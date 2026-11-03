#!/usr/bin/env node
// Makes the shareable invitation files from print/invitation.html (wording from config.js):
//   output/reception-invitation.pdf           three pages: the hero, the reception, the programme + QR code (links work)
//   output/reception-invitation-animated.gif  the hero as a seamless looping animation (plays in WhatsApp, email, …)
//
//   node tools/make-invitation.mjs            → both
//   node tools/make-invitation.mjs --pdf      → only the PDF        --gif → only the GIF
//   options for the GIF: --width=720 (pixels) --fps=15
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { findBrowser } from './browser.mjs';
import { startServer } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const a = process.argv.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=')[1] : d; };
const only = process.argv.includes('--pdf') ? 'pdf' : process.argv.includes('--gif') ? 'gif' : 'both';
const stop = (msg) => { console.error(`\n${msg}\n`); process.exit(1); };
let puppeteer;
try { puppeteer = (await import('puppeteer-core')).default; } catch { stop('Run "npm install" (or "npm run setup" from the Reception folder) once first.'); }
if (!fs.existsSync(path.join(root, 'node_modules', 'qrcode-generator'))) stop('Run "npm install" (or "npm run setup" from the Reception folder) once first.');
if (only !== 'pdf' && spawnSync('ffmpeg', ['-version']).status !== 0) stop('FFmpeg was not found. Install it once with:  winget install Gyan.FFmpeg');

const outDir = path.join(root, 'output');
fs.mkdirSync(outDir, { recursive: true });
const { server, url } = await startServer(root, 0);
const browser = await puppeteer.launch({ executablePath: findBrowser(), headless: true, args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--mute-audio', '--force-color-profile=srgb'] });
const errors = [];
const open = async (mode) => {
  const page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push('missing file: ' + r.url()));
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  await page.goto(`${url}print/invitation.html?mode=${mode}`, { waitUntil: 'load' });
  await page.evaluate(() => window.__hero.ready);
  return page;
};
try {
  if (only !== 'gif') {
    // 1) photograph each page's artwork alone at 1.5x, as JPEG
    const art = await open('pdf');
    await art.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1.5 });
    await art.evaluate(() => document.body.classList.add('art'));
    const shots = [];
    for (const id of await art.evaluate(() => [...document.querySelectorAll('.page')].map((p) => p.id))) {
      const el = await art.$('#' + id);
      shots.push('data:image/jpeg;base64,' + (await el.screenshot({ type: 'jpeg', quality: 88, encoding: 'base64' })));
    }
    await art.close();
    // 2) print the pages with that artwork behind the (vector) words
    const page = await open('pdf');
    await page.evaluate((list) => { document.body.classList.add('flat'); document.querySelectorAll('.page').forEach((p, i) => { p.style.backgroundImage = `url(${list[i]})`; }); }, shots);
    await page.evaluate(() => Promise.all([...document.querySelectorAll('.page')].map((p) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = res; im.src = getComputedStyle(p).backgroundImage.slice(5, -2); }))));
    const file = path.join(outDir, 'reception-invitation.pdf');
    await page.pdf({ path: file, width: '1080px', height: '1920px', printBackground: true, preferCSSPageSize: true });
    console.log(`Saved  ${path.relative(process.cwd(), file)}  (${(fs.statSync(file).size / 1048576).toFixed(1)} MB)`);
    await page.close();
  }
  if (only !== 'pdf') {
    const page = await open('gif');
    const fps = parseInt(arg('fps', '15'), 10), width = parseInt(arg('width', '720'), 10);
    const loop = await page.evaluate(() => window.__hero.loop), frames = Math.round(loop * fps);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invite-gif-'));
    process.stdout.write(`Rendering the animated GIF (${frames} frames, ${loop} s loop) `);
    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.__hero.seek(t), f / fps);
      await page.screenshot({ path: path.join(tmp, `f${String(f).padStart(4, '0')}.png`), clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      if (f % 20 === 0) process.stdout.write('.');
    }
    const file = path.join(outDir, 'reception-invitation-animated.gif');
    // one palette tuned to the moving details; ordered (bayer) dithering keeps still areas identical from frame to
    // frame, so only the moving details are stored and the file stays small
    const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=256:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
    const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps), '-i', path.join(tmp, 'f%04d.png'), '-vf', vf, '-loop', '0', file], { encoding: 'utf8' });
    fs.rmSync(tmp, { recursive: true, force: true });
    if (r.status !== 0) throw new Error('FFmpeg could not make the GIF:\n' + r.stderr);
    console.log(`\nSaved  ${path.relative(process.cwd(), file)}  (${(fs.statSync(file).size / 1048576).toFixed(1)} MB)`);
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}
if (errors.length) { console.error('\nProblems while drawing the page:\n  ' + [...new Set(errors)].join('\n  ')); process.exit(1); }
