/* ============================================================
   CUSTOM INK LUXEMBOURG — interactions
   nav / reveals / filters / lightbox / form / concierge / analytics
   ============================================================ */
import { reviews as datasetReviews } from './reviews-data.js';

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------- cookie notice & consent management (session-based) ---------------- */
  var CONSENT_SESSION_KEY = 'ci_cookie_consent_session';
  var GA_MEASUREMENT_ID = window.CI_GA_MEASUREMENT_ID || ''; // Configurable measurement ID (e.g. 'G-XXXXXXXXXX')

  // Clear legacy persistent consent so each new session prompts the user
  try {
    localStorage.removeItem('ci_cookie_consent_v1');
  } catch (e) {}

  function getStoredConsent() {
    try {
      var raw = sessionStorage.getItem(CONSENT_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analyticsAllowed) {
    var state = {
      necessary: true,
      analytics: !!analyticsAllowed,
      timestamp: new Date().toISOString(),
      choice: analyticsAllowed ? 'accept' : 'deny'
    };
    try {
      sessionStorage.setItem(CONSENT_SESSION_KEY, JSON.stringify(state));
    } catch (e) {}
    applyConsent(state);
    return state;
  }

  var gaLoaded = false;
  function applyConsent(state) {
    if (state && state.analytics) {
      if (GA_MEASUREMENT_ID && !gaLoaded) {
        gaLoaded = true;
        var s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag(){ window.dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
      }
    }
  }

  function track(event, data) {
    var c = getStoredConsent();
    if (!c || !c.analytics) {
      return;
    }
    window.dataLayer = window.dataLayer || [];
    var cleanData = Object.assign({ event: event }, data || {});
    window.dataLayer.push(cleanData);
    if (window.console && console.debug) console.debug('[track]', event, cleanData);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-track]');
    if (t) track(t.getAttribute('data-track'), { label: (t.textContent || '').trim().slice(0, 60) });
  });

  // Cookie notice popup controller (session-based)
  (function initConsentUI() {
    var popupBackdrop = $('#cookiePopupBackdrop');

    // Dynamically inject if not present on page (e.g. privacy or terms pages)
    if (!popupBackdrop) {
      popupBackdrop = document.createElement('div');
      popupBackdrop.id = 'cookiePopupBackdrop';
      popupBackdrop.className = 'cookie-popup-backdrop';
      popupBackdrop.hidden = true;
      popupBackdrop.setAttribute('role', 'dialog');
      popupBackdrop.setAttribute('aria-modal', 'true');
      popupBackdrop.setAttribute('aria-labelledby', 'cookiePopupTitle');
      popupBackdrop.innerHTML =
        '<div class="cookie-popup">' +
          '<div class="cookie-popup-badge">Cookie Notice</div>' +
          '<h2 class="cookie-popup-title" id="cookiePopupTitle">We Value Your Privacy</h2>' +
          '<p class="cookie-popup-text">We use essential storage to make our website work. With your choice, we also use anonymized measurement tools to enhance your experience. Read our <a href="privacy.html">Privacy Policy</a>.</p>' +
          '<div class="cookie-popup-actions">' +
            '<button type="button" class="cookie-popup-btn cookie-popup-btn-accept" id="btnAcceptAllCookies">Accept all cookies</button>' +
            '<button type="button" class="cookie-popup-btn cookie-popup-btn-deny" id="btnRejectCookies">Deny</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(popupBackdrop);
    }

    function showPopup() {
      if (popupBackdrop) {
        popupBackdrop.hidden = false;
        popupBackdrop.style.display = 'flex';
      }
    }

    function removePopup() {
      if (popupBackdrop) {
        popupBackdrop.hidden = true;
        popupBackdrop.style.display = 'none';
      }
    }

    var current = getStoredConsent();
    if (current) {
      applyConsent(current);
      removePopup();
    } else {
      showPopup();
    }

    // Handle button clicks inside the popup
    popupBackdrop.addEventListener('click', function (e) {
      var acceptBtn = e.target.closest('#btnAcceptAllCookies');
      var denyBtn = e.target.closest('#btnRejectCookies');
      if (acceptBtn) {
        saveConsent(true);
        removePopup();
      } else if (denyBtn) {
        saveConsent(false);
        removePopup();
      }
    });

    // Reopen popup if user clicks on Cookie Preferences in footer
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('#openCookieSettings, [data-open-cookie-settings]');
      if (trigger) {
        e.preventDefault();
        showPopup();
      }
    });
  })();

  /* ---------------- sticky nav ---------------- */
  var nav = $('#nav');
  if (nav) {
    var onScrollNav = function () { nav.classList.toggle('is-solid', window.scrollY > 40); };
    onScrollNav();
    window.addEventListener('scroll', onScrollNav, { passive: true });
  }

  /* ---------------- mobile menu ---------------- */
  var burger = $('#burger'), menu = $('#mobileMenu');
  var mainEl = $('#main'), footEl = $('.footer');
  var menuTimer = null;

  function closeMenu(shouldFocusBurger) {
    if (!burger || !menu) return;
    clearTimeout(menuTimer);
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    document.body.style.overflow = '';
    document.body.classList.remove('menu-open');
    if (mainEl) mainEl.removeAttribute('aria-hidden');
    if (footEl) footEl.removeAttribute('aria-hidden');
    menuTimer = setTimeout(function () {
      if (!burger.classList.contains('is-open')) {
        menu.hidden = true;
      }
    }, 350);
    if (shouldFocusBurger !== false) {
      try { burger.focus(); } catch (e) {}
    }
  }

  function openMenu() {
    if (!burger || !menu) return;
    clearTimeout(menuTimer);
    menu.hidden = false;
    // Force layout flush so CSS transition starts immediately
    void menu.offsetHeight;
    burger.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    menu.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('menu-open');
    if (mainEl) mainEl.setAttribute('aria-hidden', 'true');
    if (footEl) footEl.setAttribute('aria-hidden', 'true');
    $$('.mobile-menu nav a, .mobile-menu .mm-foot a', menu).forEach(function (a, i) { a.style.setProperty('--i', i); });
  }

  if (burger && menu) {
    burger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var isOpen = burger.classList.contains('is-open');
      if (isOpen) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    $$('#mobileMenu a', menu).forEach(function (a) {
      a.addEventListener('click', function () {
        closeMenu(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.classList.contains('is-open')) {
        closeMenu(true);
      }
    });
  }


  /* ---------------- scroll reveals ---------------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------------- active nav section ---------------- */
  var sections = ['work', 'services', 'artists', 'studio', 'reviews', 'visit', 'faq']
    .map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = $$('.nav-links a');
  var secIo = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-38% 0px -55% 0px' });
  sections.forEach(function (s) { secIo.observe(s); });

  /* ---------------- gallery filters ---------------- */
  var filters = $$('.filter');
  var items = $$('#masonry .g-item, .p-item');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      var f = btn.getAttribute('data-filter');
      items.forEach(function (it) {
        var show = f === 'all' || it.getAttribute('data-cat') === f;
        it.classList.toggle('is-hidden', !show);
      });
      track('gallery_filter', { filter: f });
    });
  });

  /* ---------------- lightbox ---------------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lbTitle = $('#lbTitle'),
      lbMeta = $('#lbMeta'), lbCount = $('#lbCount');
  var lbList = [], lbIdx = 0, lbLastFocus = null;

  function visibleItems() { return items.filter(function (it) { return !it.classList.contains('is-hidden'); }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function renderLb() {
    var it = lbList[lbIdx];
    if (!it) return;
    var img = $('img', it);
    lbImg.src = img.getAttribute('src');
    lbImg.alt = img.getAttribute('alt') || '';
    lbTitle.innerHTML = it.getAttribute('data-title') || '';
    lbMeta.innerHTML = [it.getAttribute('data-style'), it.getAttribute('data-place')]
      .filter(Boolean).join(' · ');
    lbCount.textContent = pad(lbIdx + 1) + ' / ' + pad(lbList.length);
  }
  function openLb(item) {
    lbList = visibleItems();
    lbIdx = Math.max(0, lbList.indexOf(item));
    lbLastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    renderLb();
    $('#lbClose').focus();
    track('gallery_image_open', { title: item.getAttribute('data-title') });
  }
  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lbLastFocus) lbLastFocus.focus();
  }
  function stepLb(d) { lbIdx = (lbIdx + d + lbList.length) % lbList.length; renderLb(); }

  items.forEach(function (it) {
    var m = $('.g-media', it);
    if (m) m.addEventListener('click', function () { openLb(it); });
  });
  var lbc = $('#lbClose'); if (lbc) lbc.addEventListener('click', closeLb);
  var lbp = $('#lbPrev'); if (lbp) lbp.addEventListener('click', function () { stepLb(-1); });
  var lbn = $('#lbNext'); if (lbn) lbn.addEventListener('click', function () { stepLb(1); });
  if (lb) {
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') stepLb(-1);
      if (e.key === 'ArrowRight') stepLb(1);
    });
  }

  /* ---------------- accordion: close others ---------------- */
  var accs = $$('.acc');
  accs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) accs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });

  /* ---------------- booking form → email draft ---------------- */
  var form = $('#bookForm');
  if (form) {
    var success = $('#frmSuccess');
    var submitBtn = $('#btnSubmitForm');
    function err(name, show, msg) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      var field = input.closest('.frm-field');
      if (!field) return;
      field.classList.toggle('is-error', show);
      input.setAttribute('aria-invalid', show ? 'true' : 'false');
      var m = field.querySelector('.err-msg');
      if (show && msg && !m) {
        m = document.createElement('p');
        m.className = 'err-msg';
        m.setAttribute('role', 'alert');
        m.textContent = msg;
        field.appendChild(m);
      } else if (m) {
        m.textContent = show ? (msg || '') : '';
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Anti-spam honeypot check
      var hp = form.querySelector('[name="_hp_company"]');
      if (hp && hp.value.trim() !== '') {
        // Silently stop automated bot submission
        return;
      }

      var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
      var ok = true;
      var firstBadEl = null;

      // Name validation: required, 2-100 characters
      var nameVal = v('name');
      if (!nameVal) {
        err('name', true, 'Please add your name.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="name"]');
      } else if (nameVal.length < 2) {
        err('name', true, 'Please enter your full name (at least 2 letters).');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="name"]');
      } else {
        err('name', false);
      }

      // Phone validation: required, valid characters
      var phoneVal = v('phone');
      var phoneRegex = /^[+0-9\s\-().]{6,25}$/;
      if (!phoneVal) {
        err('phone', true, 'Please add a phone number.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="phone"]');
      } else if (!phoneRegex.test(phoneVal)) {
        err('phone', true, 'Please enter a valid phone number with country code.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="phone"]');
      } else {
        err('phone', false);
      }

      // Email validation: required, standard RFC format
      var emailVal = v('email');
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailVal) {
        err('email', true, 'Please add your email.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="email"]');
      } else if (!emailRegex.test(emailVal)) {
        err('email', true, 'That email does not look right.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="email"]');
      } else {
        err('email', false);
      }

      // Description validation: required, min 10 chars
      var descVal = v('description');
      if (!descVal) {
        err('description', true, 'Tell us briefly about your idea.');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="description"]');
      } else if (descVal.length < 10) {
        err('description', true, 'Please share a few more details about your concept (at least 10 characters).');
        ok = false;
        if (!firstBadEl) firstBadEl = form.querySelector('[name="description"]');
      } else {
        err('description', false);
      }

      // Consent validation
      var consentChk = form.querySelector('[name="consent"]');
      if (!consentChk || !consentChk.checked) {
        ok = false;
        track('form_consent_missing');
        var chkField = form.querySelector('.frm-check');
        if (chkField) chkField.classList.add('is-error');
        if (!firstBadEl) firstBadEl = consentChk;
      } else {
        var chkFieldClean = form.querySelector('.frm-check');
        if (chkFieldClean) chkFieldClean.classList.remove('is-error');
      }

      if (!ok) {
        if (firstBadEl) try { firstBadEl.focus(); } catch (errFocus) {}
        return;
      }

      // Prevent duplicate clicks
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-disabled', 'true');
        submitBtn.textContent = 'Preparing email draft…';
      }

      var svc = (form.querySelector('[name="service"]:checked') || {}).value || 'Tattoo';
      var subject = 'Appointment request — ' + svc + ' — ' + v('name');
      var lines = [
        'Name: ' + v('name'),
        'Phone: ' + v('phone'),
        'Email: ' + v('email'),
        'Interested in: ' + svc,
        'Style: ' + (v('style') || '—'),
        'Preferred artist: ' + (v('artist') || '—'),
        'Placement: ' + (v('placement') || '—'),
        'Approx. size: ' + (v('size') || '—'),
        'Preferred date: ' + (v('date') || '—'),
        'Preferred time: ' + (v('time') || '—'),
        '',
        'Idea:',
        v('description'),
        '',
        '— sent from customink.lu appointment request form'
      ];
      var href = 'mailto:info@customink.lu?subject=' + encodeURIComponent(subject) +
                 '&body=' + encodeURIComponent(lines.join('\n'));
      track('form_submitted', { service: svc });
      window.location.href = href;
      if (success) {
        success.hidden = false;
        $$('.frm-row, .frm-field:not(:last-of-type), .frm-actions', form).forEach(function (el) {
          if (el !== success && !success.contains(el)) el.style.display = 'none';
        });
        success.focus();
      }

      setTimeout(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-disabled');
          submitBtn.textContent = 'Request appointment';
        }
      }, 4000);
    });
  }

  /* ---------------- open-now (Europe/Luxembourg) ---------------- */
  (function () {
    var el = $('#openNow');
    if (!el) return;
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Luxembourg', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
      }).formatToParts(new Date());
      var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ''; };
      var day = get('weekday');
      var hour = parseInt(get('hour'), 10);
      var minute = parseInt(get('minute'), 10);
      var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      var idx = days.indexOf(day);
      var t = hour * 60 + minute;
      var openM = 10 * 60, closeM = 19 * 60;
      var isClosedDay = idx === 0; // Monday
      var isOpen = !isClosedDay && t >= openM && t < closeM;
      function nextOpenName() {
        if (!isClosedDay && t < openM) return 'opens today at 10:00';
        for (var i = 1; i <= 7; i++) {
          var d = (idx + i) % 7;
          if (d !== 0) return 'opens ' + (i === 1 ? 'tomorrow' : days[d]) + ' at 10:00';
        }
        return '';
      }
      if (isOpen) { el.textContent = 'Open now · until 19:00'; el.classList.add('is-open'); }
      else { el.textContent = 'Closed now · ' + nextOpenName(); }
    } catch (e) { el.textContent = 'Tue – Sun · 10:00 – 19:00'; }
  })();

  /* ---------------- mobile action bar ---------------- */
  var bar = $('#actionbar');
  var hero = $('.hero');
  var bookSec = $('#book');
  if (bar && hero) {
    function onScrollBar() {
      var heroH = hero.offsetHeight;
      var scrollY = window.scrollY;
      var pastHero = scrollY > heroH * 0.75;
      var atBookingForm = false;
      if (bookSec) {
        var rect = bookSec.getBoundingClientRect();
        atBookingForm = (rect.top <= window.innerHeight * 0.6) && (rect.bottom >= 100);
      }
      var show = pastHero && !atBookingForm;
      bar.hidden = false;
      bar.classList.toggle('is-visible', show);
      document.body.classList.toggle('ab-shown', show);
    }
    window.addEventListener('scroll', onScrollBar, { passive: true });
    document.addEventListener('focusin', function (e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) {
        bar.classList.add('is-hidden-keyboard');
      }
    });
    document.addEventListener('focusout', function () {
      bar.classList.remove('is-hidden-keyboard');
    });
    onScrollBar();
  }

  /* ---------------- studio concierge ---------------- */
  var WA_URL = 'https://api.whatsapp.com/send?phone=352621523131&text=Bonjour%20je%20souhaite%20avec%20plus%20d\u2019informations%20';
  var CONCIERGE = (function () {
    var ig = 'https://www.instagram.com/customink_tattoostudio/';
    var hand = 'For anything personal, the team replies fast \u2014 <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a>, <a href="tel:+35226550766">+352 26 55 07 66</a>, <a href="mailto:info@customink.lu?body=Hi%2C%20i%20would%20like%20to%20receive%20a%20call%20to%20talk%20more%20about%20the%20services">info@customink.lu</a>, or the <a href="#book">booking form</a>.';
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
        a: 'All roads lead to the team: <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a> \u00b7 <a href="tel:+35226550766">+352 26 55 07 66</a> \u00b7 <a href="mailto:info@customink.lu?body=Hi%2C%20i%20would%20like%20to%20receive%20a%20call%20to%20talk%20more%20about%20the%20services">info@customink.lu</a> \u00b7 <a href="#book">booking form</a>.',
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
    var FALLBACK = 'That one is best answered directly by the studio team: <a href="' + WA_URL + '" target="_blank" rel="noopener">WhatsApp</a> · <a href="tel:+35226550766">+352 26 55 07 66</a> · <a href="mailto:info@customink.lu?body=Hi%2C%20i%20would%20like%20to%20receive%20a%20call%20to%20talk%20more%20about%20the%20services">info@customink.lu</a>. Reach out directly and the team will be happy to assist you.';
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
    var SELF_HARM_TERMS = [
      'suicide', 'kill myself', 'end my life', 'want to die', 'harm myself', 'self harm', 'self-harm',
      'cutting myself', 'cut myself', 'slit', 'overdose', 'hang myself', 'take my life',
      'mourir', 'me tuer', 'suicider', 'mettre fin a mes jours', 'mettre fin à mes jours', 'me faire du mal', 'automutilation',
      'umbringen', 'selbstmord', 'suizid', 'mein leben beenden', 'ritzen', 'mich verletzen'
    ];

    function isSelfHarmQuery(q) {
      var s = (' ' + (q || '').toLowerCase() + ' ').replace(/[^a-z0-9àâäéèêëîïôöùûüç -]/g, ' ');
      for (var i = 0; i < SELF_HARM_TERMS.length; i++) {
        if (s.indexOf(' ' + SELF_HARM_TERMS[i] + ' ') !== -1 || s.indexOf(SELF_HARM_TERMS[i]) !== -1) return true;
      }
      return false;
    }

    var CRISIS_RESPONSE = 'If you are going through a difficult time, please know that you are not alone and compassionate help is available right now.<br><br>' +
      '<strong>Immediate Emergency &amp; Crisis Support:</strong><br>' +
      '• <strong>Emergency in Luxembourg &amp; Europe:</strong> Call <strong>112</strong> (free, 24/7).<br>' +
      '• <strong>SOS Détresse (Luxembourg Helpline):</strong> Call <strong>45 45 45</strong> or visit <a href="https://sosdetresse.lu" target="_blank" rel="noopener">sosdetresse.lu</a>.<br>' +
      '• <strong>Kanner- a Jugendtelefon (Helpline for youth):</strong> Call <strong>116 111</strong>.<br>' +
      '• <strong>International Crisis Support:</strong> Find free confidential crisis support worldwide at <a href="https://findahelpline.com" target="_blank" rel="noopener">findahelpline.com</a>.<br><br>' +
      'Please reach out to one of these support services or to a trusted person near you. The studio concierge is an automated system and cannot provide medical or mental health advice.';

    return {
      greeting: 'Hey! Welcome to Custom Ink ✳ I’m the automated studio concierge. I can guide you through tattoo styles, piercing info, hours, and booking steps. (I cannot confirm bookings or provide medical advice). What can I help you explore?',
      chips: DEFAULT_CHIPS,
      isSafetyRisk: function (q) {
        return isSelfHarmQuery(q);
      },
      safetyAnswer: function () {
        return CRISIS_RESPONSE;
      },
      answer: function (q) {
        if (isSelfHarmQuery(q)) return CRISIS_RESPONSE;
        var hit = match(q);
        if (!hit) return FALLBACK;
        return hit.hand ? hit.a + ' ' + hand : hit.a;
      },
      nextFor: function (q) {
        if (isSelfHarmQuery(q)) return ['Opening hours', 'Where are you?'];
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
    if (CONCIERGE.isSafetyRisk(text)) {
      // Prioritize safety & privacy: NEVER send sensitive crisis text to analytics
      botSay(CONCIERGE.safetyAnswer(), ['Opening hours', 'Where are you?']);
      return;
    }
    track(text.length <= 24 ? 'concierge_topic' : 'concierge_question', { topic: text.slice(0, 60) });
    botSay(CONCIERGE.answer(text), CONCIERGE.nextFor(text));
  }
  function openConc() {
    if (!panel || !fab) return;
    panel.hidden = false;
    void panel.offsetHeight;
    panel.classList.add('is-open');
    fab.setAttribute('aria-expanded', 'true');
    if (concDot) concDot.remove();
    if (!greeted) {
      greeted = true;
      setTimeout(function () { botSay(CONCIERGE.greeting, CONCIERGE.chips); }, 350);
    }
    scrollLog();
    if (concInput) setTimeout(function () { try { concInput.focus(); } catch (e) {} }, 100);
    track('concierge_open');
  }
  function closeConc() {
    if (!panel || !fab) return;
    panel.hidden = true;
    panel.classList.remove('is-open');
    fab.setAttribute('aria-expanded', 'false');
    try { fab.focus(); } catch (e) {}
  }
  if (fab && panel) {
    fab.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      panel.hidden ? openConc() : closeConc();
    });
    var cc = $('#concClose'); if (cc) cc.addEventListener('click', closeConc);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closeConc();
    });
  }

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

