/* booking.js: booking page (Bertan).
   Data: extras (8 objects), time slots (8 objects), promo codes.
   Features: 1) live price calculator with extras and promo code (total is calculated),
   2) time slots built for the chosen date (busy slots are disabled),
   3) validated booking form with a success message,
   4) services chosen on the Services page come from localStorage (cart.js): they are shown with a total,
      can be removed one by one or cleared, and are included in the price. */
const EXTRAS = [
  { id: 'ozone',    name: 'Озонирование салона',      price: 8000,  hours: 1, note: 'Убирает запахи' },
  { id: 'lights',   name: 'Полировка фар',            price: 12000, hours: 2, note: 'Прозрачные фары' },
  { id: 'wheels',   name: 'Керамика на диски',        price: 25000, hours: 4, note: 'Диски не грязнятся' },
  { id: 'glass',    name: 'Керамика на стёкла',       price: 15000, hours: 2, note: 'Вода скатывается' },
  { id: 'engine',   name: 'Мойка двигателя',          price: 8000,  hours: 1, note: 'Без риска для электрики' },
  { id: 'leather',  name: 'Кондиционер для кожи',     price: 20000, hours: 3, note: 'Мягкая кожа салона' },
  { id: 'trunk',    name: 'Чистка багажника',         price: 6000,  hours: 1, note: 'Ковёр и ниши' },
  { id: 'report',   name: 'Видеоотчёт о работах',     price: 3000,  hours: 0, note: 'Ролик в WhatsApp' }
];
const PROMOS = [
  { code: 'OBSIDIAN10', percent: 10 },
  { code: 'FIRST5',     percent: 5 },
  { code: 'WINTER15',   percent: 15 }
];

