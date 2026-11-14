const Toast = (function () {
  const LIFETIME = 3200;
  const LIMIT = 3;
  let $box = null;

  function container() {
    if (!$box) {
      $box = $('<div class="toast-box" role="status" aria-live="polite"></div>').appendTo('body');
    }
    return $box;
  }

  function show(message, type) {
    const $box = container();
    const $item = $('<div class="toast-item"></div>').toggleClass('is-warn', type === 'warn').text(message);
    $box.append($item);
    $item.hide().fadeIn(200);
    $box.children().slice(0, -LIMIT).remove();
    setTimeout(function () {
      $item.fadeOut(300, function () { $item.remove(); });
    }, LIFETIME);
  }

  return { show: show };
})();
