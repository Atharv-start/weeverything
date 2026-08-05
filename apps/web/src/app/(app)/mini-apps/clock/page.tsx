'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';
import { Input } from '@/components/ui/Input';

export default function ClockPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<'world' | 'alarm' | 'stopwatch' | 'timer' | 'reminders'>('world');

  // Live World Clock
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Alarm State
  const [alarms, setAlarms] = useState([
    { id: 1, time: '06:30 AM', label: 'Morning Yoga & Meditation', enabled: true },
    { id: 2, time: '09:30 AM', label: 'WeEverything Daily Standup', enabled: true },
    { id: 3, time: '02:00 PM', label: 'UPI Ledger Audit', enabled: false },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('');

  // Stopwatch State
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let timer: any;
    if (swRunning) {
      timer = setInterval(() => setSwTime((prev) => prev + 10), 10);
    }
    return () => clearInterval(timer);
  }, [swRunning]);

  const recordLap = () => {
    setLaps([swTime, ...laps]);
  };

  // Timer State
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let t: any;
    if (timerRunning && timerRemaining > 0) {
      t = setInterval(() => setTimerRemaining((prev) => prev - 1), 1000);
    } else if (timerRemaining === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(t);
  }, [timerRunning, timerRemaining]);

  // Reminders State (Water & Medicine)
  const [waterMl, setWaterMl] = useState(1750);
  const waterTarget = 3000;
  const [medicines, setMedicines] = useState([
    { id: 1, name: 'Multivitamin Complex', time: '08:00 AM', taken: true },
    { id: 2, name: 'Omega-3 Fish Oil', time: '02:00 PM', taken: false },
    { id: 3, name: 'Vitamin D3 (Weekly)', time: '09:00 PM', taken: false },
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedTime, setNewMedTime] = useState('20:00');

  const formatSw = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="CHRONO UTILITY & HEALTH ALERTS"
        title="Clock & Reminders Suite"
        description="IST world time, intelligent alarms, stopwatch, timer, water reminder & medicine schedule"
      />

      {/* Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'world', label: 'IST World Clock', icon: 'schedule' },
          { key: 'alarm', label: 'Alarms', icon: 'alarm' },
          { key: 'stopwatch', label: 'Stopwatch', icon: 'timer' },
          { key: 'timer', label: 'Timer', icon: 'hourglass_empty' },
          { key: 'reminders', label: 'Water & Medicine', icon: 'notifications_active' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: World Clock */}
      {activeTab === 'world' && (
        <div className="space-y-6">
          <Card variant="glass" className="anime-stagger p-8 text-center space-y-2">
            <Badge variant="neon">
              INDIAN STANDARD TIME (IST - UTC+05:30)
            </Badge>
            <h2 className="font-display text-5xl md:text-6xl font-black text-[var(--color-text)] tracking-tight">
              {time ? time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }) : '00:00:00 AM'}
            </h2>
            <p className="font-mono text-xs text-[var(--color-text-muted)]">
              {time ? time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </p>
          </Card>

          <div className="anime-stagger grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { city: 'London (GMT)', zone: 'Europe/London', tz: 'UTC +0' },
              { city: 'Dubai (GST)', zone: 'Asia/Dubai', tz: 'UTC +4' },
              { city: 'Singapore (SGT)', zone: 'Asia/Singapore', tz: 'UTC +8' },
            ].map((loc, i) => {
              const locTime = time ? time.toLocaleTimeString('en-US', { timeZone: loc.zone, hour: '2-digit', minute: '2-digit' }) : '--:--';
              return (
                <Card key={i} variant="glass" className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-xs text-[var(--color-text)]">{loc.city}</h3>
                    <p className="font-mono text-[9px] text-[var(--color-text-muted)]">{loc.tz}</p>
                  </div>
                  <span className="font-mono font-bold text-base text-[var(--color-primary)]">{locTime}</span>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Alarm */}
      {activeTab === 'alarm' && (
        <div className="space-y-6">
          <Card variant="glass" className="anime-stagger p-6 space-y-4">
            <h3 className="font-display font-bold text-sm uppercase text-[var(--color-text)]">Set New Alarm</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="time"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
              />
              <Input
                placeholder="Alarm description…"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!newAlarmTime) return;
                  setAlarms([
                    ...alarms,
                    { id: Date.now(), time: newAlarmTime, label: newAlarmLabel || 'Alarm', enabled: true },
                  ]);
                  setNewAlarmLabel('');
                }}
                variant="primary"
              >
                + Add Alarm
              </Button>
            </div>
          </Card>

          <div className="space-y-3">
            {alarms.map((a) => (
              <Card key={a.id} variant="glass" className="anime-stagger p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-2xl text-[var(--color-text)]">{a.time}</h3>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{a.label}</p>
                </div>
                <Button
                  onClick={() =>
                    setAlarms(alarms.map((item) => (item.id === a.id ? { ...item, enabled: !item.enabled } : item)))
                  }
                  variant={a.enabled ? 'primary' : 'secondary'}
                  size="sm"
                >
                  {a.enabled ? 'Enabled' : 'Disabled'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Stopwatch */}
      {activeTab === 'stopwatch' && (
        <div className="space-y-6 text-center">
          <Card variant="glass" className="anime-stagger p-10 space-y-4">
            <h2 className="font-mono text-5xl md:text-6xl font-black text-[var(--color-primary)] tracking-tight">
              {formatSw(swTime)}
            </h2>

            <div className="flex justify-center gap-4 pt-4">
              <Button
                onClick={() => setSwRunning(!swRunning)}
                variant={swRunning ? 'secondary' : 'primary'}
                size="lg"
              >
                {swRunning ? 'Pause' : 'Start'}
              </Button>
              {swRunning && (
                <Button onClick={recordLap} variant="outline" size="lg">
                  Lap
                </Button>
              )}
              <Button
                onClick={() => {
                  setSwRunning(false);
                  setSwTime(0);
                  setLaps([]);
                }}
                variant="ghost"
                size="lg"
              >
                Reset
              </Button>
            </div>
          </Card>

          {laps.length > 0 && (
            <Card variant="glass" className="p-4 space-y-2 max-h-48 overflow-y-auto">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between font-mono text-xs py-1 border-b border-[var(--color-border)] last:border-0 text-[var(--color-text-muted)]">
                  <span>Lap {laps.length - i}</span>
                  <span className="font-bold text-[var(--color-primary)]">{formatSw(lap)}</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Timer */}
      {activeTab === 'timer' && (
        <Card variant="glass" className="anime-stagger p-10 text-center space-y-6">
          <h2 className="font-mono text-6xl md:text-7xl font-black text-[var(--color-primary)] tracking-tight">
            {formatSeconds(timerRemaining)}
          </h2>

          <div className="flex justify-center gap-3">
            {[60, 300, 600, 900, 1800].map((sec) => (
              <Button
                key={sec}
                onClick={() => {
                  setTimerRemaining(sec);
                  setTimerRunning(false);
                }}
                variant="secondary"
                size="sm"
              >
                {sec / 60}m
              </Button>
            ))}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setTimerRunning(!timerRunning)}
              variant={timerRunning ? 'secondary' : 'primary'}
              size="lg"
              className="w-48"
            >
              {timerRunning ? 'Pause Countdown' : 'Start Timer'}
            </Button>
          </div>
        </Card>
      )}

      {/* Tab 5: Water & Medicine Reminders */}
      {activeTab === 'reminders' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Water Intake Reminder */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-[var(--color-primary)]">water_drop</span>
              Water Intake Reminder
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[var(--color-text)]">
                <span>Daily Intake Progress:</span>
                <span className="font-bold text-[var(--color-primary)]">{waterMl} / {waterTarget} ml</span>
              </div>
              <div className="w-full bg-[var(--color-surface-dim)] rounded-full h-3 border border-[var(--color-border)] overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full transition-all duration-500 glow-neon"
                  style={{ width: `${Math.min(100, (waterMl / waterTarget) * 100)}%` }}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => setWaterMl((prev) => prev + 250)}
                  variant="primary"
                  size="sm"
                  className="flex-1"
                >
                  + 250 ml Glass
                </Button>
                <Button
                  onClick={() => setWaterMl((prev) => prev + 500)}
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                >
                  + 500 ml Bottle
                </Button>
              </div>
            </div>
          </Card>

          {/* Medicine Reminder Schedule */}
          <Card variant="glass" className="p-6 space-y-4">
            <h3 className="font-display font-bold text-base text-[var(--color-text)] flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-400">medication</span>
              Medicine Reminder Schedule
            </h3>

            <div className="space-y-2">
              {medicines.map((med) => (
                <div
                  key={med.id}
                  onClick={() =>
                    setMedicines(
                      medicines.map((item) => (item.id === med.id ? { ...item, taken: !item.taken } : item))
                    )
                  }
                  className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                >
                  <div>
                    <h4 className={`font-display font-bold text-xs ${med.taken ? 'line-through text-[var(--color-text-subtle)]' : 'text-[var(--color-text)]'}`}>
                      {med.name}
                    </h4>
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{med.time}</p>
                  </div>
                  <Badge variant={med.taken ? 'neon' : 'neutral'}>
                    {med.taken ? 'Taken' : 'Mark Taken'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="pt-2 flex gap-2">
              <Input
                placeholder="Med name…"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
              />
              <Button
                onClick={() => {
                  if (!newMedName) return;
                  setMedicines([
                    ...medicines,
                    { id: Date.now(), name: newMedName, time: newMedTime, taken: false },
                  ]);
                  setNewMedName('');
                }}
                variant="primary"
                size="sm"
              >
                Add
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
