'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';

interface MiniProgramMeta {
  title: string;
  category: string;
  icon: string;
  developer: string;
  version: string;
  rating: string;
  description: string;
}

const PROGRAM_REGISTRY: Record<string, MiniProgramMeta> = {
  'doctor-booking': {
    title: 'Apollo 24/7 & Tata 1mg - Doctor Consult & Pharmacy',
    category: 'Medical & Health',
    icon: 'medical_services',
    developer: 'Apollo HealthNet Ltd',
    version: 'v2.4.0',
    rating: '★ 4.9',
    description: 'Book online & in-clinic specialist appointments with instant lab test bookings.',
  },
  'restaurant-booking': {
    title: 'Zomato & Swiggy Dineout - Table Booking',
    category: 'Dining & Food',
    icon: 'restaurant',
    developer: 'Zomato Media Pvt Ltd',
    version: 'v3.1.2',
    rating: '★ 4.8',
    description: 'Reserve premium dining tables with real-time slot selection and Gold discounts.',
  },
  'event-booking': {
    title: 'BookMyShow TicketPulse - Events & Matches',
    category: 'Entertainment',
    icon: 'confirmation_number',
    developer: 'Bigtree Entertainment',
    version: 'v1.9.0',
    rating: '★ 4.7',
    description: 'Discover IPL live cricket matches, music concerts, and comedy shows near you.',
  },
  'movie-booking': {
    title: 'PVR INOX CinePass - Movie Ticket Reservation',
    category: 'Entertainment',
    icon: 'movie',
    developer: 'PVR INOX Limited',
    version: 'v4.0.1',
    rating: '★ 4.9',
    description: 'Choose seat layout, pre-order gourmet snacks, and get instant QR entry passes.',
  },
  'hotel-booking': {
    title: 'MakeMyTrip & Goibibo - Hotel Booking',
    category: 'Travel & Living',
    icon: 'hotel',
    developer: 'MakeMyTrip India Pvt Ltd',
    version: 'v2.8.0',
    rating: '★ 4.8',
    description: 'Book luxury resorts, boutique hotels & homestays in India at guaranteed best rates.',
  },
  'train-booking': {
    title: 'IRCTC Rail Connect - Train & Bus Tickets',
    category: 'Travel & IRCTC',
    icon: 'train',
    developer: 'Indian Railway Catering & Tourism Corp',
    version: 'v3.0.0',
    rating: '★ 4.6',
    description: 'Live IRCTC train booking, Tatkal slots, PNR status tracking & coach selection.',
  },
  'flight-booking': {
    title: 'EaseMyTrip & ixigo - Flight Booking Engine',
    category: 'Travel',
    icon: 'flight',
    developer: 'EaseMyTrip Planet Ltd',
    version: 'v5.1.0',
    rating: '★ 4.9',
    description: 'Compare domestic & international flight fares with zero convenience fee.',
  },
  'salon-booking': {
    title: 'Urban Company - Salon & Spa Slots',
    category: 'Lifestyle',
    icon: 'spa',
    developer: 'UrbanClap Technologies',
    version: 'v1.4.0',
    rating: '★ 4.7',
    description: 'Book hair styling, spa massages, and grooming sessions with top pros at home.',
  },
  'gym-booking': {
    title: 'Cult.fit - Gym & Workout Slots',
    category: 'Health & Fitness',
    icon: 'fitness_center',
    developer: 'Curefit Healthcare Pvt Ltd',
    version: 'v2.2.0',
    rating: '★ 4.8',
    description: 'Access 500+ premium Cult gyms & personal trainer slots on a pay-per-visit basis.',
  },
  'home-services': {
    title: 'Urban Company - On-Demand Home Repairs',
    category: 'Home & Utility',
    icon: 'handyman',
    developer: 'UrbanClap Technologies',
    version: 'v3.4.0',
    rating: '★ 4.9',
    description: 'Book vetted electricians, plumbers, home cleaning & AC appliance repair.',
  },
  'job-portal': {
    title: 'Naukri.com & LinkedIn - Tech Jobs',
    category: 'Career & Business',
    icon: 'work',
    developer: 'Info Edge India Ltd',
    version: 'v2.0.1',
    rating: '★ 4.8',
    description: 'AI-driven resume matching for engineering, product, and design roles in India.',
  },
  'gov-services': {
    title: 'DigiLocker & UMANG - Citizen Govt Portal',
    category: 'Government & Public',
    icon: 'account_balance',
    developer: 'Ministry of Electronics & IT (MeitY)',
    version: 'v1.0.0',
    rating: '★ 4.9',
    description: 'Access DigiLocker Aadhaar, PAN card, Driving License & EPFO UAN passbook.',
  },
};

