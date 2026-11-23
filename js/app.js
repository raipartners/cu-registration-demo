/* CU Credit Union – Registration demo
   Hash router + real form behavior (typing, tab order, gating). No dependencies. */
(function () {
  'use strict';

  var ORDER = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16'];
  var TOTAL_STEPS = 9;
  // External destinations (Consumer Portal demo)
  var LINKS = {
    profile: 'https://consumer-cdn.demo.raipartners.com/account/profile',
    portal:  'https://consumer-cdn.demo.raipartners.com/account/summary'
  };
  var DEMO = { fi: 'CU Credit Union', first: 'Jane', last: 'Doe', email: 'jane@email.com', pw: 'Demo1234!', dob: '07/20/1981', phone: '(123) 456-7890', ssn: '123-45-6789' };
  var state = {};
  var plaidTimer = null;

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Shell: nav, footer, progress ---------- */
  var USER_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#20293a" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M6.2 18.3a7 7 0 0 1 11.6 0"/></svg>';
  $$('.screen[data-nav]').forEach(function (s) {
    var nav = $('#tpl-nav').content.firstElementChild.cloneNode(true);
    var btn = $('[data-action]', nav);
    if (s.dataset.nav === 'portal') {
      var a = document.createElement('a');
      a.className = 'nav-action'; a.href = LINKS.profile; a.setAttribute('aria-label', 'Profile');
      a.innerHTML = USER_ICON;
      btn.replaceWith(a);
    } else {
      btn.innerHTML = '<img src="assets/icon-x.png" alt="">';
      btn.dataset.toast = 'Closing registration isn’t part of this demo.';
    }
    s.insertBefore(nav, s.firstChild);
    s.appendChild($('#tpl-footer').content.firstElementChild.cloneNode(true));
  });
  $$('.screen[data-progress]').forEach(function (s) {
    var n = +s.dataset.progress;
    var bar = document.createElement('div');
    bar.className = 'progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0'); bar.setAttribute('aria-valuemax', String(TOTAL_STEPS)); bar.setAttribute('aria-valuenow', String(n));
    bar.setAttribute('aria-label', 'Step ' + n + ' of ' + TOTAL_STEPS);
    bar.innerHTML = '<div class="track"><div class="fill" style="width:' + (n / TOTAL_STEPS * 100).toFixed(2) + '%"></div></div>';
    var main = $('main', s); main.insertBefore(bar, main.firstChild);
  });

  /* ---------- Router ---------- */
  function current() { var m = location.hash.match(/^#step-(\d\d)$/); return m && ORDER.indexOf(m[1]) > -1 ? m[1] : '01'; }
  function go(id, focusId) {
    pendingFocus = focusId || null;
    if (current() === id) render(); else location.hash = '#step-' + id;
  }
  var pendingFocus = null;
  function render() {
    var id = current();
    $$('.screen').forEach(function (s) { s.classList.toggle('active', s.id === 's' + id); });
    bindAll();
    clearTimeout(plaidTimer);
    if (id === '14') plaidTimer = setTimeout(function () { if (current() === '14') go('15'); }, 2500);
    window.scrollTo(0, 0);
    var screen = $('#s' + id);
    requestAnimationFrame(function () {
      var target = pendingFocus ? $('#' + pendingFocus) : null;
      if (!target) target = $('input:not([type=hidden]):not([type=radio]):not([type=checkbox])', screen) || $('[data-primary]', screen) || $('.btn', screen);
      if (target) target.focus({ preventScroll: true });
      pendingFocus = null;
    });
    document.title = (screen.getAttribute('aria-label') || 'Demo') + ' – CU Credit Union demo';
  }
  window.addEventListener('hashchange', render);

  /* ---------- Bindings ---------- */
  function bindAll() {
    var vals = {
      first: state.first || DEMO.first, last: state.last || DEMO.last, email: state.email || DEMO.email,
      phone: state.phone || DEMO.phone, dob: state.dob || DEMO.dob, fi: state.fi || DEMO.fi,
      ssnMasked: '***-**-' + (state.ssn ? state.ssn.replace(/\D/g, '').slice(-4) : '6789')
    };
    $$('[data-bind]').forEach(function (el) { var k = el.dataset.bind; if (vals[k] != null) el.textContent = vals[k]; });
  }

  /* ---------- Generic clicks ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-go],[data-toast]');
    if (!t) return;
    e.preventDefault();
    if (t.dataset.toast) return toast(t.dataset.toast);
    go(t.dataset.go, t.dataset.focus);
  });

  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
  }

  /* ---------- Field helpers ---------- */
  function syncFilled(input) { var w = input.closest('.input-wrap'); if (w) w.classList.toggle('filled', input.value.trim() !== ''); }
  $$('.input-wrap input').forEach(function (i) { syncFilled(i); i.addEventListener('input', function () { syncFilled(i); }); });
  $$('[data-eye]').forEach(function (b) {
    b.addEventListener('click', function () {
      var i = $('#' + b.dataset.eye); var show = i.type === 'password';
      i.type = show ? 'text' : 'password';
      b.setAttribute('aria-label', (show ? 'Hide ' : 'Show ') + (b.dataset.eye === 'ssn' ? 'SSN' : 'password'));
    });
  });
  function digits(v) { return v.replace(/\D/g, ''); }
  function maskPhone(v) { var d = digits(v).slice(0, 10); if (d.length < 4) return d.length ? '(' + d : ''; if (d.length < 7) return '(' + d.slice(0, 3) + ') ' + d.slice(3); return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6); }
  function maskDob(v) { var d = digits(v).slice(0, 8); if (d.length < 3) return d; if (d.length < 5) return d.slice(0, 2) + '/' + d.slice(2); return d.slice(0, 2) + '/' + d.slice(2, 4) + '/' + d.slice(4); }
  function maskSsn(v) { var d = digits(v).slice(0, 9); if (d.length < 4) return d; if (d.length < 6) return d.slice(0, 3) + '-' + d.slice(3); return d.slice(0, 3) + '-' + d.slice(3, 5) + '-' + d.slice(5); }
  function applyMask(input, fn) {
    input.addEventListener('input', function () {
      var before = input.value; var pos = input.selectionStart; var digitsBefore = digits(before.slice(0, pos)).length;
      input.value = fn(before);
      var i = 0, seen = 0; while (i < input.value.length && seen < digitsBefore) { if (/\d/.test(input.value[i])) seen++; i++; }
      try { input.setSelectionRange(i, i); } catch (err) { /* some input types disallow selection */ }
      syncFilled(input);
    });
  }

  /* ---------- 01: Register info ---------- */
  var f01 = $('#form01');
  applyMask($('#phone'), maskPhone);
  applyMask($('#dob'), maskDob);
  var checks01 = {
    email: function () { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test($('#email').value.trim()); },
    pw: function () { return $('#pw').value.length >= 8; },
    pw2: function () { return $('#pw2').value !== '' && $('#pw2').value === $('#pw').value; },
    dob: function () { var m = $('#dob').value.match(/^(\d\d)\/(\d\d)\/(\d{4})$/); return !!m && +m[1] >= 1 && +m[1] <= 12 && +m[2] >= 1 && +m[2] <= 31 && +m[3] > 1900; },
    phone: function () { return digits($('#phone').value).length === 10; }
  };
  var errMap = { email: 'f-email', pw: 'f-pw', pw2: 'f-pw2', dob: 'f-dob', phone: 'f-phone' };
  function valid01() {
    var filled = ['fi', 'first', 'last'].every(function (id) { return $('#' + id).value.trim() !== ''; });
    var ok = Object.keys(checks01).every(function (k) { return checks01[k](); });
    return filled && ok && $('#terms').checked && $('#esign').checked && $('#captcha').checked;
  }
  function update01() { $('#next01').disabled = !valid01(); }
  f01.addEventListener('input', update01);
  f01.addEventListener('change', update01);
  Object.keys(errMap).forEach(function (k) {
    var input = $('#' + k);
    input.addEventListener('blur', function () { if (input.value) $('#' + errMap[k]).classList.toggle('error', !checks01[k]()); });
    input.addEventListener('input', function () { var f = $('#' + errMap[k]); if (f.classList.contains('error') && checks01[k]()) f.classList.remove('error'); });
  });
  f01.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valid01()) { Object.keys(errMap).forEach(function (k) { $('#' + errMap[k]).classList.toggle('error', !!$('#' + k).value && !checks01[k]()); }); return; }
    ['fi', 'first', 'last', 'email', 'dob', 'phone'].forEach(function (k) { state[k] = $('#' + k).value.trim(); });
    go('02');
  });

  /* ---------- 07: OTP ---------- */
  var OTP_LEN = 8;
  var otpWrap = $('#otp');
  for (var i = 0; i < OTP_LEN; i++) {
    var inp = document.createElement('input');
    inp.inputMode = 'numeric'; inp.maxLength = 1; inp.autocomplete = i === 0 ? 'one-time-code' : 'off';
    inp.setAttribute('aria-label', 'Digit ' + (i + 1) + ' of ' + OTP_LEN);
    otpWrap.appendChild(inp);
  }
  var otpInputs = $$('input', otpWrap);
  function updateOtp() { otpInputs.forEach(function (x) { x.classList.toggle('filled', x.value !== ''); }); $('#next07').disabled = !otpInputs.every(function (x) { return /\d/.test(x.value); }); }
  otpInputs.forEach(function (inp, idx) {
    inp.addEventListener('input', function () {
      var d = digits(inp.value);
      if (d.length > 1) { fillOtpFrom(idx, d); return; }
      inp.value = d;
      if (d && idx < OTP_LEN - 1) otpInputs[idx + 1].focus();
      updateOtp();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !inp.value && idx > 0) { otpInputs[idx - 1].focus(); otpInputs[idx - 1].value = ''; updateOtp(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && idx > 0) { otpInputs[idx - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && idx < OTP_LEN - 1) { otpInputs[idx + 1].focus(); e.preventDefault(); }
    });
    inp.addEventListener('paste', function (e) { e.preventDefault(); fillOtpFrom(idx, digits((e.clipboardData || window.clipboardData).getData('text'))); });
    inp.addEventListener('focus', function () { inp.select(); });
  });
  function fillOtpFrom(start, d) {
    for (var j = 0; j < d.length && start + j < OTP_LEN; j++) otpInputs[start + j].value = d[j];
    otpInputs[Math.min(start + d.length, OTP_LEN - 1)].focus();
    updateOtp();
  }
  $('#form07').addEventListener('submit', function (e) { e.preventDefault(); if (!$('#next07').disabled) go('08'); });

  /* ---------- 08: SSN ---------- */
  applyMask($('#ssn'), maskSsn);
  $('#ssn').addEventListener('input', function () { $('#next08').disabled = digits($('#ssn').value).length !== 9; });
  $('#form08').addEventListener('submit', function (e) { e.preventDefault(); if ($('#next08').disabled) return; state.ssn = $('#ssn').value; go('09'); });

  /* ---------- 12 + 06: option rows ---------- */
  $$('.option input').forEach(function (r) {
    r.addEventListener('change', function () {
      $$('input[name="' + r.name + '"]').forEach(function (o) { o.closest('.option').classList.toggle('selected', o.checked); });
    });
  });
  $('#form12').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = ($('input[name="pay"]:checked') || {}).value;
    if (v === 'link') go('13'); else { toast(v === 'check' ? 'Mail-a-check selected — skipping bank linking.' : 'Bill pay selected — skipping bank linking.'); go('16'); }
  });

  /* ---------- 14: Plaid placeholder ---------- */
  $('#s14').addEventListener('click', function () { go('15'); });
  document.addEventListener('keydown', function (e) {
    if (current() === '14' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go('15'); }
  });

  /* ---------- 16: finish ---------- */
  $('#finish').addEventListener('click', function () { window.location.href = LINKS.portal; });
  function resetDemo() {
    state = {};
    $$('form').forEach(function (f) { f.reset(); });
    $$('.input-wrap input').forEach(syncFilled);
    $$('.field.error').forEach(function (f) { f.classList.remove('error'); });
    otpInputs.forEach(function (x) { x.value = ''; }); updateOtp();
    $('#next01').disabled = true; $('#next08').disabled = true;
    $$('.option input').forEach(function (r) { r.closest('.option').classList.toggle('selected', r.checked); });
    go('01');
  }

  /* ---------- Presenter shortcut: Shift+Alt+D fills the current form with demo data ---------- */
  document.addEventListener('keydown', function (e) {
    if (!(e.shiftKey && e.altKey && (e.code === 'KeyD'))) return;
    e.preventDefault();
    var id = current();
    if (id === '01') {
      ['fi', 'first', 'last', 'email', 'dob', 'phone'].forEach(function (k) { $('#' + k).value = DEMO[k]; });
      $('#pw').value = DEMO.pw; $('#pw2').value = DEMO.pw;
      $('#terms').checked = $('#esign').checked = $('#captcha').checked = true;
      $$('#form01 .input-wrap input').forEach(syncFilled); update01(); $('#next01').focus();
    } else if (id === '07') { fillOtpFrom(0, '12345678'); $('#next07').focus(); }
    else if (id === '08') { $('#ssn').value = DEMO.ssn; syncFilled($('#ssn')); $('#next08').disabled = false; $('#next08').focus(); }
    toast('Demo data filled');
  });

  render();
})();
