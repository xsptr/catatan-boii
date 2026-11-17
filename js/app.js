import bundledConfig from './firebase-config.js';

const icons = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2m0-14-2 2M7 17l-2 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.2"/><rect x="14" y="3" width="7" height="7" rx="1.2"/><rect x="3" y="14" width="7" height="7" rx="1.2"/><rect x="14" y="14" width="7" height="7" rx="1.2"/>',
  pen: '<path d="m14 5 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-4-4L5 15z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4m-9 7h2m4 0h2m-8 3h2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  book: '<path d="M12 6C8 3 5 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-2-1-5-2-9 1Zm0 0v14"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  filter: '<path d="M4 7h16M7 12h10m-7 5h4"/>',
  x: '<path d="m6 6 12 12m0-12L6 18"/>',
  left: '<path d="m15 6-6 6 6 6"/>',
  right: '<path d="m9 6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 1 1 8 0v3m-4 4v3"/>',
  meal: '<path d="M3 12h18a9 9 0 0 1-18 0Zm6 9h6M8 8c-2-2 2-2 0-5m4 5c-2-2 2-2 0-5m4 5c-2-2 2-2 0-5"/>',
  snack: '<path d="M9 4a8 8 0 1 0 11 10 4 4 0 0 1-4-4 4 4 0 0 1-4-5L9 4Zm-2 8h.01M11 9h.01M10 16h.01m5 1h.01"/>',
  milk: '<path d="M8 7V4h8v3l3 4v9H5v-9l3-4Zm0 0h8M5 12h14"/>',
  leaf: '<path d="M20 4c-8 0-14 3-14 9a5 5 0 0 0 5 5c6 0 9-6 9-14ZM4 20l10-10"/>',
  drop: '<path d="M12 3c3 5 7 8 7 12a7 7 0 1 1-14 0c0-4 4-7 7-12Zm-4 12a4 4 0 0 0 4 4"/>',
  moon: '<path d="M20.5 14a9 9 0 0 1-10.5-10.5A9 9 0 1 0 20.5 14Z"/>',
  note: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8m-8 4h8m-8 4h4"/>'
};

const fields = [
  ['makanUtama', 'Makan utama', 'meal', 'peach', 'Contoh: Sarapan bubur ayam, habis setengah mangkuk.'],
  ['snack', 'Snack', 'snack', 'yellow', 'Contoh: Biskuit setelah tidur siang.'],
  ['susu', 'Susu', 'milk', 'purple', 'Contoh: 120 ml pagi, 150 ml sebelum tidur.'],
  ['sayurBuah', 'Sayur buah', 'leaf', 'green', 'Contoh: Wortel saat makan siang dan potongan pepaya.'],
  ['bab', 'BAB', 'drop', 'peach', 'Contoh: 1 kali pagi, tekstur lembut.'],
  ['tidurSiang', 'Tidur siang', 'sun', 'yellow', 'Contoh: 12.30–14.00.'],
  ['tidurMalam', 'Tidur malam', 'moon', 'purple', 'Contoh: Mulai tidur 20.30, sempat terbangun sekali.'],
  ['keterangan', 'Keterangan', 'note', 'green', 'Contoh: Hari ini mencoba makan sendiri.']
];

