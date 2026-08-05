'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export default function HealthPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  // Water intake state
  const [waterDrunk, setWaterDrunk] = useState(1750);
  const waterTarget = 3000;

  // Step counter state
  const [steps] = useState(8420);
  const stepTarget = 10000;

  // Sleep tracker state
  const [sleepHours] = useState(7.5);

  // Health Integrations State
  const [integrations, setIntegrations] = useState([
    { name: 'Google Fit', icon: 'fitness_center', connected: true, status: 'Synced 10m ago' },
    { name: 'Health Connect', icon: 'health_and_safety', connected: true, status: 'Active Service' },
    { name: 'Fitbit', icon: 'watch', connected: false, status: 'Tap to connect' },
    { name: 'Samsung Health', icon: 'monitor_heart', connected: false, status: 'Tap to connect' },
  ]);

  // Medicine Reminders
  const [meds, setMeds] = useState([
    { name: 'Multivitamin Complex', time: '08:00 AM', taken: true },
    { name: 'Omega-3 Fish Oil', time: '01:00 PM', taken: true },
    { name: 'Vitamin D3 (Weekly)', time: '09:30 PM', taken: false },
  ]);

  const addWater = (amount: number) => {
    setWaterDrunk((prev) => Math.min(waterTarget, prev + amount));
  };

  const toggleMed = (index: number) => {
    setMeds(meds.map((m, i) => (i === index ? { ...m, taken: !m.taken } : m)));
  };

  const toggleIntegration = (idx: number) => {
    setIntegrations(
      integrations.map((item, i) => (i === idx ? { ...item, connected: !item.connected, status: !item.connected ? 'Synced just now' : 'Disconnected' } : item))
    );
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="WELLNESS & FITNESS ENGINE"
        title="Health & Fitness Hub"
        description="Google Fit, Health Connect, Fitbit, Samsung Health integrations & hydration tracker"
      />

      {/* Fitness App Integrations Row */}
      <div className="anime-stagger space-y-3">
        <h3 className="font-display font-bold text-xs uppercase text-[var(--color-text)] tracking-wider">Health Data Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {integrations.map((item, idx) => (
            <Card
              key={item.name}
              variant="interactive"
              onClick={() => toggleIntegration(idx)}
              className="p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-[var(--color-primary)]">{item.icon}</span>
                <div>
                  <h4 className="font-display font-bold text-xs text-[var(--color-text)]">{item.name}</h4>
                  <p className="font-mono text-[9px] text-[var(--color-text-muted)]">{item.status}</p>
                </div>
              </div>
              <Badge variant={item.connected ? 'neon' : 'neutral'}>
                {item.connected ? 'Active' : 'Pair'}
              </Badge>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Water Intake */}
        <Card variant="glass" className="anime-stagger p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">water_drop</span>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Water Intake Reminder</h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">Daily Hydration Target</p>
              </div>
            </div>
            <span className="font-mono text-xs text-[var(--color-primary)] font-bold">
              {waterDrunk} / {waterTarget} ml
            </span>
          </div>

          <div className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-border)] h-4 rounded-full overflow-hidden">
            <div
              className="bg-[var(--color-primary)] h-full transition-all duration-700 glow-neon"
              style={{ width: `${(waterDrunk / waterTarget) * 100}%` }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => addWater(250)}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              + 250 ml Glass
            </Button>
            <Button
              onClick={() => addWater(500)}
              variant="secondary"
              size="sm"
              className="flex-1"
            >
              + 500 ml Bottle
            </Button>
          </div>
        </Card>

        {/* Card 2: Step Counter */}
        <Card variant="glass" className="anime-stagger p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-3xl text-emerald-400">directions_walk</span>
              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)]">Step Counter Meter</h3>
                <p className="font-mono text-xs text-[var(--color-text-muted)]">Synced via Google Fit / Health Connect</p>
              </div>
            </div>
            <span className="font-mono text-xs text-[var(--color-primary)] font-bold">
              {steps.toLocaleString()} / {stepTarget.toLocaleString()} steps
            </span>
          </div>

          <div className="w-full bg-[var(--color-surface-dim)] border border-[var(--color-border)] h-4 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-700"
              style={{ width: `${(steps / stepTarget) * 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center font-mono text-xs text-[var(--color-text-muted)]">
            <span>Calories Burned: ~340 kcal</span>
            <span>Distance: 6.2 km</span>
          </div>
        </Card>

        {/* Card 3: Sleep Tracker */}
        <Card variant="glass" className="anime-stagger p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">bedtime</span>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Sleep Tracker</h3>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">Rest & Recovery Score</p>
            </div>
          </div>

          <div className="p-4 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl text-center font-mono space-y-1">
            <p className="text-[10px] text-[var(--color-text-muted)] uppercase">Last Night Sleep</p>
            <p className="text-3xl font-bold text-[var(--color-primary)]">{sleepHours} Hours</p>
            <p className="text-xs text-emerald-400 font-bold">Optimal Deep Sleep Score: 92%</p>
          </div>
        </Card>

        {/* Card 4: Medicine Reminder */}
        <Card variant="glass" className="anime-stagger p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-rose-400">medication</span>
            <div>
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Medicine Reminder</h3>
              <p className="font-mono text-xs text-[var(--color-text-muted)]">Daily Supplement Schedule</p>
            </div>
          </div>

          <div className="space-y-2">
            {meds.map((m, i) => (
              <div
                key={i}
                onClick={() => toggleMed(i)}
                className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-primary)] transition-colors"
              >
                <div>
                  <h4 className={`font-display font-bold text-xs ${m.taken ? 'line-through text-[var(--color-text-subtle)]' : 'text-[var(--color-text)]'}`}>
                    {m.name}
                  </h4>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{m.time}</p>
                </div>
                <Badge variant={m.taken ? 'neon' : 'neutral'}>
                  {m.taken ? 'Taken' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
