// ============================================================
// Smart Seller Profit Calculator
// All monetary values are stored canonically in BDT.
// The "currency" setting controls display & input only.
// ============================================================

const DEFAULT_COURIERS = [
  { name: 'Pathao (Inside Dhaka)', cost: 70 },
  { name: 'Pathao (Outside Dhaka)', cost: 130 },
  { name: 'Steadfast (Inside Dhaka)', cost: 60 },
  { name: 'Steadfast (Outside Dhaka)', cost: 110 },
  { name: 'RedX (Inside Dhaka)', cost: 70 },
  { name: 'RedX (Outside Dhaka)', cost: 130 },
  { name: 'Sundarban (Inside Dhaka)', cost: 80 },
  { name: 'Sundarban (Outside Dhaka)', cost: 150 },
  { name: 'Paperfly (Inside Dhaka)', cost: 70 },
  { name: 'Paperfly (Outside Dhaka)', cost: 120 },
  { name: 'eCourier (Inside Dhaka)', cost: 70 },
  { name: 'eCourier (Outside Dhaka)', cost: 110 }
];

const DEFAULT_USD_RATE = 110;

const state = {
  currency: 'BDT',
  usdRate: DEFAULT_USD_RATE,
  couriers: DEFAULT_COURIERS.slice(),
  saved: [],
  sortBy: 'date'
};

// ============================================================
// Storage
// ============================================================

const storage = {
  get(keys) {
    return new Promise(resolve => chrome.storage.local.get(keys, resolve));
  },
  set(obj) {
    return new Promise(resolve => chrome.storage.local.set(obj, resolve));
  }
};

async function loadState() {
  const data = await storage.get(['currency', 'usdRate', 'couriers', 'saved', 'sortBy']);
  if (data.currency === 'BDT' || data.currency === 'USD') state.currency = data.currency;
  if (typeof data.usdRate === 'number' && data.usdRate > 0) state.usdRate = data.usdRate;
  if (Array.isArray(data.couriers)) state.couriers = data.couriers;
  if (Array.isArray(data.saved)) state.saved = data.saved;
  if (data.sortBy) state.sortBy = data.sortBy;
}

// ============================================================
// Currency helpers
// ============================================================

function fromDisplay(value) {
  // Convert displayed value (in current currency) to BDT for storage/calc.
  if (state.currency === 'USD') return value * state.usdRate;
  return value;
}

function toDisplay(bdtValue) {
  // Convert canonical BDT to display currency.
  if (state.currency === 'USD') return bdtValue / state.usdRate;
  return bdtValue;
}

function formatMoney(bdtValue) {
  if (!isFinite(bdtValue)) return '—';
  const v = toDisplay(bdtValue);
  const symbol = state.currency === 'USD' ? '$' : '৳';
  const formatted = v.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  return `${symbol}${formatted}`;
}

function formatPercent(p) {
  if (!isFinite(p)) return '—';
  return `${p.toFixed(2)}%`;
}

// ============================================================
// Calculation core (operates entirely in BDT)
// ============================================================

function calculateProfit({ productCost, deliveryCost, adCost, discount, sellingPrice }) {
  const totalCost = productCost + deliveryCost + adCost;
  const netRevenue = sellingPrice - discount;
  const profit = netRevenue - totalCost;
  const margin = netRevenue > 0 ? (profit / netRevenue) * 100 : NaN;
  const breakEven = totalCost + discount;
  return { profit, margin, breakEven, netRevenue, totalCost };
}

function calculateTargetSelling({ productCost, deliveryCost, adCost, discount, targetMarginPct }) {
  const totalCost = productCost + deliveryCost + adCost;
  const m = targetMarginPct / 100;
  if (m >= 1) return { suggested: NaN, breakEven: totalCost + discount };
  const suggested = totalCost / (1 - m) + discount;
  const breakEven = totalCost + discount;
  return { suggested, breakEven };
}

