import React from 'react';
import { Post } from '../types';
import CategoryBadge from './CategoryBadge';
import { Eye, Heart, MessageSquare, Clock } from 'lucide-react';

interface PostCardProps {
  key?: React.Key;
  post: any;
  onClick: () => void;
}

export default function PostCard({ post, onClick }: PostCardProps) {
  // Parse approximate read time (e.g. 1 min per 150 words)
  const plainText = (post.content || '').replace(/<[^>]*>/g, '');
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <div
      onClick={onClick}
      id={`post-card-${post.id}`}
      className="bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-lg hover:border-slate-300/60 active:translate-y-0 transition-all duration-300 cursor-pointer group h-full text-left"
    >
      <div>
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-slate-100">
          <img
            src={post.featuredImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80';
            }}
          />
          <div className="absolute top-3 left-3">
            <CategoryBadge category={post.category} />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {readTime} min read
          </span>
        </div>

        <h4 className="text-lg font-bold leading-tight line-clamp-2 text-slate-900 group-hover:text-blue-600 transition-colors mb-2 font-sans">
          {post.title}
        </h4>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-normal leading-relaxed">
          {post.excerpt}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'}
            alt={post.authorName}
            className="w-8 h-8 rounded-full border border-slate-250 object-cover"
          />
          <div className="text-left">
            <span className="text-xs font-bold block leading-none text-slate-800 group-hover:underline">{post.authorName}</span>
            <span className="text-[10px] text-slate-400">@{post.authorUsername}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1" title={`${post.views || 0} Views`}>
            <Eye className="w-3.5 h-3.5 text-slate-300" />
            {post.views || 0}
          </span>
          <span className={`flex items-center gap-1 ${post.isLiked ? 'text-rose-500 font-bold' : ''}`} title={`${post.likesCount || 0} Likes`}>
            <Heart className={`w-3.5 h-3.5 ${post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-300'}`} />
            {post.likesCount || 0}
          </span>
          <span className="flex items-center gap-1" title={`${post.commentsCount || 0} Comments`}>
            <MessageSquare className="w-3.5 h-3.5 text-slate-300" />
            {post.commentsCount || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
