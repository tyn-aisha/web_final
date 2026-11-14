const Favorites = (function () {
  const KEY = 'obsidian_favorites';

  function ids() {
    const list = Store.read(KEY, []);
    if (!Array.isArray(list)) { return []; }
    return Array.from(new Set(list.filter(Number.isInteger)));
  }

  function has(id) {
    return ids().indexOf(id) !== -1;
  }

  function count() {
    return ids().length;
  }

  function paint() {
    const n = count();
    $('[data-fav-count]').text(n).prop('hidden', n === 0).attr('title', 'Избранных работ: ' + n);
  }

  function save(list) {
    Store.write(KEY, list);
    paint();
    $(document).trigger('favorites:changed');
  }

  function toggle(id) {
    const list = ids();
    const i = list.indexOf(id);
    if (i === -1) {
      list.push(id);
      save(list);
      return true;
    }
    list.splice(i, 1);
    save(list);
    return false;
  }

  function remove(id) {
    save(ids().filter(function (x) { return x !== id; }));
  }

  function clear() {
    save([]);
  }

  $(paint);
  $(window).on('storage', function (e) {
    if (e.originalEvent.key === KEY) {
      paint();
      $(document).trigger('favorites:external').trigger('favorites:changed');
    }
  });

  return { ids: ids, has: has, count: count, toggle: toggle, remove: remove, clear: clear };
})();
