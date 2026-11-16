/* data.js: data shared by the services, booking and account pages (single source of truth for prices). */
const CAR_CLASSES = [
  { id: 'sedan',     name: 'Седан',       examples: 'Camry, A6, E-Class' },
  { id: 'crossover', name: 'Кроссовер',   examples: 'RAV4, X3, Q5' },
  { id: 'suv',       name: 'Внедорожник', examples: 'LC 300, X5, GLE' }
];

const PACKAGES = [
  { id: 'fresh', name: 'Fresh', featured: false, lead: 'Для ухоженной машины, которой нужна свежесть.',
    prices: { sedan: 25000, crossover: 30000, suv: 35000 },
    includes: ['Двухфазная мойка кузова', 'Очистка от металлических частиц', 'Лёгкая полировка', 'Воск-защита на 3 месяца'] },
  { id: 'ceramic', name: 'Ceramic', featured: true, lead: 'Глубокий блеск и защита кузова на годы.',
    prices: { sedan: 140000, crossover: 170000, suv: 210000 },
    includes: ['Всё из пакета Fresh', 'Коррекционная полировка', 'Керамическое покрытие, 5 лет', 'Керамика на стёкла', 'Письменная гарантия'] },
  { id: 'interior', name: 'Interior', featured: false, lead: 'Салон как из автосалона: чисто и без запаха.',
    prices: { sedan: 45000, crossover: 55000, suv: 65000 },
    includes: ['Глубокая химчистка салона', 'Чистка и кондиционер кожи', 'Озонирование', 'Чистка потолка и багажника'] }
];

const SERVICES = [
  { id: 1,  name: 'Комплексная мойка',            category: 'wash',     prices: { sedan: 15000,  crossover: 18000,  suv: 22000 },  duration: '3 часа',    hours: 3 },
  { id: 2,  name: 'Мойка двигателя',              category: 'wash',     prices: { sedan: 8000,   crossover: 10000,  suv: 12000 },  duration: '1 час',     hours: 1 },
  { id: 3,  name: 'Полировка кузова',             category: 'polish',   prices: { sedan: 60000,  crossover: 75000,  suv: 90000 },  duration: '1–2 дня',   hours: 16 },
  { id: 4,  name: 'Полировка фар',                category: 'polish',   prices: { sedan: 12000,  crossover: 12000,  suv: 15000 },  duration: '2 часа',    hours: 2 },
  { id: 5,  name: 'Керамическое покрытие',        category: 'protect',  prices: { sedan: 140000, crossover: 170000, suv: 210000 }, duration: '2–3 дня',   hours: 24 },
  { id: 6,  name: 'Керамика на диски',            category: 'protect',  prices: { sedan: 25000,  crossover: 25000,  suv: 30000 },  duration: '4 часа',    hours: 4 },
  { id: 7,  name: 'Керамика на стёкла',           category: 'protect',  prices: { sedan: 15000,  crossover: 18000,  suv: 20000 },  duration: '2 часа',    hours: 2 },
  { id: 8,  name: 'Защитная плёнка (капот и бампер)', category: 'protect', prices: { sedan: 180000, crossover: 210000, suv: 250000 }, duration: '2 дня', hours: 16 },
  { id: 9,  name: 'Химчистка салона',             category: 'interior', prices: { sedan: 45000,  crossover: 55000,  suv: 65000 },  duration: '1 день',    hours: 8 },
  { id: 10, name: 'Озонирование салона',          category: 'interior', prices: { sedan: 8000,   crossover: 8000,   suv: 10000 },  duration: '1 час',     hours: 1 },
  { id: 11, name: 'Чистка и кондиционер кожи',    category: 'interior', prices: { sedan: 20000,  crossover: 25000,  suv: 30000 },  duration: '3 часа',    hours: 3 }
];
const CATEGORY_NAMES = { wash: 'Мойка', polish: 'Полировка', protect: 'Защита', interior: 'Салон' };

const WORKS = [
  { id: 1, car: 'Audi A6',          service: 'ceramic',  label: 'Керамика',     days: 3, year: 2021, img: 'img/work1.svg', alt: 'Тёмный седан с каплями воды после нанесения керамики' },
  { id: 2, car: 'BMW X5',           service: 'polish',   label: 'Полировка',    days: 2, year: 2020, img: 'img/work2.svg', alt: 'Тёмный кроссовер, на капоте полировальный круг и круговые следы' },
  { id: 3, car: 'Toyota Camry',     service: 'interior', label: 'Химчистка',    days: 1, year: 2019, img: 'img/work3.svg', alt: 'Руль и передняя панель салона после химчистки' },
  { id: 4, car: 'Lexus RX',         service: 'ppf',      label: 'Плёнка',       days: 2, year: 2022, img: 'img/work4.svg', alt: 'Капот с защитной плёнкой, один край плёнки приподнят' },
  { id: 5, car: 'Mercedes E-Class', service: 'ceramic',  label: 'Керамика',     days: 2, year: 2023, img: 'img/work5.svg', alt: 'Колёсный диск с голубым центром и каплями воды после керамики' },
  { id: 6, car: 'Kia Sportage',     service: 'polish',   label: 'Полировка',    days: 1, year: 2018, img: 'img/work6.svg', alt: 'Фара: левая половина мутная, правая после полировки прозрачная' },
  { id: 7, car: 'Hyundai Tucson',   service: 'wash',     label: 'Мойка',        days: 1, year: 2021, img: 'img/work7.svg', alt: 'Седан, покрытый белой пеной во время мойки' },
  { id: 8, car: 'Toyota LC 300',    service: 'interior', label: 'Кожа салона',  days: 1, year: 2022, img: 'img/work8.svg', alt: 'Кожаное сиденье с голубой прострочкой после чистки' }
];
