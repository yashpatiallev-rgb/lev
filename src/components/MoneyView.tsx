import React, { useState } from 'react';
import { Wallet, Sparkles, Plus, ArrowUpRight, ArrowDownRight, Tag, Settings2, Check, X } from 'lucide-react';
import { translations } from '../i18n/translations';
import { Expense, MoneyBudget } from '../types';
import { getTodayKey } from '../services/storage';

interface MoneyViewProps {
  language: 'en' | 'id';
  budget: MoneyBudget;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateBudget?: (updated: MoneyBudget) => void;
}

// Fixed dual currency: INR (₹) and IDR (Rp) strictly (1 INR = 190 IDR)
const INR_TO_IDR = 190;

export const formatDualCurrency = (amount: number, baseCurrency: 'INR' | 'IDR' | string = 'INR') => {
  let inrVal = 0;
  let idrVal = 0;
  const upper = (baseCurrency || 'INR').toUpperCase();

  if (upper.includes('IDR') || baseCurrency === 'Rp') {
    idrVal = amount;
    inrVal = Math.round(amount / INR_TO_IDR);
  } else {
    // Default INR
    inrVal = amount;
    idrVal = Math.round(amount * INR_TO_IDR);
  }

  const inrFormatted = `₹${inrVal.toLocaleString('en-IN')}`;
  const idrFormatted = `Rp ${idrVal.toLocaleString('id-ID')}`;

  return {
    inr: inrFormatted,
    idr: idrFormatted,
    inrVal,
    idrVal,
  };
};

