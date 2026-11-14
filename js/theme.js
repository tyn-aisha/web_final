/* theme.js: light / dark mode (Aisha). Loaded in <head> of every page, so the saved mode
   is applied before the page is drawn (no flash). The choice is kept in localStorage
   under "obsidian_theme" ("dark" or "light") and works on every page. */
(function () {
  var KEY = 'obsidian_theme';

  function saved() {
    try {
      var v = localStorage.getItem(KEY);
      return v === 'light' ? 'light' : 'dark';
    } catch (err) {
      return 'dark';              // storage blocked: the default dark mode
    }
  }

  function apply(theme) {
    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);   // Bootstrap components follow the same mode
    var nav = document.querySelector('.site-nav');
    if (nav) { nav.setAttribute('data-bs-theme', theme); }
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var next = theme === 'dark' ? 'светлую' : 'тёмную';
      btn.setAttribute('aria-label', 'Включить ' + next + ' тему');
      btn.setAttribute('title', 'Включить ' + next + ' тему');
      var label = btn.querySelector('.theme-label');
      if (label) { label.textContent = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'; }
    }
  }

  function set(theme) {
    try { localStorage.setItem(KEY, theme); } catch (err) { /* storage blocked: works until reload */ }
    apply(theme);
  }

  apply(saved());                                 // before the first paint

  document.addEventListener('DOMContentLoaded', function () {
    apply(saved());                               // now the toggle button exists
    var btn = document.querySelector('.theme-toggle');
    if (!btn) { return; }
    btn.addEventListener('click', function () {   // a <button>: Enter and Space work too
      set(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  });

  // another tab changed the mode: follow it
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { apply(saved()); }
  });
})();