// ============================================================
// DOM
// ============================================================

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const els = {
  productCost: $('#product-cost'),
  deliveryCost: $('#delivery-cost'),
  adCost: $('#ad-cost'),
  discount: $('#discount'),
  sellingPrice: $('#selling-price'),
  targetMargin: $('#target-margin'),
  productName: $('#product-name'),
  courierPreset: $('#courier-preset'),
  resultProfit: $('#result-profit'),
  resultMargin: $('#result-margin'),
  resultBreakeven: $('#result-breakeven'),
  resultSuggested: $('#result-suggested'),
  suggestedRow: $('#suggested-row'),
  sellingField: $('#selling-field'),
  targetField: $('#target-field'),
  saveBtn: $('#save-btn'),
  resetBtn: $('#reset-btn'),
  savedList: $('#saved-list'),
  savedEmpty: $('#saved-empty'),
  savedCount: $('#saved-count'),
  tabSavedCount: $('#tab-saved-count'),
  sortBy: $('#sort-by'),
  clearAllBtn: $('#clear-all-btn'),
  usdRate: $('#usd-rate'),
  courierList: $('#courier-list'),
  newCourierName: $('#new-courier-name'),
  newCourierCost: $('#new-courier-cost'),
  addCourierBtn: $('#add-courier-btn'),
  resetPresetsBtn: $('#reset-presets-btn'),
  curSuffixes: $$('.cur-suffix')
};

function getInputs() {
  return {
    productCost: fromDisplay(parseFloat(els.productCost.value) || 0),
    deliveryCost: fromDisplay(parseFloat(els.deliveryCost.value) || 0),
    adCost: fromDisplay(parseFloat(els.adCost.value) || 0),
    discount: fromDisplay(parseFloat(els.discount.value) || 0),
    sellingPrice: fromDisplay(parseFloat(els.sellingPrice.value) || 0),
    targetMarginPct: parseFloat(els.targetMargin.value) || 0,
    productName: els.productName.value.trim()
  };
}

function getCurrentMode() {
  const checked = document.querySelector('input[name="mode"]:checked');
  return checked ? checked.value : 'profit';
}

// ============================================================
// Recalculate & render results
// ============================================================

function recalculate() {
  const inputs = getInputs();
  const mode = getCurrentMode();

  if (mode === 'target') {
    const { suggested, breakEven } = calculateTargetSelling(inputs);
    if (isFinite(suggested) && suggested > 0) {
      const profitAtSuggested = (suggested - inputs.discount) - (inputs.productCost + inputs.deliveryCost + inputs.adCost);
      els.resultProfit.textContent = formatMoney(profitAtSuggested);
      setProfitColor(els.resultProfit, profitAtSuggested);
      els.resultMargin.textContent = formatPercent(inputs.targetMarginPct);
      els.resultSuggested.textContent = formatMoney(suggested);
    } else {
      els.resultProfit.textContent = '—';
      els.resultMargin.textContent = '—';
      els.resultSuggested.textContent = inputs.targetMarginPct >= 100 ? '∞' : '—';
      els.resultProfit.className = 'result-value';
    }
    els.resultBreakeven.textContent = formatMoney(breakEven);
  } else {
    const r = calculateProfit(inputs);
    els.resultProfit.textContent = formatMoney(r.profit);
    setProfitColor(els.resultProfit, r.profit);
    els.resultMargin.textContent = isFinite(r.margin) ? formatPercent(r.margin) : '—';
    els.resultBreakeven.textContent = formatMoney(r.breakEven);
  }
}

function setProfitColor(el, value) {
  el.classList.remove('profit-positive', 'profit-negative', 'profit-zero');
  if (value > 0) el.classList.add('profit-positive');
  else if (value < 0) el.classList.add('profit-negative');
  else el.classList.add('profit-zero');
}

// ============================================================
// Mode switching
// ============================================================

function applyMode(mode) {
  if (mode === 'target') {
    els.sellingField.classList.add('hidden');
    els.targetField.classList.remove('hidden');
    els.suggestedRow.classList.remove('hidden');
  } else {
    els.sellingField.classList.remove('hidden');
    els.targetField.classList.add('hidden');
    els.suggestedRow.classList.add('hidden');
  }
  recalculate();
}

