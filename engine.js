/* TrueWage engine - real hourly wage after taxes, work costs, and unpaid time. Pure math, no DOM. */
(function (root) {
  'use strict';

  function num(v, name) {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    if (typeof n !== 'number' || !isFinite(n) || isNaN(n)) throw new Error(name + ' must be a number');
    return n;
  }

  function analyze(o) {
    if (!o || typeof o !== 'object') throw new Error('options required');
    const salary = num(o.salary, 'salary');
    const taxPct = o.taxPct === undefined ? 25 : num(o.taxPct, 'taxPct');
    const contractHours = o.contractHours === undefined ? 40 : num(o.contractHours, 'contractHours');
    const actualHours = o.actualHours === undefined ? contractHours : num(o.actualHours, 'actualHours');
    const commuteMinPerDay = o.commuteMinPerDay === undefined ? 0 : num(o.commuteMinPerDay, 'commuteMinPerDay');
    const daysPerWeek = o.daysPerWeek === undefined ? 5 : num(o.daysPerWeek, 'daysPerWeek');
    const weeksPerYear = o.weeksPerYear === undefined ? 47 : num(o.weeksPerYear, 'weeksPerYear');
    const commuteCostPerDay = o.commuteCostPerDay === undefined ? 0 : num(o.commuteCostPerDay, 'commuteCostPerDay');
    const monthlyWorkCosts = o.monthlyWorkCosts === undefined ? 0 : num(o.monthlyWorkCosts, 'monthlyWorkCosts');

    if (salary <= 0) throw new Error('salary must be positive');
    if (taxPct < 0 || taxPct >= 100) throw new Error('taxPct must be between 0 and 100');
    if (contractHours <= 0 || contractHours > 100) throw new Error('contractHours must be in (0, 100]');
    if (actualHours <= 0 || actualHours > 120) throw new Error('actualHours must be in (0, 120]');
    if (commuteMinPerDay < 0 || commuteMinPerDay > 600) throw new Error('commuteMinPerDay must be in [0, 600]');
    if (daysPerWeek <= 0 || daysPerWeek > 7) throw new Error('daysPerWeek must be in (0, 7]');
    if (weeksPerYear <= 0 || weeksPerYear > 52) throw new Error('weeksPerYear must be in (0, 52]');
    if (commuteCostPerDay < 0) throw new Error('commuteCostPerDay must be >= 0');
    if (monthlyWorkCosts < 0) throw new Error('monthlyWorkCosts must be >= 0');

    const workDays = daysPerWeek * weeksPerYear;
    const commuteHours = commuteMinPerDay * workDays / 60;
    const workHours = actualHours * weeksPerYear;
    const totalHours = workHours + commuteHours;

    const netAnnual = salary * (1 - taxPct / 100);
    const commuteCostAnnual = commuteCostPerDay * workDays;
    const workCostsAnnual = monthlyWorkCosts * 12 + commuteCostAnnual;
    const realNet = netAnnual - workCostsAnnual;

    const nominalWage = salary / (contractHours * weeksPerYear);   // what the offer letter implies, gross
    const netWage = netAnnual / (contractHours * weeksPerYear);    // after tax, contract hours
    const realWage = realNet / totalHours;                          // after costs, all hours given

    return {
      salary: salary, taxPct: taxPct,
      netAnnual: netAnnual,
      workDays: workDays,
      workHours: workHours,
      commuteHours: commuteHours,
      totalHours: totalHours,
      commuteCostAnnual: commuteCostAnnual,
      workCostsAnnual: workCostsAnnual,
      realNet: realNet,
      nominalWage: nominalWage,
      netWage: netWage,
      realWage: realWage,
      unpaidOvertimeHours: Math.max(0, (actualHours - contractHours) * weeksPerYear),
      commuteSharePct: totalHours > 0 ? commuteHours / totalHours * 100 : 0
    };
  }

  function compare(a, b) {
    const ra = analyze(a), rb = analyze(b);
    const delta = rb.realWage - ra.realWage;
    let winner;
    if (Math.abs(delta) < 0.005) winner = 'tie';
    else winner = delta > 0 ? 'b' : 'a';
    // annual value of the real-wage gap, measured over the winner's total hours
    const annualGap = Math.abs(delta) * (winner === 'b' ? rb.totalHours : ra.totalHours);
    return { a: ra, b: rb, winner: winner, realWageDelta: Math.abs(delta), annualGap: annualGap };
  }

  const api = { analyze: analyze, compare: compare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.TrueWageEngine = api;
})(typeof self !== 'undefined' ? self : this);
