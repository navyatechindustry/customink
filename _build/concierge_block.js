/* ---------------- studio concierge ---------------- */
  var WA_URL = 'https://api.whatsapp.com/send?phone=352621523131&text=Bonjour%20je%20souhaite%20avec%20plus%20d\u2019informations%20';
  var CONCIERGE = (function () {
    var ig = 'https://www.instagram.com/customink_tattoostudio/';
    var hand = 'For anything personal, the team replies fast \u2014 <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a>, <a href="tel:+35226550766">+352 26 55 07 66</a>, <a href="mailto:info@customink.lu">info@customink.lu</a>, or the <a href="#book">booking form</a>.';
    var KB = [
      { k: ['hello', ' hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        a: 'Hey, welcome to Custom Ink \u2733 I know the studio inside out \u2014 styles, piercing, booking, hours, prices, aftercare. What can I point you to?',
        n: ['Tattoo styles', 'Piercing', 'How do I book?', 'Prices', 'Opening hours'] },
      { k: ['merci', 'thank'],
        a: 'You\u2019re very welcome! If anything else comes up, I\u2019m here \u2014 and the team is one WhatsApp message away.',
        n: ['How do I book?', 'Opening hours'] },
      { k: ['whatsapp'],
        a: 'Of course \u2014 the fastest way to reach the team is <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a>. Messages are answered personally.',
        n: ['Opening hours', 'How do I book?'] },
      { k: ['style', 'fine line', 'fineline', 'dotwork', 'dot work', 'realism', 'black', 'grey', 'gray', 'colour', 'color', 'traditional', 'japanese', 'mandala', 'maori', 'lettering', 'abstract', 'minimal'],
        a: 'The studio covers every style \u2014 fine line, dotwork &amp; mandala, black &amp; grey, photo-realism, colour, Japanese, old school and lettering. Every piece is drawn individually for you. Scroll the <a href="#work">selected work</a> above to see the range.',
        n: ['Cover-ups & scar camouflage', 'Prices', 'How do I book?'] },
      { k: ['cover', 'rework', 'scar', 'camouflage', 'old tattoo', 'fix'],
        a: 'Yes \u2014 cover-ups, reworkings and scar camouflage are dedicated services here. Bring the tattoo or area you\u2019d like transformed to a consultation and the artist will honestly tell you what\u2019s possible.',
        n: ['Prices', 'How do I book?'] },
      { k: ['piercing', 'pierce', 'ear', 'helix', 'nose', 'septum', 'lip', 'medusa', 'tongue', 'navel', 'belly', 'jewellery', 'jewelry'],
        a: 'Piercings: ear lobes, helix &amp; cartilage, nose &amp; septum, lip &amp; medusa, tongue, navel and more. The piercer advises you on placement and jewellery before anything happens \u2014 questions are genuinely welcome.',
        n: ['How do I book?', 'Opening hours', 'Age rules'] },
      { k: ['book', 'appointment', 'termin', 'reserve', 'schedule', 'r\u00e9server', 'rendez-vous', 'rdv'],
        a: 'Three fast ways: the <a href="#book">appointment request form</a> on this page, a call to <a href="tel:+35226550766">+352 26 55 07 66</a>, or a message on <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a>. Every request is confirmed personally \u2014 a request is not yet an appointment.',
        n: ['Prices', 'Opening hours', 'Do I need a consultation?'] },
      { k: ['consult'],
        a: 'Always \u2014 it\u2019s how the studio works. You bring the idea, the studio proposes the artist whose style fits it, and nothing is inked until the design feels right to you. First-timers: mention it when you book and the team takes extra care.',
        n: ['How do I book?', 'First tattoo'] },
      { k: ['price', 'cost', 'how much', 'expensive', 'quote', 'prix', 'tarif', 'co\u00fbt', 'combien'],
        a: 'Pricing depends on size, style, placement and the sessions a project needs \u2014 so you get a personal quote after a consultation, before anything is booked. No surprises, ever.',
        n: ['How do I book?', 'Tattoo styles'] },
      { k: ['hour', 'open', 'close', 'when', 'horaires', 'ouvert'],
        a: 'Tuesday to Sunday, 10:00\u201319:00. Closed on Mondays. The <a href="#visit">Visit section</a> even shows whether the studio is open right now.',
        n: ['Where are you?', 'How do I book?'] },
      { k: ['where', 'address', 'location', 'direction', 'find', 'map', 'adresse', 'o\u00f9', 'situe'],
        a: 'Custom Ink Luxembourg, 103 Waistrooss, L-5440 Remerschen \u2014 in the Moselle region of south-east Luxembourg. There\u2019s an interactive map in the <a href="#visit">Visit section</a>: tap \u201cFetch my location\u201d and it draws your route to the door.',
        n: ['Opening hours', 'How do I book?'] },
      { k: ['parking', 'bus', 'train', 'transport'],
        a: 'Good question \u2014 for parking and the easiest way to reach us, ask the team directly and they\u2019ll walk you through it:',
        n: ['Where are you?', 'Opening hours'], hand: true },
      { k: ['aftercare', 'heal ', 'healing', 'care', 'soin'],
        a: 'Every client leaves with personal healing instructions, and the studio stays reachable while you heal. Short version: keep it clean, follow the instructions you were given, and ask if anything concerns you.',
        n: ['Healing time', 'How do I book?'] },
      { k: ['healing time', 'how long'],
        a: 'Tattoos usually surface-heal in two to four weeks, with full healing taking longer. Piercings vary a lot by placement. Your artist or piercer gives you a realistic timeline for your exact piece.',
        n: ['Aftercare', 'Prices'] },
      { k: ['walk-in', 'walk in', 'today', 'same day'],
        a: 'Most projects are planned ahead so the right artist and enough time are reserved for you. For smaller pieces, send a message \u2014 the studio will tell you honestly what\u2019s possible today.',
        n: ['How do I book?', 'Opening hours'] },
      { k: ['age', 'old', 'minor', 'kid', 'parent', ' id'],
        a: 'Tattoos and piercings follow Luxembourg\u2019s legal requirements. Bring a valid ID, and contact the studio about minimum ages and parental consent before booking.',
        n: ['How do I book?'] },
      { k: ['artist', 'who', 'guest', 'team'],
        a: 'Custom Ink is a collective: resident artists plus a permanent rotation of international guests. The studio matches the artist to your project \u2014 and you can name a preferred artist in the <a href="#book">booking form</a>. The current line-up lives on <a href="' + ig + '" target="_blank" rel="noopener">Instagram</a>.',
        n: ['Tattoo styles', 'How do I book?'] },
      { k: ['review', 'rating', 'star', 'google'],
        a: 'The studio holds a 4.9\u2605 rating from 377 Google reviews \u2014 quotes are on this page in the <a href="#reviews">Reviews section</a>, with a link to read all of them.',
        n: ['Tattoo styles', 'How do I book?'] },
      { k: ['instagram', 'insta', 'follow'],
        a: 'You\u2019ll find the studio at <a href="' + ig + '" target="_blank" rel="noopener">@customink_tattoostudio</a> \u2014 16.6K followers, fresh work, guest-artist announcements and last-minute slots.',
        n: ['Opening hours', 'How do I book?'] },
      { k: ['first', 'nervous', 'scared', 'afraid', 'never had'],
        a: 'First-timers are this studio\u2019s specialty, honestly \u2014 unhurried consultations, designs refined until you\u2019re happy, and clients regularly mention how at ease they felt. Mention it\u2019s your first when you book; the team takes it from there.',
        n: ['How do I book?', 'Prices'] },
      { k: ['pain', 'hurt'],
        a: 'Honestly: it depends more on placement than on size \u2014 and on you. The team is upfront about what to expect for your specific idea at the consultation.',
        n: ['First tattoo', 'How do I book?'] },
      { k: ['reschedul', 'cancel', 'change my appointment'],
        a: 'Life happens \u2014 contact the studio as early as you can and a new time will be found. No drama.',
        n: ['Opening hours', 'How do I book?'] },
      { k: ['deposit'],
        a: 'Deposits are confirmed personally when you book \u2014 the team will tell you exactly what applies to your project:',
        n: ['How do I book?', 'Prices'], hand: true },
      { k: ['language', 'speak', 'fran\u00e7ais', 'deutsch', 'portugu\u00eas'],
        a: 'The studio works in seven languages: Luxembourgish, German, English, French, Portuguese, Italian and Russian. Whichever feels most comfortable \u2014 someone speaks it.',
        n: ['How do I book?'] },
      { k: ['prepare', 'before my session', 'what should i bring'],
        a: 'Sleep well, eat properly beforehand, avoid alcohol for 24 hours, and wear something comfortable that gives access to the area. References, screenshots, sketches \u2014 all welcome.',
        n: ['Aftercare', 'How do I book?'] },
      { k: ['gift', 'voucher'],
        a: 'Gift vouchers aren\u2019t on the site yet \u2014 best to ask the team directly, they\u2019ll tell you what\u2019s possible:',
        n: ['Opening hours'], hand: true },
      { k: ['contact', 'email', 'phone', 'call', 'number'],
        a: 'All roads lead to the team: <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a> \u00b7 <a href="tel:+35226550766">+352 26 55 07 66</a> \u00b7 <a href="mailto:info@customink.lu">info@customink.lu</a> \u00b7 <a href="#book">booking form</a>.',
        n: ['Opening hours', 'How do I book?'] },
      { k: ['bonjour', 'salut', 'moien', 'bonsoir', 'coucou'],
        a: 'Bonjour et bienvenue chez Custom Ink \u2733 Je connais le studio sur le bout des doigts \u2014 styles, piercing, r\u00e9servation, horaires, prix, soins. Que puis-je pour vous ?',
        n: ['R\u00e9server', 'Prix', 'Horaires', 'O\u00f9 \u00eates-vous ?'] },
      { k: ['tatouage', 'mod\u00e8le', 'modele', 'dessin'],
        a: 'Le studio couvre tous les styles \u2014 fine line, dotwork &amp; mandala, black &amp; grey, r\u00e9alisme, couleur, japonais, old school et lettering. Chaque pi\u00e8ce est dessin\u00e9e sur mesure. Voyez la <a href="#work">s\u00e9lection de travaux</a> ci-dessus.',
        n: ['Prix', 'R\u00e9server'] },
      { k: ['horaires', 'ouvert', 'ferm\u00e9', 'heures'],
        a: 'Du mardi au dimanche, 10h00\u201319h00. Ferm\u00e9 le lundi. La section <a href="#visit">Visiter</a> indique m\u00eame si le studio est ouvert en ce moment.',
        n: ['O\u00f9 \u00eates-vous ?', 'R\u00e9server'] },
      { k: ['adresse', 'o\u00f9', 'situe', 'trouve'],
        a: 'Custom Ink Luxembourg, 103 Waistrooss, L-5440 Remerschen \u2014 dans la r\u00e9gion de la Moselle, au sud-est du Luxembourg. Utilisez la carte interactive dans la section <a href="#visit">Visiter</a> : \u00ab Fetch my location \u00bb trace votre itin\u00e9raire.',
        n: ['Horaires', 'R\u00e9server'] }
    ];
    var FALLBACK = 'That one is better answered by a human \u2014 and they reply quickly: <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a> \u00b7 <a href="tel:+35226550766">+352 26 55 07 66</a> \u00b7 <a href="mailto:info@customink.lu">info@customink.lu</a>.';
    var DEFAULT_CHIPS = ['Tattoo styles', 'Piercing', 'How do I book?', 'Prices', 'Opening hours'];
    function match(q) {
      q = ' ' + q.toLowerCase() + ' ';
      for (var i = 0; i < KB.length; i++) {
        var ks = KB[i].k;
        for (var j = 0; j < ks.length; j++) {
          if (q.indexOf(ks[j]) !== -1) return KB[i];
        }
      }
      return null;
    }
    return {
      greeting: 'Hey, welcome to Custom Ink \u2733 I know the studio inside out \u2014 styles, piercing, booking, hours, prices, aftercare. What can I point you to?',
      chips: DEFAULT_CHIPS,
      answer: function (q) {
        var hit = match(q);
        if (!hit) return FALLBACK;
        return hit.hand ? hit.a + ' ' + hand : hit.a;
      },
      nextFor: function (q) {
        var hit = match(q);
        return (hit && hit.n) || DEFAULT_CHIPS;
      }
    };
  })();

  var fab = $('#concFab'), panel = $('#concPanel'), log = $('#concLog'),
      chipsBox = $('#concChips'), concForm = $('#concForm'), concInput = $('#concInput'),
      concDot = $('#concDot');
  var greeted = false, typingEl = null;
  function scrollLog() { log.scrollTop = log.scrollHeight; }
  function bubble(html, who) {
    var d = document.createElement('div');
    d.className = 'msg msg-' + who;
    d.innerHTML = html;
    log.appendChild(d);
    scrollLog();
  }
  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className = 'msg msg-typing';
    typingEl.setAttribute('aria-label', 'The concierge is typing');
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(typingEl);
    scrollLog();
  }
  function botSay(html, chips) {
    showTyping();
    var delay = 650 + Math.min(1500, String(html).length * 4);
    setTimeout(function () {
      if (typingEl) { typingEl.remove(); typingEl = null; }
      bubble(html, 'bot');
      renderChips(chips || CONCIERGE.chips);
    }, delay);
  }
  function renderChips(list) {
    chipsBox.innerHTML = '';
    (list || []).forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = c;
      b.addEventListener('click', function () { ask(c); });
      chipsBox.appendChild(b);
    });
  }
  function ask(text) {
    bubble(text.replace(/&/g, '&amp;').replace(/</g, '&lt;'), 'user');
    track(text.length <= 24 ? 'concierge_topic' : 'concierge_question', { topic: text.slice(0, 60) });
    botSay(CONCIERGE.answer(text), CONCIERGE.nextFor(text));
  }
  function openConc() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    if (concDot) concDot.remove();
    if (!greeted) {
      greeted = true;
      setTimeout(function () { botSay(CONCIERGE.greeting, CONCIERGE.chips); }, 350);
    }
    scrollLog();
    track('concierge_open');
  }
  function closeConc() { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); }
  fab.addEventListener('click', function () { panel.hidden ? openConc() : closeConc(); });
  var cc = $('#concClose'); if (cc) cc.addEventListener('click', closeConc);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) closeConc();
  });
  if (concForm) {
    concForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = concInput.value.trim();
      if (!v) return;
      concInput.value = '';
      ask(v);
    });
  }
  log.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a) { closeConc(); var t = $(a.getAttribute('href')); if (t) t.scrollIntoView({ behavior: 'smooth' }); }
  });