// ============================================================
// Tabs
// ============================================================

function setupTabs() {
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      $('#tab-' + tab.dataset.tab).classList.add('active');
      if (tab.dataset.tab === 'saved') renderSaved();
      if (tab.dataset.tab === 'settings') renderSettings();
    });
  });
}

// ============================================================
// Currency toggle
// ============================================================

async function setCurrency(currency) {
  if (currency === state.currency) return;

  // Re-display existing input values in the new currency.
  // Inputs hold values in the *display* currency, so we must convert.
  const numericInputs = [els.productCost, els.deliveryCost, els.adCost, els.discount, els.sellingPrice];
  const oldRate = state.usdRate;
  const oldCurrency = state.currency;

  numericInputs.forEach(input => {
    const v = parseFloat(input.value);
    if (!isFinite(v) || input.value === '') return;
    let bdt;
    if (oldCurrency === 'USD') bdt = v * oldRate;
    else bdt = v;
    let display;
    if (currency === 'USD') display = bdt / oldRate;
    else display = bdt;
    input.value = display.toFixed(2);
  });

  state.currency = currency;
  await storage.set({ currency });
  updateCurrencyUI();
  recalculate();
}

function updateCurrencyUI() {
  $$('.currency-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.currency === state.currency);
  });
  els.curSuffixes.forEach(el => { el.textContent = state.currency; });
}

// ============================================================
// Courier presets
// ============================================================

function renderCourierDropdown() {
  els.courierPreset.innerHTML = '<option value="">Preset…</option>';
  state.couriers.forEach((c, i) => {
    const opt = document.createElement('option');
    opt.value = String(i);
    const displayCost = formatMoney(c.cost);
    opt.textContent = `${c.name} · ${displayCost}`;
    els.courierPreset.appendChild(opt);
  });
}

function renderCourierList() {
  els.courierList.innerHTML = '';
  if (state.couriers.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.style.padding = '12px';
    empty.textContent = 'No presets yet.';
    els.courierList.appendChild(empty);
    return;
  }
  state.couriers.forEach((c, i) => {
    const row = document.createElement('div');
    row.className = 'courier-row';
    const name = document.createElement('span');
    name.textContent = c.name;
    const cost = document.createElement('span');
    cost.textContent = `৳${c.cost.toFixed(2)}`;
    const del = document.createElement('button');
    del.textContent = '×';
    del.title = 'Remove';
    del.addEventListener('click', async () => {
      state.couriers.splice(i, 1);
      await storage.set({ couriers: state.couriers });
      renderCourierList();
      renderCourierDropdown();
    });
    row.appendChild(name);
    row.appendChild(cost);
    row.appendChild(del);
    els.courierList.appendChild(row);
  });
}

async function addCourier() {
  const name = els.newCourierName.value.trim();
  const cost = parseFloat(els.newCourierCost.value);
  if (!name || !isFinite(cost) || cost < 0) return;
  state.couriers.push({ name, cost });
  await storage.set({ couriers: state.couriers });
  els.newCourierName.value = '';
  els.newCourierCost.value = '';
  renderCourierList();
  renderCourierDropdown();
}

async function resetPresets() {
  state.couriers = DEFAULT_COURIERS.slice();
  await storage.set({ couriers: state.couriers });
  renderCourierList();
  renderCourierDropdown();
}

// ============================================================
// Saved products
// ============================================================

