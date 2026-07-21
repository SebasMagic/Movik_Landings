const { test } = require('node:test');
const assert = require('node:assert');
const C = require('./calc.js');

test('monthlyAmount passes monthly through and divides annual by 12', () => {
  assert.strictEqual(C.monthlyAmount(100000, 'monthly'), 100000);
  assert.strictEqual(C.monthlyAmount(1200000, 'annual'), 100000);
});

test('computeSavings at 70% funded keeps 30% of the fee', () => {
  const r = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  assert.strictEqual(r.traditional, 2000);
  assert.strictEqual(r.movik, 1400);
  assert.strictEqual(Math.round(r.savings), 600);
  assert.strictEqual(Math.round(r.savingsPct), 30);
});

test('computeSavings at 100% funded saves nothing', () => {
  const r = C.computeSavings({ amount: 100000, period: 'monthly', pct: 100 });
  assert.strictEqual(r.savings, 0);
  assert.strictEqual(r.savingsPct, 0);
});

test('computeSavings on annual divides before applying the rate', () => {
  const r = C.computeSavings({ amount: 1200000, period: 'annual', pct: 70 });
  assert.strictEqual(r.traditional, 2000);
  assert.strictEqual(r.movik, 1400);
});

test('computeSavings with zero volume yields zero, not NaN', () => {
  const r = C.computeSavings({ amount: 0, period: 'monthly', pct: 70 });
  assert.strictEqual(r.traditional, 0);
  assert.strictEqual(r.savingsPct, 0);
});

test('computeSavings uses the fixed 2% rate', () => {
  assert.strictEqual(C.RATE, 0.02);
});

test('formatUSD rounds and adds thousands separators', () => {
  assert.strictEqual(C.formatUSD(1234.56), '$1,235');
  assert.strictEqual(C.formatUSD(0), '$0');
  assert.strictEqual(C.formatUSD(1000000), '$1,000,000');
});

test('formatDigits inserts commas and keeps the caret after the typed digit', () => {
  const r = C.formatDigits('100000', 6);
  assert.strictEqual(r.text, '100,000');
  assert.strictEqual(r.caret, 7);
  assert.strictEqual(r.value, 100000);
});

test('formatDigits keeps the caret mid-string when editing inside the number', () => {
  const r = C.formatDigits('1005,000', 4);
  assert.strictEqual(r.text, '1,005,000');
  assert.strictEqual(r.value, 1005000);
  assert.strictEqual(r.text.slice(0, r.caret).replace(/[^0-9]/g, '').length, 4);
});

test('formatDigits strips non-digits', () => {
  const r = C.formatDigits('12a3', 4);
  assert.strictEqual(r.text, '123');
  assert.strictEqual(r.value, 123);
});

test('formatDigits handles an empty field', () => {
  const r = C.formatDigits('', 0);
  assert.strictEqual(r.text, '');
  assert.strictEqual(r.caret, 0);
  assert.strictEqual(r.value, 0);
});

test('isValidEmail accepts real addresses and rejects junk', () => {
  assert.ok(C.isValidEmail('carlos@onestopdb.us'));
  assert.ok(!C.isValidEmail('carlos@'));
  assert.ok(!C.isValidEmail('carlos at example.com'));
  assert.ok(!C.isValidEmail(''));
  assert.ok(!C.isValidEmail('a@b'));
});

test('buildLead trims text and computes per-truck savings', () => {
  const state = {
    leadName: '  Carlos  ', leadEmail: ' carlos@onestopdb.us ', leadPhone: ' 555 ',
    trucks: 12, period: 'monthly', amount: 100000, pct: 70
  };
  const result = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  const lead = C.buildLead(state, result, '2026-07-21T00:00:00.000Z');
  assert.strictEqual(lead.name, 'Carlos');
  assert.strictEqual(lead.email, 'carlos@onestopdb.us');
  assert.strictEqual(lead.phone, '555');
  assert.strictEqual(lead.estimatedMonthlySavings, 600);
  assert.strictEqual(lead.estimatedSavingsPerTruck, 50);
  assert.strictEqual(lead.source, 'movik-savings-calculator');
  assert.strictEqual(lead.timestamp, '2026-07-21T00:00:00.000Z');
});

test('buildLead reports null per-truck savings when there are no trucks', () => {
  const state = {
    leadName: 'Carlos', leadEmail: 'carlos@onestopdb.us', leadPhone: '',
    trucks: 0, period: 'monthly', amount: 100000, pct: 70
  };
  const result = C.computeSavings({ amount: 100000, period: 'monthly', pct: 70 });
  assert.strictEqual(C.buildLead(state, result, 'x').estimatedSavingsPerTruck, null);
});

test('ticks enumerates the slider stops', () => {
  assert.deepStrictEqual(C.ticks(70, 100), [70, 80, 90, 100]);
});