$(function () {
  const form = $('#bookingForm')[0];
  const $form = $(form);
  const $total = $('#sumTotal');
  const totalAnim = { v: 0 };

  /* ---- extras built from the array ---- */
  const $extras = $('#extrasList');
  EXTRAS.forEach(function (e) {
    const $label = $('<label class="extra-item"></label>');
    $('<input class="form-check-input extra" type="checkbox" name="extra">').val(e.id).appendTo($label);
    const $txt = $('<span class="extra-text"></span>');
    $('<b></b>').text(e.name).appendTo($txt);
    $('<small></small>').text(e.note).appendTo($txt);
    $label.append($txt).append($('<em></em>').text('+' + Site.rub(e.price)));
    $extras.append($label);
  });

  /* ---- car classes and packages from data.js ---- */
  const $classGrid = $('#classGrid');
  CAR_CLASSES.forEach(function (c, i) {
    const $l = $('<label class="class-option"></label>');
    $('<input type="radio" name="carClass">').val(c.id).prop('checked', c.id === Cart.get().cls).appendTo($l);
    $l.append($('<span></span>').append($('<b></b>').text(c.name)).append($('<small></small>').text(c.examples)));
    $classGrid.append($l);
  });
  const $pkg = $('#package');
  // "no package": only the services chosen on the Services page (price 0, so the package adds nothing)
  const NO_PACKAGE = { id: 'none', name: 'Без пакета', prices: { sedan: 0, crossover: 0, suv: 0 } };
  $('<option></option>').val(NO_PACKAGE.id).text('Без пакета: только выбранные услуги').appendTo($pkg);
  PACKAGES.forEach(function (p) {
    $('<option></option>').val(p.id).text(p.name + ': ' + p.lead).appendTo($pkg);
  });
  function defaultPackage() { return Cart.get().ids.length > 0 ? NO_PACKAGE.id : 'ceramic'; }
  $pkg.val(defaultPackage());

  /* ---- services saved from the Services page (localStorage) ---- */
  function savedServices() {
    const cls = form.elements.carClass.value;
    return Cart.get().ids.map(function (id) {
      return SERVICES.find(function (s) { return s.id === id; });
    }).filter(Boolean).map(function (s) {
      return { id: s.id, name: s.name, category: CATEGORY_NAMES[s.category], price: s.prices[cls], hours: s.hours };
    });
  }
  function renderCartPanel() {
    const items = savedServices();
    const $list = $('#cartList').empty();
    let sum = 0, hours = 0;
    items.forEach(function (s) {
      sum += s.price; hours += s.hours;
      const $li = $('<li class="cart-item"></li>');
      $li.append($('<span class="cart-item-name"></span>').append($('<small></small>').text(s.category)).append(document.createTextNode(s.name)));
      $li.append($('<em></em>').text(Site.rub(s.price)));
      $('<button type="button" class="cart-remove"></button>').attr('aria-label', 'Убрать из расчёта: ' + s.name).data('id', s.id).text('×').appendTo($li);
      $list.append($li);
    });
    $('#cartEmpty').toggle(items.length === 0);
    $('#cartTotalRow').toggle(items.length > 0);
    $('#cartPanelClear').toggle(items.length > 0);
    $('#cartPanelSum').text(Site.rub(sum));
    $('#cartPanelHours').text(items.length ? '· ' + (hours >= 8 ? 'около ' + Math.ceil(hours / 8) + ' раб. дн.' : hours + ' ч') : '');
    return { items: items, sum: sum };
  }
  $('#cartList').on('click', '.cart-remove', function () {
    const $li = $(this).closest('li');
    const id = $(this).data('id');
    $li.stop(true, true).slideUp(160, function () { Cart.remove(id); });
  });
  $('#cartPanelClear').on('click', function () { Cart.clear(); });
  // the cart changed (here or in another tab): redraw the list and the price
  $(document).on('cart:changed', function () {
    if (Cart.get().ids.length === 0 && $pkg.val() === NO_PACKAGE.id) { $pkg.val('ceramic'); }
    renderCartPanel();
    updateSummary();
  });

  /* ---- price calculation ---- */
  function currentPromo() {
    const code = $('#promo').val().trim().toUpperCase();
    return PROMOS.find(function (p) { return p.code === code; }) || null;
  }
  function calc() {
    const cls = form.elements.carClass.value;
    const pack = $pkg.val() === NO_PACKAGE.id ? NO_PACKAGE : PACKAGES.find(function (p) { return p.id === $pkg.val(); });
    const services = savedServices();
    const servicesSum = services.reduce(function (t, s) { return t + s.price; }, 0);
    let extrasSum = 0, extrasCount = 0, hours = 0;
    $form.find('.extra:checked').each(function () {
      const e = EXTRAS.find(function (x) { return x.id === this.value; }, this);
      extrasSum += e.price; hours += e.hours; extrasCount += 1;
    });
    const subtotal = pack.prices[cls] + servicesSum + extrasSum;
    const promo = currentPromo();
    const discount = promo ? Math.round(subtotal * promo.percent / 100) : 0;
    return { pack: pack, services: services, servicesSum: servicesSum, cls: CAR_CLASSES.find(function (c) { return c.id === cls; }), extrasSum: extrasSum, extrasCount: extrasCount, discount: discount, promo: promo, total: subtotal - discount, hours: hours };
  }
  function updateSummary() {
    const c = calc();
    $('#sumPackage').text(c.pack.name);
    $('#sumClass').text(c.cls.name);
    $('#sumServices').text(c.services.length ? c.services.length + ' шт. · ' + Site.rub(c.servicesSum) : '0 ₸');
    $('#sumExtras').text(c.extrasCount ? c.extrasCount + ' шт. · ' + Site.rub(c.extrasSum) : '0 ₸');
    $('#sumDiscountRow').toggle(!!c.promo);
    $('#sumDiscount').text(c.promo ? '−' + Site.rub(c.discount) + ' (' + c.promo.percent + '%)' : '');
    // animated change of the total (one tween object, so fast clicks do not stack)
    $(totalAnim).stop(true).animate({ v: c.total }, {
      duration: 350,
      step: function (now) { $total.text(Site.rub(Math.round(now))); },
      complete: function () { $total.text(Site.rub(c.total)); }
    });
    $total.parent().stop(true, true).css('position', 'relative').animate({ top: -3 }, 90).animate({ top: 0 }, 90);
    return c;
  }
  $form.on('change input', 'input[name=carClass], #package, .extra, #promo', function () {
    updateSummary();
  });
  // the car class is saved too: prices of the saved services depend on it
  $form.on('change', 'input[name=carClass]', function () { Cart.setClass(this.value); });

  /* ---- time slots for the chosen date ---- */
  const dateInput = $('#date')[0];
  const fmt = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const today = new Date();
  const maxDate = new Date(today.getTime() + 90 * 86400000);
  dateInput.min = fmt(today);
  dateInput.max = fmt(maxDate);

  function renderSlots() {
    const $box = $('#slotList').empty();
    const d = dateInput.value;
    if (!d) {
      $box.append($('<p class="slot-hint"></p>').text('Сначала выберите дату, и мы покажем свободное время.'));
      return;
    }
    let free = 0;
    SLOTS.forEach(function (s, i) {
      const busy = Schedule.isPast(d, s, today) || Schedule.isBusy(d, s);
      if (!busy) { free += 1; }
      const $l = $('<label class="slot"></label>').toggleClass('is-busy', busy);
      $('<input type="radio" name="time">').val(s.time).prop('disabled', busy).appendTo($l);
      $l.append($('<span></span>').append($('<b></b>').text(s.time)).append($('<small></small>').text(busy ? 'занято' : s.period)));
      $l.hide().appendTo($box).delay(i * 40).fadeIn(200);
    });
    $('#slotFree').text(free === 0 ? 'На эту дату свободного времени нет. Выберите другую дату.' : 'Свободно окон: ' + free + ' из ' + SLOTS.length);
  }
  $('#date').on('change', function () { renderSlots(); });

  /* ---- booking data helpers ---- */
  const RECO_KEY = 'obsidian_recommendation';
  let lastBooking = null;
  function bookingSummary(c) {
    const parts = [];
    if (c.pack.id !== NO_PACKAGE.id) { parts.push('Пакет ' + c.pack.name); }
    c.services.forEach(function (s) { parts.push(s.name); });
    $form.find('.extra:checked').each(function () {
      const e = EXTRAS.find(function (x) { return x.id === this.value; }, this);
      if (e) { parts.push(e.name); }
    });
    return parts.join(', ');
  }
  function fillFromProfile() {
    const user = Auth.current();
    if (!user) { return false; }
    const values = { name: user.name, phone: user.phone, email: user.email, car: user.brand };
    let filled = false;
    Object.keys(values).forEach(function (field) {
      const input = form.elements[field];
      if (input && input.value.trim() === '') {
        input.value = values[field];
        filled = true;
      }
    });
    return filled;
  }

  /* ---- validation ---- */
  const R = Validator.rules;
  const toDate = function (s) { const p = s.split('-'); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); };
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  Validator.attach('#bookingForm', {
    name:    [R.required('Введите ваше имя'), R.minLen(2, 'Имя должно содержать минимум 2 буквы'), R.pattern(/^[\p{L}\s'-]+$/u, 'В имени допустимы только буквы')],
    phone:   [R.required('Введите номер телефона'), R.phone('Номер выглядит так: +7 705 000 00 00')],
    email:   [R.required('Введите e-mail'), R.email('Проверьте e-mail: нужен адрес вида name@mail.kz')],
    car:     [R.required('Укажите марку и модель автомобиля'), R.minLen(3, 'Название слишком короткое: например, Audi A6'), R.pattern(/\p{L}/u, 'В названии должны быть буквы')],
    date:    [R.required('Выберите дату визита'),
              R.custom(function (v) { return v === '' || toDate(v) >= startOfToday || 'Эта дата уже прошла: выберите сегодняшнюю или более позднюю'; }),
              R.custom(function (v) { return v === '' || toDate(v) <= maxDate || 'Запись открыта на 90 дней вперёд'; })],
    package: [R.custom(function (v) { return v !== NO_PACKAGE.id || Cart.get().ids.length > 0 || 'Выберите пакет или добавьте услуги на странице «Услуги и цены»'; })],
    time:    [R.required('Выберите свободное время')],
    promo:   [R.custom(function (v) { return v.trim() === '' || PROMOS.some(function (p) { return p.code === v.trim().toUpperCase(); }) || 'Такого промокода нет. Проверьте написание или оставьте поле пустым'; })],
    consent: [R.required('Нужно согласие на обработку данных')]
  }, {
    successSelector: '#bookingSuccess',
    onSuccess: function (v) {
      const c = calc();
      const code = 'OD-' + String(Date.now()).slice(-5);
      const date = toDate(v.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      $('#successCode').text(code);
      lastBooking = {
        id: 'b' + Date.now(),
        code: code,
        name: v.name,
        phone: v.phone,
        email: v.email,
        car: v.car,
        carClass: c.cls.id,
        className: c.cls.name,
        summary: bookingSummary(c),
        date: v.date,
        time: v.time,
        total: c.total,
        created: new Date().toISOString()
      };
      Bookings.add(lastBooking);
      Store.remove(RECO_KEY);
      $('#recoBox').prop('hidden', true);
      Toast.show('Запись ' + code + ' сохранена в «Мои записи»');
      Cart.clear();             // the request is sent: the saved list is not needed any more
      const what = (c.pack.id === NO_PACKAGE.id ? '' : 'пакет ' + c.pack.name + ', ') + (c.services.length ? 'услуг из прайса: ' + c.services.length + ', ' : '');
      $('#successText').text(v.name + ', спасибо! Заявка ' + code + ': ' + what + c.cls.name.toLowerCase() + ', ' + date + ' в ' + v.time + '. Предварительная стоимость: ' + Site.rub(c.total) + '. Мы позвоним в течение часа.');
    }
  });
  $form.on('form:cleared', function () {
    // after a successful submit: restore defaults and recalculate
    $('input[name=carClass][value=' + Cart.get().cls + ']').prop('checked', true);
    $pkg.val(defaultPackage());
    fillFromProfile();
    renderCartPanel();
    renderSlots();
    updateSummary();
  });
  $('#successClose').on('click', function () { $('#bookingSuccess').stop(true, true).slideUp(250); });

  renderCartPanel();
  renderSlots();
  updateSummary();

  const params = new URLSearchParams(location.search);
  const wantedDate = params.get('date');
  const wantedTime = params.get('time');
  if (wantedDate && /^\d{4}-\d{2}-\d{2}$/.test(wantedDate) && wantedDate >= dateInput.min && wantedDate <= dateInput.max) {
    dateInput.value = wantedDate;
    renderSlots();
    const $wanted = $('#slotList input[value="' + String(wantedTime).replace(/[^0-9:]/g, '') + '"]');
    if ($wanted.length && !$wanted.prop('disabled')) {
      $wanted.prop('checked', true);
      Toast.show('Время выбрано: ' + toDate(wantedDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }) + ' в ' + $wanted.val());
    }
  }

  if (fillFromProfile()) {
    Toast.show('Данные подставлены из вашего профиля');
  }

  const $bookingList = $('#bookingList');
  function renderBookings() {
    Bookings.render($bookingList, $('#bookingsEmpty'), $('#bookingsClear'));
  }
  Bookings.bind($bookingList, renderBookings);
  $('#bookingsClear').on('click', function () {
    Bookings.clear();
    renderBookings();
    Toast.show('Все записи удалены', 'warn');
  });
  $(document).on('bookings:changed', renderBookings);
  renderBookings();

  $('#successIcs').on('click', function () {
    if (lastBooking) {
      Bookings.download(lastBooking);
      Toast.show('Файл календаря скачан: ' + lastBooking.code);
    }
  });

  const reco = Store.read(RECO_KEY, null);
  const recoValid = reco && PACKAGES.some(function (p) { return p.id === reco.pkg; }) && CAR_CLASSES.some(function (c) { return c.id === reco.carClass; });
  if (recoValid) {
    const recoPack = PACKAGES.find(function (p) { return p.id === reco.pkg; });
    const recoClass = CAR_CLASSES.find(function (c) { return c.id === reco.carClass; });
    $('#recoText').text('Из подбора пакета: ' + recoPack.name + ' для класса «' + recoClass.name + '», от ' + Site.rub(reco.cost));
    $('#recoBox').prop('hidden', false);
    $('#recoApply').on('click', function () {
      $pkg.val(recoPack.id);
      $('input[name=carClass][value=' + recoClass.id + ']').prop('checked', true);
      Cart.setClass(recoClass.id);
      updateSummary();
      Toast.show('Выбран пакет ' + recoPack.name + ', класс «' + recoClass.name + '»');
    });
  }
});