async function saveCurrentProduct() {
  const inputs = getInputs();
  const mode = getCurrentMode();

  let sellingBdt = inputs.sellingPrice;
  if (mode === 'target') {
    const { suggested } = calculateTargetSelling(inputs);
    if (isFinite(suggested)) sellingBdt = suggested;
  }

  if (sellingBdt <= 0 && inputs.productCost <= 0) {
    flashButton(els.saveBtn, 'Enter values first', true);
    return;
  }

  const r = calculateProfit({
    productCost: inputs.productCost,
    deliveryCost: inputs.deliveryCost,
    adCost: inputs.adCost,
    discount: inputs.discount,
    sellingPrice: sellingBdt
  });

  const item = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: inputs.productName || `Product ${state.saved.length + 1}`,
    productCost: inputs.productCost,
    deliveryCost: inputs.deliveryCost,
    adCost: inputs.adCost,
    discount: inputs.discount,
    sellingPrice: sellingBdt,
    profit: r.profit,
    margin: isFinite(r.margin) ? r.margin : 0,
    breakEven: r.breakEven,
    createdAt: Date.now()
  };

  state.saved.unshift(item);
  await storage.set({ saved: state.saved });
  flashButton(els.saveBtn, 'Saved', false);
  updateSavedCounts();
}

function flashButton(btn, message, isError) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.disabled = true;
  if (isError) btn.style.background = 'var(--warn)';
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
    btn.style.background = '';
  }, 1100);
}

function updateSavedCounts() {
  els.tabSavedCount.textContent = String(state.saved.length);
  els.savedCount.textContent = `${state.saved.length} saved`;
}

function sortedSaved() {
  const list = state.saved.slice();
  switch (state.sortBy) {
    case 'profit': list.sort((a, b) => b.profit - a.profit); break;
    case 'margin': list.sort((a, b) => b.margin - a.margin); break;
    case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'date':
    default: list.sort((a, b) => b.createdAt - a.createdAt); break;
  }
  return list;
}

function renderSaved() {
  updateSavedCounts();
  els.savedList.innerHTML = '';
  if (state.saved.length === 0) {
    els.savedEmpty.classList.remove('hidden');
    return;
  }
  els.savedEmpty.classList.add('hidden');

  const list = sortedSaved();
  list.forEach(item => {
    const card = document.createElement('div');
    card.className = 'saved-item';

    const head = document.createElement('div');
    head.className = 'saved-item-head';
    const nameEl = document.createElement('span');
    nameEl.className = 'saved-item-name';
    nameEl.textContent = item.name;
    const marginEl = document.createElement('span');
    marginEl.className = 'saved-item-margin';
    marginEl.textContent = `${item.margin.toFixed(1)}%`;
    marginEl.style.color = item.profit > 0 ? 'var(--success)' : item.profit < 0 ? 'var(--danger)' : 'var(--text-muted)';
    head.appendChild(nameEl);
    head.appendChild(marginEl);

    const grid = document.createElement('div');
    grid.className = 'saved-item-grid';
    grid.innerHTML = `
      <div>Selling <b>${formatMoney(item.sellingPrice)}</b></div>
      <div>Profit <b style="color:${item.profit > 0 ? 'var(--success)' : item.profit < 0 ? 'var(--danger)' : 'var(--text-muted)'}">${formatMoney(item.profit)}</b></div>
      <div>Cost <b>${formatMoney(item.productCost + item.deliveryCost + item.adCost)}</b></div>
      <div>Break-even <b>${formatMoney(item.breakEven)}</b></div>
    `;

    const actions = document.createElement('div');
    actions.className = 'saved-item-actions';
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Load';
    loadBtn.addEventListener('click', () => loadSavedIntoCalculator(item));
    const dupBtn = document.createElement('button');
    dupBtn.textContent = 'Duplicate';
    dupBtn.addEventListener('click', () => duplicateSaved(item));
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'delete';
    delBtn.addEventListener('click', () => deleteSaved(item.id));
    actions.appendChild(loadBtn);
    actions.appendChild(dupBtn);
    actions.appendChild(delBtn);

    card.appendChild(head);
    card.appendChild(grid);
    card.appendChild(actions);
    els.savedList.appendChild(card);
  });
}

