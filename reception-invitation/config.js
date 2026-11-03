/* ============================================================================
   RECEPTION INVITATION — the one file you edit to change names, date, venue, text.
   The website AND the MP4 renderer both read this file, so they always match.
   After editing, refresh the browser (and re-run "npm run render" for a new MP4).
   ============================================================================ */
window.INVITE_CONFIG = {
  /* ---------- Event details ---------- */
  BRIDE_NAME: 'Kenvi Dwivedi',
  GROOM_NAME: 'Puru Tyagi',
  EVENT_TYPE: 'Reception',
  EVENT_DAY: 'Saturday',
  EVENT_DATE: '28 November 2026',
  VENUE_NAME: 'Hotel Royal Residency',
  VENUE_ADDRESS: 'Ambala Road, Opp. Kalpana Cinema, Purani Mandi, Saharanpur, Uttar Pradesh 247001',

  // How the address is broken into lines on the invitation card (keep the lines balanced).
  VENUE_ADDRESS_LINES: [
    'Ambala Road, Opp. Kalpana Cinema,',
    'Purani Mandi, Saharanpur,',
    'Uttar Pradesh – 247001',
  ],
  // Short venue line used in the closing frame and on the final web screen.
  VENUE_SHORT: 'Hotel Royal Residency, Saharanpur',

  // Leave these empty ('') to hide them. If you fill them in they appear on the card automatically.
  EVENT_TIME: '',      // e.g. '7:00 PM onwards'
  RSVP_DETAILS: '',    // e.g. 'RSVP: Name — 98xxxxxxxx'

  // Machine-readable date, used only for the "Save the dates" calendar file on the final web screen.
  EVENT_DATE_ISO: '2026-11-28',

  /* ---------- Programme: a second gathering, two days before the reception ----------
     It is shown on the envelope, on the back of the invitation card (the card turns over in the film),
     in the closing frame and on the final web screen. Set PROGRAMME_EVENTS to [] to hide it everywhere.
     icon: 'diya' (oil lamp) or 'dinner' (cloche); anything else shows a small gold diamond. */
  PROGRAMME_TITLE: 'Programme',
  PROGRAMME_DAY: 'Thursday',
  PROGRAMME_DATE: '26th November 2026',
  PROGRAMME_DATE_ISO: '2026-11-26',   // used only for the calendar file
  PROGRAMME_EVENTS: [
    { name: 'Sundarkand', time: '2:00 PM', at: '14:00', icon: 'diya' },
    { name: 'Dinner', time: '8:00 PM', at: '20:00', icon: 'dinner' },
  ],
  PROGRAMME_VENUE_ADDRESS: 'Ankit Vihar Colony, Lane No. 3, Nawada Road, Saharanpur – 247001',
  PROGRAMME_VENUE_LINES: [
    'Ankit Vihar Colony, Lane No. 3,',
    'Nawada Road, Saharanpur – 247001',
  ],

  /* ---------- Wording of each scene ---------- */
  TEXT: {
    envelopeKicker: 'Reception Invitation',
    tapToOpen: 'Tap the seal to open',
    opening: 'A Beautiful Evening Awaits...',
    groomLabel: 'Introducing the Groom',
    brideLabel: 'Introducing the Bride',
    together: ['Two Beautiful Souls', 'One Special Evening', 'An Unforgettable Celebration'],
    inviteLine: 'Cordially invite you to their',
    message: 'With love and the blessings of our families, we warmly invite you to join us for an evening of joy, togetherness, and celebration.',
    venueLabel: 'Venue',
    closing: ['Your Presence Will Make Our Celebration More Special', 'We Look Forward to Celebrating With You!'],
  },

  /* ---------- Sharing ---------- */
  // Address of the published website. The PDF invitation (npm run invitation) uses it for its
  // "Watch the animated invitation" button and QR code. Leave '' to leave both out.
  SHARE_URL: 'https://purvi250.github.io/Wedding-Invitation/',

  /* ---------- PDF invitation only ---------- */
  // The hosts' invitation on the cover of the PDF (npm run invitation). It is not shown on the website, in
  // the videos or in the animated GIF. Leave PDF_HOSTS as [] to use the couple's own line (inviteLine) instead.
  PDF_HOSTS: ['Er. Subodh Tyagi', 'Mrs. Poonam Tyagi'],
  PDF_HOSTS_INVITE: ['cordially invite you to the', 'Sundarkand & Wedding Reception'],
  PDF_GROOM_FIRST: true,   // the PDF names the groom first (Puru Tyagi & Kenvi Dwivedi, "Puru & Kenvi")

  /* ---------- Artwork and music (replace the files or point to new ones) ---------- */
  IMAGES: {
    groom: 'assets/groom.webp',    // transparent cut-out, full figure
    bride: 'assets/bride.webp',    // transparent cut-out
    couple: 'assets/couple.webp',  // transparent cut-out of the two together (scene 4)
  },
  MUSIC: 'assets/music/reception-theme.mp3',

  /* ---------- Options ---------- */
  SHOW_COUPLE_PORTRAIT: true,   // false = scene 4 shows the groom and bride illustrations side by side instead
  SHOW_DIRECTIONS_BUTTON: true, // "Directions" button (Google Maps search for the venue) on the final web screen
  SHOW_CALENDAR_BUTTON: true,   // "Save the dates" button on the final web screen (programme times as given; reception all-day)
};