export const MoneyView: React.FC<MoneyViewProps> = ({
  language,
  budget,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onUpdateBudget,
}) => {
  const t = translations[language].money;
  const [naturalText, setNaturalText] = useState('');
  const [quickCurrency, setQuickCurrency] = useState<'₹' | 'Rp'>('₹');
  const [isEditingBudget, setIsEditingBudget] = useState(false);

  // Edit budget form state
  const [inputAvailable, setInputAvailable] = useState(String(budget.totalAvailable || ''));
  const [inputUpcoming, setInputUpcoming] = useState(String(budget.monthlyUpcoming || ''));
  const [inputWeekly, setInputWeekly] = useState(String(budget.weeklyBudget || ''));
  const [budgetBaseCurrency, setBudgetBaseCurrency] = useState<'INR' | 'IDR'>('INR');

  const todayKey = getTodayKey();
  const todayExpenses = expenses.filter((e) => e.date === todayKey);

  // Normalize all today expenses into INR
  const todaySpentTotalINR = todayExpenses.reduce((sum, e) => {
    if (e.currency === 'Rp' || e.currency === 'IDR') {
      return sum + Math.round(e.amount / INR_TO_IDR);
    }
    return sum + e.amount;
  }, 0);

  // Normalize budget total into INR
  let totalAvailableINR = budget.totalAvailable;
  if (budget.currency === 'Rp' || budget.currency === 'IDR') {
    totalAvailableINR = Math.round(budget.totalAvailable / INR_TO_IDR);
  }

  let monthlyUpcomingINR = budget.monthlyUpcoming;
  if (budget.currency === 'Rp' || budget.currency === 'IDR') {
    monthlyUpcomingINR = Math.round(budget.monthlyUpcoming / INR_TO_IDR);
  }

  const safeToSpendINR = Math.max(0, totalAvailableINR - monthlyUpcomingINR - todaySpentTotalINR);

  // Dual format strings: BOTH INR and IDR displayed simultaneously
  const safeDual = formatDualCurrency(safeToSpendINR, 'INR');
  const availableDual = formatDualCurrency(Math.max(0, totalAvailableINR - todaySpentTotalINR), 'INR');
  const upcomingDual = formatDualCurrency(monthlyUpcomingINR, 'INR');
  const spentTodayDual = formatDualCurrency(todaySpentTotalINR, 'INR');

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const avail = parseFloat(inputAvailable) || 0;
    const upcom = parseFloat(inputUpcoming) || 0;
    const weekly = parseFloat(inputWeekly) || 0;

    if (onUpdateBudget) {
      onUpdateBudget({
        totalAvailable: avail,
        monthlyUpcoming: upcom,
        safeToSpend: Math.max(0, avail - upcom),
        weeklyBudget: weekly,
        currency: budgetBaseCurrency,
      });
    }
    setIsEditingBudget(false);
  };

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;

    const lower = naturalText.toLowerCase();
    let amt = 0;
    let detectedCurrency: '₹' | 'Rp' = quickCurrency;

    if (lower.includes('rp') || lower.includes('idr') || /rb|ribu/i.test(naturalText)) {
      detectedCurrency = 'Rp';
    } else if (lower.includes('₹') || lower.includes('rs') || lower.includes('inr')) {
      detectedCurrency = '₹';
    }

    const matchId = lower.match(/(\d+(?:\.\d+)?)\s*(?:rb|ribu|k)?/i);
    if (matchId) {
      amt = parseFloat(matchId[1]);
      if (/rb|ribu|k/i.test(naturalText) && detectedCurrency === 'Rp') amt *= 1000;
    }

    let category: 'food' | 'health' | 'commute' | 'study' | 'personal' | 'other' = 'food';
    if (/kopi|coffee|makan|lunch|dinner|breakfast|snack|groceries/i.test(lower)) category = 'food';
    else if (/obat|medicine|doctor|dokter|pharmacy/i.test(lower)) category = 'health';
    else if (/transport|metro|bus|auto|cab|gojek|grab/i.test(lower)) category = 'commute';
    else if (/book|buku|course/i.test(lower)) category = 'study';

    const defaultAmt = detectedCurrency === 'Rp' ? 35000 : 150;

    const exp: Expense = {
      id: `exp_${Date.now()}`,
      title: naturalText.replace(/^(i spent|spent|habis|tadi habis|tadi beli)\s+/i, '').trim() || naturalText,
      amount: amt || defaultAmt,
      currency: detectedCurrency,
      category,
      date: todayKey,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    };

    onAddExpense(exp);
    setNaturalText('');
  };

  return (
    <div className="space-y-6 sm:space-y-7 pb-20 max-w-xl mx-auto">
      {/* Title & Set Balance button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#29272A]">
            {t.title}
          </h1>
          <p className="text-xs font-medium text-[#716D70] mt-1 tracking-wide">
            {t.sub}
          </p>
        </div>

        <button
          onClick={() => setIsEditingBudget(!isEditingBudget)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#716D70] hover:text-[#29272A] bg-white border border-[#EAE6DF] rounded-xl transition-colors cursor-pointer shadow-xs"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>{language === 'id' ? 'Atur Saldo' : 'Set Balances'}</span>
        </button>
      </div>

      {/* Set Balances Form */}
      {isEditingBudget && (
        <form onSubmit={handleSaveBudget} className="bg-white border border-[#EAE6DF] p-4 rounded-2xl space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#EAE6DF] pb-2">
            <h3 className="text-xs font-semibold text-[#29272A]">
              {language === 'id' ? 'Pengaturan Saldo & Anggaran' : 'Set Your Real Balances'}
            </h3>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-[#716D70] mr-1">Currency:</span>
              <button
                type="button"
                onClick={() => setBudgetBaseCurrency('INR')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  budgetBaseCurrency === 'INR' ? 'bg-[#B56F83] text-white' : 'bg-[#F8F5F0] text-[#716D70]'
                }`}
              >
                INR (₹)
              </button>
              <button
                type="button"
                onClick={() => setBudgetBaseCurrency('IDR')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                  budgetBaseCurrency === 'IDR' ? 'bg-[#B56F83] text-white' : 'bg-[#F8F5F0] text-[#716D70]'
                }`}
              >
                IDR (Rp)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-[#716D70] mb-1 font-medium">
                {t.available} ({budgetBaseCurrency === 'INR' ? '₹' : 'Rp'})
              </label>
              <input
                type="number"
                value={inputAvailable}
                onChange={(e) => setInputAvailable(e.target.value)}
                placeholder={budgetBaseCurrency === 'INR' ? 'e.g. 25000' : 'mis. 5000000'}
                className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#716D70] mb-1 font-medium">
                {t.upcomingBills} ({budgetBaseCurrency === 'INR' ? '₹' : 'Rp'})
              </label>
              <input
                type="number"
                value={inputUpcoming}
                onChange={(e) => setInputUpcoming(e.target.value)}
                placeholder={budgetBaseCurrency === 'INR' ? 'e.g. 8000' : 'mis. 1500000'}
                className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#716D70] mb-1 font-medium">
                Weekly Budget ({budgetBaseCurrency === 'INR' ? '₹' : 'Rp'})
              </label>
              <input
                type="number"
                value={inputWeekly}
                onChange={(e) => setInputWeekly(e.target.value)}
                placeholder={budgetBaseCurrency === 'INR' ? 'e.g. 5000' : 'mis. 1000000'}
                className="w-full px-3 py-1.5 text-xs bg-[#F8F5F0] border border-[#EAE6DF] rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditingBudget(false)}
              className="px-3 py-1.5 text-xs text-[#716D70] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] rounded-xl cursor-pointer"
            >
              Save Balances
            </button>
          </div>
        </form>
      )}

      {/* Dual Currency Stat Cards: BOTH INR (₹) AND IDR (Rp) ALWAYS DISPLAYED */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Safe to Spend (Hero) */}
        <div className="bg-[#F3E9E5] border border-[#E3D3CD] rounded-2xl p-4.5 sm:col-span-1 shadow-xs">
          <span className="text-[11px] font-semibold text-[#B56F83] uppercase tracking-wider block">
            {t.safeToSpend}
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#29272A] mt-1.5 tabular-nums">
            {safeDual.inr}
          </div>
          <div className="text-xs font-mono font-medium text-[#716D70] mt-0.5 tabular-nums">
            ≈ {safeDual.idr}
          </div>
          <p className="text-[10px] text-[#716D70] mt-1">
            Safe after all upcoming commitments
          </p>
        </div>

        {/* Available Total */}
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#716D70] uppercase tracking-wider block">
            {t.available}
          </span>
          <div className="text-xl sm:text-2xl font-semibold font-mono text-[#29272A] mt-1.5 tabular-nums">
            {availableDual.inr}
          </div>
          <div className="text-xs font-mono font-medium text-[#716D70] mt-0.5 tabular-nums">
            ≈ {availableDual.idr}
          </div>
          <p className="text-[10px] text-[#716D70] mt-1">
            Total liquid balance
          </p>
        </div>

        {/* Upcoming Commitments */}
        <div className="bg-white border border-[#EAE6DF] rounded-2xl p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold text-[#716D70] uppercase tracking-wider block">
            {t.upcomingBills}
          </span>
          <div className="text-xl sm:text-2xl font-semibold font-mono text-[#B56F83] mt-1.5 tabular-nums">
            {upcomingDual.inr}
          </div>
          <div className="text-xs font-mono font-medium text-[#716D70] mt-0.5 tabular-nums">
            ≈ {upcomingDual.idr}
          </div>
          <p className="text-[10px] text-[#716D70] mt-1">
            Fixed bills & subscriptions
          </p>
        </div>
      </div>

      {/* Spent Today Dual Banner */}
      <div className="bg-white border border-[#EAE6DF] rounded-2xl p-3.5 flex items-center justify-between text-xs shadow-xs">
        <span className="text-[#716D70] font-medium">{t.spentToday}:</span>
        <div className="flex items-baseline gap-2 font-mono font-semibold text-[#29272A]">
          <span>{spentTodayDual.inr}</span>
          <span className="text-[11px] text-[#716D70] font-normal">({spentTodayDual.idr})</span>
        </div>
      </div>

      {/* Natural Language Quick Log Bar with ₹ & Rp chips */}
      <form onSubmit={handleQuickLog} className="bg-white border border-[#EAE6DF] rounded-2xl p-2 flex items-center gap-2 shadow-xs">
        <div className="flex items-center gap-1 shrink-0 pl-1">
          <button
            type="button"
            onClick={() => setQuickCurrency('₹')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              quickCurrency === '₹'
                ? 'bg-[#B56F83] text-white shadow-xs'
                : 'bg-[#F8F5F0] text-[#716D70] hover:text-[#29272A]'
            }`}
          >
            ₹ INR
          </button>
          <button
            type="button"
            onClick={() => setQuickCurrency('Rp')}
            className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              quickCurrency === 'Rp'
                ? 'bg-[#B56F83] text-white shadow-xs'
                : 'bg-[#F8F5F0] text-[#716D70] hover:text-[#29272A]'
            }`}
          >
            Rp IDR
          </button>
        </div>

        <input
          type="text"
          value={naturalText}
          onChange={(e) => setNaturalText(e.target.value)}
          placeholder={
            language === 'id'
              ? 'Tulis pengeluaran (mis. "35rb makan siang" atau "₹150 kopi")'
              : 'Log expense (e.g. "₹250 lunch" or "35k groceries")'
          }
          className="flex-1 px-3 py-1.5 text-xs bg-transparent text-[#29272A] placeholder-[#A09A9F] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!naturalText.trim()}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#B56F83] hover:bg-[#A25C70] disabled:opacity-40 rounded-xl transition-colors cursor-pointer whitespace-nowrap shadow-xs"
        >
          {t.logButton}
        </button>
      </form>

      {/* Recent transactions (Clean Empty State if 0) */}
      <div className="space-y-2">
        <h2 className="text-[11px] font-semibold tracking-wider text-[#716D70] uppercase">
          {t.recentExpenses}
        </h2>

        {expenses.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#716D70] space-y-1">
            <p>{t.noExpenses}</p>
            <p className="text-[11px] text-[#A09A9F]">
              Both INR (₹) and IDR (Rp) values are always displayed side-by-side.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE6DF]/70">
            {expenses.map((exp) => {
              const isIDR = exp.currency === 'Rp' || exp.currency === 'IDR';
              const dual = formatDualCurrency(exp.amount, isIDR ? 'IDR' : 'INR');

              return (
                <div key={exp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-[#29272A]">{exp.title}</span>
                    <div className="flex items-center gap-2 text-[11px] text-[#716D70] mt-0.5">
                      <span>{exp.date === todayKey ? 'Today' : exp.date}</span>
                      {exp.time && (
                        <>
                          <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                          <span className="font-mono">{exp.time}</span>
                        </>
                      )}
                      <span aria-hidden="true" className="text-[#D5CFC7]">·</span>
                      <span className="capitalize">{exp.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <div className="font-mono font-medium text-[#29272A] tabular-nums">
                        - {dual.inr}
                      </div>
                      <div className="font-mono text-[10px] text-[#716D70] tabular-nums">
                        ≈ {dual.idr}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-[#A09A9F] hover:text-[#B56F83] transition-colors p-1 cursor-pointer"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
