/* cart.js: the "my calculation" saved in localStorage (Aisha). Shared by every page.
   The services chosen on the Services page are kept here, so the Booking page can show them.
   Storage key "obsidian_cart" (JSON): { "cls": "sedan", "ids": [1, 3] }
   cls = car class, ids = ids of the services from SERVICES (data.js).
   The nav button "Записаться" shows how many services are saved. */
const Cart = (function () {
  const KEY = 'obsidian_cart';
  const CLASSES = ['sedan', 'crossover', 'suv'];

  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      const ids = data && Array.isArray(data.ids) ? data.ids.filter(Number.isInteger) : [];
      const cls = data && CLASSES.indexOf(data.cls) !== -1 ? data.cls : 'sedan';
      return { cls: cls, ids: Array.from(new Set(ids)) };      // no duplicates
    } catch (err) {
      return { cls: 'sedan', ids: [] };                        // empty or broken storage
    }
  }
  function write(cart) {
    try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (err) { /* storage blocked */ }
    paintBadge();
    $(document).trigger('cart:changed');
  }

  function get() { return read(); }
  function has(id) { return read().ids.indexOf(id) !== -1; }
  function add(id) { const c = read(); if (c.ids.indexOf(id) === -1) { c.ids.push(id); write(c); } }
  function remove(id) { const c = read(); c.ids = c.ids.filter(function (x) { return x !== id; }); write(c); }
  function clear() { const c = read(); c.ids = []; write(c); }
  function setClass(cls) { const c = read(); if (CLASSES.indexOf(cls) !== -1) { c.cls = cls; write(c); } }

  // number on the "Записаться" button of every page
  function paintBadge() {
    const n = read().ids.length;
    $('[data-cart-count]').text(n).prop('hidden', n === 0)
      .attr('title', 'Выбрано услуг: ' + n);
  }
  $(paintBadge);
  // another tab changed the cart: 'cart:external' (only for changes from other tabs) and 'cart:changed'
  $(window).on('storage', function (e) {
    if (e.originalEvent.key === KEY) { paintBadge(); $(document).trigger('cart:external').trigger('cart:changed'); }
  });

  return { get: get, has: has, add: add, remove: remove, clear: clear, setClass: setClass };
})();
