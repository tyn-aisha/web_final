/* services.js: services page (Yeraly). Data (SERVICES, PACKAGES) is in data.js, content built with the DOM.
   Features: 1) search / filter / sort of the price list, 2) cart with a total,
   3) package finder (validated form with a calculated recommendation). */
$(function () {
  /* ---- packages built from data.js ---- */
  const $pk = $('#packages');
  PACKAGES.forEach(function (p) {
    const $col = $('<div class="col-12 col-md-6 col-lg-4"></div>');
    const $a = $('<article class="card-gloss package reveal"></article>').toggleClass('package-featured', p.featured);
    if (p.featured) { $('<span class="badge-top"></span>').text('Популярный').appendTo($a); }
    $('<h3></h3>').text(p.name).appendTo($a);
    $('<p class="price"></p>').text('от ' + Site.rub(p.prices.sedan)).appendTo($a);
    $('<p class="text-muted-2"></p>').text(p.lead).appendTo($a);
    const $ul = $('<ul></ul>');
    p.includes.forEach(function (t) { $('<li></li>').text(t).appendTo($ul); });
    $a.append($ul);
    $('<a class="btn w-100"></a>').addClass(p.featured ? 'btn-accent' : 'btn-ghost').attr('href', 'booking.html').text('Выбрать').appendTo($a);
    $pk.append($col.append($a));
  });
  Site.reveal($pk.find('.reveal'));

  /* ---- price list: search, filter, sort, cart ---- */
  // the chosen services and the car class are saved in localStorage (cart.js), so they stay after a reload
  // and the Booking page can show them
  const state = { cat: 'all', query: '', sort: 'name', cls: Cart.get().cls };
  const $body = $('#priceBody');
  const $empty = $('#priceEmpty');
  const $table = $('#priceWrap');
  const $bar = $('#cartBar');

  function list() {
    const q = state.query.trim().toLowerCase();
    const items = SERVICES.filter(function (s) {
      return (state.cat === 'all' || s.category === state.cat) && (q === '' || s.name.toLowerCase().includes(q));
    });
    items.sort(function (a, b) {
      if (state.sort === 'asc') { return a.prices[state.cls] - b.prices[state.cls]; }
      if (state.sort === 'desc') { return b.prices[state.cls] - a.prices[state.cls]; }
      if (state.sort === 'time') { return a.hours - b.hours; }
      return a.name.localeCompare(b.name, 'ru');
    });
    return items;
  }

  function renderTable() {
    const items = list();
    $body.empty();
    $('#priceCount').html('Показано услуг: <b>' + items.length + '</b> из ' + SERVICES.length);
    $table.toggle(items.length > 0);
    $empty.toggle(items.length === 0);
    items.forEach(function (s, i) {
      const $tr = $('<tr></tr>').toggleClass('picked', Cart.has(s.id));
      const $pick = $('<td class="pick" data-label="В расчёт"></td>');
      $('<input class="form-check-input" type="checkbox">').attr({ id: 'pick' + s.id, 'aria-label': 'Добавить в расчёт: ' + s.name }).prop('checked', Cart.has(s.id)).data('id', s.id).appendTo($pick);
      $tr.append($pick);
      $('<th scope="row"></th>').append($('<span class="cat"></span>').text(CATEGORY_NAMES[s.category])).append(document.createTextNode(s.name)).appendTo($tr);
      CAR_CLASSES.forEach(function (c) {
        $('<td></td>').attr('data-label', c.name).toggleClass('col-sel', c.id === state.cls).text(Site.rub(s.prices[c.id])).appendTo($tr);
      });
      $('<td></td>').attr('data-label', 'Срок').text(s.duration).appendTo($tr);
      $tr.hide().appendTo($body).delay(i * 30).fadeIn(220);
    });
    $('#priceHead th[data-class]').each(function () { $(this).toggleClass('col-sel', $(this).data('class') === state.cls); });
  }

  function renderCart() {
    let total = 0, hours = 0;
    const ids = Cart.get().ids;
    ids.forEach(function (id) {
      const s = SERVICES.find(function (x) { return x.id === id; });
      if (!s) { return; }          // an old id that no longer exists
      total += s.prices[state.cls];
      hours += s.hours;
    });
    $('#cartCount').text(ids.length);
    $('#cartTotal').text(Site.rub(total));
    $('#cartHours').text(hours >= 8 ? 'около ' + Math.ceil(hours / 8) + ' раб. дн.' : hours + ' ч');
    if (ids.length > 0) { $bar.stop(true, true).slideDown(250); }
    else { $bar.stop(true, true).slideUp(200); }
  }

  $body.on('change', 'input[type=checkbox]', function () {
    const id = $(this).data('id');
    if (this.checked) { Cart.add(id); } else { Cart.remove(id); }
    $(this).closest('tr').toggleClass('picked', this.checked);
    renderCart();
  });
  $('#cartClear').on('click', function () { Cart.clear(); renderTable(); renderCart(); });

  $('#catChips').on('click', '.chip', function () {
    state.cat = $(this).data('cat');
    $('#catChips .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderTable();
  });
  $('#classChips').on('click', '.chip', function () {
    state.cls = $(this).data('cls');
    Cart.setClass(state.cls);
    $('#classChips .chip').attr('aria-pressed', 'false'); $(this).attr('aria-pressed', 'true');
    renderTable(); renderCart();
  });
  $('#priceSearch').on('input', function () { state.query = this.value; renderTable(); });
  $('#priceSort').on('change', function () { state.sort = this.value; renderTable(); });
  $('#resetFilters').on('click', function () {
    state.cat = 'all'; state.query = ''; state.sort = 'name';
    $('#priceSearch').val(''); $('#priceSort').val('name');
    $('#catChips .chip').attr('aria-pressed', 'false').first().attr('aria-pressed', 'true');
    renderTable();
  });
  // show the saved car class and the saved services when the page opens
  $('#classChips .chip').attr('aria-pressed', 'false').filter(function () { return $(this).data('cls') === state.cls; }).attr('aria-pressed', 'true');
  renderTable();
  renderCart();
  // the cart was changed in another tab
  $(document).on('cart:external', function () {
    state.cls = Cart.get().cls;
    $('#classChips .chip').attr('aria-pressed', 'false').filter(function () { return $(this).data('cls') === state.cls; }).attr('aria-pressed', 'true');
    renderTable(); renderCart();
  });

  /* ---- package finder ---- */
  function recommend(v) {
    const budget = Number(v.budget);
    const age = new Date().getFullYear() - Number(v.year);
    const byId = function (id) { return PACKAGES.find(function (p) { return p.id === id; }); };
    const price = function (id) { return byId(id).prices[v.carClass]; };
    const reasons = [];
    let pick;
    if (v.goal === 'interior') {
      pick = 'interior'; reasons.push('Вы хотите обновить салон, а пакет Interior закрывает химчистку, кожу и озонирование.');
    } else if (v.goal === 'protect') {
      pick = budget >= price('ceramic') ? 'ceramic' : 'fresh';
      reasons.push(pick === 'ceramic' ? 'Для защиты на годы подходит керамика, и она укладывается в бюджет.' : 'Бюджета не хватает на керамику, поэтому Fresh с воском на 3 месяца: это самая разумная защита.');
      if (age <= 2 && pick === 'ceramic') { reasons.push('Автомобиль новый, и керамика сохранит заводской лак почти без полировки.'); }
    } else if (v.goal === 'restore') {
      pick = budget >= price('ceramic') ? 'ceramic' : 'fresh';
      reasons.push(pick === 'ceramic' ? 'Коррекционная полировка из пакета Ceramic убирает царапины, а керамика закрепляет результат.' : 'Fresh включает лёгкую полировку. Для глубоких царапин лучше накопить на Ceramic.');
      if (v.condition === 'bad') { reasons.push('Лак в плохом состоянии: на осмотре мастер уточнит объём полировки.'); }
    } else {
      pick = 'fresh'; reasons.push('Перед продажей достаточно Fresh: аккуратный кузов добавляет к цене автомобиля.');
      if (budget >= price('fresh') + price('interior')) { reasons.push('Бюджет позволяет добавить Interior: чистый салон продаёт машину быстрее.'); }
    }
    if (age >= 10 && pick === 'fresh') { reasons.push('Автомобилю ' + age + ' лет: возможно, понадобится дополнительная полировка.'); }
    const p = byId(pick), cost = price(pick);
    return { pkg: p, cost: cost, left: budget - cost, reasons: reasons };
  }

  const R = Validator.rules;
  const thisYear = new Date().getFullYear();
  Validator.attach('#finderForm', {
    name:      [R.required('Введите имя'), R.minLen(2, 'Имя должно содержать минимум 2 буквы'), R.pattern(/^[\p{L}\s'-]+$/u, 'В имени допустимы только буквы')],
    email:     [R.required('Введите e-mail'), R.email('Проверьте e-mail: нужен адрес вида name@mail.kz')],
    year:      [R.required('Укажите год выпуска'), R.number(1990, thisYear, 'Год выпуска должен быть от 1990 до ' + thisYear)],
    carClass:  [R.required('Выберите класс автомобиля')],
    condition: [R.required('Выберите состояние кузова')],
    goal:      [R.required('Выберите, что для вас важнее всего')],
    budget:    [R.required('Укажите бюджет'), R.number(15000, 1000000, 'Бюджет должен быть от 15 000 до 1 000 000 ₸')]
  }, {
    successSelector: '#finderResult',
    onSuccess: function (v) {
      const r = recommend(v);
      $('#fName').text(v.name);
      $('#fPackage').text(r.pkg.name);
      $('#fPrice').text('от ' + Site.rub(r.cost));
      $('#fBudget').text(r.left >= 0 ? 'Остаток от бюджета: ' + Site.rub(r.left) : 'Не хватает: ' + Site.rub(-r.left));
      const $ul = $('#fReasons').empty();
      r.reasons.forEach(function (t) { $('<li></li>').text(t).appendTo($ul); });
      Store.write('obsidian_recommendation', { pkg: r.pkg.id, carClass: v.carClass, cost: r.cost, created: new Date().toISOString() });
      Toast.show('Рекомендация сохранена: ' + r.pkg.name);
    }
  });
});

$(function () {
  let term = 6;

  function cartTotal() {
    const cart = Cart.get();
    return cart.ids.reduce(function (sum, id) {
      const service = SERVICES.find(function (s) { return s.id === id; });
      return service ? sum + service.prices[cart.cls] : sum;
    }, 0);
  }

  function renderInstallment() {
    const total = cartTotal();
    $('#termChips .chip').each(function () {
      $(this).attr('aria-pressed', Number($(this).data('term')) === term);
    });
    if (total === 0) {
      $('#installmentMonthly').text('—');
      $('#installmentNote').text('');
      $('#installmentHint').text('Выберите услуги в прайс-листе, и мы посчитаем ежемесячный платёж.');
      return;
    }
    const monthly = Math.ceil(total / term);
    $('#installmentMonthly').text(Site.rub(monthly));
    $('#installmentNote').text(term + ' мес. · всего ' + Site.rub(monthly * term));
    $('#installmentHint').text('Сумма выбранных услуг: ' + Site.rub(total) + '. Рассрочка 0%, условия ориентировочные.');
  }

  $('#termChips').on('click', '.chip', function () {
    term = Number($(this).data('term'));
    renderInstallment();
  });

  const $a = $('#compareA');
  const $b = $('#compareB');
  PACKAGES.forEach(function (p) {
    $('<option></option>').val(p.id).text(p.name).appendTo($a);
    $('<option></option>').val(p.id).text(p.name).appendTo($b);
  });
  $a.val('fresh');
  $b.val('ceramic');

  function mark(has) {
    return $('<td class="compare-mark"></td>').toggleClass('is-yes', has).attr('aria-label', has ? 'входит' : 'не входит').text(has ? '✓' : '—');
  }

  function renderCompare() {
    const cls = Cart.get().cls;
    const className = CAR_CLASSES.find(function (c) { return c.id === cls; }).name;
    $('#compareClass').text(className);
    const first = PACKAGES.find(function (p) { return p.id === $a.val(); });
    const second = PACKAGES.find(function (p) { return p.id === $b.val(); });
    const $head = $('#compareHead').empty();
    const $body = $('#compareBody').empty();
    if (first.id === second.id) {
      $('#compareMessage').text('Выберите два разных пакета, чтобы увидеть отличия.');
      $('#compareWrap').hide();
      return;
    }
    $('#compareWrap').show();
    $('<tr></tr>')
      .append($('<th scope="col"></th>').text('Что сравниваем'))
      .append($('<th scope="col"></th>').text(first.name))
      .append($('<th scope="col"></th>').text(second.name))
      .appendTo($head);
    const priceA = first.prices[cls];
    const priceB = second.prices[cls];
    $('<tr class="compare-price"></tr>')
      .append($('<th scope="row"></th>').text('Цена для класса «' + className + '»'))
      .append($('<td></td>').text(Site.rub(priceA)))
      .append($('<td></td>').text(Site.rub(priceB)))
      .appendTo($body);
    const items = first.includes.concat(second.includes.filter(function (t) { return first.includes.indexOf(t) === -1; }));
    let different = 0;
    items.forEach(function (text) {
      const inA = first.includes.indexOf(text) !== -1;
      const inB = second.includes.indexOf(text) !== -1;
      if (inA !== inB) { different += 1; }
      $('<tr></tr>').toggleClass('is-diff', inA !== inB)
        .append($('<th scope="row"></th>').text(text))
        .append(mark(inA))
        .append(mark(inB))
        .appendTo($body);
    });
    const diff = Math.abs(priceA - priceB);
    const pricier = priceA > priceB ? first.name : second.name;
    $('#compareMessage').html('Отличий в составе: <b>' + different + '</b> из ' + items.length + ' · ' + pricier + ' дороже на <b>' + Site.rub(diff) + '</b>');
  }

  $a.add($b).on('change', function () {
    renderCompare();
    if ($a.val() !== $b.val()) { $('#compareWrap').stop(true, true).hide().fadeIn(200); }
  });

  $(document).on('cart:changed', function () {
    renderInstallment();
    renderCompare();
  });

  renderInstallment();
  renderCompare();
});
