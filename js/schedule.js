const SLOTS = [
  { time: '09:00', period: 'Утро',  capacity: 2, busyMod: 3 },
  { time: '10:00', period: 'Утро',  capacity: 2, busyMod: 4 },
  { time: '11:00', period: 'Утро',  capacity: 2, busyMod: 5 },
  { time: '12:00', period: 'День',  capacity: 1, busyMod: 3 },
  { time: '14:00', period: 'День',  capacity: 2, busyMod: 4 },
  { time: '15:00', period: 'День',  capacity: 2, busyMod: 5 },
  { time: '16:00', period: 'Вечер', capacity: 1, busyMod: 3 },
  { time: '17:00', period: 'Вечер', capacity: 1, busyMod: 4 }
];

const Schedule = (function () {
  const HORIZON_DAYS = 90;

  function fmt(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function isBusy(dateStr, slot) {
    const n = Number(dateStr.replace(/-/g, '')) + Number(slot.time.slice(0, 2));
    return n % slot.busyMod === 0;
  }

  function isPast(dateStr, slot, now) {
    return dateStr === fmt(now) && Number(slot.time.slice(0, 2)) <= now.getHours();
  }

  function nextFree(now) {
    for (let offset = 0; offset <= HORIZON_DAYS; offset += 1) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const dateStr = fmt(day);
      for (let i = 0; i < SLOTS.length; i += 1) {
        if (!isPast(dateStr, SLOTS[i], now) && !isBusy(dateStr, SLOTS[i])) {
          return { date: dateStr, day: day, offset: offset, slot: SLOTS[i] };
        }
      }
    }
    return null;
  }

  function dayLabel(found) {
    if (found.offset === 0) { return 'сегодня'; }
    if (found.offset === 1) { return 'завтра'; }
    return found.day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  return { fmt: fmt, isBusy: isBusy, isPast: isPast, nextFree: nextFree, dayLabel: dayLabel };
})();
