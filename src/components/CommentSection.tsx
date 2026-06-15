import React, { useState } from 'react';
import { Comment } from '../types';
import { Send, LogIn, MessageSquare, Flame } from 'lucide-react';

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  isAuthenticated: boolean;
  onLoginClick: () => void;
}

export default function CommentSection({ comments, onAddComment, isAuthenticated, onLoginClick }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (err: any) {
      setError(err.message || 'Could not post your comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm text-left">
      <div className="flex items-center gap-1.5 mb-6">
        <MessageSquare className="w-5 h-5 text-slate-700" />
        <h3 className="text-lg font-bold text-slate-800">Comments ({comments.length})</h3>
      </div>

      {/* List comments recursively */}
      <div className="space-y-4 mb-8">
        {comments.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm text-slate-400">No comments on this article yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment, idx) => (
            <div
              key={comment.id || idx}
              className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 transition-all"
            >
              <div className="flex items-start gap-3">
                <img
                  src={comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'}
                  alt={comment.authorName}
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0"
                />
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-slate-800">{comment.authorName}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-blue-600 mb-2 font-bold uppercase tracking-wider">Contributor</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Interactive write area */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-2 mt-4">
          <div className="relative">
            <textarea
              rows={3}
              placeholder="What are your insights on this piece? Type them here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-rose-500 font-bold">{error}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Publishing...' : 'Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">Join the community conversation!</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Log in to comment, toggle publication reactions, and structure your personal profile details instantly.
          </p>
          <button
            onClick={onLoginClick}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In Now
          </button>
        </div>
      )}
    </div>
  );
}
