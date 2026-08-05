'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useEffect, useState, useRef } from 'react';
import { setAuthToken } from '@/lib/api';
import { Plus, X, Check, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type Status = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export default function TasksPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const { accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');

  // Task state
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<Status | ''>('');

  // Habits state
  const [habits, setHabits] = useState([
    { id: 'h1', title: 'Daily 30-min Coding Sprint', streak: 12, completedToday: true },
    { id: 'h2', title: 'Drink 3L Water', streak: 8, completedToday: true },
    { id: 'h3', title: 'Read Tech / Finance Articles', streak: 5, completedToday: false },
    { id: 'h4', title: 'Evening Walk / Exercise', streak: 14, completedToday: false },
  ]);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  const qc = useQueryClient();

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
  }, [accessToken]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filterStatus],
    queryFn: async () => {
      const params = filterStatus ? `?status=${filterStatus}` : '';
      const res = await api.get(`/tasks${params}`);
      return res.data.data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks', { title, priority, dueDate: dueDate || undefined });
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      setTitle(''); setPriority('MEDIUM'); setDueDate('');
      setShowCreate(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const newStatus = status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      const res = await api.put(`/tasks/${id}`, { status: newStatus });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const todo = tasks?.filter((t: any) => t.status !== 'COMPLETED') ?? [];
  const done = tasks?.filter((t: any) => t.status === 'COMPLETED') ?? [];

  const toggleHabit = (id: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id === id) {
          const nextState = !h.completedToday;
          return {
            ...h,
            completedToday: nextState,
            streak: nextState ? h.streak + 1 : Math.max(0, h.streak - 1),
          };
        }
        return h;
      })
    );
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    setHabits([...habits, { id: Date.now().toString(), title: newHabitTitle, streak: 0, completedToday: false }]);
    setNewHabitTitle('');
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="TASK & HABIT ENGINE"
        title="Task & Habit Manager"
        description="Organize daily sprint tasks, priority tracking, due dates & daily habit streaks"
        actions={
          activeTab === 'tasks' ? (
            <button id="create-task-btn" onClick={() => setShowCreate(true)} className="btn-neon font-mono font-bold text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" /> New Task
            </button>
          ) : undefined
        }
      />

      {/* Main Mode Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-3 font-mono text-xs">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'tasks' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)]' : 'glass-card text-[var(--color-text-muted)]'
          }`}
        >
          To-Do List & Tasks
        </button>
        <button
          onClick={() => setActiveTab('habits')}
          className={`px-4 py-2 rounded-xl font-bold uppercase transition-all cursor-pointer ${
            activeTab === 'habits' ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)]' : 'glass-card text-[var(--color-text-muted)]'
          }`}
        >
          Daily Habit Tracker
        </button>
      </div>

      {activeTab === 'tasks' && (
        <>
          {/* Filter bar */}
          <div className="anime-stagger flex gap-2 mb-5 overflow-x-auto pb-1">
            {(['', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s as any)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold uppercase whitespace-nowrap transition-all cursor-pointer border',
                  filterStatus === s ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                )}
              >
                {s === '' ? 'All Tasks' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Create task form */}
          {showCreate && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-5 mb-5 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm text-[var(--color-text)]">New Task Details</p>
                <button onClick={() => setShowCreate(false)} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3 font-mono text-xs">
                <input
                  id="task-title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="input-neon"
                  placeholder="Task title…"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Priority</label>
                    <select id="task-priority" value={priority} onChange={e => setPriority(e.target.value as Priority)} className="input-neon">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-[var(--color-text-muted)] font-bold block mb-1">Due date</label>
                    <input id="task-due" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input-neon" />
                  </div>
                </div>
                <button
                  id="task-submit"
                  onClick={() => createMutation.mutate()}
                  disabled={!title.trim() || createMutation.isPending}
                  className="btn-neon font-bold w-full py-2.5 text-xs rounded-xl uppercase cursor-pointer"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          )}

          {isLoading && <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass-card h-14 rounded-xl animate-pulse" />)}</div>}

          {/* Todo tasks */}
          {todo.length > 0 && (
            <div className="anime-stagger space-y-2.5 mb-6">
              {todo.map((task: any) => (
                <TaskRow key={task.id} task={task} onToggle={() => toggleMutation.mutate({ id: task.id, status: task.status })} onDelete={() => deleteMutation.mutate(task.id)} />
              ))}
            </div>
          )}

          {/* Completed tasks */}
          {done.length > 0 && (
            <div className="anime-stagger">
              <p className="text-xs font-mono font-bold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Completed</p>
              <div className="space-y-2.5">
                {done.map((task: any) => (
                  <TaskRow key={task.id} task={task} onToggle={() => toggleMutation.mutate({ id: task.id, status: task.status })} onDelete={() => deleteMutation.mutate(task.id)} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && tasks?.length === 0 && (
            <div className="glass-card border border-[var(--color-border)] p-12 text-center rounded-xl">
              <p className="text-[var(--color-text-muted)] text-xs font-mono">No active tasks. Create your first task!</p>
            </div>
          )}
        </>
      )}

      {/* Habits Tab */}
      {activeTab === 'habits' && (
        <div className="anime-stagger space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New habit title (e.g. Daily Meditation)..."
              value={newHabitTitle}
              onChange={(e) => setNewHabitTitle(e.target.value)}
              className="flex-1 input-neon"
            />
            <button
              onClick={addHabit}
              className="btn-neon px-5 py-2.5 rounded-xl font-mono text-xs uppercase font-bold cursor-pointer"
            >
              + Add Habit
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {habits.map((h) => (
              <div
                key={h.id}
                className="glass-card border border-[var(--color-border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--color-primary)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabit(h.id)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center font-bold transition-all cursor-pointer ${
                      h.completedToday ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-text-inverse)]' : 'border-[var(--color-border)] text-transparent'
                    }`}
                  >
                    ✓
                  </button>
                  <div>
                    <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{h.title}</h4>
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)]">🔥 {h.streak} Day Streak</p>
                  </div>
                </div>

                <span className={`font-mono text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border ${h.completedToday ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'}`}>
                  {h.completedToday ? 'Done Today' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }: { task: any; onToggle: () => void; onDelete: () => void }) {
  const PRIORITY_COLORS: Record<string, string> = {
    LOW: 'text-slate-400 bg-slate-400/10',
    MEDIUM: 'text-yellow-400 bg-yellow-400/10',
    HIGH: 'text-orange-400 bg-orange-400/10',
    URGENT: 'text-red-400 bg-red-400/10',
  };
  const isCompleted = task.status === 'COMPLETED';
  return (
    <div className={clsx('glass-card border border-[var(--color-border)] rounded-xl px-4 py-3.5 flex items-center gap-3 group hover:border-[var(--color-primary)] transition-all', isCompleted && 'opacity-60')}>
      <button onClick={onToggle} className={clsx('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer', isCompleted ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]')}>
        {isCompleted && <Check className="w-3 h-3 text-[var(--color-text-inverse)]" />}
      </button>
      <div className="flex-1 min-w-0 font-mono text-xs">
        <p className={clsx('text-sm font-medium truncate text-[var(--color-text)]', isCompleted && 'line-through text-[var(--color-text-muted)]')}>{task.title}</p>
        {task.dueDate && (
          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">Due {new Date(task.dueDate).toLocaleDateString()}</p>
        )}
      </div>
      <span className={clsx('text-[10px] font-semibold px-2.5 py-0.5 rounded-full font-mono', PRIORITY_COLORS[task.priority] ?? 'text-slate-400')}>{task.priority}</span>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