export default function MiniProgramRunnerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  const program = PROGRAM_REGISTRY[slug] || {
    title: `Mini Program: ${slug.toUpperCase()}`,
    category: 'Utility Service',
    icon: 'apps',
    developer: 'WeEverything India Open Platform',
    version: 'v1.0.0',
    rating: '★ 5.0',
    description: 'Scalable third-party Mini Program running within WeEverything OS container.',
  };

  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [slotDate, setSlotDate] = useState('Today, 4:00 PM');
  const [guestCount, setGuestCount] = useState('2');
  const [notes, setNotes] = useState('');

  const handleExecuteBooking = () => {
    setBookingConfirmed(true);
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto px-6 py-10 space-y-8 min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/app-store" aria-label="Back to App Store" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </Link>
            <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)] tracking-widest block">
              INDIAN MINI PROGRAM CONTAINER
            </span>
          </div>
          <h1 className="font-display text-3xl font-extrabold text-[var(--color-text)] tracking-tight flex items-center gap-3">
            {program.title}
          </h1>
          <p className="font-body text-xs text-[var(--color-text-muted)] mt-0.5">{program.description}</p>
        </div>

        <div className="flex gap-2">
          <span className="font-mono text-xs text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-3 py-1.5 rounded border border-[var(--color-primary-glow)] font-bold">
            {program.rating}
          </span>
          <span className="font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] px-3 py-1.5 rounded border border-[var(--color-border)]">
            {program.version}
          </span>
        </div>
      </div>

      {/* Mini Program Runner Canvas */}
      <div className="anime-stagger glass-card rounded-2xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Developer & Sandbox Info Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-dim)] text-[var(--color-primary)] flex items-center justify-center border border-[var(--color-primary-glow)]">
              <span className="material-symbols-outlined text-2xl">{program.icon}</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm text-[var(--color-text)]">{program.title}</h3>
              <p className="font-mono text-[10px] text-[var(--color-text-muted)]">Dev: {program.developer} • Isolated Sandbox</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/app-store')}
            aria-label="Close program"
            className="text-xs font-mono text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
          >
            Close Program ✕
          </button>
        </div>

        {/* Interactive Booking / Service Execution Form */}
        {!bookingConfirmed ? (
          <div className="space-y-6 max-w-lg mx-auto py-4 font-mono text-xs">
            <div className="space-y-2">
              <label htmlFor="slot-select" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Select Slot / Schedule</label>
              <select
                id="slot-select"
                aria-label="Select Slot / Schedule"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-[var(--color-text)] rounded-lg px-4 py-3 focus:border-[var(--color-primary)] outline-none"
              >
                <option value="Today, 4:00 PM">Today, 4:00 PM (Instant Slot)</option>
                <option value="Today, 6:30 PM">Today, 6:30 PM</option>
                <option value="Tomorrow, 10:00 AM">Tomorrow, 10:00 AM</option>
                <option value="Tomorrow, 2:00 PM">Tomorrow, 2:00 PM</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="guest-count-input" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Guests / Seats / Units</label>
              <input
                id="guest-count-input"
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-[var(--color-text)] rounded-lg px-4 py-3 focus:border-[var(--color-primary)] outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes-textarea" className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Special Instructions / Preferences</label>
              <textarea
                id="notes-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add special notes or preference requirements..."
                className="w-full bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-[var(--color-text)] rounded-lg p-3 focus:border-[var(--color-primary)] outline-none h-24 resize-none"
              />
            </div>

            <button
              onClick={handleExecuteBooking}
              className="btn-neon w-full py-3.5 flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              Confirm & Instant Pass Execution
            </button>
          </div>
        ) : (
          <div className="py-8 text-center space-y-4 font-mono">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-2 border-[var(--color-primary)] flex items-center justify-center mx-auto animate-bounce">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h3 className="font-display font-bold text-xl text-[var(--color-text)]">Booking Confirmed!</h3>
            <p className="text-xs text-[var(--color-text-muted)]">
              Your service pass for <span className="text-[var(--color-primary)] font-bold">{program.title}</span> has been processed.
            </p>

            <button
              onClick={() => setBookingConfirmed(false)}
              className="btn-glass px-6 py-2.5 text-xs uppercase font-bold cursor-pointer"
            >
              Book Another Slot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
