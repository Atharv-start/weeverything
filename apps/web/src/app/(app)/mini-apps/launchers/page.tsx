'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

export interface LauncherApp {
  name: string;
  category:
  | 'payments'
  | 'food'
  | 'instant'
  | 'shopping'
  | 'travel'
  | 'medicine'
  | 'grocery'
  | 'entertainment'
  | 'social'
  | 'productivity'
  | 'learning'
  | 'finance'
  | 'news'
  | 'health'
  | 'government';
  icon: string;
  scheme: string;
  webUrl: string;
  description: string;
}

const APPS: LauncherApp[] = [
  // Payments
  { name: 'UPI / BHIM', category: 'payments', icon: 'account_balance_wallet', scheme: 'upi://pay', webUrl: 'https://www.npci.org.in/what-we-do/upi/product-overview', description: 'Unified Payments Interface & BHIM official protocol' },
  { name: 'PhonePe', category: 'payments', icon: 'payments', scheme: 'phonepe://', webUrl: 'https://www.phonepe.com', description: 'UPI payments, mobile recharge & financial services' },
  { name: 'Google Pay (GPay)', category: 'payments', icon: 'account_balance', scheme: 'gpay://', webUrl: 'https://pay.google.com', description: 'Fast, secure UPI payments & rewards' },
  { name: 'Paytm', category: 'payments', icon: 'wallet', scheme: 'paytmmp://', webUrl: 'https://paytm.com', description: 'UPI, wallet, movie tickets & bill payments' },
  { name: 'Amazon Pay', category: 'payments', icon: 'shopping_bag', scheme: 'amazon://pay', webUrl: 'https://www.amazon.in/amazonpay/home', description: 'Recharge, bill pay, UPI & cashback rewards' },
  { name: 'CRED', category: 'payments', icon: 'credit_card', scheme: 'cred://', webUrl: 'https://cred.club', description: 'Credit card bill payments, rewards & UPI' },
  { name: 'MobiKwik', category: 'payments', icon: 'account_balance_wallet', scheme: 'mobikwik://', webUrl: 'https://www.mobikwik.com', description: 'Wallet, UPI payments, ZIP pay later & recharges' },
  { name: 'Freecharge', category: 'payments', icon: 'bolt', scheme: 'freecharge://', webUrl: 'https://www.freecharge.in', description: 'UPI, bill payments, investment & credit cards' },

  // Food Delivery
  { name: 'Zomato', category: 'food', icon: 'fastfood', scheme: 'zomato://', webUrl: 'https://www.zomato.com', description: 'Restaurant discovery, food delivery & Gold dining' },
  { name: 'Swiggy', category: 'food', icon: 'restaurant', scheme: 'swiggy://', webUrl: 'https://www.swiggy.com', description: 'Food delivery, Dineout & gourmet experiences' },
  { name: 'EatSure', category: 'food', icon: 'lunch_dining', scheme: 'eatsure://', webUrl: 'https://www.eatsure.com', description: 'Multi-brand food ordering & cloud kitchens' },

  // Instant Delivery & Grocery
  { name: 'Zepto', category: 'instant', icon: 'bolt', scheme: 'zepto://', webUrl: 'https://www.zeptonow.com', description: '10-minute instant grocery & essentials delivery' },
  { name: 'Blinkit', category: 'instant', icon: 'shopping_bag', scheme: 'blinkit://', webUrl: 'https://blinkit.com', description: 'Instant grocery, electronics & home delivery in minutes' },
  { name: 'Swiggy Instamart', category: 'instant', icon: 'storefront', scheme: 'swiggy://instamart', webUrl: 'https://www.swiggy.com/instamart', description: 'Instant groceries & everyday essentials' },
  { name: 'BigBasket', category: 'grocery', icon: 'shopping_cart', scheme: 'bigbasket://', webUrl: 'https://www.bigbasket.com', description: 'Fresh fruits, vegetables & monthly supermarket grocery' },
  { name: 'JioMart', category: 'grocery', icon: 'local_grocery_store', scheme: 'jiomart://', webUrl: 'https://www.jiomart.com', description: 'Grocery, fashion, electronics & daily savings' },

  // Shopping
  { name: 'Amazon India', category: 'shopping', icon: 'local_mall', scheme: 'amazon://', webUrl: 'https://www.amazon.in', description: 'India online shopping, Prime delivery & deals' },
  { name: 'Flipkart', category: 'shopping', icon: 'store', scheme: 'flipkart://', webUrl: 'https://www.flipkart.com', description: 'Electronics, fashion & big billion day sales' },
  { name: 'Myntra', category: 'shopping', icon: 'checkroom', scheme: 'myntra://', webUrl: 'https://www.myntra.com', description: 'Fashion, apparel & lifestyle brands' },
  { name: 'AJIO', category: 'shopping', icon: 'styler', scheme: 'ajio://', webUrl: 'https://www.ajio.com', description: 'Trendy fashion & international streetwear' },
  { name: 'Nykaa', category: 'shopping', icon: 'face', scheme: 'nykaa://', webUrl: 'https://www.nykaa.com', description: 'Beauty, cosmetics, skincare & wellness' },
  { name: 'Meesho', category: 'shopping', icon: 'sell', scheme: 'meesho://', webUrl: 'https://www.meesho.com', description: 'Affordable fashion, home decor & reseller deals' },
  { name: 'Tata CLiQ', category: 'shopping', icon: 'diamond', scheme: 'tatacliq://', webUrl: 'https://www.tatacliq.com', description: 'Luxury fashion & authentic tech electronics' },
  { name: 'FirstCry', category: 'shopping', icon: 'child_care', scheme: 'firstcry://', webUrl: 'https://www.firstcry.com', description: 'Baby, kids fashion & parenting products' },
  { name: 'Pepperfry', category: 'shopping', icon: 'chair', scheme: 'pepperfry://', webUrl: 'https://www.pepperfry.com', description: 'Furniture & home decor marketplace' },
  { name: 'Croma', category: 'shopping', icon: 'tv', scheme: 'croma://', webUrl: 'https://www.croma.com', description: 'Tata electronics store, laptops & appliances' },
  { name: 'Reliance Digital', category: 'shopping', icon: 'devices', scheme: 'reliancedigital://', webUrl: 'https://www.reliancedigital.in', description: 'Smartphones, gadgets & consumer electronics' },

  // Travel & Commute
  { name: 'Uber', category: 'travel', icon: 'local_taxi', scheme: 'uber://', webUrl: 'https://m.uber.com', description: 'On-demand cabs, Auto & intercity rides' },
  { name: 'Ola Cabs', category: 'travel', icon: 'directions_car', scheme: 'olacabs://', webUrl: 'https://www.olacabs.com', description: 'City taxi, auto rickshaws & electric cabs' },
  { name: 'Rapido', category: 'travel', icon: 'two_wheeler', scheme: 'rapido://', webUrl: 'https://www.rapido.bike', description: 'Bike taxi, quick auto & parcel delivery' },
  { name: 'RedBus', category: 'travel', icon: 'directions_bus', scheme: 'redbus://', webUrl: 'https://www.redbus.in', description: 'Intercity bus ticket booking & live bus tracking' },
  { name: 'IRCTC Rail Connect', category: 'travel', icon: 'train', scheme: 'irctc://', webUrl: 'https://www.irctc.co.in', description: 'Official Indian Railways train booking & PNR status' },
  { name: 'MakeMyTrip', category: 'travel', icon: 'flight_takeoff', scheme: 'makemytrip://', webUrl: 'https://www.makemytrip.com', description: 'Flights, hotels, holiday packages & trains' },
  { name: 'Goibibo', category: 'travel', icon: 'hotel', scheme: 'goibibo://', webUrl: 'https://www.goibibo.com', description: 'Budget hotels, domestic flights & bus tickets' },
  { name: 'Yatra', category: 'travel', icon: 'explore', scheme: 'yatra://', webUrl: 'https://www.yatra.com', description: 'Flight booking, corporate travel & hotels' },
  { name: 'ixigo', category: 'travel', icon: 'confirmation_number', scheme: 'ixigo://', webUrl: 'https://www.ixigo.com', description: 'Train seat availability, PNR prediction & flight deals' },
  { name: 'EaseMyTrip', category: 'travel', icon: 'flight', scheme: 'easemytrip://', webUrl: 'https://www.easemytrip.com', description: 'Zero convenience fee flight & hotel bookings' },

  // Medicine & Healthcare
  { name: 'Tata 1mg', category: 'medicine', icon: 'medical_services', scheme: 'oneimg://', webUrl: 'https://www.1mg.com', description: 'Online pharmacy, lab tests & doctor consultations' },
  { name: 'Apollo 24/7', category: 'medicine', icon: 'health_and_safety', scheme: 'apollo247://', webUrl: 'https://www.apollo247.com', description: 'Apollo doctors, 2-hour medicine delivery & diagnostics' },
  { name: 'PharmEasy', category: 'medicine', icon: 'vaccines', scheme: 'pharmeasy://', webUrl: 'https://pharmeasy.in', description: 'Medicine ordering, healthcare products & lab tests' },
  { name: 'NetMeds', category: 'medicine', icon: 'medication', scheme: 'netmeds://', webUrl: 'https://www.netmeds.com', description: 'Reliance online pharmacy & wellness store' },

  // Entertainment & Music
  { name: 'JioHotstar', category: 'entertainment', icon: 'live_tv', scheme: 'hotstar://', webUrl: 'https://www.hotstar.com', description: 'Live cricket, IPL, Marvel, Disney & Indian movies' },
  { name: 'Netflix', category: 'entertainment', icon: 'movie', scheme: 'netflix://', webUrl: 'https://www.netflix.com', description: 'Global movies, web series & Netflix originals' },
  { name: 'Amazon Prime Video', category: 'entertainment', icon: 'play_circle', scheme: 'primevideo://', webUrl: 'https://www.primevideo.com', description: 'Regional Indian movies & exclusive shows' },
  { name: 'Sony LIV', category: 'entertainment', icon: 'tv', scheme: 'sonyliv://', webUrl: 'https://www.sonyliv.com', description: 'UEFA Champions league, Sony shows & sports' },
  { name: 'ZEE5', category: 'entertainment', icon: 'subscriptions', scheme: 'zee5://', webUrl: 'https://www.zee5.com', description: 'Regional Indian web series, news & movies' },
  { name: 'JioCinema', category: 'entertainment', icon: 'movie_filter', scheme: 'jiocinema://', webUrl: 'https://www.jiocinema.com', description: 'Free live sports, HBO shows & Indian movies' },
  { name: 'Spotify', category: 'entertainment', icon: 'headphones', scheme: 'spotify://', webUrl: 'https://open.spotify.com', description: 'Bollywood, regional music & global podcasts' },
  { name: 'YouTube', category: 'entertainment', icon: 'smart_display', scheme: 'vnd.youtube://', webUrl: 'https://www.youtube.com', description: 'Video streaming, shorts & live channels' },
  { name: 'Gaana', category: 'entertainment', icon: 'music_note', scheme: 'gaana://', webUrl: 'https://gaana.com', description: 'Indian songs, playlist & podcast hub' },
  { name: 'JioSaavn', category: 'entertainment', icon: 'graphic_eq', scheme: 'jiosaavn://', webUrl: 'https://www.jiosaavn.com', description: 'Bollywood, Punjabi & regional high-res music' },
  { name: 'Wynk Music', category: 'entertainment', icon: 'library_music', scheme: 'wynk://', webUrl: 'https://wynk.in/music', description: 'Airtel Wynk music streaming & hellotunes' },

  // Social
  { name: 'WhatsApp', category: 'social', icon: 'chat', scheme: 'whatsapp://', webUrl: 'https://web.whatsapp.com', description: 'Messaging, HD video calls & WhatsApp Pay' },
  { name: 'Instagram', category: 'social', icon: 'photo_camera', scheme: 'instagram://', webUrl: 'https://www.instagram.com', description: 'Reels, stories & direct messaging' },
  { name: 'Facebook', category: 'social', icon: 'groups', scheme: 'fb://', webUrl: 'https://www.facebook.com', description: 'Social network, feed & marketplace' },
  { name: 'Snapchat', category: 'social', icon: 'camera_alt', scheme: 'snapchat://', webUrl: 'https://web.snapchat.com', description: 'AR filters, snaps & streaks' },
  { name: 'Telegram', category: 'social', icon: 'send', scheme: 'tg://', webUrl: 'https://web.telegram.org', description: 'Encrypted chats & broadcast channels' },
  { name: 'Discord', category: 'social', icon: 'forum', scheme: 'discord://', webUrl: 'https://discord.com', description: 'Voice servers, gaming & tech communities' },
  { name: 'LinkedIn', category: 'social', icon: 'work', scheme: 'linkedin://', webUrl: 'https://www.linkedin.com', description: 'Professional network & job market' },
  { name: 'X (Twitter)', category: 'social', icon: 'tag', scheme: 'twitter://', webUrl: 'https://x.com', description: 'Breaking news, trends & tech discussion' },
  { name: 'Threads', category: 'social', icon: 'alternate_email', scheme: 'barcelona://', webUrl: 'https://www.threads.net', description: 'Instagram text conversation network' },
  { name: 'Reddit', category: 'social', icon: 'forum', scheme: 'reddit://', webUrl: 'https://www.reddit.com', description: 'r/india & community discussions' },

  // Productivity
  { name: 'Gmail', category: 'productivity', icon: 'mail', scheme: 'googlegmail://', webUrl: 'https://mail.google.com', description: 'Google email inbox & smart reply' },
  { name: 'Google Calendar', category: 'productivity', icon: 'calendar_month', scheme: 'content://com.android.calendar', webUrl: 'https://calendar.google.com', description: 'Schedules, meetings & reminders' },
  { name: 'Google Drive', category: 'productivity', icon: 'cloud', scheme: 'googledrive://', webUrl: 'https://drive.google.com', description: 'Cloud storage, docs & sheets' },
  { name: 'Google Meet', category: 'productivity', icon: 'videocam', scheme: 'gmeet://', webUrl: 'https://meet.google.com', description: 'Video conferences & team calls' },
  { name: 'Microsoft Outlook', category: 'productivity', icon: 'mark_email_unread', scheme: 'ms-outlook://', webUrl: 'https://outlook.live.com', description: 'Enterprise email & calendar' },
  { name: 'Microsoft Teams', category: 'productivity', icon: 'groups_3', scheme: 'msteams://', webUrl: 'https://teams.microsoft.com', description: 'Team chat & enterprise meetings' },
  { name: 'Zoom', category: 'productivity', icon: 'video_call', scheme: 'zoomus://', webUrl: 'https://zoom.us', description: 'HD video webinars & virtual meetings' },
  { name: 'Notion', category: 'productivity', icon: 'notes', scheme: 'notion://', webUrl: 'https://www.notion.so', description: 'All-in-one workspace & docs' },
  { name: 'Trello', category: 'productivity', icon: 'view_kanban', scheme: 'trello://', webUrl: 'https://trello.com', description: 'Kanban task boards & project management' },
  { name: 'GitHub', category: 'productivity', icon: 'code', scheme: 'github://', webUrl: 'https://github.com', description: 'Developer repositories, PRs & code hosting' },

  // Learning
  { name: 'YouTube Learning', category: 'learning', icon: 'play_lesson', scheme: 'vnd.youtube://', webUrl: 'https://www.youtube.com/learning', description: 'Free educational channels & tutorials' },
  { name: 'Coursera', category: 'learning', icon: 'school', scheme: 'coursera://', webUrl: 'https://www.coursera.org', description: 'University certifications & online degrees' },
  { name: 'Udemy', category: 'learning', icon: 'auto_stories', scheme: 'udemy://', webUrl: 'https://www.udemy.com', description: 'Self-paced tech & business video courses' },
  { name: 'Unacademy', category: 'learning', icon: 'cast_for_education', scheme: 'unacademy://', webUrl: 'https://unacademy.com', description: 'Competitive exam prep (UPSC, JEE, NEET, GATE)' },
  { name: 'Physics Wallah', category: 'learning', icon: 'calculate', scheme: 'pw://', webUrl: 'https://www.pw.live', description: 'Affordable coaching for JEE, NEET & foundation' },
  { name: 'BYJU\'S', category: 'learning', icon: 'local_library', scheme: 'byjus://', webUrl: 'https://byjus.com', description: 'K-12 learning & interactive study materials' },
  { name: 'NPTEL', category: 'learning', icon: 'menu_book', scheme: 'nptel://', webUrl: 'https://nptel.ac.in', description: 'IIT & IISc official online course portal' },
  { name: 'GeeksforGeeks', category: 'learning', icon: 'terminal', scheme: 'gfg://', webUrl: 'https://www.geeksforgeeks.org', description: 'DSA, programming tutorials & interview prep' },
  { name: 'LeetCode', category: 'learning', icon: 'code_blocks', scheme: 'leetcode://', webUrl: 'https://leetcode.com', description: 'Coding practice & technical interview problems' },
  { name: 'HackerRank', category: 'learning', icon: 'integration_instructions', scheme: 'hackerrank://', webUrl: 'https://www.hackerrank.com', description: 'Programming skills evaluation & contests' },

  // Finance & Stocks
  { name: 'Groww', category: 'finance', icon: 'trending_up', scheme: 'groww://', webUrl: 'https://groww.in', description: 'Stock trading, direct mutual funds & SIP' },
  { name: 'Zerodha Kite', category: 'finance', icon: 'show_chart', scheme: 'kite://', webUrl: 'https://kite.zerodha.com', description: 'India\'s #1 stock broker & trading platform' },
  { name: 'Angel One', category: 'finance', icon: 'finance_chip', scheme: 'angelone://', webUrl: 'https://www.angelone.in', description: 'Smart money stock trading & F&O analytics' },
  { name: 'Upstox', category: 'finance', icon: 'stacked_line_chart', scheme: 'upstox://', webUrl: 'https://upstox.com', description: 'Equities, IPOs, commodities & futures' },
  { name: 'INDmoney', category: 'finance', icon: 'pie_chart', scheme: 'indmoney://', webUrl: 'https://www.indmoney.com', description: 'US stocks, net worth tracking & fixed deposits' },
  { name: 'ET Money', category: 'finance', icon: 'savings', scheme: 'etmoney://', webUrl: 'https://www.etmoney.com', description: 'Zero commission mutual funds & tax saving' },
  { name: 'Coin by Zerodha', category: 'finance', icon: 'currency_rupee', scheme: 'coin://', webUrl: 'https://coin.zerodha.com', description: 'Direct mutual fund investments with zero fees' },

  // News
  { name: 'Inshorts', category: 'news', icon: 'newspaper', scheme: 'inshorts://', webUrl: 'https://inshorts.com', description: '60-word news summaries in English & Hindi' },
  { name: 'DailyHunt', category: 'news', icon: 'feed', scheme: 'dailyhunt://', webUrl: 'https://m.dailyhunt.in', description: 'Regional Indian news in 14 languages' },
  { name: 'Google News', category: 'news', icon: 'article', scheme: 'googlenews://', webUrl: 'https://news.google.com', description: 'AI-curated headline news & sports' },
  { name: 'The Hindu', category: 'news', icon: 'menu_book', scheme: 'thehindu://', webUrl: 'https://www.thehindu.com', description: 'Trusted journalism & national editorial news' },
  { name: 'Times of India', category: 'news', icon: 'public', scheme: 'toi://', webUrl: 'https://timesofindia.indiatimes.com', description: 'India\'s largest national English newspaper' },
  { name: 'Indian Express', category: 'news', icon: 'gavel', scheme: 'indianexpress://', webUrl: 'https://indianexpress.com', description: 'Investigative reporting & opinion columns' },
  { name: 'Mint', category: 'news', icon: 'currency_exchange', scheme: 'mint://', webUrl: 'https://www.livemint.com', description: 'Business news, Sensex, economy & startups' },

  // Health
  { name: 'Google Fit', category: 'health', icon: 'fitness_center', scheme: 'googlefit://', webUrl: 'https://www.google.com/fit', description: 'Heart points, step tracking & activity history' },
  { name: 'Health Connect', category: 'health', icon: 'health_and_safety', scheme: 'healthconnect://', webUrl: 'https://developer.android.com/health-and-fitness/guides/health-connect', description: 'Android unified health data sync' },
  { name: 'Fitbit', category: 'health', icon: 'watch', scheme: 'fitbit://', webUrl: 'https://www.fitbit.com', description: 'Sleep analytics, heart rate & workout tracking' },
  { name: 'Samsung Health', category: 'health', icon: 'monitor_heart', scheme: 'shealth://', webUrl: 'https://www.samsung.com/global/galaxy/apps/samsung-health', description: 'Body composition, steps & hydration reminders' },

  // Government Services
  { name: 'DigiLocker', category: 'government', icon: 'verified_user', scheme: 'digilocker://', webUrl: 'https://www.digilocker.gov.in', description: 'Official digital document wallet (Aadhaar, DL, RT-PCR)' },
  { name: 'UMANG', category: 'government', icon: 'account_balance', scheme: 'umang://', webUrl: 'https://web.umang.gov.in', description: 'Unified Mobile App for New-age Governance' },
  { name: 'Aadhaar (mAadhaar)', category: 'government', icon: 'badge', scheme: 'maadhaar://', webUrl: 'https://uidai.gov.in', description: 'UIDAI Aadhaar card update & verification' },
  { name: 'PAN Services (NSDL/UTI)', category: 'government', icon: 'id_card', scheme: 'pan://', webUrl: 'https://www.onlineservices.nsdl.com', description: 'PAN card application, e-PAN download & link to Aadhaar' },
  { name: 'Passport Seva', category: 'government', icon: 'flight_land', scheme: 'passportseva://', webUrl: 'https://www.passportindia.gov.in', description: 'Indian Passport application & appointment status' },
  { name: 'mParivahan', category: 'government', icon: 'directions_car', scheme: 'mparivahan://', webUrl: 'https://parivahan.gov.in', description: 'Digital Driving License & RC certificate' },
  { name: 'FASTag Recharge', category: 'government', icon: 'toll', scheme: 'fastag://', webUrl: 'https://www.netc.org.in', description: 'Toll plaza FASTag balance check & recharge' },
  { name: 'GST Portal', category: 'government', icon: 'receipt_long', scheme: 'gst://', webUrl: 'https://www.gst.gov.in', description: 'GST return filing & GSTIN taxpayer verification' },
  { name: 'Income Tax e-Filing', category: 'government', icon: 'assessment', scheme: 'incometax://', webUrl: 'https://www.incometax.gov.in', description: 'ITR filing, refund status & Form 26AS' },
  { name: 'EPFO (UAN Passbook)', category: 'government', icon: 'savings', scheme: 'epfo://', webUrl: 'https://www.epfindia.gov.in', description: 'Provident fund balance passbook & UAN services' },
];

