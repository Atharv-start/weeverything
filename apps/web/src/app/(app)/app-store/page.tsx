'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import clsx from 'clsx';

interface StoreApp {
  slug: string;
  name: string;
  category: string;
  developer: string;
  version: string;
  rating: number;
  downloads: string;
  icon: string;
  description: string;
  badge?: string;
  isInstalled?: boolean;
}

const INDIAN_MINI_PROGRAMS: StoreApp[] = [
  { slug: 'irctc', name: 'IRCTC Connect', category: 'Travel & Railways', developer: 'Indian Railways (CRIS)', version: '3.4.1', rating: 4.8, downloads: '100M+', icon: 'train', description: 'Book train tickets, check PNR status, live train running status & food on track.', badge: 'GOVT OFFICIAL' },
  { slug: 'digilocker', name: 'DigiLocker', category: 'Government & Docs', developer: 'MeitY India', version: '2.9.0', rating: 4.9, downloads: '50M+', icon: 'verified_user', description: 'Access authentic Aadhaar, Driving License, Vehicle RC & academic certificates.', badge: 'VERIFIED' },
  { slug: 'apollo247', name: 'Apollo 24|7', category: 'Healthcare & Pharmacy', developer: 'Apollo Hospitals', version: '4.1.2', rating: 4.7, downloads: '25M+', icon: 'local_hospital', description: 'Doctor consultations, online medicine delivery in 2 hours & lab diagnostic tests.', badge: 'HEALTH' },
  { slug: 'zomato', name: 'Zomato Express', category: 'Food & Dining', developer: 'Zomato Media', version: '18.2.0', rating: 4.9, downloads: '200M+', icon: 'restaurant', description: 'Food delivery from 100,000+ restaurants, live order tracking & dining offers.', badge: 'POPULAR' },
  { slug: 'tata1mg', name: 'Tata 1mg', category: 'Pharmacy & Wellness', developer: 'Tata Digital', version: '5.0.3', rating: 4.8, downloads: '30M+', icon: 'medication', description: 'Genuine medicines, health supplements, lab tests & AI medicine guidance.' },
  { slug: 'urban-company', name: 'Urban Company', category: 'Home Services', developer: 'Urban Clap', version: '7.2.1', rating: 4.7, downloads: '15M+', icon: 'home_repair_service', description: 'Book salon at home, AC repair, cleaning, plumbing, electrician & home painting.' },
  { slug: 'zepto', name: 'Zepto 10-Min Delivery', category: 'Quick Commerce', developer: 'Aadit Palicha & Kaivalya V.', version: '6.1.0', rating: 4.9, downloads: '50M+', icon: 'bolt', description: '10-minute grocery delivery, fresh fruits, vegetables & daily essentials.', badge: '10 MINS' },
  { slug: 'bookmyshow', name: 'BookMyShow', category: 'Entertainment & Tickets', developer: 'Bigtree Entertainment', version: '11.0.4', rating: 4.8, downloads: '80M+', icon: 'confirmation_number', description: 'Book movie tickets, live concerts, sports events & theater plays across India.' },
];

export default function AppStorePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [filterCat, setFilterCat] = useState('All');
  const [installedApps, setInstalledApps] = useState<string[]>(['irctc', 'digilocker', 'zomato']);

  const categories = ['All', 'Travel & Railways', 'Government & Docs', 'Healthcare & Pharmacy', 'Food & Dining', 'Quick Commerce', 'Home Services'];

  const toggleInstall = (slug: string) => {
    if (installedApps.includes(slug)) {
      setInstalledApps(installedApps.filter(s => s !== slug));
    } else {
      setInstalledApps([...installedApps, slug]);
    }
  };

  const filtered = filterCat === 'All' ? INDIAN_MINI_PROGRAMS : INDIAN_MINI_PROGRAMS.filter(a => a.category === filterCat);

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8">
      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">INDIAN MINI PROGRAM MARKETPLACE</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
            App Store Ecosystem
          </h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Official Indian Mini Programs container runtime — IRCTC, DigiLocker, Apollo 24/7, Zomato & Zepto
          </p>
        </div>

        <div className="flex gap-2">
          <Button href="/mini-apps" variant="secondary" icon="apps">
            View Utilities Matrix
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="anime-stagger flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={clsx(
              'px-4 py-2 rounded-full font-mono text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0 cursor-pointer border',
              filterCat === cat ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm' : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Store Grid */}
      <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((app) => {
          const isInst = installedApps.includes(app.slug);
          return (
            <Card
              key={app.slug}
              variant="glass"
              className="p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.25)] glow-neon">
                    <span className="material-symbols-outlined text-2xl">{app.icon}</span>
                  </div>
                  {app.badge && (
                    <Badge variant="neon">
                      {app.badge}
                    </Badge>
                  )}
                </div>

                <div>
                  <h3 className="font-display font-bold text-sm text-[var(--color-text)]">{app.name}</h3>
                  <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{app.developer}</p>
                </div>

                <p className="font-body text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {app.description}
                </p>

                <div className="flex items-center gap-3 font-mono text-[10px] text-[var(--color-text-subtle)]">
                  <span className="flex items-center gap-1 text-[var(--color-primary)] font-bold">
                    <span className="material-symbols-outlined text-xs">star</span> {app.rating}
                  </span>
                  <span>{app.downloads} downloads</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={() => toggleInstall(app.slug)}
                  variant={isInst ? 'secondary' : 'primary'}
                  size="sm"
                  className="flex-1"
                >
                  {isInst ? 'Installed' : 'Install MiniApp'}
                </Button>
                <Button href={`/mini-program/${app.slug}`} variant="ghost" size="sm">
                  Open
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
