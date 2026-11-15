const Bookings = (function () {
  const KEY = 'obsidian_bookings';
  const PLACE = 'Астана, ул. Култегин, 10';

  function all() {
    const list = Store.read(KEY, []);
    if (!Array.isArray(list)) { return []; }
    return list.filter(function (b) { return b && b.id && b.date && b.time; });
  }

  function sorted() {
    return all().sort(function (a, b) {
      return (a.date + a.time).localeCompare(b.date + b.time);
    });
  }

  function save(list) {
    Store.write(KEY, list);
    $(document).trigger('bookings:changed');
  }

  function add(booking) {
    const list = all();
    list.push(booking);
    save(list);
  }

  function remove(id) {
    save(all().filter(function (b) { return b.id !== id; }));
  }

  function clear() {
    save([]);
  }

  function find(id) {
    return all().find(function (b) { return b.id === id; }) || null;
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function stamp(date, time, addHours) {
    const p = date.split('-').map(Number);
    const t = time.split(':').map(Number);
    const d = new Date(p[0], p[1] - 1, p[2], t[0] + addHours, t[1]);
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  function escapeText(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }

  function toIcs(b) {
    const now = new Date();
    const created = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T' + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
    const description = [
      'Заявка ' + b.code,
      b.summary,
      'Автомобиль: ' + b.car + ' (' + b.className + ')',
      'Предварительная стоимость: ' + b.total + ' тенге'
    ].join('\n');
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Obsidian Detailing//Booking//RU',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + b.id + '@obsidian-detailing',
      'DTSTAMP:' + created,
      'DTSTART:' + stamp(b.date, b.time, 0),
      'DTEND:' + stamp(b.date, b.time, 1),
      'SUMMARY:' + escapeText('Obsidian Detailing: осмотр автомобиля'),
      'LOCATION:' + escapeText(PLACE),
      'DESCRIPTION:' + escapeText(description),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n') + '\r\n';
  }

  function download(b) {
    const blob = new Blob([toIcs(b)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'obsidian-' + b.code + '.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function label(b) {
    const p = b.date.split('-').map(Number);
    const day = new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
    return day + ' в ' + b.time;
  }

  function render($list, $empty, $clear) {
    const items = sorted();
    $list.empty();
    items.forEach(function (b) {
      const $li = $('<li class="booking-item"></li>').attr('data-id', b.id);
      const $info = $('<div class="booking-info"></div>');
      $info.append($('<b class="booking-when"></b>').text(label(b)));
      $info.append($('<span class="booking-what"></span>').text(b.summary + ' · ' + b.car));
      $info.append($('<span class="booking-code"></span>').text(b.code + ' · ' + Site.rub(b.total)));
      const $actions = $('<div class="booking-actions"></div>');
      $('<button type="button" class="btn btn-ghost btn-sm" data-action="ics"></button>').attr('data-id', b.id).text('В календарь').appendTo($actions);
      $('<button type="button" class="btn btn-ghost btn-sm btn-danger-ghost" data-action="cancel"></button>').attr('data-id', b.id).text('Отменить').appendTo($actions);
      $li.append($info, $actions).appendTo($list);
    });
    $empty.prop('hidden', items.length > 0);
    $clear.prop('hidden', items.length === 0);
  }

  function bind($list, onChange) {
    $list.on('click', '[data-action]', function () {
      const id = $(this).attr('data-id');
      const b = find(id);
      if (!b) { return; }
      if ($(this).attr('data-action') === 'ics') {
        download(b);
        Toast.show('Файл календаря скачан: ' + b.code);
        return;
      }
      $(this).closest('li').stop(true, true).slideUp(180, function () {
        remove(id);
        Toast.show('Запись ' + b.code + ' отменена', 'warn');
        onChange();
      });
    });
  }

  return {
    all: all, sorted: sorted, add: add, remove: remove, clear: clear, find: find,
    download: download, label: label, render: render, bind: bind
  };
})();