const configKey = 'hari-kecil:firebase-config:v1';
const id = (name) => document.getElementById(name);
const pad = (value) => String(value).padStart(2, '0');
const localDate = (date) => [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
const today = () => localDate(new Date());
const asDate = (value) => new Date(value + 'T12:00:00');
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(+asDate(value)) && localDate(asDate(value)) === value;
const formatDate = (value, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat('id-ID', options).format(asDate(value));
const icon = (name) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[name] + '</svg>';

let month = new Date();
let filter = { from: '', to: '' };
let records = {};
let loaded = false;
let loadError = '';
let online = false;
let config = bundledConfig;
let sdk;
let auth;
let database;
let account;
let startingSession = false;
let sessionError = '';
let stopRecords;
let stopConnection;
let entryBase = null;
let shownDate = today();
let working = false;
let toastTimer;

function make(tag, content, className) {
  const element = document.createElement(tag);
  if (content) element.textContent = content;
  if (className) element.className = className;
  return element;
}

function notify(message) {
  const toast = id('toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 4500);
}

function connectionMessage(message, error = false) {
  id('connection-message').textContent = message;
  id('connection-message').classList.toggle('error', error);
}

function refreshFormStatus() {
  id('entry-date-status').textContent = !auth ? 'Hubungkan Firebase untuk menyimpan.' :
    !account ? (sessionError || 'Menyiapkan jurnal…') :
    !loaded ? 'Menunggu data Firebase.' :
    entryBase ? 'Mengedit catatan untuk tanggal ini.' : 'Catatan baru.';
  const submit = id('entry-form').querySelector('button[type=submit]');
  submit.disabled = working || !loaded || !online;
  id('entry-submit-label').textContent = working ? 'Menyimpan…' : entryBase ? 'Simpan perubahan' : 'Simpan catatan';
}

function entryValues() {
  return Object.fromEntries(fields.flatMap(([key]) => {
    const value = id(key).value.trim();
    return value ? [[key, value]] : [];
  }));
}

function sameRecord(first, second) {
  return fields.every(([key]) => (first?.[key] || '') === (second?.[key] || ''));
}

function openDate(value) {
  shownDate = value;
  id('entry-date').value = value;
  entryBase = records[value] || null;
  for (const [key] of fields) id(key).value = entryBase?.[key] || '';
  refreshFormStatus();
}

function route() {
  const isEntry = location.hash === '#catat';
  id('entry').hidden = !isEntry;
  id('dashboard-page').hidden = isEntry;
  id('hero-link').hidden = isEntry;
  for (const [name, active] of [['nav-catat', isEntry], ['nav-dashboard', !isEntry]]) {
    if (active) id(name).setAttribute('aria-current', 'page');
    else id(name).removeAttribute('aria-current');
  }
  refreshFormStatus();
}

function useFilter(from, to) {
  filter = { from, to };
  id('date-from').value = from;
  id('date-to').value = to;
  render();
}

function calendarRender() {
  const container = id('calendar-days');
  container.replaceChildren();
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  id('calendar-month').textContent = formatDate(localDate(new Date(year, monthIndex, 1)), { month: 'long', year: 'numeric' });
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const count = new Date(year, monthIndex + 1, 0).getDate();
  const days = document.createDocumentFragment();
  for (let i = 0; i < offset; i++) days.append(make('span'));
  for (let day = 1; day <= count; day++) {
    const key = localDate(new Date(year, monthIndex, day));
    const button = make('button', day, 'day');
    const selected = (filter.from || filter.to) && (!filter.from || key >= filter.from) && (!filter.to || key <= filter.to);
    button.type = 'button';
    button.classList.toggle('today', key === today());
    button.classList.toggle('selected', Boolean(selected));
    button.classList.toggle('logged', Boolean(records[key]));
    button.setAttribute('aria-label', formatDate(key) + (records[key] ? ', ada catatan' : ''));
    button.setAttribute('aria-pressed', String(Boolean(selected)));
    if (key === today()) button.setAttribute('aria-current', 'date');
    button.addEventListener('click', () => {
      useFilter(key, key);
      container.querySelectorAll('button')[day - 1]?.focus();
    });
    days.append(button);
  }
  container.append(days);
}

function recordCard(date, record, open) {
  const article = make('article', '', 'record');
  const details = make('details');
  details.dataset.date = date;
  details.open = open;
  const summary = make('summary', formatDate(date, {weekday:'long', day:'numeric', month:'long', year:'numeric'}));
  const list = make('dl');
  let filled = 0;
  for (const [key, label] of fields) {
    if (typeof record[key] !== 'string' || !record[key]) continue;
    const item = make('div');
    item.append(make('dt', label), make('dd', record[key]));
    list.append(item);
    filled++;
  }
  summary.append(make('small', '· ' + filled + ' bagian'));
  const actions = make('div', '', 'record-actions');
  const edit = make('button', 'Edit', 'button outline');
  edit.type = 'button';
  edit.setAttribute('aria-label', 'Edit catatan ' + formatDate(date));
  edit.addEventListener('click', () => {
    openDate(date);
    location.hash = 'catat';
  });
  const remove = make('button', 'Hapus', 'button outline');
  remove.type = 'button';
  remove.setAttribute('aria-label', 'Hapus catatan ' + formatDate(date));
  remove.addEventListener('click', () => confirmDelete(date, record));
  actions.append(edit, remove);
  details.append(summary, list);
  article.append(details, actions);
  return article;
}

function render() {
  const keys = Object.keys(records).filter(validDate).sort().reverse();
  const matches = keys.filter((key) => (!filter.from || key >= filter.from) && (!filter.to || key <= filter.to));
  const filtered = filter.from || filter.to;
  id('total').textContent = loaded ? keys.length : '—';
  id('current-month').textContent = loaded ? keys.filter((key) => key.startsWith(today().slice(0, 7))).length : '—';
  id('latest').textContent = keys.length ? formatDate(keys[0], {day:'numeric', month:'short', year:'numeric'}) : '—';
  id('result-count').textContent = loaded ? matches.length + ' catatan' : 'Riwayat harian';
  id('active-filter').hidden = !filtered;
  if (filtered) {
    id('active-label').textContent = filter.from === filter.to ? formatDate(filter.from) :
      [filter.from ? formatDate(filter.from) : 'Awal', filter.to ? formatDate(filter.to) : 'Sekarang'].join(' – ');
  }
  const container = id('records');
  const previouslyOpen = new Set([...container.querySelectorAll('details[open]')].map(node => node.dataset.date));
  container.replaceChildren();
  if (matches.length) {
    for (const [index, date] of matches.entries()) {
      container.append(recordCard(date, records[date], previouslyOpen.has(date) || index === 0));
    }
  } else {
    const empty = make('div', '', 'empty');
    const bubble = make('span', '', 'bubble yellow');
    bubble.innerHTML = icon('book');
    const title = !loaded ? 'Riwayat catatan si kecil' : filtered ? 'Belum ada catatan di tanggal ini' : 'Belum ada catatan';
    const copy = loadError || sessionError || (!loaded ? (auth ? 'Menyiapkan riwayat dari Firebase…' : 'Hubungkan Firebase untuk melihat catatan.') :
      filtered ? 'Pilih tanggal lain atau tambahkan catatan.' : 'Mulai dengan mencatat satu hal dari hari ini.');
    empty.append(bubble, make('h4', title), make('p', copy));
    if (loaded) {
      const link = make('a', '', 'button outline');
      link.href = '#catat';
      link.innerHTML = icon('plus') + 'Tambah catatan';
      link.addEventListener('click', () => openDate(filter.from && filter.from === filter.to ? filter.from : today()));
      empty.append(link);
    }
    container.append(empty);
  }
  calendarRender();
}

function showConnection(expanded) {
  id('setup-panel').hidden = !expanded;
  id('connection-panel').hidden = !expanded;
  id('connection-action').setAttribute('aria-expanded', String(expanded));
}

function refreshConnection() {
  id('connection-title').textContent = !auth ? 'Hubungkan Firebase' :
    loadError || sessionError ? 'Firebase perlu diperiksa' : online && loaded ? 'Firebase terhubung' : 'Menghubungkan Firebase…';
  id('connection-copy').textContent = !auth ? 'Siapkan database untuk mulai menyimpan catatan.' :
    loadError || sessionError || (!online || !loaded ? 'Menyiapkan jurnal di browser ini.' : 'Jurnal siap digunakan di browser ini.');
  id('retry-session').hidden = !sessionError;
}

function firebaseError(error) {
  const code = error?.code || '';
  if (code.toLowerCase().includes('permission_denied')) return 'Akses database ditolak. Periksa aturan pada node hariKecil.';
  return {
    'auth/operation-not-allowed': 'Aktifkan Anonymous di Firebase Authentication.',
    'auth/admin-restricted-operation': 'Aktifkan Anonymous di Firebase Authentication.',
    'auth/network-request-failed': 'Koneksi terputus. Periksa jaringan dan coba lagi.',
    'auth/invalid-api-key': 'API key Firebase tidak valid.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.'
  }[code] || 'Firebase belum dapat memproses permintaan. Periksa konfigurasi dan koneksi.';
}

function parseConfig(value) {
  const configFields = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'appId', 'messagingSenderId'];
  const parsed = {};
  for (const key of configFields) {
    const match = value.match(new RegExp('(?:^|[,{\\s])[\'"]?' + key + '[\'"]?\\s*:\\s*([\'"])(.*?)\\1'));
    if (match?.[2]) parsed[key] = match[2].trim();
  }
  if (!parsed.apiKey || !parsed.projectId || !parsed.databaseURL) {
    throw new Error('Sertakan apiKey, projectId, dan databaseURL dari proyek Firebase.');
  }
  let url;
  try { url = new URL(parsed.databaseURL); } catch { throw new Error('Format databaseURL tidak valid.'); }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' ||
      url.search || url.hash || !/\.(firebaseio\.com|firebasedatabase\.app)$/.test(url.hostname)) {
    throw new Error('Gunakan URL HTTPS dari halaman Realtime Database.');
  }
  return parsed;
}

async function connect(firebaseConfig) {
  const cdn = 'https://www.gstatic.com/firebasejs/13.3.0/';
  const [appSdk, authSdk, dbSdk] = await Promise.all([
    import(cdn + 'firebase-app.js'),
    import(cdn + 'firebase-auth.js'),
    import(cdn + 'firebase-database.js')
  ]);
  sdk = {...authSdk, ...dbSdk};
  const app = appSdk.initializeApp(firebaseConfig);
  try {
    database = sdk.getDatabase(app);
    auth = sdk.getAuth(app);
  } catch (error) {
    await appSdk.deleteApp(app);
    throw error;
  }
  sdk.onAuthStateChanged(auth, (user) => {
    if (user) {
      sessionError = '';
      changeAccount(user);
    } else {
      changeAccount(null);
      void startAnonymousSession();
    }
  }, (error) => {
    sessionError = firebaseError(error);
    refreshConnection();
    refreshFormStatus();
  });
}

async function startAnonymousSession() {
  if (!auth || account || startingSession) return;
  startingSession = true;
  sessionError = '';
  refreshConnection();
  refreshFormStatus();
  render();
  try {
    await sdk.signInAnonymously(auth);
  } catch (error) {
    sessionError = firebaseError(error);
    refreshConnection();
    refreshFormStatus();
    render();
  } finally {
    startingSession = false;
  }
}

function changeAccount(user) {
  const hadAccount = Boolean(account);
  stopRecords?.();
  stopConnection?.();
  account = user;
  records = {};
  loaded = false;
  loadError = '';
  online = false;
  working = false;
  if (hadAccount) openDate(today());
  refreshConnection();
  refreshFormStatus();
  render();
  if (!user) return;
  showConnection(false);
  stopConnection = sdk.onValue(sdk.ref(database, '.info/connected'), (snapshot) => {
    online = snapshot.val() === true;
    refreshFormStatus();
    refreshConnection();
  });
  stopRecords = sdk.onValue(sdk.ref(database, 'hariKecil/' + user.uid), (snapshot) => {
    const canRefreshForm = sameRecord(entryValues(), entryBase);
    records = snapshot.val() || {};
    loaded = true;
    loadError = '';
    refreshConnection();
    if (canRefreshForm) openDate(shownDate);
    else refreshFormStatus();
    render();
  }, (error) => {
    records = {};
    loaded = false;
    loadError = firebaseError(error);
    refreshConnection();
    refreshFormStatus();
    render();
  });
}

async function writeRecord(date, original, replacement) {
  if (!account || !loaded || !online || working) {
    notify('Hubungkan kembali ke Firebase untuk menyimpan perubahan.');
    return false;
  }
  working = true;
  refreshFormStatus();
  const uid = account.uid;
  try {
    const target = sdk.ref(database, 'hariKecil/' + uid + '/' + date);
    await sdk.get(target);
    const result = await sdk.runTransaction(target, (current) => {
      if (sameRecord(current, original)) return replacement;
    }, {applyLocally:false});
    if (result.committed) return true;
    notify('Catatan berubah di perangkat lain. Buka kembali catatan sebelum mengedit.');
  } catch (error) {
    notify(firebaseError(error));
  } finally {
    working = false;
    refreshFormStatus();
  }
  return false;
}

function confirmDelete(date, record) {
  const dialog = id('delete-dialog');
  id('delete-copy').textContent = 'Catatan ' + formatDate(date) + ' akan dihapus.';
  dialog.returnValue = 'cancel';
  dialog.addEventListener('close', async () => {
    if (dialog.returnValue === 'delete' && await writeRecord(date, record, null)) {
      notify('Catatan dihapus.');
    }
  }, {once:true});
  dialog.showModal();
}

for (const element of document.querySelectorAll('[data-icon]')) element.innerHTML = icon(element.dataset.icon);
for (const [key, label, symbol, tone, example] of fields) {
  const field = make('div', '', 'card field');
  const title = make('label');
  title.htmlFor = key;
  const bubble = make('span', '', 'bubble ' + tone);
  bubble.innerHTML = icon(symbol);
  title.append(bubble, document.createTextNode(label));
  const input = document.createElement('textarea');
  input.id = key;
  input.name = key;
  input.rows = 2;
  input.maxLength = 3000;
  input.placeholder = example;
  field.append(title, input);
  id('entry-fields').append(field);
}

id('site-domain').textContent = location.hostname;
id('hero-date').textContent = formatDate(today(), {weekday:'long', day:'numeric', month:'long', year:'numeric'});
id('hero-link').addEventListener('click', () => openDate(today()));
id('filter-toggle').addEventListener('click', () => {
  const form = id('filters');
  form.hidden = !form.hidden;
  id('filter-toggle').setAttribute('aria-expanded', String(!form.hidden));
});
id('filters').addEventListener('submit', (event) => {
  event.preventDefault();
  const from = id('date-from').value;
  const to = id('date-to').value;
  if ((from && !validDate(from)) || (to && !validDate(to))) {
    notify('Masukkan tanggal yang valid.');
    return;
  }
  if (from && to && from > to) {
    id('date-to').setCustomValidity('Tanggal akhir harus sama atau setelah tanggal awal.');
    id('date-to').reportValidity();
    return;
  }
  if (from || to) month = asDate(from || to);
  useFilter(from, to);
});
for (const key of ['date-from', 'date-to']) {
  id(key).addEventListener('input', () => id('date-to').setCustomValidity(''));
}
for (const key of ['reset-filter', 'clear-filter']) {
  id(key).addEventListener('click', () => {
    id('date-to').setCustomValidity('');
    useFilter('', '');
  });
}
for (const [key, delta] of [['prev-month', -1], ['next-month', 1]]) {
  id(key).addEventListener('click', () => {
    month = new Date(month.getFullYear(), month.getMonth() + delta, 1);
    calendarRender();
  });
}
id('entry-date').addEventListener('change', () => {
  const value = id('entry-date').value;
  if (!validDate(value) || (!sameRecord(entryValues(), entryBase) && !window.confirm('Ganti tanggal dan abaikan perubahan yang belum disimpan?'))) {
    id('entry-date').value = shownDate;
    return;
  }
  openDate(value);
});
id('entry-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const values = entryValues();
  if (!Object.keys(values).length) {
    notify('Isi setidaknya satu bagian sebelum menyimpan.');
    id(fields[0][0]).focus();
    return;
  }
  const date = shownDate;
  if (await writeRecord(date, entryBase, values)) {
    openDate(date);
    month = asDate(date);
    useFilter(date, date);
    location.hash = 'dashboard';
    notify('Catatan tersimpan.');
  }
});
id('connection-action').addEventListener('click', () => {
  connectionMessage('');
  if (config && !id('firebase-config').value) id('firebase-config').value = JSON.stringify(config, null, 2);
  showConnection(id('connection-panel').hidden);
});
id('retry-session').addEventListener('click', () => void startAnonymousSession());
id('setup-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submit = event.submitter;
  submit.disabled = true;
  connectionMessage('Menghubungkan Firebase…');
  try {
    const nextConfig = parseConfig(id('firebase-config').value);
    if (auth) {
      localStorage.setItem(configKey, JSON.stringify(nextConfig));
      location.reload();
      return;
    }
    await connect(nextConfig);
    config = nextConfig;
    refreshConnection();
    showConnection(false);
    try { localStorage.setItem(configKey, JSON.stringify(config)); }
    catch { notify('Konfigurasi berlaku selama halaman ini terbuka.'); return; }
    connectionMessage('');
  } catch (error) {
    connectionMessage(error.code ? firebaseError(error) : (error instanceof TypeError ? 'SDK Firebase gagal dimuat. Periksa koneksi internet.' : error.message), true);
  } finally {
    submit.disabled = false;
  }
});
window.addEventListener('hashchange', () => {
  route();
  id(location.hash === '#catat' ? 'entry-title' : 'dashboard-title').focus({preventScroll:true});
  id(location.hash === '#catat' ? 'entry' : 'dashboard-page').scrollIntoView({block:'start'});
});

openDate(today());
route();
render();

try {
  config ||= JSON.parse(localStorage.getItem(configKey) || 'null');
  if (config) {
    await connect(config);
    refreshConnection();
  }
} catch (error) {
  showConnection(true);
  if (config) id('firebase-config').value = JSON.stringify(config, null, 2);
  connectionMessage(error.code ? firebaseError(error) : 'Konfigurasi atau koneksi Firebase gagal dimuat.', true);
}
