'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { MiniAppHeader } from '@/components/ui/MiniAppHeader';

type EntTab = 'youtube' | 'streaming' | 'music' | 'movies' | 'news' | 'cricket';

interface Track {
  title: string;
  artist: string;
  duration: string;
  album: string;
  spotifyId: string;
}

interface Movie {
  id: string;
  title: string;
  genre: string;
  rating: string;
  poster: string;
  releaseDate: string;
  category: 'trending' | 'popular' | 'upcoming';
  bmsLink: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  summary: string;
  bookmarked?: boolean;
}

export default function EntertainmentPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const [activeTab, setActiveTab] = useState<EntTab>('music');

  // YouTube Embedded Player State
  const [activeVideoId, setActiveVideoId] = useState('dQw4w9WgXcQ');
  const [ytQuery, setYtQuery] = useState('Indian Tech & Super Apps 2026');

  const YT_VIDEOS = [
    { id: 'dQw4w9WgXcQ', title: 'Building Scalable Next.js 15 Super Apps in India', channel: 'WeEverything Tech', views: '240K' },
    { id: 'L_LUpnjgPso', title: 'Top 10 Indian UPI Features & Instant Checkout', channel: 'FinTech India', views: '580K' },
    { id: '3JZ_D3ELwOQ', title: 'Bollywood Hits & Lofi Chill Beats 2026', channel: 'T-Series Official', views: '1.2M' },
  ];

  // Spotify Music Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [musicSearch, setMusicSearch] = useState('');
  const [spotifyEmbedId, setSpotifyEmbedId] = useState('37i9dQZF1DX0XUfTFmBDM0'); // Top Hits India Playlist ID

  const tracks: Track[] = [
    { title: 'Chaleya (Jawan)', artist: 'Anirudh Ravichander, Arijit Singh', duration: '3:20', album: 'Jawan Motion Picture', spotifyId: '0aA11qZkK95lB3N00n' },
    { title: 'Kesariya (Brahmastra)', artist: 'Pritam, Arijit Singh', duration: '4:28', album: 'Brahmastra Original', spotifyId: '6W79n5yS4n3A9g00' },
    { title: 'Tauba Tauba (Bad Newz)', artist: 'Karan Aujla', duration: '3:15', album: 'Bad Newz Hits', spotifyId: '7aZk9mK00n912' },
    { title: 'Illuminati (Aavesham)', artist: 'Sushin Shyam, Dabzee', duration: '2:55', album: 'Aavesham South Blockbuster', spotifyId: '8bB22pK00m11' },
  ];

  // Trending Movies & BookMyShow Integration State
  const [movieSearch, setMovieSearch] = useState('');
  const [selectedMovieGenre, setSelectedMovieGenre] = useState('All');

  const MOVIES: Movie[] = [
    {
      id: 'm1',
      title: 'Kalki 2898 AD',
      genre: 'Sci-Fi / Epic',
      rating: '★ 9.4',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
      releaseDate: 'In Theatres Now',
      category: 'trending',
      bmsLink: 'https://in.bookmyshow.com/movies/kalki-2898-ad',
    },
    {
      id: 'm2',
      title: 'Stree 2 (Horror Comedy)',
      genre: 'Horror / Comedy',
      rating: '★ 9.2',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      releaseDate: 'In Theatres Now',
      category: 'popular',
      bmsLink: 'https://in.bookmyshow.com/movies/stree-2',
    },
    {
      id: 'm3',
      title: 'Jawan (Action Blockbuster)',
      genre: 'Action / Thriller',
      rating: '★ 9.5',
      poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80',
      releaseDate: 'Popular Streaming',
      category: 'popular',
      bmsLink: 'https://in.bookmyshow.com',
    },
    {
      id: 'm4',
      title: 'War 2 (YRF Spy Universe)',
      genre: 'Action / Spy',
      rating: '★ 9.6',
      poster: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=600&q=80',
      releaseDate: 'Upcoming Release',
      category: 'upcoming',
      bmsLink: 'https://in.bookmyshow.com',
    },
  ];

  // News Feed State
  const [newsCategory, setNewsCategory] = useState('Tech');
  const [newsSearch, setNewsSearch] = useState('');
  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: 'n1',
      title: 'UPI International Transactions Cross Landmark 500 Million Milestone Across Asia',
      source: 'Inshorts India',
      category: 'Tech',
      time: '10m ago',
      summary: 'NPCI confirms international UPI adoption across Singapore, UAE, France, and Sri Lanka driving instant cross-border payments.',
      bookmarked: false,
    },
    {
      id: 'n2',
      title: 'Sensex Crosses Historic Threshold Driven by Strong Tech & Super App Earnings',
      source: 'Mint Markets',
      category: 'Finance',
      time: '1h ago',
      summary: 'Indian benchmark equity indices surge following stellar quarterly earnings in tech, digital retail, and quick commerce.',
      bookmarked: true,
    },
    {
      id: 'n3',
      title: 'Supreme Court Issues New Directives on Digital Citizen Data Protection & Privacy',
      source: 'The Hindu',
      category: 'India',
      time: '3h ago',
      summary: 'Enhanced framework guidelines mandated for digital services operating in India to protect user identity and data rights.',
    },
  ]);

  const [activeNewsSummary, setActiveNewsSummary] = useState<string | null>(null);

  // Live Cricket State
  const [cricketTab, setCricketTab] = useState<'live' | 'upcoming' | 'points' | 'predictions'>('live');
  const [isRefreshingCricket, setIsRefreshingCricket] = useState(false);

  const toggleBookmarkNews = (id: string) => {
    setNewsItems(newsItems.map(n => n.id === id ? { ...n, bookmarked: !n.bookmarked } : n));
  };

  const summarizeNewsArticle = (n: NewsItem) => {
    setActiveNewsSummary(`[AI Article Summary - ${n.title}]:\n• Key Point 1: ${n.summary}\n• Key Point 2: Rapid growth verified across Indian digital ecosystem.\n• Key Takeaway: Significant positive trajectory for mobile-first users.`);
  };

  const refreshCricketScores = () => {
    setIsRefreshingCricket(true);
    setTimeout(() => setIsRefreshingCricket(false), 800);
  };

  const INDIAN_STREAMING = [
    { name: 'JioHotstar', desc: 'Live Cricket, IPL, Marvel & Hotstar Specials', icon: 'live_tv', url: 'https://www.hotstar.com' },
    { name: 'JioCinema', desc: 'Free Sports, HBO Shows & Bollywood Blockbusters', icon: 'movie_filter', url: 'https://www.jiocinema.com' },
    { name: 'Sony LIV', desc: 'UEFA Champions League, Sony TV Shows & Originals', icon: 'tv', url: 'https://www.sonyliv.com' },
    { name: 'ZEE5', desc: 'Regional Web Series, Live TV & Indian Movies', icon: 'subscriptions', url: 'https://www.zee5.com' },
    { name: 'Amazon Prime Video', desc: 'Bollywood movies, Web series & Prime originals', icon: 'play_circle', url: 'https://www.primevideo.com' },
    { name: 'Netflix', desc: 'Global blockbuster series & Netflix Indian originals', icon: 'movie', url: 'https://www.netflix.com' },
    { name: 'Spotify India', desc: 'Bollywood, Punjabi, South & Indian podcasts', icon: 'headphones', url: 'https://open.spotify.com' },
    { name: 'Wynk Music', desc: 'Airtel music streaming & free Hellotunes', icon: 'library_music', url: 'https://wynk.in/music' },
    { name: 'JioSaavn', desc: 'High-definition Bollywood & regional songs', icon: 'graphic_eq', url: 'https://www.jiosaavn.com' },
    { name: 'Gaana', desc: 'Trending Hindi, Tamil, Telugu songs & podcasts', icon: 'music_note', url: 'https://gaana.com' },
  ];

  return (
    <div ref={containerRef} className="page-wrapper-wide space-y-8 bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      <MiniAppHeader
        category="INDIAN MEDIA & ENTERTAINMENT SUITE"
        title="Entertainment & Sports Hub"
        description="Spotify Music Player, Trending Movies & BookMyShow, Dynamic Live News, Live Cricket & JioHotstar Streaming"
      />

      {/* Main Feature Tabs */}
      <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-4 overflow-x-auto hide-scrollbar">
        {[
          { key: 'music', label: 'Spotify Music Player', icon: 'headphones' },
          { key: 'movies', label: 'Trending Movies & BookMyShow', icon: 'movie' },
          { key: 'news', label: 'Live News Feed & AI', icon: 'newspaper' },
          { key: 'cricket', label: 'Live Cricket Dashboard', icon: 'sports_cricket' },
          { key: 'youtube', label: 'YouTube Player', icon: 'play_circle' },
          { key: 'streaming', label: 'Streaming Apps Matrix', icon: 'live_tv' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 border whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm'
                : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: SPOTIFY MUSIC PLAYER */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="anime-stagger grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Spotify Audio Player Card */}
            <div className="lg:col-span-2 glass-card border border-[var(--color-border)] rounded-xl p-8 space-y-6 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-40 h-40 rounded-xl bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.4)] flex items-center justify-center flex-shrink-0 shadow-2xl relative overflow-hidden">
                  <span className={`material-symbols-outlined text-6xl text-[var(--color-primary)] ${isPlaying ? 'animate-bounce' : ''}`}>
                    graphic_eq
                  </span>
                </div>

                <div className="space-y-2 text-center md:text-left flex-1">
                  <span className="font-mono text-[10px] uppercase font-bold text-[var(--color-primary)]">BOLLYWOOD TOP 50 TRACK</span>
                  <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">{tracks[trackIndex].title}</h2>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{tracks[trackIndex].artist}</p>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{tracks[trackIndex].album}</p>
                  <p className="font-mono text-xs text-[var(--color-primary)] font-bold">{tracks[trackIndex].duration}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setTrackIndex((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))}
                  className="p-3 glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] rounded-full border border-[var(--color-border)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">skip_previous</span>
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 btn-neon text-[var(--color-text-inverse)] rounded-full shadow-lg cursor-pointer"
                >
                  <span className="material-symbols-outlined text-2xl">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <button
                  onClick={() => setTrackIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))}
                  className="p-3 glass-card hover:bg-[var(--color-surface-bright)] text-[var(--color-text)] rounded-full border border-[var(--color-border)] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl">skip_next</span>
                </button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(tracks[trackIndex].title)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-glass border border-[var(--color-border)] text-[#1DB954] hover:border-[#1DB954] px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Listen on Spotify Web App
                </a>
              </div>
            </div>

            {/* Official Spotify Playlist Embed & Track Queue */}
            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-4 font-mono text-xs shadow-xl">
              <h4 className="font-bold text-[var(--color-text)] text-sm border-b border-[var(--color-border)] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1DB954]">headphones</span>
                Spotify Playlist & Queue
              </h4>

              <div className="space-y-2">
                {tracks.map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setTrackIndex(idx); setIsPlaying(true); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      trackIndex === idx
                        ? 'bg-[var(--color-primary-dim)] border-[rgba(223,255,0,0.4)] text-[var(--color-primary)] font-bold'
                        : 'glass-card border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h5 className="font-bold text-xs truncate">{t.title}</h5>
                      <span className="text-[10px]">{t.duration}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{t.artist}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${spotifyEmbedId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="152"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  className="rounded-xl border border-[var(--color-border)]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRENDING MOVIES & BOOKMYSHOW INTEGRATION */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="anime-stagger flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] text-base">
                search
              </span>
              <input
                type="text"
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
                placeholder="Search Kalki, Stree 2, Jawan..."
                className="w-full input-neon pl-10"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
              {['All', 'Action', 'Sci-Fi', 'Horror', 'Comedy', 'Spy'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedMovieGenre(g)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold border cursor-pointer ${
                    selectedMovieGenre === g
                      ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                      : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOVIES.filter(m => selectedMovieGenre === 'All' || m.genre.includes(selectedMovieGenre))
              .filter(m => m.title.toLowerCase().includes(movieSearch.toLowerCase()))
              .map((m) => (
                <div key={m.id} className="glass-card border border-[var(--color-border)] rounded-xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-[var(--color-primary)] transition-all">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-dim)]">
                    <img
                      src={m.poster}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur text-[var(--color-primary)] font-mono text-xs font-extrabold px-2.5 py-1 rounded-lg border border-[rgba(223,255,0,0.4)]">
                      {m.rating}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-primary)]">{m.releaseDate}</span>
                      <h4 className="font-display font-bold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{m.title}</h4>
                      <p className="font-mono text-xs text-[var(--color-text-muted)] mt-0.5">{m.genre}</p>
                    </div>

                    <a
                      href={m.bmsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-[#e50914] text-white py-2.5 rounded-xl font-mono text-xs uppercase font-bold text-center block hover:brightness-110 shadow-lg cursor-pointer"
                    >
                      Book Tickets on BookMyShow ➔
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE NEWS FEED & AI SUMMARIES */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="anime-stagger flex flex-col md:flex-row justify-between gap-4 items-center">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto hide-scrollbar">
              {['Tech', 'Finance', 'India', 'Sports', 'Entertainment'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNewsCategory(cat)}
                  className={`px-4 py-2 rounded-xl font-mono text-xs uppercase font-bold border cursor-pointer ${
                    newsCategory === cat
                      ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]'
                      : 'glass-card text-[var(--color-text-muted)] border-[var(--color-border)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="Search headlines..."
                className="w-full input-neon"
              />
            </div>
          </div>

          <div className="anime-stagger space-y-4">
            {newsItems.map((n) => (
              <div key={n.id} className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-3 hover:border-[var(--color-primary)] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[9px] uppercase font-bold text-[var(--color-primary)]">{n.source} • {n.time}</span>
                    <h4 className="font-display font-bold text-lg text-[var(--color-text)] mt-1">{n.title}</h4>
                    <p className="font-body text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{n.summary}</p>
                  </div>
                  <button
                    onClick={() => toggleBookmarkNews(n.id)}
                    className={`material-symbols-outlined cursor-pointer ${n.bookmarked ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}
                  >
                    {n.bookmarked ? 'bookmark' : 'bookmark_border'}
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
                  <button
                    onClick={() => summarizeNewsArticle(n)}
                    className="btn-neon font-mono text-[10px] uppercase font-bold px-4 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    Generate AI Summary
                  </button>
                </div>
              </div>
            ))}
          </div>

          {activeNewsSummary && (
            <div className="anime-stagger p-6 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-primary)] leading-relaxed whitespace-pre-wrap">
              {activeNewsSummary}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: LIVE CRICKET DASHBOARD */}
      {activeTab === 'cricket' && (
        <div className="space-y-6">
          <div className="anime-stagger flex justify-between items-center glass-card p-4 rounded-xl border border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 animate-pulse text-xl">sports_cricket</span>
              <h3 className="font-display font-bold text-sm text-[var(--color-text)]">Live Cricket Dashboard & AI Match Predictions</h3>
            </div>
            <button
              onClick={refreshCricketScores}
              disabled={isRefreshingCricket}
              className="btn-neon font-mono text-xs uppercase font-bold px-4 py-1.5 cursor-pointer flex items-center gap-1"
            >
              <span className={`material-symbols-outlined text-sm ${isRefreshingCricket ? 'animate-spin' : ''}`}>
                {isRefreshingCricket ? 'sync' : 'refresh'}
              </span>
              {isRefreshingCricket ? 'Updating...' : 'Live Refresh'}
            </button>
          </div>

          {/* Sub-tabs for Cricket */}
          <div className="anime-stagger flex gap-2 border-b border-[var(--color-border)] pb-3">
            {[
              { id: 'live', label: 'Live Scorecard' },
              { id: 'upcoming', label: 'Upcoming Matches' },
              { id: 'points', label: 'Points Table' },
              { id: 'predictions', label: 'AI Match Predictions' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setCricketTab(t.id as any)}
                className={`px-4 py-1.5 rounded-lg font-mono text-xs uppercase font-bold cursor-pointer ${
                  cricketTab === t.id ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border border-[rgba(223,255,0,0.3)]' : 'glass-card text-[var(--color-text-muted)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {cricketTab === 'live' && (
            <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xl">
                <span className="font-mono text-[10px] text-red-500 font-bold uppercase animate-pulse">● LIVE • 3RD TEST MATCH (WANKHEDE)</span>
                <div className="flex justify-between items-center font-display font-bold text-xl text-[var(--color-text)]">
                  <span>India</span>
                  <span className="text-[var(--color-primary)] font-mono text-2xl">284/4 (42.2 ov)</span>
                  <span>Australia</span>
                </div>
                <div className="p-3 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-muted)] space-y-1">
                  <p>CRR: 6.70 • Target: 310 • Need 26 runs in 46 balls</p>
                  <p className="text-[var(--color-text)] font-bold">Batsmen: Yashasvi Jaiswal 112* (88), Shubman Gill 64 (52)</p>
                </div>
              </div>

              <div className="glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 shadow-xl">
                <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase">COMPLETED • T20 INTERNATIONAL</span>
                <div className="flex justify-between items-center font-display font-bold text-xl text-[var(--color-text)]">
                  <span>India</span>
                  <span className="text-[var(--color-primary)] font-mono text-2xl">198/5 (20.0 ov)</span>
                  <span>South Africa</span>
                </div>
                <div className="p-3 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] font-mono text-xs text-[var(--color-text-muted)] space-y-1">
                  <p className="text-emerald-400 font-bold">Result: India won by 34 runs</p>
                  <p>Player of the Match: Suryakumar Yadav 84 (42)</p>
                </div>
              </div>
            </div>
          )}

          {cricketTab === 'upcoming' && (
            <div className="anime-stagger grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { match: 'India vs England', date: 'Tomorrow, 02:30 PM', venue: 'Eden Gardens, Kolkata' },
                { match: 'India vs New Zealand', date: 'Friday, 07:00 PM', venue: 'M. Chinnaswamy Stadium, Bengaluru' },
                { match: 'IPL 2026 Season Opener', date: 'Next Month', venue: 'Narendra Modi Stadium, Ahmedabad' },
              ].map((m, i) => (
                <div key={i} className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-2">
                  <span className="font-mono text-[10px] text-[var(--color-primary)] font-bold uppercase">{m.date}</span>
                  <h4 className="font-display font-bold text-base text-[var(--color-text)]">{m.match}</h4>
                  <p className="font-mono text-xs text-[var(--color-text-muted)]">{m.venue}</p>
                </div>
              ))}
            </div>
          )}

          {cricketTab === 'points' && (
            <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-6 space-y-4 font-mono text-xs">
              <h4 className="font-display font-bold text-base text-[var(--color-text)]">ICC World Test Championship Standings</h4>
              <div className="space-y-2">
                {[
                  { pos: 1, team: 'India', p: 12, w: 9, l: 2, pct: '75.0%' },
                  { pos: 2, team: 'Australia', p: 14, w: 10, l: 3, pct: '71.4%' },
                  { pos: 3, team: 'England', p: 15, w: 8, l: 6, pct: '53.3%' },
                  { pos: 4, team: 'South Africa', p: 10, w: 5, l: 5, pct: '50.0%' },
                ].map((t) => (
                  <div key={t.team} className="p-3 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl flex justify-between items-center">
                    <span className="font-bold text-[var(--color-primary)]">#{t.pos} {t.team}</span>
                    <span className="text-[var(--color-text-muted)]">Played {t.p} • Won {t.w} • Lost {t.l}</span>
                    <span className="font-bold text-[var(--color-text)]">{t.pct} PCT</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cricketTab === 'predictions' && (
            <div className="anime-stagger p-6 bg-[var(--color-surface-dim)] border border-[var(--color-border)] rounded-xl font-mono text-xs text-[var(--color-primary)] leading-relaxed space-y-2">
              <h4 className="font-display font-bold text-base text-[var(--color-text)]">🤖 AI Match Win Prediction (Clearly AI Generated)</h4>
              <p>• India Win Probability: 72% based on pitch conditions, 1st innings total & spinners record at Wankhede.</p>
              <p>• Key Factor: Dew expected in 2nd innings will favor chasing team.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: YOUTUBE EMBEDDED PLAYER */}
      {activeTab === 'youtube' && (
        <div className="space-y-6">
          <div className="anime-stagger glass-card border border-[var(--color-border)] rounded-xl p-4 flex gap-2 font-mono text-xs shadow-xl">
            <input
              type="text"
              value={ytQuery}
              onChange={(e) => setYtQuery(e.target.value)}
              placeholder="Search YouTube videos..."
              className="flex-1 input-neon"
            />
            <button
              onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`, '_blank')}
              className="bg-[#FF0000] text-white px-6 py-2.5 rounded-xl font-bold uppercase hover:brightness-110 cursor-pointer"
            >
              Search YouTube
            </button>
          </div>

          <div className="anime-stagger grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 aspect-video bg-black border border-[var(--color-border)] rounded-xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="YouTube Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-4 font-mono text-xs">
              <h4 className="font-bold text-[var(--color-text)] text-sm border-b border-[var(--color-border)] pb-2">Trending Indian Videos</h4>
              <div className="space-y-3">
                {YT_VIDEOS.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setActiveVideoId(vid.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                      activeVideoId === vid.id ? 'bg-[var(--color-primary-dim)] border-[rgba(223,255,0,0.4)] text-[var(--color-primary)] font-bold' : 'glass-card border-[var(--color-border)] text-[var(--color-text)]'
                    }`}
                  >
                    <h5 className="font-bold text-xs line-clamp-1">{vid.title}</h5>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{vid.channel} • {vid.views} views</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: STREAMING SERVICES MATRIX */}
      {activeTab === 'streaming' && (
        <div className="anime-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INDIAN_STREAMING.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="glass-card border border-[var(--color-border)] rounded-xl p-5 space-y-3 hover:border-[var(--color-primary)] transition-colors group cursor-pointer block"
            >
              <div className="flex justify-between items-center">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.3)] text-[var(--color-primary)] flex items-center justify-center font-mono">
                  <span className="material-symbols-outlined text-xl">{s.icon}</span>
                </div>
                <span className="material-symbols-outlined text-sm text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-transform">
                  open_in_new
                </span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                  {s.name}
                </h4>
                <p className="font-body text-xs text-[var(--color-text-muted)] mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
