export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  avatarUrl: string;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML rich text
  featuredImageUrl: string;
  category: string; // category slug
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string; // color name identifier (e.g. 'tech', 'lifestyle')
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPosts: number;
  publishedCount: number;
  draftCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}