/* ---------------- hero background video ---------------- */
  /* Always loops. Each loop fades in over the poster, plays, then fades back
     out into the poster at the end — no visible cut. */
  (function () {
    var hv = $('.hero-video');
    if (!hv) return;
    var wantPlay = false, rafId = null;
    var FADE = 1.1; // seconds of fade at each loop boundary

    function tryPlay() { if (wantPlay) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); } }
    function applyFade() {
      var d = hv.duration, t = hv.currentTime;
      if (!d || !isFinite(d)) { hv.style.opacity = 0; return; }
      var o = 1;
      if (t < FADE) o = t / FADE;
      else if (t > d - FADE) o = Math.max(0, (d - t) / FADE);
      o = o * o * (3 - 2 * o); /* smoothstep */
      hv.style.opacity = o.toFixed(3);
    }
    function tick() { applyFade(); rafId = requestAnimationFrame(tick); }
    function startTick() { if (rafId == null) rafId = requestAnimationFrame(tick); }
    function stopTick() { if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; } }

    hv.addEventListener('loadedmetadata', applyFade);
    hv.addEventListener('play', startTick);
    hv.addEventListener('pause', stopTick);
    hv.addEventListener('ended', function () { hv.currentTime = 0; tryPlay(); });

    /* autoplay regardless of reduced-motion preference: the loop is the hero's
       core visual per the site owner's request; fades keep it calm */
    wantPlay = true;
    hv.addEventListener('canplay', tryPlay);
    hv.addEventListener('loadeddata', tryPlay);

    var heroEl = $('.hero');
    if (heroEl && 'IntersectionObserver' in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) tryPlay(); else hv.pause();
        });
      }, { threshold: 0.12 });
      vio.observe(heroEl);
    } else { tryPlay(); }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hv.pause(); else tryPlay();
    });
  })();

