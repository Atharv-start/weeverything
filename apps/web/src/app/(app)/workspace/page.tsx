'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';
import clsx from 'clsx';

interface WorkspaceProject {
  id: string;
  name: string;
  category: string;
  status: 'In Progress' | 'Completed' | 'In Review';
  membersCount: number;
  tasksCompleted: number;
  totalTasks: number;
  dueDate: string;
}



export default function WorkspacePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'channels' | 'files' | 'meetings'>('dashboard');
  const [projects, setProjects] = useState<WorkspaceProject[]>([]);
  const [showNewProj, setShowNewProj] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjCat, setNewProjCat] = useState('Engineering');

  const handleCreateProject = () => {
    if (!newProjName.trim()) return;
    const newProj: WorkspaceProject = {
      id: `p-${Date.now()}`,
      name: newProjName.trim(),
      category: newProjCat,
      status: 'In Progress',
      membersCount: 1,
      tasksCompleted: 0,
      totalTasks: 5,
      dueDate: 'Aug 15, 2026',
    };
    setProjects([newProj, ...projects]);
    setNewProjName('');
    setShowNewProj(false);
  };

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight flex items-center gap-3 text-[var(--color-text)]">
            Teams Workspace
            <Badge variant="neon">
              PRO
            </Badge>
          </h1>

        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => requireAuth(() => setShowNewProj(true), 'create workspace projects')}
            variant="primary"
            icon="add"
          >
            New Project
          </Button>
          <Button
            onClick={() => requireAuth(() => { window.location.href = '/mini-apps/google-suite'; }, 'start video meetings')}
            variant="secondary"
            icon="video_call"
          >
            Start Meeting
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="anime-stagger flex items-center gap-2 pb-4 border-b border-[var(--color-border)] overflow-x-auto hide-scrollbar">
        {(['dashboard', 'projects', 'channels', 'files', 'meetings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 flex-shrink-0 cursor-pointer border',
              activeTab === tab
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm'
                : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            <span className="material-symbols-outlined text-base">
              {tab === 'dashboard' ? 'dashboard' : tab === 'projects' ? 'folder_open' : tab === 'channels' ? 'forum' : tab === 'files' ? 'cloud' : 'videocam'}
            </span>
            {tab}
          </button>
        ))}
      </div>

      {/* Modal */}
      {showNewProj && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card variant="glass" className="glass-modal p-6 w-full max-w-md space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Create Workspace Project</h3>
              <button onClick={() => setShowNewProj(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <Input
              type="text"
              value={newProjName}
              onChange={e => setNewProjName(e.target.value)}
              placeholder="Project Name..."
            />
            <Input
              type="text"
              value={newProjCat}
              onChange={e => setNewProjCat(e.target.value)}
              placeholder="Category (Engineering, Product...)..."
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button onClick={() => setShowNewProj(false)} variant="ghost">Cancel</Button>
              <Button onClick={handleCreateProject} disabled={!newProjName.trim()} variant="primary">
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <div className="anime-stagger space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Projects', val: projects.length.toString(), icon: 'folder_open' },
              { label: 'Tasks Completed', val: projects.reduce((a, p) => a + p.tasksCompleted, 0).toString(), icon: 'task_alt' },
              { label: 'Total Tasks', val: projects.reduce((a, p) => a + p.totalTasks, 0).toString(), icon: 'checklist' },
              { label: 'Completion Rate', val: projects.length > 0 ? `${Math.round((projects.reduce((a, p) => a + p.tasksCompleted, 0) / Math.max(projects.reduce((a, p) => a + p.totalTasks, 0), 1)) * 100)}%` : '—', icon: 'percent' },
            ].map(s => (
              <Card key={s.label} variant="glass" className="p-4 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                  <span className="material-symbols-outlined text-base text-[var(--color-primary)]">{s.icon}</span>
                  {s.label}
                </div>
                <div className="font-display font-extrabold text-2xl text-[var(--color-text)]">{s.val}</div>
              </Card>
            ))}
          </div>

          {/* Active Projects List */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider flex items-center gap-2 text-[var(--color-text)]">
              <span className="material-symbols-outlined text-[var(--color-primary)]">work</span>
              Active Projects Matrix
            </h3>

            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <span className="material-symbols-outlined text-3xl text-[var(--color-text-muted)]">folder_open</span>
                  <div>
                    <p className="font-mono text-xs font-bold text-[var(--color-text-muted)]">No projects yet</p>
                    <p className="font-body text-xs text-[var(--color-text-subtle)] mt-1">Create your first project to start collaborating.</p>
                  </div>
                  <Button onClick={() => requireAuth(() => setShowNewProj(true), 'create a project')} variant="primary" size="sm" icon="add">
                    Create First Project
                  </Button>
                </div>
              ) : (
                projects.map(p => (
                  <div key={p.id} className="p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--color-primary)] bg-[var(--color-surface-container)] border border-[var(--color-border)]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{p.name}</h4>
                        <Badge variant={p.status === 'Completed' ? 'success' : 'neon'}>
                          {p.status}
                        </Badge>
                      </div>
                      <p className="font-mono text-xs text-[var(--color-text-muted)]">{p.category} • Due: {p.dueDate}</p>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-xs">
                      <div>
                        <span className="block text-[10px] text-[var(--color-text-subtle)]">PROGRESS</span>
                        <span className="font-bold text-[var(--color-text)]">{p.tasksCompleted}/{p.totalTasks} tasks</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[var(--color-text-subtle)]">TEAM</span>
                        <span className="font-bold text-[var(--color-primary)]">{p.membersCount} members</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Projects View */}
      {activeTab === 'projects' && (
        <div className="anime-stagger space-y-4">
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.2)] flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">folder_open</span>
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="font-display font-bold text-xl text-[var(--color-text)]">No projects yet</h2>
                <p className="font-body text-sm text-[var(--color-text-muted)]">Create your first project to start tracking tasks and collaborating with your team.</p>
              </div>
              <Button onClick={() => requireAuth(() => setShowNewProj(true), 'create a project')} variant="primary" icon="add">
                Create First Project
              </Button>
            </div>
          ) : (
            projects.map(p => (
              <Card key={p.id} variant="glass" className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-bold text-base text-[var(--color-text)]">{p.name}</h4>
                  <Badge variant="neon">{p.status}</Badge>
                </div>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">{p.category} • {p.membersCount} team members assigned</p>
                <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-2 overflow-hidden border border-[var(--color-border)]">
                  <div className="bg-[var(--color-primary)] h-full rounded-full glow-neon" style={{ width: `${(p.tasksCompleted / p.totalTasks) * 100}%` }} />
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Channels, Files, Meetings placeholders */}
      {activeTab === 'channels' && (
        <Card variant="glass" className="anime-stagger p-10 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">forum</span>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Workspace Channels</h3>
          <p className="font-mono text-xs max-w-sm mx-auto text-[var(--color-text-muted)]">Channels let your team collaborate in organized topic streams. Create your first project to unlock channels.</p>
        </Card>
      )}

      {activeTab === 'files' && (
        <Card variant="glass" className="anime-stagger p-10 text-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)]">cloud</span>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Shared Files</h3>
          <p className="font-mono text-xs max-w-sm mx-auto text-[var(--color-text-muted)]">Upload and share documents with your workspace team. No files uploaded yet.</p>
        </Card>
      )}

      {activeTab === 'meetings' && (
        <Card variant="glass" className="anime-stagger p-6 space-y-4 text-center">
          <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">video_call</span>
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">Instant Video Meetings</h3>
          <p className="font-mono text-xs max-w-md mx-auto text-[var(--color-text-muted)]">
            Integrated with Google Meet & Teams Protocol. Launch HD video conference instantly with 1-click.
          </p>
          <Button onClick={() => requireAuth(() => { window.location.href = '/mini-apps/google-suite'; }, 'launch video meetings')} variant="primary">
            Launch Google Meet Hub
          </Button>
        </Card>
      )}
    </div>
  );
}