function loadSavedIntoCalculator(item) {
  // Switch to profit mode and load values (converted to display currency).
  document.querySelector('input[name="mode"][value="profit"]').checked = true;
  applyMode('profit');
  els.productName.value = item.name;
  els.productCost.value = toDisplay(item.productCost).toFixed(2);
  els.deliveryCost.value = toDisplay(item.deliveryCost).toFixed(2);
  els.adCost.value = toDisplay(item.adCost).toFixed(2);
  els.discount.value = toDisplay(item.discount).toFixed(2);
  els.sellingPrice.value = toDisplay(item.sellingPrice).toFixed(2);
  recalculate();
  // Switch to calculator tab.
  document.querySelector('.tab[data-tab="calc"]').click();
}

async function duplicateSaved(item) {
  const copy = {
    ...item,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: `${item.name} (copy)`,
    createdAt: Date.now()
  };
  state.saved.unshift(copy);
  await storage.set({ saved: state.saved });
  renderSaved();
}

async function deleteSaved(id) {
  state.saved = state.saved.filter(s => s.id !== id);
  await storage.set({ saved: state.saved });
  renderSaved();
}

async function clearAllSaved() {
  if (state.saved.length === 0) return;
  if (!confirm(`Delete all ${state.saved.length} saved products?`)) return;
  state.saved = [];
  await storage.set({ saved: [] });
  renderSaved();
}

// ============================================================
// Settings
// ============================================================

function renderSettings() {
  els.usdRate.value = state.usdRate;
  renderCourierList();
}

async function setUsdRate(value) {
  const v = parseFloat(value);
  if (!isFinite(v) || v <= 0) return;
  state.usdRate = v;
  await storage.set({ usdRate: v });
  // Trigger redisplay so existing input values stay accurate.
  recalculate();
  renderCourierDropdown();
}

// ============================================================
// Reset calculator
// ============================================================

function resetCalculator() {
  els.productCost.value = '';
  els.deliveryCost.value = '';
  els.adCost.value = '';
  els.discount.value = '';
  els.sellingPrice.value = '';
  els.targetMargin.value = '';
  els.productName.value = '';
  els.courierPreset.value = '';
  recalculate();
}

// ============================================================
// Wire up events
// ============================================================

function setupEvents() {
  // Inputs trigger recalculation
  [els.productCost, els.deliveryCost, els.adCost, els.discount, els.sellingPrice, els.targetMargin].forEach(input => {
    input.addEventListener('input', recalculate);
  });

  // Mode switching
  $$('input[name="mode"]').forEach(r => {
    r.addEventListener('change', () => applyMode(getCurrentMode()));
  });

  // Currency toggle
  $$('.currency-btn').forEach(btn => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
  });

  // Courier preset → fills delivery field with display-currency value
  els.courierPreset.addEventListener('change', () => {
    const i = parseInt(els.courierPreset.value, 10);
    if (Number.isNaN(i)) return;
    const c = state.couriers[i];
    if (!c) return;
    els.deliveryCost.value = toDisplay(c.cost).toFixed(2);
    recalculate();
  });

  els.saveBtn.addEventListener('click', saveCurrentProduct);
  els.resetBtn.addEventListener('click', resetCalculator);
  els.clearAllBtn.addEventListener('click', clearAllSaved);
  els.sortBy.addEventListener('change', async () => {
    state.sortBy = els.sortBy.value;
    await storage.set({ sortBy: state.sortBy });
    renderSaved();
  });

  els.usdRate.addEventListener('change', () => setUsdRate(els.usdRate.value));
  els.addCourierBtn.addEventListener('click', addCourier);
  els.newCourierCost.addEventListener('keydown', e => { if (e.key === 'Enter') addCourier(); });
  els.newCourierName.addEventListener('keydown', e => { if (e.key === 'Enter') addCourier(); });
  els.resetPresetsBtn.addEventListener('click', resetPresets);
}

// ============================================================
// Boot
// ============================================================

(async function init() {
  await loadState();
  els.sortBy.value = state.sortBy;
  updateCurrencyUI();
  renderCourierDropdown();
  setupTabs();
  setupEvents();
  recalculate();
  updateSavedCounts();
})();
