'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';
import { Tooltip } from '@/components/ui/Tooltip';
import clsx from 'clsx';

interface ChannelVideo {
  id: string;
  creator: { displayName: string; username: string; verified: boolean };
  description: string;
  category: 'Tech' | 'Gaming' | 'Music' | 'Comedy' | 'Fitness';
  music: string;
  likes: number;
  comments: number;
  views: string;
  videoUrl: string;
  poster?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  commentsList?: { id: string; user: string; text: string; time: string }[];
}

export default function ChannelsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 50);

  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [feed, setFeed] = useState<ChannelVideo[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newCategory, setNewCategory] = useState<'Tech' | 'Gaming' | 'Music' | 'Comedy' | 'Fitness'>('Tech');

  const [activeCommentVideoId, setActiveCommentVideoId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    // Only load authentic user-created reels — no fake static seeds
    const saved = localStorage.getItem('we_channels_user_feed_v2');
    if (saved) {
      try { setFeed(JSON.parse(saved)); } catch { setFeed([]); }
    } else {
      setFeed([]);
    }
  }, []);

  const saveFeed = (updated: ChannelVideo[]) => {
    setFeed(updated);
    localStorage.setItem('we_channels_user_feed_v2', JSON.stringify(updated));
  };

  const handleToggleLike = (id: string) => {
    requireAuth(() => {
      saveFeed(feed.map(v => {
        if (v.id === id) {
          const isLiked = !v.isLiked;
          return { ...v, isLiked, likes: isLiked ? v.likes + 1 : Math.max(0, v.likes - 1) };
        }
        return v;
      }));
    }, 'like videos');
  };

  const handleToggleFollow = (id: string) => {
    requireAuth(() => {
      saveFeed(feed.map(v => v.id === id ? { ...v, isFollowing: !v.isFollowing } : v));
    }, 'follow channels');
  };

  const handleToggleSave = (id: string) => {
    requireAuth(() => {
      saveFeed(feed.map(v => v.id === id ? { ...v, isSaved: !v.isSaved } : v));
    }, 'bookmark reels');
  };

  const handleUploadVideo = () => {
    if (!newCaption.trim()) return;
    const newVid: ChannelVideo = {
      id: `vid_${Date.now()}`,
      creator: { displayName: 'Creator', username: 'creator', verified: true },
      description: newCaption.trim(),
      category: newCategory,
      music: 'Original Audio - Creator Reel',
      likes: 0,
      comments: 0,
      views: '1',
      videoUrl: newVideoUrl.trim() || 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-lines-41557-large.mp4',
      isLiked: false,
      isFollowing: false,
      commentsList: [],
    };
    saveFeed([newVid, ...feed]);
    setNewVideoUrl('');
    setNewCaption('');
    setShowUploadModal(false);
  };

  const handleAddComment = (vidId: string) => {
    if (!commentInput.trim()) return;
    requireAuth(() => {
      const newComment = { id: `c_${Date.now()}`, user: 'User', text: commentInput.trim(), time: 'Just now' };
      saveFeed(feed.map(v => {
        if (v.id === vidId) {
          const commentsList = v.commentsList ? [...v.commentsList, newComment] : [newComment];
          return { ...v, commentsList, comments: commentsList.length };
        }
        return v;
      }));
      setCommentInput('');
    }, 'comment on videos');
  };

  const filteredFeed = activeCategory === 'All' ? feed : feed.filter(v => v.category === activeCategory);

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">SHORT-VIDEO PLATFORM</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">Channels Reels</h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            User-driven short video reels, creator channels, and real interaction
          </p>
        </div>
        <Button
          onClick={() => requireAuth(() => setShowUploadModal(true), 'upload short reels')}
          variant="primary"
          icon="video_call"
        >
          Upload Reel
        </Button>
      </div>

      {/* Categories */}
      <div className="anime-stagger flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
        {['All', 'Tech', 'Gaming', 'Music', 'Comedy', 'Fitness'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={clsx(
              'px-4 py-2 rounded-full font-mono text-xs uppercase font-bold tracking-wider transition-all flex-shrink-0 cursor-pointer border',
              activeCategory === cat ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)] shadow-sm' : 'glass-card border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card variant="glass" className="glass-modal p-6 w-full max-w-md space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Upload New Reel</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <Input
              type="text"
              value={newVideoUrl}
              onChange={e => setNewVideoUrl(e.target.value)}
              placeholder="Video URL (.mp4 / webm)..."
            />
            <textarea
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              placeholder="Reel caption & hashtags..."
              className="input-neon h-24 resize-none font-mono text-xs"
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button onClick={() => setShowUploadModal(false)} variant="ghost">Cancel</Button>
              <Button onClick={handleUploadVideo} disabled={!newCaption.trim()} variant="primary">
                Publish Reel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Video Feed */}
      <div className="space-y-6">
        {filteredFeed.length === 0 ? (
          <div className="anime-stagger flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.2)] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">video_library</span>
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="font-display font-bold text-xl text-[var(--color-text)]">No reels published yet</h2>
              <p className="font-body text-sm text-[var(--color-text-muted)]">
                Be the first to publish a short video reel on Channels.
              </p>
            </div>
            <Button
              onClick={() => requireAuth(() => setShowUploadModal(true), 'upload short reels')}
              variant="primary"
              icon="video_call"
            >
              Publish First Reel
            </Button>
          </div>
        ) : (
          filteredFeed.map((v) => (
            <Card key={v.id} variant="glass" className="anime-stagger p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-mono font-bold flex items-center justify-center glow-neon">
                    {v.creator.displayName[0]}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-[var(--color-text)] flex items-center gap-1.5">
                      {v.creator.displayName}
                      {v.creator.verified && <span className="material-symbols-outlined text-xs text-[var(--color-primary)]">verified</span>}
                    </h4>
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)]">@{v.creator.username}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleToggleFollow(v.id)}
                  variant={v.isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                >
                  {v.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>

              <p className="font-body text-sm text-[var(--color-text)]">{v.description}</p>

              {/* Video Player */}
              <div className="rounded-xl overflow-hidden border border-[var(--color-border)] aspect-video bg-black relative">
                <video
                  src={v.videoUrl}
                  poster={v.poster}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Interactions */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)] font-mono text-xs">
                <div className="flex items-center gap-6">
                  <Tooltip content={v.isLiked ? 'Unlike reel' : 'Like this reel'}>
                    <button
                      onClick={() => handleToggleLike(v.id)}
                      aria-label="Like reel"
                      className={clsx(
                        'flex items-center gap-1.5 font-bold transition-all cursor-pointer',
                        v.isLiked ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                      )}
                    >
                      <span className="material-symbols-outlined text-lg">{v.isLiked ? 'favorite' : 'favorite'}</span>
                      <span>{v.likes.toLocaleString()}</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="View or post comments">
                    <button
                      onClick={() => setActiveCommentVideoId(activeCommentVideoId === v.id ? null : v.id)}
                      aria-label="Comments"
                      className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-lg">chat_bubble</span>
                      <span>{v.comments}</span>
                    </button>
                  </Tooltip>

                  <Tooltip content="Total views">
                    <span className="text-[var(--color-text-subtle)] flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">visibility</span>
                      {v.views}
                    </span>
                  </Tooltip>
                </div>

                <Tooltip content={v.isSaved ? 'Remove bookmark' : 'Bookmark reel'}>
                  <button
                    onClick={() => handleToggleSave(v.id)}
                    aria-label="Bookmark reel"
                    className={clsx(
                      'transition-all cursor-pointer',
                      v.isSaved ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">{v.isSaved ? 'bookmark' : 'bookmark_border'}</span>
                  </button>
                </Tooltip>
              </div>

              {/* Comments Drawer */}
              {activeCommentVideoId === v.id && (
                <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(v.id)}
                    />
                    <Button onClick={() => handleAddComment(v.id)} variant="primary" size="sm">
                      Comment
                    </Button>
                  </div>

                  {v.commentsList && v.commentsList.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {v.commentsList.map((cm) => (
                        <div key={cm.id} className="p-3 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] font-mono text-xs">
                          <div className="flex justify-between text-[var(--color-text-muted)] mb-1">
                            <span className="font-bold text-[var(--color-primary)]">{cm.user}</span>
                            <span className="text-[10px]">{cm.time}</span>
                          </div>
                          <p className="text-[var(--color-text)]">{cm.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
