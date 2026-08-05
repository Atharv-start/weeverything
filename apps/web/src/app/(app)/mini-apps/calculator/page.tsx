'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

type CalcMode = 'standard' | 'scientific' | 'emi' | 'gst' | 'sip' | 'loan' | 'age' | 'percentage' | 'bmi';

export default function CalculatorPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<CalcMode>('standard');

  // EMI State
  const [emiPrincipal, setEmiPrincipal] = useState('500000');
  const [emiRate, setEmiRate] = useState('8.5');
  const [emiTenureYears, setEmiTenureYears] = useState('5');
  const [emiResult, setEmiResult] = useState<{ emi: number; totalInterest: number; totalPayment: number } | null>(null);

  // GST State
  const [gstAmount, setGstAmount] = useState('1000');
  const [gstRate, setGstRate] = useState('18');
  const [gstType, setGstType] = useState<'exclusive' | 'inclusive'>('exclusive');
  const [gstResult, setGstResult] = useState<{ gstAmount: number; totalAmount: number } | null>(null);

  // SIP State
  const [sipMonthly, setSipMonthly] = useState('5000');
  const [sipReturnRate, setSipReturnRate] = useState('12');
  const [sipYears, setSipYears] = useState('10');
  const [sipResult, setSipResult] = useState<{ invested: number; returns: number; total: number } | null>(null);

  // Age State
  const [dob, setDob] = useState('2000-01-15');
  const [ageResult, setAgeResult] = useState<string>('');

  // BMI State
  const [weightKg, setWeightKg] = useState('68');
  const [heightCm, setHeightCm] = useState('172');
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);

  // Percentage State
  const [pctVal, setPctVal] = useState('20');
  const [totalVal, setTotalVal] = useState('1500');
  const [pctResult, setPctResult] = useState<number | null>(null);

  const handleNum = (num: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOp = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = equation + display;
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(');

      // eslint-disable-next-line no-eval
      const res = eval(sanitized);
      const formattedRes = String(Number.isInteger(res) ? res : Number(res.toFixed(6)));
      setHistory((prev) => [`${fullExpr} = ${formattedRes}`, ...prev.slice(0, 9)]);
      setDisplay(formattedRes);
      setEquation('');
    } catch {
      setDisplay('Error');
    }
  };

  const handleScientificFunc = (func: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      if (func === 'sin') res = Math.sin(val);
      else if (func === 'cos') res = Math.cos(val);
      else if (func === 'tan') res = Math.tan(val);
      else if (func === 'sqrt') res = Math.sqrt(val);
      else if (func === 'log') res = Math.log10(val);
      else if (func === 'sq') res = val * val;

      const formatted = String(Number.isInteger(res) ? res : Number(res.toFixed(6)));
      setHistory((prev) => [`${func}(${val}) = ${formatted}`, ...prev.slice(0, 9)]);
      setDisplay(formatted);
    } catch {
      setDisplay('Error');
    }
  };

  const calculateEMI = () => {
    const P = parseFloat(emiPrincipal);
    const r = parseFloat(emiRate) / 12 / 100;
    const n = parseFloat(emiTenureYears) * 12;
    if (isNaN(P) || isNaN(r) || isNaN(n) || n === 0) return;
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;
    setEmiResult({ emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment) });
    setHistory((prev) => [`EMI (₹${P.toLocaleString()} @ ${emiRate}% for ${emiTenureYears}y) = ₹${Math.round(emi).toLocaleString()}/mo`, ...prev.slice(0, 9)]);
  };

  const calculateGST = () => {
    const P = parseFloat(gstAmount);
    const R = parseFloat(gstRate);
    if (isNaN(P) || isNaN(R)) return;
    let gstAmountVal = 0;
    let totalAmountVal = 0;
    if (gstType === 'exclusive') {
      gstAmountVal = (P * R) / 100;
      totalAmountVal = P + gstAmountVal;
    } else {
      gstAmountVal = P - (P * (100 / (100 + R)));
      totalAmountVal = P;
    }
    setGstResult({ gstAmount: Number(gstAmountVal.toFixed(2)), totalAmount: Number(totalAmountVal.toFixed(2)) });
    setHistory((prev) => [`GST (${R}% on ₹${P}) = ₹${gstAmountVal.toFixed(2)}`, ...prev.slice(0, 9)]);
  };

  const calculateSIP = () => {
    const P = parseFloat(sipMonthly);
    const i = parseFloat(sipReturnRate) / 12 / 100;
    const n = parseFloat(sipYears) * 12;
    if (isNaN(P) || isNaN(i) || isNaN(n)) return;
    const M = P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = P * n;
    const returns = M - invested;
    setSipResult({ invested: Math.round(invested), returns: Math.round(returns), total: Math.round(M) });
    setHistory((prev) => [`SIP (₹${P}/mo @ ${sipReturnRate}% for ${sipYears}y) = ₹${Math.round(M).toLocaleString()}`, ...prev.slice(0, 9)]);
  };

  const calculateAge = () => {
    if (!dob) return;
    const birth = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const res = `${years} Years, ${months} Months, ${days} Days`;
    setAgeResult(res);
    setHistory((prev) => [`Age (${dob}) = ${res}`, ...prev.slice(0, 9)]);
  };

  const calculateBMI = () => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm) / 100;
    if (isNaN(w) || isNaN(h) || h === 0) return;
    const bmi = w / (h * h);
    let category = 'Normal weight';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi >= 25 && bmi < 29.9) category = 'Overweight';
    else if (bmi >= 30) category = 'Obesity';
    setBmiResult({ bmi: Number(bmi.toFixed(1)), category });
    setHistory((prev) => [`BMI (${w}kg, ${heightCm}cm) = ${bmi.toFixed(1)} (${category})`, ...prev.slice(0, 9)]);
  };

  const calculatePercentage = () => {
    const p = parseFloat(pctVal);
    const t = parseFloat(totalVal);
    if (isNaN(p) || isNaN(t)) return;
    const res = (p / 100) * t;
    setPctResult(res);
    setHistory((prev) => [`${p}% of ${t} = ${res}`, ...prev.slice(0, 9)]);
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="SYSTEM UTILITY & FINANCIAL CALCULATORS"
        title="Multi-Calculator Engine"
        description="Standard math, high-precision trigonometry, EMI, GST, SIP, Loan, Age, Percentage & BMI engine"
      />

      {/* Mode Selector Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { id: 'standard', name: 'Standard' },
          { id: 'scientific', name: 'Scientific' },
          { id: 'emi', name: 'EMI' },
          { id: 'gst', name: 'GST' },
          { id: 'sip', name: 'SIP Returns' },
          { id: 'loan', name: 'Loan Amortization' },
          { id: 'age', name: 'Age' },
          { id: 'percentage', name: 'Percentage' },
          { id: 'bmi', name: 'BMI' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as CalcMode)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
              mode === m.id
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calculator Main Section */}
        <div className="lg:col-span-2 space-y-4">
          {(mode === 'standard' || mode === 'scientific') && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 shadow-2xl">
              {/* Display screen */}
              <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 mb-6 text-right font-mono min-h-[100px] flex flex-col justify-end">
                <span className="text-xs text-[var(--color-text-muted)] h-5">{equation}</span>
                <span className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary)] tracking-wider truncate">
                  {display}
                </span>
              </div>

              {/* Scientific Row if active */}
              {mode === 'scientific' && (
                <div className="grid grid-cols-6 gap-2 mb-3">
                  {['sin', 'cos', 'tan', 'sqrt', 'log', 'sq'].map((fn) => (
                    <button
                      key={fn}
                      onClick={() => handleScientificFunc(fn)}
                      className="bg-[var(--color-surface-bright)] hover:bg-[var(--color-surface-dim)] text-[var(--color-primary)] py-2.5 rounded-lg font-mono text-xs font-bold border border-[var(--color-border)] cursor-pointer"
                    >
                      {fn}
                    </button>
                  ))}
                </div>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-4 gap-3 font-mono font-bold text-sm">
                <button onClick={handleClear} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30 cursor-pointer">
                  AC
                </button>
                <button onClick={handleBackspace} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                  ⌫
                </button>
                <button onClick={() => handleOp('%')} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                  %
                </button>
                <button onClick={() => handleOp('÷')} className="bg-[var(--color-primary-dim)] hover:bg-[var(--color-primary-dim)]/80 text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-primary-glow)] text-lg cursor-pointer">
                  ÷
                </button>

                {['7', '8', '9'].map((n) => (
                  <button key={n} onClick={() => handleNum(n)} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                    {n}
                  </button>
                ))}
                <button onClick={() => handleOp('×')} className="bg-[var(--color-primary-dim)] hover:bg-[var(--color-primary-dim)]/80 text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-primary-glow)] text-lg cursor-pointer">
                  ×
                </button>

                {['4', '5', '6'].map((n) => (
                  <button key={n} onClick={() => handleNum(n)} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                    {n}
                  </button>
                ))}
                <button onClick={() => handleOp('-')} className="bg-[var(--color-primary-dim)] hover:bg-[var(--color-primary-dim)]/80 text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-primary-glow)] text-lg cursor-pointer">
                  -
                </button>

                {['1', '2', '3'].map((n) => (
                  <button key={n} onClick={() => handleNum(n)} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                    {n}
                  </button>
                ))}
                <button onClick={() => handleOp('+')} className="bg-[var(--color-primary-dim)] hover:bg-[var(--color-primary-dim)]/80 text-[var(--color-primary)] p-4 rounded-xl border border-[var(--color-primary-glow)] text-lg cursor-pointer">
                  +
                </button>

                <button onClick={() => handleNum('0')} className="col-span-2 glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                  0
                </button>
                <button onClick={() => handleNum('.')} className="glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] p-4 rounded-xl border border-[var(--color-border)] cursor-pointer">
                  .
                </button>
                <button onClick={handleCalculate} className="bg-[var(--color-primary)] hover:brightness-110 text-[var(--color-text-inverse)] p-4 rounded-xl text-lg font-black cursor-pointer shadow-lg">
                  =
                </button>
              </div>
            </div>
          )}

          {/* EMI & Loan Calculator */}
          {(mode === 'emi' || mode === 'loan') && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">EMI & Loan Amortization Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={emiPrincipal}
                    onChange={(e) => setEmiPrincipal(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    value={emiRate}
                    onChange={(e) => setEmiRate(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Tenure (Years)</label>
                  <input
                    type="number"
                    value={emiTenureYears}
                    onChange={(e) => setEmiTenureYears(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
              </div>
              <button
                onClick={calculateEMI}
                className="w-full btn-neon py-3 uppercase font-bold"
              >
                Calculate Monthly EMI
              </button>

              {emiResult && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 space-y-2 font-mono text-xs text-[var(--color-text)]">
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Monthly EMI:</span>
                    <span className="font-bold text-[var(--color-primary)] text-sm">₹{emiResult.emi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Total Interest Payable:</span>
                    <span>₹{emiResult.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Total Payment (Principal + Interest):</span>
                    <span className="font-bold">₹{emiResult.totalPayment.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GST Calculator */}
          {mode === 'gst' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Goods & Services Tax (GST) Calculator</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Base Amount (₹)</label>
                  <input
                    type="number"
                    value={gstAmount}
                    onChange={(e) => setGstAmount(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">GST Slab Rate (%)</label>
                  <select
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    className="w-full input-neon"
                  >
                    <option value="5">5% (Essential Goods)</option>
                    <option value="12">12% (Standard Items)</option>
                    <option value="18">18% (Services & Tech)</option>
                    <option value="28">28% (Luxury Goods)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">GST Mode</label>
                  <select
                    value={gstType}
                    onChange={(e) => setGstType(e.target.value as any)}
                    className="w-full input-neon"
                  >
                    <option value="exclusive">Add GST (Exclusive)</option>
                    <option value="inclusive">Remove GST (Inclusive)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={calculateGST}
                className="w-full btn-neon py-3 uppercase font-bold"
              >
                Compute GST Breakdown
              </button>

              {gstResult && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 space-y-2 font-mono text-xs text-[var(--color-text)]">
                  <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                    <span className="text-[var(--color-text-muted)]">Calculated GST Amount:</span>
                    <span className="font-bold text-[var(--color-primary)]">₹{gstResult.gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Net Gross Amount:</span>
                    <span className="font-bold text-sm">₹{gstResult.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SIP Return Calculator */}
          {mode === 'sip' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Systematic Investment Plan (SIP) Return Engine</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Monthly SIP (₹)</label>
                  <input
                    type="number"
                    value={sipMonthly}
                    onChange={(e) => setSipMonthly(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Expected Return (% p.a.)</label>
                  <input
                    type="number"
                    value={sipReturnRate}
                    onChange={(e) => setSipReturnRate(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Investment Horizon (Years)</label>
                  <input
                    type="number"
                    value={sipYears}
                    onChange={(e) => setSipYears(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
              </div>
              <button
                onClick={calculateSIP}
                className="w-full btn-neon py-3 uppercase font-bold"
              >
                Calculate Maturity Returns
              </button>

              {sipResult && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 space-y-2 font-mono text-xs text-[var(--color-text)]">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Invested Capital:</span>
                    <span>₹{sipResult.invested.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-muted)]">Estimated Wealth Gain:</span>
                    <span className="text-emerald-400 font-bold">₹{sipResult.returns.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-text-muted)]">Total Maturity Wealth:</span>
                    <span className="font-bold text-[var(--color-primary)] text-sm">₹{sipResult.total.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Age Calculator */}
          {mode === 'age' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Exact Chronological Age Calculator</h3>
              <div className="font-mono text-xs space-y-3">
                <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full input-neon"
                />
                <button
                  onClick={calculateAge}
                  className="w-full btn-neon py-3 uppercase font-bold"
                >
                  Calculate Age
                </button>
              </div>

              {ageResult && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 font-mono text-center space-y-1">
                  <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Exact Age</span>
                  <p className="font-bold text-lg text-[var(--color-primary)]">{ageResult}</p>
                </div>
              )}
            </div>
          )}

          {/* BMI Calculator */}
          {mode === 'bmi' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Body Mass Index (BMI) Calculator</h3>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
              </div>
              <button
                onClick={calculateBMI}
                className="w-full btn-neon py-3 uppercase font-bold"
              >
                Compute BMI Score
              </button>

              {bmiResult && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 font-mono text-center space-y-1">
                  <span className="text-[10px] uppercase text-[var(--color-text-muted)]">BMI Score</span>
                  <p className="font-bold text-2xl text-[var(--color-primary)]">{bmiResult.bmi}</p>
                  <p className="text-xs text-[var(--color-text)] font-bold">{bmiResult.category}</p>
                </div>
              )}
            </div>
          )}

          {/* Percentage Calculator */}
          {mode === 'percentage' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Percentage Calculator</h3>
              <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Percentage (%)</label>
                  <input
                    type="number"
                    value={pctVal}
                    onChange={(e) => setPctVal(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Total Value</label>
                  <input
                    type="number"
                    value={totalVal}
                    onChange={(e) => setTotalVal(e.target.value)}
                    className="w-full input-neon"
                  />
                </div>
              </div>
              <button
                onClick={calculatePercentage}
                className="w-full btn-neon py-3 uppercase font-bold"
              >
                Calculate Percentage Result
              </button>

              {pctResult !== null && (
                <div className="bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl p-5 font-mono text-center space-y-1">
                  <span className="text-[10px] uppercase text-[var(--color-text-muted)]">Percentage Value</span>
                  <p className="font-bold text-2xl text-[var(--color-primary)]">{pctResult}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 h-fit space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-[var(--color-primary)]">history</span>
              Calculation Log
            </h3>
            {history.length > 0 && (
              <button onClick={() => setHistory([])} className="font-mono text-[10px] text-red-400 hover:underline cursor-pointer">
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-[450px] overflow-y-auto hide-scrollbar">
            {history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-text)]">
                  {item}
                </div>
              ))
            ) : (
              <p className="font-mono text-xs text-[var(--color-text-muted)] text-center py-8">No calculation history yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
