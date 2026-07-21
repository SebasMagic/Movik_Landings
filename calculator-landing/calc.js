/* Movik Savings Calculator — pure logic.
   No DOM access. Loaded by index.html as window.MovikCalc, and by
   calc.test.js through CommonJS. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MovikCalc = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var RATE = 0.02;

  function monthlyAmount(amount, period) {
    var a = amount || 0;
    return period === 'annual' ? a / 12 : a;
  }

  function computeSavings(opts) {
    var rate = typeof opts.rate === 'number' ? opts.rate : RATE;
    var m = monthlyAmount(opts.amount, opts.period);
    var traditional = m * rate;
    var movik = m * (opts.pct / 100) * rate;
    var savings = traditional - movik;
    return {
      traditional: traditional,
      movik: movik,
      savings: savings,
      savingsPct: traditional > 0 ? (savings / traditional) * 100 : 0
    };
  }

  function formatUSD(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  /* Reformats a partially typed number with thousands separators and reports
     where the caret belongs afterwards, so typing never yanks the cursor to
     the end. Counts digits before the caret, reformats, then walks forward
     to the same digit index. */
  function formatDigits(rawValue, caret) {
    var value = String(rawValue == null ? '' : rawValue);
    var pos = typeof caret === 'number' ? caret : value.length;
    var digitsBefore = value.slice(0, pos).replace(/[^0-9]/g, '').length;
    var digits = value.replace(/[^0-9]/g, '');
    var formatted = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    var newCaret = formatted.length;
    if (digitsBefore === 0) {
      newCaret = 0;
    } else {
      var count = 0;
      for (var i = 0; i < formatted.length; i++) {
        if (formatted[i] >= '0' && formatted[i] <= '9') count++;
        if (count === digitsBefore) { newCaret = i + 1; break; }
      }
    }

    return {
      text: formatted,
      caret: newCaret,
      value: digits ? parseInt(digits, 10) : 0
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email == null ? '' : email).trim());
  }

  function buildLead(state, result, timestamp) {
    return {
      name: String(state.leadName || '').trim(),
      email: String(state.leadEmail || '').trim(),
      phone: String(state.leadPhone || '').trim(),
      trucks: state.trucks,
      billingPeriod: state.period,
      invoiceVolume: state.amount,
      pctFunded: state.pct,
      estimatedMonthlySavings: Math.round(result.savings),
      estimatedSavingsPerTruck: state.trucks > 0 ? Math.round(result.savings / state.trucks) : null,
      source: 'movik-savings-calculator',
      timestamp: timestamp
    };
  }

  function ticks(minPct, maxPct) {
    var out = [];
    for (var v = minPct; v <= maxPct; v += 10) out.push(v);
    return out;
  }

  return {
    RATE: RATE,
    monthlyAmount: monthlyAmount,
    computeSavings: computeSavings,
    formatUSD: formatUSD,
    formatDigits: formatDigits,
    isValidEmail: isValidEmail,
    buildLead: buildLead,
    ticks: ticks
  };
});