/* ---------------- feedback wall builder ---------------- */
  function initFeedbackWall() {
    var data = (Array.isArray(datasetReviews) && datasetReviews.length)
      ? datasetReviews
      : (Array.isArray(window.FB_REVIEWS) && window.FB_REVIEWS.length)
        ? window.FB_REVIEWS
        : [];
    var container = document.getElementById('fbwallCols');
    if (!container) return;

    if (!data.length) {
      container.innerHTML =
        '<div class="fbwall-fallback" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:48px 20px; text-align:center; min-height:200px; background:#141414; border-radius:12px; margin:16px 0;">' +
          '<span style="color:#D6A84F; font-size:22px; letter-spacing:3px; margin-bottom:10px;" aria-label="5 stars">★★★★★</span>' +
          '<p style="color:#F5F2EA; font-family:var(--disp); font-size:20px; text-transform:uppercase; margin:0 0 8px;">4.9 · 377 Google Reviews</p>' +
          '<p style="color:#A5A096; font-size:13.5px; max-width:480px; margin:0 0 16px;">Verified client reviews from the Custom Ink studio profile in Luxembourg.</p>' +
          '<a href="https://www.google.com/maps/search/?api=1&query=Custom+Ink+Luxembourg+103+Waistrooss+Remerschen" target="_blank" rel="noopener" class="btn btn-gold btn-sm" style="display:inline-block; padding:10px 18px; font-size:11px;">Read all reviews on Google Maps →</a>' +
        '</div>';
      return;
    }

    /* Development-time validation */
    if (window.console && console.assert) {
      console.assert(
        data.length === 377,
        'Custom Ink review dataset should contain 377 reviews (found ' + data.length + ')'
      );
    }

    function esc(x) {
      return String(x == null ? '' : x)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }

    function initials(n) {
      var parts = (n || '').trim().split(/\s+/);
      var a = (parts[0] || '').charAt(0);
      var b = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
      return ((a + b) || 'CI').toUpperCase();
    }

    function createCard(r, isDup) {
      var card = document.createElement('article');
      var rawText = (r.text || r.x || '').trim();
      var hasText = rawText.length > 0;
      card.className = 'review-card fb-card' + (hasText ? '' : ' fb-card--rating');
      if (isDup) {
        card.setAttribute('aria-hidden', 'true');
      }

      var name = (r.name || r.n || 'Anonymous').trim();
      var dateStr = (r.date || r.t || '').trim();
      var sourceName = (r.source || 'Google').trim();
      var rating = typeof r.rating === 'number' ? r.rating : 5;
      var starsStr = '★'.repeat(Math.max(1, Math.min(5, rating))) + '☆'.repeat(Math.max(0, 5 - rating));

      var starsHtml = '<span class="fb-stars-row" aria-label="' + rating + ' stars" title="' + rating + ' stars on ' + esc(sourceName) + '">' + starsStr + '</span>';
      var sourceHtml = '<span class="fb-source-tag">' + esc(sourceName) + ' Review</span>';

      var textHtml = hasText
        ? '<blockquote class="fb-text">“' + esc(rawText) + '”</blockquote>'
        : '<p class="fb-text fb-text--empty">' + rating + '-star ' + esc(sourceName) + ' studio experience</p>';

      var metaDetails = [];
      if (dateStr) metaDetails.push(esc(dateStr));

      card.innerHTML =
        '<div class="fb-card-inner">' +
          '<header class="fb-top-row">' +
            starsHtml +
            sourceHtml +
          '</header>' +
          textHtml +
          '<footer class="fb-footer">' +
            '<div class="fb-ava" aria-hidden="true"><span>' + esc(initials(name)) + '</span></div>' +
            '<div class="fb-who">' +
              '<cite>' + esc(name) + '</cite>' +
              (metaDetails.length ? '<span>' + metaDetails.join(' · ') + '</span>' : '') +
            '</div>' +
          '</footer>' +
        '</div>';
      return card;
    }

    var currentCols = -1;

    function getTargetColCount() {
      var w = window.innerWidth;
      if (w > 960) return 3;
      if (w > 600) return 2;
      return 1;
    }

    function renderWall() {
      var cols = getTargetColCount();
      if (cols === currentCols) return;
      currentCols = cols;

      container.innerHTML = '';

      var durations = [];
      if (cols === 3) {
        durations = [300, 360, 330];
      } else if (cols === 2) {
        durations = [310, 370];
      } else {
        durations = [340];
      }

      for (var c = 0; c < cols; c++) {
        var col = document.createElement('div');
        col.className = 'review-column fb-col fb-col-' + (c + 1);

        var track = document.createElement('div');
        track.className = 'review-track fb-track fb-dir-up';
        track.style.animationDuration = durations[c] + 's';
        track.style.setProperty('--dur', durations[c] + 's');

        // Review Group A (primary sequence)
        var groupA = document.createElement('div');
        groupA.className = 'review-group';

        for (var i = 0; i < data.length; i++) {
          if (i % cols === c) {
            groupA.appendChild(createCard(data[i], false));
          }
        }

        // Review Group B (identical duplicate sequence for seamless -50% loop)
        var groupB = document.createElement('div');
        groupB.className = 'review-group';
        groupB.setAttribute('aria-hidden', 'true');

        for (var j = 0; j < data.length; j++) {
          if (j % cols === c) {
            groupB.appendChild(createCard(data[j], true));
          }
        }

        track.appendChild(groupA);
        track.appendChild(groupB);
        col.appendChild(track);
        container.appendChild(col);
      }
    }

    renderWall();

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderWall, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeedbackWall);
  } else {
    initFeedbackWall();
  }

