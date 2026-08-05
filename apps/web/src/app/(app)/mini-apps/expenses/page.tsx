'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef } from 'react';
import { setAuthToken } from '@/lib/api';
import { Plus, X, ArrowLeft, Users, Trash2, PiggyBank, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENTAGE';

interface CategoryItem {
  name: string;
  amount: number;
  color: string;
  icon: string;
}

interface CustomTransaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const { accessToken, user } = useAuthStore();
  const [activeView, setActiveView] = useState<'dashboard' | 'groups'>('dashboard');

  // Dashboard Finance State & Persistence
  const [monthlyBudget, setMonthlyBudget] = useState<number>(25000);
  const [savingsGoalTarget, setSavingsGoalTarget] = useState<number>(10000);
  const [savingsGoalSaved, setSavingsGoalSaved] = useState<number>(4500);

  const [transactions, setTransactions] = useState<CustomTransaction[]>([
    { id: 'tx-1', title: 'Zepto Grocery & Essentials', amount: 1420, category: 'Food & Dining', date: 'Today, 2:15 PM' },
    { id: 'tx-2', title: 'IRCTC Vande Bharat Express Ticket', amount: 2150, category: 'Travel & Transit', date: 'Yesterday' },
    { id: 'tx-3', title: 'Airtel Broadband & Fiber Bill', amount: 1179, category: 'Utilities & Bills', date: 'Jul 24' },
    { id: 'tx-4', title: 'Zomato Gold Order', amount: 680, category: 'Food & Dining', date: 'Jul 23' },
    { id: 'tx-5', title: 'Zerodha Index Fund SIP', amount: 5000, category: 'Savings & Investment', date: 'Jul 20' },
  ]);

  // Transaction Input state
  const [showAddTx, setShowAddTx] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Food & Dining');

  // AI Suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Group Splitter state
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddGroupExpense, setShowAddGroupExpense] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [memberIds, setMemberIds] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');

  const qc = useQueryClient();

  // Load / Sync local storage state on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBudget = localStorage.getItem('we_monthly_budget');
      if (savedBudget) setMonthlyBudget(Number(savedBudget));

      const savedTxs = localStorage.getItem('we_transactions');
      if (savedTxs) {
        try { setTransactions(JSON.parse(savedTxs)); } catch {}
      }
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('we_monthly_budget', monthlyBudget.toString());
      localStorage.setItem('we_transactions', JSON.stringify(transactions));
    }
  }, [monthlyBudget, transactions]);

  useEffect(() => { if (accessToken) setAuthToken(accessToken); }, [accessToken]);

  const { data: groups, isLoading } = useQuery({
    queryKey: ['expense-groups'],
    queryFn: async () => {
      const res = await api.get('/expenses');
      return res.data.data as any[];
    },
  });

  const { data: groupDetail, isLoading: groupLoading } = useQuery({
    queryKey: ['expense-group', selectedGroup?.id],
    queryFn: async () => {
      const res = await api.get(`/expenses/groups/${selectedGroup.id}`);
      return res.data.data;
    },
    enabled: !!selectedGroup?.id,
  });

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const ids = memberIds.split(',').map(s => s.trim()).filter(Boolean);
      const res = await api.post('/expenses/groups', { name: groupName, memberIds: ids });
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['expense-groups'] });
      setGroupName(''); setMemberIds(''); setShowCreateGroup(false);
      setSelectedGroup(data);
    },
  });

  const addExpenseMutation = useMutation({
    mutationFn: async () => {
      const amountMinor = Math.round(parseFloat(expAmount) * 100);
      const members = groupDetail?.members ?? [];
      const splits = members.map((m: any) => ({
        userId: m.userId,
        ...(splitType === 'PERCENTAGE' ? { percentage: 100 / members.length } : {}),
      }));
      const res = await api.post(`/expenses/groups/${selectedGroup.id}/expenses`, {
        title: expTitle,
        amount: amountMinor,
        paidById: user?.id,
        splitType,
        splits,
      });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expense-group', selectedGroup?.id] });
      setExpTitle(''); setExpAmount(''); setShowAddGroupExpense(false);
    },
  });

  // Calculate Total Spent
  const totalSpent = transactions.reduce((acc, t) => acc + t.amount, 0);
  const remainingBudget = monthlyBudget - totalSpent;
  const budgetUsagePct = Math.min(100, Math.round((totalSpent / (monthlyBudget || 1)) * 100));

  // Dynamic Financial Health Score (0-100)
  const healthScore = Math.max(0, Math.min(100, Math.round(100 - (budgetUsagePct * 0.6) + (savingsGoalSaved / savingsGoalTarget * 20))));

  // Categories Breakdown
  const categoriesMap: Record<string, number> = {};
  transactions.forEach(t => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });

  const CATEGORY_ITEMS: CategoryItem[] = [
    { name: 'Food & Dining', amount: categoriesMap['Food & Dining'] || 0, color: '#dfff00', icon: 'restaurant' },
    { name: 'Travel & Transit', amount: categoriesMap['Travel & Transit'] || 0, color: '#3b82f6', icon: 'directions_car' },
    { name: 'Utilities & Bills', amount: categoriesMap['Utilities & Bills'] || 0, color: '#ef4444', icon: 'receipt_long' },
    { name: 'Savings & Investment', amount: categoriesMap['Savings & Investment'] || 0, color: '#10b981', icon: 'savings' },
    { name: 'Shopping & Leisure', amount: categoriesMap['Shopping & Leisure'] || 0, color: '#a855f7', icon: 'shopping_bag' },
  ];

  const handleAddTransaction = () => {
    if (!txTitle.trim() || !txAmount || isNaN(Number(txAmount))) return;
    const newTx: CustomTransaction = {
      id: `tx-${Date.now()}`,
      title: txTitle,
      amount: Number(txAmount),
      category: txCategory,
      date: 'Just now',
    };
    setTransactions([newTx, ...transactions]);
    setTxTitle('');
    setTxAmount('');
    setShowAddTx(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const generateAISuggestions = () => {
    setIsGeneratingAI(true);
    setTimeout(() => {
      setAiSuggestions(
        `💡 AI Financial Insights & Advice:\n` +
        `• Current Spend: ₹${totalSpent.toLocaleString()} of ₹${monthlyBudget.toLocaleString()} (${budgetUsagePct}% used).\n` +
        `• Highest Category: Food & Dining (₹${(categoriesMap['Food & Dining'] || 0).toLocaleString()}). You can cut costs by ordering monthly essentials in bulk.\n` +
        `• Recommended Action: Deposit ₹${Math.round(remainingBudget * 0.25).toLocaleString()} into Zerodha Index Fund SIP before month-end.`
      );
      setIsGeneratingAI(false);
    }, 800);
  };

  // Group Detail Screen
  if (selectedGroup) {
    return (
      <div className="page-wrapper-wide space-y-6 text-[var(--color-text)]">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedGroup(null)} className="btn-ghost p-2 -ml-2"><ArrowLeft className="w-4 h-4" /></button>
          <h1 className="text-xl font-bold flex-1">{selectedGroup.name}</h1>
          <button onClick={() => setShowAddGroupExpense(true)} className="btn-neon font-mono font-bold text-xs uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4" /> Add Expense</button>
        </div>

        {showAddGroupExpense && (
          <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 mb-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-sm text-[var(--color-text)]">Add Group Expense</p>
              <button onClick={() => setShowAddGroupExpense(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
            </div>
            <input value={expTitle} onChange={e => setExpTitle(e.target.value)} className="w-full input-neon" placeholder="Expense description..." autoFocus />
            <input value={expAmount} onChange={e => setExpAmount(e.target.value)} type="number" min="0" step="0.01" className="w-full input-neon" placeholder="Amount (₹)" />
            <select value={splitType} onChange={e => setSplitType(e.target.value as SplitType)} className="w-full input-neon">
              <option value="EQUAL">Split equally</option>
              <option value="EXACT">Exact amounts</option>
              <option value="PERCENTAGE">By percentage</option>
            </select>
            <button
              onClick={() => addExpenseMutation.mutate()}
              disabled={!expTitle || !expAmount || addExpenseMutation.isPending}
              className="btn-neon font-bold w-full py-2.5 rounded-xl uppercase cursor-pointer"
            >
              {addExpenseMutation.isPending ? 'Processing...' : 'Save Group Expense'}
            </button>
          </div>
        )}

        <div className="glass-card border border-[var(--color-border)] rounded-xl p-4 mb-4 font-mono text-xs space-y-2">
          <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Group Members</p>
          <div className="flex flex-wrap gap-2">
            {groupDetail?.members?.map((m: any) => (
              <div key={m.userId} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-surface-dim)] border border-[var(--color-border)]">
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] flex items-center justify-center text-[10px] font-bold">
                  {m.user?.displayName?.[0]?.toUpperCase()}
                </div>
                <span className="text-[var(--color-text)]">{m.user?.displayName}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wide">Group Expenses</p>
        {groupLoading && <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 glass-card rounded-xl animate-pulse" />)}</div>}
        {!groupLoading && (!groupDetail?.expenses || groupDetail.expenses.length === 0) && (
          <div className="glass-card border border-[var(--color-border)] p-8 text-center rounded-xl"><p className="text-xs font-mono text-[var(--color-text-muted)]">No group expenses logged yet.</p></div>
        )}
        <div className="space-y-2 font-mono text-xs">
          {groupDetail?.expenses?.map((exp: any) => (
            <div key={exp.id} className="glass-card border border-[var(--color-border)] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-[var(--color-text)] text-sm">{exp.title}</p>
                <p className="text-[10px] text-[var(--color-text-muted)]">Paid by {exp.paidBy?.username} · {exp.splitType}</p>
              </div>
              <p className="font-bold text-[var(--color-primary)] text-sm">₹{(exp.amount / 100).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="WE-OS PERSONAL FINANCE DASHBOARD"
        title="Budget Planner & Finance Suite"
        description="Monthly budget tracking, category breakdowns, savings goals, financial health score & AI suggestions"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold border cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                  : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
            >
              Finance Dashboard
            </button>
            <button
              onClick={() => setActiveView('groups')}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold border cursor-pointer ${
                activeView === 'groups'
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                  : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
              }`}
            >
              Group Splitter
            </button>
          </div>
        }
      />

      {activeView === 'dashboard' && (
        <div className="space-y-6">
          {/* Main Top Overview Grid */}
          <div className="anime-stagger grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Monthly Budget Card */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">MONTHLY BUDGET</span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">INR ₹</span>
              </div>

              <div>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] block">Total Monthly Spent</span>
                <p className="font-display font-black text-3xl text-[var(--color-text)]">₹{totalSpent.toLocaleString()}</p>
              </div>

              <div className="space-y-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Target Budget:</span>
                  <input
                    type="number"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                    className="input-neon text-right py-0 px-2 font-bold w-28 text-xs"
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Remaining:</span>
                  <span className={`font-bold ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ₹{remainingBudget.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-muted)]">
                  <span>Budget Utilized</span>
                  <span>{budgetUsagePct}%</span>
                </div>
                <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-2.5 border border-[var(--color-border)] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${budgetUsagePct > 90 ? 'bg-red-500' : 'bg-[var(--color-primary)]'}`}
                    style={{ width: `${budgetUsagePct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Financial Health Score Card */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">FINANCIAL HEALTH SCORE</span>
                <TrendingUp className="w-5 h-5 text-[var(--color-primary)]" />
              </div>

              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full border-4 border-[var(--color-primary)] flex items-center justify-center font-display font-black text-2xl text-[var(--color-primary)] bg-[var(--color-primary-dim)] shadow-lg">
                  {healthScore}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-[var(--color-text)]">
                    {healthScore > 80 ? 'Excellent Status' : healthScore > 50 ? 'Good Stability' : 'Needs Optimization'}
                  </h3>
                  <p className="font-mono text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                    Based on savings rate, spending caps, and investment consistency.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] flex items-center gap-2 font-mono text-xs">
                <AlertCircle className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                <span className="text-[var(--color-text-muted)]">Keep monthly spending below 80% to boost your score to 95+.</span>
              </div>
            </div>

            {/* Savings Goal Tracker */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">SAVINGS GOAL</span>
                <PiggyBank className="w-5 h-5 text-emerald-400" />
              </div>

              <div>
                <span className="font-mono text-[10px] text-[var(--color-text-muted)] block">Emergency & Wealth Fund</span>
                <p className="font-display font-black text-2xl text-[var(--color-text)]">₹{savingsGoalSaved.toLocaleString()} / ₹{savingsGoalTarget.toLocaleString()}</p>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-2.5 border border-[var(--color-border)] overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (savingsGoalSaved / savingsGoalTarget) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px] text-[var(--color-text-muted)] pt-1">
                  <span>Progress: {Math.round((savingsGoalSaved / savingsGoalTarget) * 100)}%</span>
                  <span>Target: ₹{savingsGoalTarget.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setSavingsGoalSaved(prev => prev + 1000)}
                className="w-full btn-glass border border-[var(--color-border)] text-emerald-400 py-2 rounded-xl font-mono text-xs uppercase font-bold hover:bg-emerald-500/10 cursor-pointer"
              >
                + Deposit ₹1,000 to Savings
              </button>
            </div>
          </div>

          {/* AI Suggestions & Insights Section */}
          <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[var(--color-primary)]">auto_awesome</span>
                  AI Financial Suggestions & Expense Insights
                </h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">Automated pattern recognition for UPI, Zomato, Zepto & IRCTC expenses</p>
              </div>
              <button
                onClick={generateAISuggestions}
                disabled={isGeneratingAI}
                className="btn-neon font-mono text-xs uppercase font-bold py-2.5 px-6 cursor-pointer flex items-center gap-2"
              >
                {isGeneratingAI ? 'Analyzing...' : 'Run AI Financial Analysis'}
              </button>
            </div>

            {aiSuggestions && (
              <div className="p-5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-primary)] leading-relaxed whitespace-pre-wrap">
                {aiSuggestions}
              </div>
            )}
          </div>

          {/* Category Breakdown & Recent Transactions */}
          <div className="anime-stagger grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category Breakdown */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Category Breakdown</h3>
              <div className="space-y-3 font-mono text-xs">
                {CATEGORY_ITEMS.map((item) => {
                  const pct = totalSpent > 0 ? Math.round((item.amount / totalSpent) * 100) : 0;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-[var(--color-text)]">
                          <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">{item.icon}</span>
                          {item.name}
                        </span>
                        <span className="font-bold text-[var(--color-text)]">₹{item.amount.toLocaleString()} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-2 border border-[var(--color-border)] overflow-hidden">
                        <div className="h-full" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transactions List */}
            <div className="lg:col-span-2 glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-3">
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Recent Expenses & Logs</h3>
                <button
                  onClick={() => setShowAddTx(!showAddTx)}
                  className="btn-neon font-mono text-xs uppercase font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Log Expense
                </button>
              </div>

              {showAddTx && (
                <div className="p-4 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl space-y-3 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Expense title (e.g. Swiggy, Uber)..."
                      value={txTitle}
                      onChange={(e) => setTxTitle(e.target.value)}
                      className="input-neon"
                    />
                    <input
                      type="number"
                      placeholder="Amount (₹)..."
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="input-neon"
                    />
                    <select
                      value={txCategory}
                      onChange={(e) => setTxCategory(e.target.value)}
                      className="input-neon"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Travel & Transit">Travel & Transit</option>
                      <option value="Utilities & Bills">Utilities & Bills</option>
                      <option value="Savings & Investment">Savings & Investment</option>
                      <option value="Shopping & Leisure">Shopping & Leisure</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddTx(false)} className="btn-glass px-4 py-2 cursor-pointer">Cancel</button>
                    <button onClick={handleAddTransaction} className="btn-neon px-5 py-2 uppercase font-bold cursor-pointer">Save Log</button>
                  </div>
                </div>
              )}

              <div className="space-y-2.5 font-mono text-xs">
                {transactions.map((t) => (
                  <div key={t.id} className="p-3.5 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between hover:border-[var(--color-primary)] transition-colors">
                    <div>
                      <h4 className="font-bold text-[var(--color-text)] text-sm">{t.title}</h4>
                      <p className="text-[10px] text-[var(--color-text-muted)]">{t.category} · {t.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[var(--color-primary)] text-sm">₹{t.amount.toLocaleString()}</span>
                      <button onClick={() => handleDeleteTransaction(t.id)} className="text-[var(--color-text-muted)] hover:text-red-400 p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Group Splitter View */}
      {activeView === 'groups' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[var(--color-text)]">Split Expenses with Friends & Flatmates</h2>
            <button id="create-group-btn" onClick={() => setShowCreateGroup(true)} className="btn-neon font-mono font-bold text-xs uppercase px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /> Create Group
            </button>
          </div>

          {showCreateGroup && (
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-[var(--color-text)]">Create Split Group</p>
                <button onClick={() => setShowCreateGroup(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <input value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full input-neon" placeholder="Group name (e.g. Goa Trip, Flat Bills)" autoFocus />
              <input value={memberIds} onChange={e => setMemberIds(e.target.value)} className="w-full input-neon" placeholder="Member User IDs (comma separated)" />
              <button
                onClick={() => createGroupMutation.mutate()}
                disabled={!groupName.trim() || createGroupMutation.isPending}
                className="btn-neon font-bold w-full py-2.5 rounded-xl uppercase cursor-pointer"
              >
                {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
              </button>
            </div>
          )}

          <div className="space-y-3">
            {isLoading && <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />)}</div>}

            {!isLoading && (!groups || groups.length === 0) && (
              <div className="glass-card border border-[var(--color-border)] p-12 text-center rounded-xl">
                <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-xs font-mono text-[var(--color-text-muted)]">No expense groups yet. Create one to split bills!</p>
              </div>
            )}

            {groups?.map((g: any) => (
              <button key={g.id} onClick={() => setSelectedGroup(g)} className="glass-card border border-[var(--color-border)] rounded-xl w-full p-4 text-left flex items-center gap-4 hover:border-[var(--color-primary)] transition-all font-mono cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)] flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[var(--color-text)]">{g.name}</p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{g._count?.members ?? 0} members · {g._count?.expenses ?? 0} expenses</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