export default function SmartLaunchersPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 30);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [launchingAppName, setLaunchingAppName] = useState<string | null>(null);

  const launchApp = (app: LauncherApp) => {
    // Instant 1-click visual feedback
    setLaunchingAppName(app.name);

    // Non-blocking browser tab / protocol launch
    setTimeout(() => {
      window.open(app.webUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => setLaunchingAppName(null), 1200);
    }, 150);
  };

  const filteredApps = APPS.filter((a) => {
    const matchesCat = activeCategory === 'all' || a.category === activeCategory;
    const matchesQuery =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="INDIA-FIRST LAUNCHER MATRIX"
        title="Indian Ecosystem App Launchers"
        description="Deep-link protocol launchers with instant web fallback for 80+ Indian services across payments, shopping, travel, government & media"
      />

      {/* Filter & Search */}
      <div className="anime-stagger flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-base">
            search
          </span>
          <input
            id="launcher-search"
            aria-label="Search PhonePe, Zepto, Groww, DigiLocker..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search PhonePe, Zepto, Groww, DigiLocker..."
            className="w-full input-neon pl-10 text-xs font-mono"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
          {[
            { id: 'all', name: 'All' },
            { id: 'payments', name: 'Payments & UPI' },
            { id: 'food', name: 'Food Delivery' },
            { id: 'instant', name: 'Instant Commerce' },
            { id: 'shopping', name: 'Shopping' },
            { id: 'travel', name: 'Travel & IRCTC' },
            { id: 'medicine', name: 'Medicine' },
            { id: 'grocery', name: 'Grocery' },
            { id: 'entertainment', name: 'Entertainment' },
            { id: 'social', name: 'Social' },
            { id: 'productivity', name: 'Productivity' },
            { id: 'learning', name: 'Learning' },
            { id: 'finance', name: 'Finance & Stocks' },
            { id: 'news', name: 'News' },
            { id: 'health', name: 'Health' },
            { id: 'government', name: 'Govt Services' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg font-mono text-xs uppercase font-bold tracking-wider border whitespace-nowrap cursor-pointer transition-all ${activeCategory === cat.id
                  ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[var(--color-primary-glow)] shadow-sm'
                  : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* App Launchers Grid */}
      <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => {
          const isLaunching = launchingAppName === app.name;
          return (
            <div
              key={app.name}
              onClick={() => launchApp(app)}
              className={`glass-card rounded-xl p-5 flex flex-col justify-between transition-all cursor-pointer group space-y-4 border ${isLaunching
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-dim)] ring-2 ring-[var(--color-primary-glow)] scale-[0.98]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)] active:scale-95'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primary-dim)] border border-[var(--color-primary-glow)] text-[var(--color-primary)] flex items-center justify-center group-hover:border-[var(--color-primary)] transition-colors">
                  <span className="material-symbols-outlined text-2xl">{app.icon}</span>
                </div>
                <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-2.5 py-0.5 rounded border border-[var(--color-primary-glow)]">
                  {isLaunching ? 'LAUNCHING...' : app.category}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {app.name}
                </h3>
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">
                <span>{isLaunching ? 'Opening App...' : 'Launch Protocol'}</span>
                <span className={`material-symbols-outlined text-sm transition-transform ${isLaunching ? 'animate-spin' : 'group-hover:translate-x-1'}`}>
                  {isLaunching ? 'sync' : 'open_in_new'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