/* ---------------- footer year ---------------- */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------------- interactive map: locate & route ----------------
     Studio coordinates geocoded from 103, Wäistrooss, L-5440 Remerschen (OSM).
     Routing via OSRM public demo server; basemap CARTO light (monochrome). */
  (function () {
    var SHOP = { lat: 49.4870753, lng: 6.3530326 };
    var mapEl = $('#map'), btn = $('#locateBtn'), statusEl = $('#mapStatus'), mapCard = $('#mapCard');
    if (!mapEl || !btn || !statusEl) return;

    var map = null, userMarker = null, routeLine = null, shopMarker = null;

    function shopIcon() {
      return L.divIcon({ className: '', html: '<span class="ci-shop-pin"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
    }
    function userIcon() {
      return L.divIcon({ className: '', html: '<span class="ci-user-pin"></span>', iconSize: [14, 14], iconAnchor: [7, 7] });
    }
    function initMap() {
      if (map || !window.L) return;
      var isMobile = ('ontouchstart' in window) && window.innerWidth < 768;
      map = L.map('map', {
        scrollWheelZoom: false,
        zoomControl: true,
        dragging: !isMobile,
        tap: false
      });
      map.setView([SHOP.lat, SHOP.lng], 14);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);
      shopMarker = L.marker([SHOP.lat, SHOP.lng], { icon: shopIcon(), title: 'Custom Ink Luxembourg' }).addTo(map);

      // Prevent Leaflet from swallowing touch / click events on the locate card
      if (mapCard && window.L && L.DomEvent) {
        L.DomEvent.disableClickPropagation(mapCard);
        L.DomEvent.disableScrollPropagation(mapCard);
      }
    }

    /* init lazily when the map first scrolls into view (Leaflet loads deferred) */
    var tries = 0;
    function tryInit() {
      if (map) return;
      if (window.L) { initMap(); return; }
      if (tries++ < 40) setTimeout(tryInit, 500);
    }
    var mapIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { tryInit(); mapIo.disconnect(); }
      });
    }, { threshold: 0.05 });
    mapIo.observe(mapEl);

    function setStatus(msg, ok) {
      statusEl.textContent = msg;
      statusEl.classList.toggle('is-ok', !!ok);
      statusEl.classList.add('is-visible');
    }
    function resetBtn(text) { btn.disabled = false; btn.textContent = text; }

    function showRoute(pos) {
      if (!map && window.L) initMap();
      if (!map) {
        setStatus('The map is initializing — please try in a moment.');
        resetBtn('Fetch my location');
        return;
      }
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([lat, lng], { icon: userIcon(), title: 'You are here' }).addTo(map);
      setStatus('Drawing your route to the studio…');
      var url = 'https://router.project-osrm.org/route/v1/driving/' +
        lng + ',' + lat + ';' + SHOP.lng + ',' + SHOP.lat + '?overview=full&geometries=geojson';
      fetch(url)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.code === 'Ok' && data.routes && data.routes[0]) {
            var route = data.routes[0];
            var coords = route.geometry.coordinates.map(function (c) { return [c[1], c[0]]; });
            if (routeLine) map.removeLayer(routeLine);
            routeLine = L.polyline(coords, { color: '#0B0B0B', weight: 3.5, opacity: 0.85 }).addTo(map);
            map.fitBounds(routeLine.getBounds(), { padding: [42, 42] });
            var km = (route.distance / 1000).toFixed(1);
            var min = Math.round(route.duration / 60);
            setStatus('≈ ' + km + ' km · about ' + min + ' min by car to the studio.', true);
            resetBtn('Update my location');
            track('map_route_found', { km: km, min: min });
          } else {
            setStatus('No route found from your location — use Google Maps directions instead.');
            resetBtn('Try again');
          }
        })
        .catch(function () {
          setStatus('Could not reach the routing service — use Google Maps directions instead.');
          resetBtn('Try again');
        });
    }

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!map && window.L) initMap();
      btn.disabled = true;
      btn.textContent = 'Locating…';
      setStatus('Requesting your location from browser…');
      track('map_locate');
      if (!navigator.geolocation) {
        setStatus('Geolocation is not supported in this browser — use Google Maps directions instead.');
        resetBtn('Fetch my location');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          showRoute(pos);
        },
        function (err) {
          var why = '';
          if (err) {
            if (err.code === 1) why = ' (permission denied)';
            else if (err.code === 2) why = ' (position unavailable)';
            else if (err.code === 3) why = ' (timed out)';
          }
          setStatus('Location access unavailable' + why + '. Please allow location access or use Google Maps.');
          resetBtn('Try again');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });

    /* test hook: draw a route from fixed coordinates without geolocation */
    window.__mapTestRoute = function (lat, lng) {
      if (!map && window.L) initMap();
      showRoute({ coords: { latitude: lat, longitude: lng } });
    };
  })();

  /* ---------------- portfolio placement typewriter loop ---------------- */
  (function initPlacementTypewriter() {
    var placeEls = $$('#masonry .g-place');
    if (!placeEls.length) return;

    placeEls.forEach(function (el, idx) {
      var fullText = (el.getAttribute('data-full') || el.textContent || '').trim();
      if (!fullText) return;

      el.setAttribute('data-full', fullText);
      el.setAttribute('aria-label', fullText);

      el.innerHTML = '<span class="g-place-text"></span><span class="g-place-cursor" aria-hidden="true"></span>';
      var textEl = el.querySelector('.g-place-text');
      if (!textEl) return;

      var charIndex = 0;
      var isDeleting = false;
      var typeSpeed = 85;
      var deleteSpeed = 45;
      var holdDuration = 2000;
      var pauseEmpty = 400;

      // Stagger start across cards for an organic, alive editorial feel
      var initialDelay = (idx * 130) % 1800;

      function step() {
        if (!isDeleting) {
          charIndex++;
          textEl.textContent = fullText.slice(0, charIndex);

          if (charIndex >= fullText.length) {
            isDeleting = true;
            setTimeout(step, holdDuration);
            return;
          }
          setTimeout(step, typeSpeed);
        } else {
          charIndex--;
          textEl.textContent = fullText.slice(0, charIndex);

          if (charIndex <= 0) {
            isDeleting = false;
            setTimeout(step, pauseEmpty);
            return;
          }
          setTimeout(step, deleteSpeed);
        }
      }

      setTimeout(step, initialDelay);
    });
  })();

  /* ---------------- global mailto body interceptor ---------------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="info@customink.lu"]');
    if (!a) return;
    var defaultBody = 'Hi, i would like to receive a call to talk more about the services';
    var href = a.getAttribute('href') || '';
    if (href.indexOf('mailto:info@customink.lu') !== -1 && href.indexOf('body=') === -1) {
      var sep = href.indexOf('?') === -1 ? '?' : '&';
      a.setAttribute('href', href + sep + 'body=' + encodeURIComponent(defaultBody));
    }
  });
})();

