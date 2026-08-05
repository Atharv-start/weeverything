'use client';

import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useEffect } from 'react';
import { api, setAuthToken } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAnimeStagger } from '@/lib/anime';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useAuthGuard } from '@/lib/useAuthGuard';
import { AuthModal } from '@/components/ui/AuthModal';

type FeedTab = 'discover' | 'connections';
type SubFilter = 'for-you' | 'trending' | 'latest';

interface MomentPost {
  id: string;
  author: { displayName: string; username: string };
  content: string;
  createdAt: string;
  media?: { url: string; mimeType?: string }[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  location?: string;
  hashtags?: string[];
  commentsList?: { id: string; author: string; text: string; time: string }[];
}

export default function MomentsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useAnimeStagger(containerRef, '.anime-stagger', 40);

  const { accessToken, user } = useAuthStore();
  const { requireAuth, authModalOpen, closeAuthModal, protectedActionName } = useAuthGuard();

  const [feedTab, setFeedTab] = useState<FeedTab>('discover');
  const [subFilter, setSubFilter] = useState<SubFilter>('for-you');
  const [showCompose, setShowCompose] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');

  const [localPosts, setLocalPosts] = useState<MomentPost[]>([]);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (accessToken) setAuthToken(accessToken);
    // Only load user-created posts from localStorage — no fake seeds
    const saved = localStorage.getItem('we_moments_posts_v2');
    if (saved) {
      try { setLocalPosts(JSON.parse(saved)); } catch { setLocalPosts([]); }
    } else {
      setLocalPosts([]);
    }
  }, [accessToken]);

  const savePostsToStorage = (updated: MomentPost[]) => {
    setLocalPosts(updated);
    localStorage.setItem('we_moments_posts_v2', JSON.stringify(updated));
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const parsedHashtags = hashtagInput
      ? hashtagInput.split(',').map((h) => (h.trim().startsWith('#') ? h.trim() : `#${h.trim()}`))
      : [];

    const newPost: MomentPost = {
      id: `p-${Date.now()}`,
      author: { displayName: user?.displayName || 'Explorer', username: user?.username || 'explorer' },
      content: newPostContent.trim(),
      createdAt: new Date().toISOString(),
      media: mediaUrl.trim() ? [{ url: mediaUrl.trim(), mimeType: 'image/jpeg' }] : undefined,
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      location: locationTag.trim() || undefined,
      hashtags: parsedHashtags,
      commentsList: [],
    };

    const updated = [newPost, ...localPosts];
    savePostsToStorage(updated);

    setNewPostContent('');
    setMediaUrl('');
    setLocationTag('');
    setHashtagInput('');
    setShowCompose(false);
  };

  const toggleLike = (postId: string) => {
    requireAuth(() => {
      const updated = localPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
          };
        }
        return p;
      });
      savePostsToStorage(updated);
    }, 'like moments');
  };

  const toggleBookmark = (postId: string) => {
    requireAuth(() => {
      const updated = localPosts.map((p) => {
        if (p.id === postId) {
          return { ...p, isBookmarked: !p.isBookmarked };
        }
        return p;
      });
      savePostsToStorage(updated);
    }, 'bookmark posts');
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    requireAuth(() => {
      const newComment = {
        id: `c-${Date.now()}`,
        author: user?.displayName || 'Explorer',
        text: commentText.trim(),
        time: 'Just now',
      };

      savePostsToStorage(localPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [...(p.commentsList || []), newComment],
          };
        }
        return p;
      }));
      setCommentText('');
    }, 'post comments');
  };

  const handleShare = (post: MomentPost) => {
    const text = `${post.author.displayName}: ${post.content}`;
    if (navigator.share) {
      navigator.share({ title: 'WeEverything Moment', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  };

  const getProcessedPosts = () => {
    let result = [...localPosts];
    if (subFilter === 'trending') result.sort((a, b) => b.likesCount - a.likesCount);
    else if (subFilter === 'latest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  };

  const processedPosts = getProcessedPosts();

  return (
    <div ref={containerRef} className="page-wrapper space-y-8">
      <AuthModal isOpen={authModalOpen} onClose={closeAuthModal} actionName={protectedActionName} />

      {/* ── Floating SaaS Header ── */}
      <div className="anime-stagger header-floating p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="section-label">SOCIAL STREAM</span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text)]">Moments Feed</h1>
          <p className="font-body text-xs mt-1 text-[var(--color-text-muted)]">
            Create posts, upload media, like, comment, bookmark and share moments
          </p>
        </div>
        <Button
          onClick={() => requireAuth(() => setShowCompose(true), 'create a new moment')}
          variant="primary"
          icon="add"
        >
          Share Moment
        </Button>
      </div>

      {/* Feed Tabs */}
      <div className="anime-stagger flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-[var(--color-border)]">
        <div className="flex rounded-xl p-1 glass-card border border-[var(--color-border)]">
          {(['discover', 'connections'] as FeedTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFeedTab(tab)}
              className={clsx(
                'px-5 py-2 rounded-lg font-mono text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer',
                feedTab === tab ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] shadow-sm' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              <span className="material-symbols-outlined text-base">
                {tab === 'discover' ? 'explore' : 'group'}
              </span>
              {tab === 'discover' ? 'Discover' : 'Connections'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {(['for-you', 'trending', 'latest'] as SubFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setSubFilter(f)}
              className={clsx(
                'px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer border',
                subFilter === f ? 'bg-[var(--color-primary-dim)] text-[var(--color-primary)] border-[rgba(223,255,0,0.3)]' : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              )}
            >
              {f === 'for-you' ? 'For You' : f === 'trending' ? 'Trending' : 'Latest'}
            </button>
          ))}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <Card variant="glass" className="glass-modal p-6 w-full max-w-lg space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
              <h3 className="font-display font-bold text-base text-[var(--color-text)]">Create New Moment</h3>
              <button onClick={() => setShowCompose(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind? Use #hashtags or @mentions..."
              className="input-neon h-28 resize-none font-mono text-xs"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Image URL (optional)..."
              />
              <Input
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                placeholder="Location (e.g. Mumbai)..."
              />
            </div>

            <Input
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              placeholder="Hashtags (comma-separated: tech, india)..."
            />

            <div className="flex justify-between items-center pt-2">
              <span className="font-mono text-[10px] text-[var(--color-text-muted)]">
                {newPostContent.length} characters
              </span>
              <div className="flex gap-3">
                <Button onClick={() => setShowCompose(false)} variant="ghost">Cancel</Button>
                <Button onClick={handleCreatePost} disabled={!newPostContent.trim()} variant="primary">
                  Post Moment
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Feed List or Empty State */}
      <div className="space-y-6">
        {processedPosts.length === 0 ? (
          <div className="anime-stagger flex flex-col items-center justify-center py-24 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[var(--color-primary-dim)] border border-[rgba(223,255,0,0.2)] flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-[var(--color-primary)]">auto_awesome</span>
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="font-display font-bold text-xl text-[var(--color-text)]">No moments yet</h2>
              <p className="font-body text-sm text-[var(--color-text-muted)]">
                Be the first to share a moment. Post updates, thoughts, and media to your feed.
              </p>
            </div>
            <Button
              onClick={() => requireAuth(() => setShowCompose(true), 'create a new moment')}
              variant="primary"
              icon="add"
            >
              Share Your First Moment
            </Button>
          </div>
        ) : (
          processedPosts.map((post) => (
            <Card key={post.id} variant="glass" className="anime-stagger p-6 space-y-4">
              {/* Author */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] font-mono font-bold flex items-center justify-center glow-neon">
                    {post.author.displayName[0]}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-[var(--color-text)]">{post.author.displayName}</h4>
                    <p className="font-mono text-[10px] text-[var(--color-text-muted)]">@{post.author.username} {post.location && `• ${post.location}`}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[var(--color-text-subtle)]">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              {/* Content */}
              <p className="font-body text-sm leading-relaxed text-[var(--color-text)]">{post.content}</p>

              {/* Media */}
              {post.media && post.media.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-[var(--color-border)] max-h-96">
                  <img src={post.media[0].url} alt="Post media" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Hashtags */}
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.hashtags.map((tag, i) => (
                    <span key={i} className="font-mono text-[10px] text-[var(--color-primary)] bg-[var(--color-primary-dim)] px-2 py-0.5 rounded-full border border-[rgba(223,255,0,0.2)]">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={clsx(
                      'flex items-center gap-1.5 font-mono text-xs font-bold transition-all cursor-pointer',
                      post.isLiked ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">{post.isLiked ? 'favorite' : 'favorite_border'}</span>
                    <span>{post.likesCount}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">chat_bubble</span>
                    <span>{post.commentsCount}</span>
                  </button>

                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                  </button>
                </div>

                <button
                  onClick={() => toggleBookmark(post.id)}
                  className={clsx(
                    'font-mono text-xs transition-all cursor-pointer',
                    post.isBookmarked ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  )}
                >
                  <span className="material-symbols-outlined text-lg">{post.isBookmarked ? 'bookmark' : 'bookmark_border'}</span>
                </button>
              </div>

              {/* Comments Drawer */}
              {activeCommentPostId === post.id && (
                <div className="pt-3 border-t border-[var(--color-border)] space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                    />
                    <Button onClick={() => handleAddComment(post.id)} variant="primary" size="sm">
                      Reply
                    </Button>
                  </div>

                  {post.commentsList && post.commentsList.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {post.commentsList.map((cm) => (
                        <div key={cm.id} className="p-3 bg-[var(--color-surface-dim)] rounded-xl border border-[var(--color-border)] font-mono text-xs">
                          <div className="flex justify-between text-[var(--color-text-muted)] mb-1">
                            <span className="font-bold text-[var(--color-primary)]">{cm.author}</span>
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
