import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Settings, 
  Layout, 
  Eye, 
  Heart, 
  ArrowLeft, 
  BookOpen, 
  Mail, 
  Edit, 
  Trash2, 
  Check, 
  CheckCircle, 
  Sparkles, 
  BarChart2, 
  X, 
  Activity, 
  MessageSquare,
  Bookmark,
  Calendar,
  AlertCircle
} from 'lucide-react';
import CategoryBadge from './components/CategoryBadge';
import PostCard from './components/PostCard';
import RichTextEditor from './components/RichTextEditor';
import CommentSection from './components/CommentSection';
import ConfirmModal from './components/ConfirmModal';
import { Post, UserProfile, Comment, DashboardStats } from './types';

export default function App() {
  // Navigation & State
  const [activeView, setActiveView] = useState<'home' | 'post-detail' | 'dashboard' | 'create-post' | 'edit-post' | 'admin'>('home');
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Admin State
  const [adminToken, setAdminToken] = useState<string | null>(localStorage.getItem('haxhub_admin_token'));
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [isAdminUsersLoading, setIsAdminUsersLoading] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('haxhub_token') || localStorage.getItem('insighthub_token'));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  
  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [signupAvatarUploading, setSignupAvatarUploading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard & Edit Post form state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('technology');
  const [formImage, setFormImage] = useState('');
  const [formStatus, setFormStatus] = useState<'published' | 'draft' | 'scheduled'>('published');
  const [scheduledAt, setScheduledAt] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [adminUserToDelete, setAdminUserToDelete] = useState<any | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Edit profile state
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Subscribing state
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [subscribedStatus, setSubscribedStatus] = useState(false);

  // Post Deletion Confirmation Modal
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  // Fetch initial posts and categories
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [selectedCategory, searchQuery]);

  // Fetch logged in user details if token exists
  useEffect(() => {
    if (token) {
      localStorage.setItem('haxhub_token', token);
      fetchCurrentUser();
      fetchDashboardStats();
    } else {
      localStorage.removeItem('haxhub_token');
      localStorage.removeItem('insighthub_token');
      setCurrentUser(null);
      setStats(null);
    }
  }, [token]);

  // Fetch individual post detailed state if selected
  useEffect(() => {
    if (selectedPostId) {
      fetchPostDetail(selectedPostId);
    }
  }, [selectedPostId]);

  // Hash routing synchronization
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/blog/')) {
        const slug = hash.replace('#/blog/', '');
        if (selectedPostId !== slug) {
          setSelectedPostId(slug);
        }
      } else if (hash === '#/dashboard') {
        setActiveView('dashboard');
      } else if (hash === '#/admin') {
        setActiveView('admin');
      } else if (hash === '#/home' || hash === '') {
        setActiveView('home');
        setSelectedPostId(null);
        setSelectedPost(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // trigger on initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedPostId]);

  // Sync admin users list when view becomes active
  useEffect(() => {
    if (activeView === 'admin' && adminToken) {
      fetchAdminUsers();
    }
  }, [activeView, adminToken]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPosts = async () => {
    try {
      let url = '/api/posts?';
      if (selectedCategory) {
        url += `category=${encodeURIComponent(selectedCategory)}&`;
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}&`;
      }
      // Pass authorization headers to get personalized "isLiked" hydration
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          // populate profile editing form
          setEditFullName(data.user.fullName);
          setEditBio(data.user.bio || '');
          setEditAvatar(data.user.avatarUrl || '');
          setEditUsername(data.user.username);
        } else {
          setToken(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboardStats = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPostDetail = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/posts/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSelectedPost(data);
        fetchComments(data.id);
        setActiveView('post-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- ADMINISTRATIVE FUNCTIONS ---
  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('haxhub_admin_token', data.token);
        setAdminToken(data.token);
        setAdminPassword('');
        fetchAdminUsers(data.token);
      } else {
        setAdminError(data.error || 'Password mismatch. Try again.');
      }
    } catch (err) {
      setAdminError('Could not contact admin auth gate.');
    }
  };

  const fetchAdminUsers = async (tokenOverride?: string) => {
    const activeAdminToken = tokenOverride || adminToken;
    if (!activeAdminToken) return;
    setIsAdminUsersLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${activeAdminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data);
        if (selectedAdminUser) {
          const fresh = data.find((u: any) => u.id === selectedAdminUser.id);
          if (fresh) {
            setSelectedAdminUser(fresh);
          } else {
            setSelectedAdminUser(null);
          }
        }
      } else {
        localStorage.removeItem('haxhub_admin_token');
        setAdminToken(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdminUsersLoading(false);
    }
  };

  const handleAdminBanToggle = async (userId: string, currentBan: boolean) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ ban: !currentBan })
      });
      if (res.ok) {
        fetchAdminUsers();
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to modify account state.');
      }
    } catch (err) {
      alert('Internal administrative error.');
    }
  };

  const handleAdminDeleteUser = async (userId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (res.ok) {
        setSelectedAdminUser(null);
        fetchAdminUsers();
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || 'Purging account failed.');
      }
    } catch (err) {
      alert('Internal administrative deletion error.');
    }
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('haxhub_admin_token');
    setAdminToken(null);
    setAdminUsers([]);
    setSelectedAdminUser(null);
    window.location.hash = '#/home';
  };

  // Auth mechanisms
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password) {
      setAuthError('Please fill out all credentials');
      return;
    }
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthModal(null);
        setUsername('');
        setPassword('');
        // Alert user
        fetchPosts();
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setAuthError('Backend servers temporarily busy.');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username || !password || !fullName) {
      setAuthError('Please provide username, full name and password.');
      return;
    }
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, fullName, password, bio, avatarUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthModal(null);
        setUsername('');
        setPassword('');
        setFullName('');
        setBio('');
        setAvatarUrl('');
        fetchPosts();
      } else {
        setAuthError(data.error || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Registration server unavailable.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    setStats(null);
    setActiveView('home');
    // refresh home list personalized likings
    setTimeout(() => {
      fetchPosts();
    }, 100);
  };

  // Comment submission
  const handleAddComment = async (content: string) => {
    if (!token || !selectedPost) return;
    const res = await fetch(`/api/posts/${selectedPost.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content })
    });
    if (res.ok) {
      await fetchComments(selectedPost.id);
      // update details counts
      fetchPostDetail(selectedPost.id);
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Failed to submit comment');
    }
  };

  // Like Toggle implementation
  const handleLikeToggle = async () => {
    if (!token) {
      setAuthModal('login');
      return;
    }
    if (!selectedPost) return;

    // Optimistic UI updates
    const currentlyLiked = selectedPost.isLiked;
    const offset = currentlyLiked ? -1 : 1;
    setSelectedPost({
      ...selectedPost,
      isLiked: !currentlyLiked,
      likesCount: Math.max(0, (selectedPost.likesCount || 0) + offset)
    });

    try {
      const response = await fetch(`/api/posts/${selectedPost.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Set actual received count
        setSelectedPost(prev => prev ? {
          ...prev,
          isLiked: data.isLiked,
          likesCount: data.likesCount
        }: null);
        fetchPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Profile configuration settings modifier
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setProfileSaveSuccess(false);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: editFullName,
          bio: editBio,
          avatarUrl: editAvatar,
          username: editUsername
        })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        setProfileSaveSuccess(true);
        fetchCurrentUser();
        fetchPosts();
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Could not save modifications');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Profile image upload directly via settings
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            base64: base64String
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setEditAvatar(data.url);
        } else {
          alert(data.error || 'Avatar upload failed');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    }
  };

  // Register image upload (for registration before logged in)
  const handleRegistrationImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignupAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload-public', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            base64: base64String
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setAvatarUrl(data.url);
        } else {
          alert(data.error || 'Avatar upload failed');
        }
        setSignupAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setSignupAvatarUploading(false);
    }
  };

  // Featured Image direct file upload for Write form
  const handlePostImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type,
            base64: base64String
          })
        });

        const data = await res.json();
        if (res.ok && data.url) {
          setFormImage(data.url);
        } else {
          alert('Failed to upload image asset');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD on Posts
  const initiateCreatePost = () => {
    if (!token) {
      setAuthModal('login');
      return;
    }
    setFormTitle('');
    setFormExcerpt('');
    setFormContent('');
    setFormCategory('technology');
    setFormImage(''); // Start empty as requested ("No image uploaded" text displays)
    setFormStatus('published');
    setScheduledAt('');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setFormError('');
    setActiveView('create-post');
  };

  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Please fulfill Title and Story Content fields');
      return;
    }

    setIsSubmitLoading(true);
    setFormError('');

    const finalCategory = (formCategory === 'custom' ? customCategoryInput : formCategory).trim().toLowerCase();
    if (!finalCategory) {
      setFormError('Please provide a category');
      setIsSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          excerpt: formExcerpt,
          content: formContent,
          featuredImageUrl: formImage,
          category: finalCategory,
          status: formStatus,
          scheduledAt: formStatus === 'scheduled' ? scheduledAt : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        fetchPosts();
        fetchCategories(); // dynamically reload categories to feature customized ones immediately
        fetchDashboardStats();
        setActiveView('dashboard');
      } else {
        setFormError(data.error || 'Failed to submit article');
      }
    } catch (err) {
      setFormError('Server is currently unresponsive');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const initiateEditPost = (post: any) => {
    setFormTitle(post.title);
    setFormExcerpt(post.excerpt);
    setFormContent(post.content);
    setFormImage(post.featuredImageUrl);
    setFormStatus(post.status);
    setScheduledAt(post.scheduledAt || '');
    
    // Check if category is standard or a custom one
    const standardCategories = ['technology', 'lifestyle', 'productivity', 'travel', 'personal-growth'];
    if (standardCategories.includes(post.category)) {
      setFormCategory(post.category);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setFormCategory('custom');
      setIsCustomCategory(true);
      setCustomCategoryInput(post.category);
    }

    setFormError('');
    setSelectedPostId(post.id);
    setActiveView('edit-post');
  };

  const handleEditPostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      setFormError('Fulfill Title and Story content fields required');
      return;
    }

    setIsSubmitLoading(true);
    setFormError('');

    const finalCategory = (formCategory === 'custom' ? customCategoryInput : formCategory).trim().toLowerCase();
    if (!finalCategory) {
      setFormError('Please provide a category');
      setIsSubmitLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/posts/${selectedPostId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle,
          excerpt: formExcerpt,
          content: formContent,
          featuredImageUrl: formImage,
          category: finalCategory,
          status: formStatus,
          scheduledAt: formStatus === 'scheduled' ? scheduledAt : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        fetchPosts();
        fetchCategories(); // dynamically reload categories to feature customized ones immediately
        fetchDashboardStats();
        setActiveView('dashboard');
      } else {
        setFormError(data.error || 'Failed to update publication');
      }
    } catch (err) {
      setFormError('Network communication error encountered');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPosts();
        fetchDashboardStats();
        if (activeView === 'post-detail') {
          setActiveView('home');
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete story');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Subscription placeholder mock triggers
  const handleNewsletterJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberEmail.trim() || !subscriberEmail.includes('@')) return;
    setSubscribedStatus(true);
    setTimeout(() => {
      setSubscriberEmail('');
    }, 2000);
  };

  // Find the principal "Featured Post" (let's pick the latest article with highest view metrics or simply the first created)
  const featuredPost = posts.find(p => p.status === 'published') || null;

  // Render main section according to active view
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-text relative">
      
      {/* Sticky Premium Corporate Headers */}
      <nav className="sticky top-0 h-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 z-40 transition-all duration-150">
        <div className="flex items-center gap-4 sm:gap-8">
          <span 
            onClick={() => { window.location.hash = '#/home'; setSelectedCategory(null); }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight cursor-pointer select-none font-sans hover:opacity-90 transition-opacity"
          >
            HAX<span className="text-blue-600">HUB</span>
          </span>
          
          {/* Slick Search Widget */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 gap-2 relative max-w-xs focus-within:bg-white focus-within:border-blue-500 transition-all">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Search articles, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400 bg-transparent w-44"
            />
            {searchQuery && (
              <X 
                className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-200 rounded-full p-0.5" 
                onClick={() => setSearchQuery('')}
              />
            )}
          </div>
        </div>

        {/* Global Nav links & Logged condition */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={() => { window.location.hash = '#/home'; setSelectedCategory(null); }}
            className={`hidden sm:inline-block text-xs font-semibold uppercase tracking-wider px-4 py-2 hover:bg-slate-100 rounded-xl transition-all ${activeView === 'home' ? 'text-blue-600 bg-blue-50/60 font-bold' : 'text-slate-600'}`}
          >
            Explore
          </button>
          
          {currentUser ? (
            <>
              <button 
                onClick={() => { window.location.hash = '#/dashboard'; }}
                className={`text-xs font-semibold uppercase tracking-wider px-3 sm:px-4 py-2 hover:bg-slate-100 rounded-xl transition-all ${activeView === 'dashboard' ? 'text-blue-600 bg-blue-50/60 font-bold' : 'text-slate-600'}`}
              >
                Dashboard
              </button>

              <button 
                onClick={initiateCreatePost}
                className="p-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Publish</span>
              </button>

              <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

              {/* Profile Selector Trigger */}
              <button 
                onClick={() => {
                  setShowProfileSettings(!showProfileSettings);
                  setActiveView('dashboard');
                }}
                className="w-9 h-9 rounded-full bg-cover bg-center border border-slate-300 cursor-pointer hover:border-blue-500 transition-all shrink-0 select-none relative group"
                style={{ backgroundImage: `url(${currentUser.avatarUrl})` }}
              >
                <span className="absolute -bottom-1 -right-1 bg-blue-600 border border-white rounded-full p-0.5">
                  <Settings className="w-2.5 h-2.5 text-white" />
                </span>
              </button>

              <button 
                onClick={handleLogout}
                title="Logout account"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setAuthModal('login'); setAuthError(''); }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold uppercase tracking-wider text-slate-600 hover:text-blue-600 transition-colors"
              >
                Sign In
              </button>
              
              <button 
                onClick={() => { setAuthModal('signup'); setAuthError(''); }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                Join
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile-only Search Bar (Sticky under header) */}
      <div className="p-3 bg-white border-b border-slate-200 md:hidden flex gap-2">
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 gap-2 relative">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs font-semibold text-slate-800 focus:outline-none placeholder-slate-400 bg-transparent w-full"
          />
          {searchQuery && (
            <X 
              className="w-3.5 h-3.5 text-slate-400" 
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
      </div>

      {/* MAIN CONTAINER STREAM */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        {activeView === 'home' ? (
          <div className="space-y-12">
            
            {/* Header intro tags if category selected */}
            {(selectedCategory || searchQuery) && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 capitalize">
                    {selectedCategory ? `${selectedCategory.replace('-', ' ')} Highlights` : 'Search Results'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {selectedCategory && `Handpicked stories and tech insights curated carefully in the ${selectedCategory} category.`}
                    {searchQuery && `Showing publications matching "${searchQuery}"`}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all self-start shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Premium Featured Hero block & Secondary Sidebar Grid */}
            {!selectedCategory && !searchQuery && featuredPost && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Hero featured card post (Left 2 cols) */}
                <div 
                  onClick={() => { window.location.hash = `#/blog/${featuredPost.slug}`; }}
                  className="lg:col-span-2 relative rounded-3xl overflow-hidden min-h-[380px] md:min-h-[460px] group cursor-pointer shadow-md hover:shadow-xl hover:translate-y-[-2px] transition-all bg-slate-950 flex flex-col justify-end"
                >
                  {/* Photo content background */}
                  <div className="absolute inset-0">
                    <img 
                      src={featuredPost.featuredImageUrl} 
                      alt="Featured visual representation" 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-101 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
                  </div>

                  <div className="absolute top-6 left-6 z-10">
                    <span className="px-5 py-1.5 rounded-full bg-blue-600 border border-white/20 text-xs font-bold uppercase text-white tracking-wider shadow-sm">
                      Featured Today
                    </span>
                  </div>

                  <div className="relative p-6 sm:p-10 text-left z-10 space-y-4">
                    <CategoryBadge category={featuredPost.category} />
                    
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight font-sans tracking-tight line-clamp-3 hover:text-blue-200 transition-colors">
                      {featuredPost.title}
                    </h1>
                    
                    <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl font-normal leading-relaxed">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center gap-4 pt-2">
                      <img 
                        src={featuredPost.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'} 
                        alt={featuredPost.authorName} 
                        className="w-10 h-10 rounded-full border border-slate-700 object-cover shadow-sm"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-white text-sm leading-none">{featuredPost.authorName}</p>
                        <p className="text-slate-400 mt-1 font-mono">
                          {new Date(featuredPost.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })} • {Math.max(1, Math.ceil((featuredPost.content || '').split(' ').length / 180))} min read
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar widgets (Right 1 col) */}
                <div className="flex flex-col gap-6">
                  
                  {/* Category cloud Box */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex-1 text-left">
                    <h3 className="text-xs font-bold uppercase tracking-[0.15em] mb-4 text-slate-400">TRENDING CHANNELS</h3>
                    <div className="space-y-3.5">
                      {[...categories]
                        .map(cat => {
                          const count = posts.filter(p => p.category.toLowerCase() === cat.slug.toLowerCase()).length;
                          return { ...cat, count };
                        })
                        .sort((a, b) => b.count - a.count)
                        .map((cat, idx) => {
                          let dotColor = 'bg-[#3B82F6]';
                          let hoverTextColor = 'hover:text-[#3B82F6]';
                          switch (cat.slug) {
                            case 'technology': dotColor = 'bg-blue-500'; hoverTextColor = 'hover:text-blue-500'; break;
                            case 'lifestyle': dotColor = 'bg-pink-500'; hoverTextColor = 'hover:text-pink-500'; break;
                            case 'productivity': dotColor = 'bg-[#F59E0B]'; hoverTextColor = 'hover:text-[#F59E0B]'; break;
                            case 'travel': dotColor = 'bg-[#10B981]'; hoverTextColor = 'hover:text-[#10B981]'; break;
                            case 'personal-growth': dotColor = 'bg-[#6366F1]'; hoverTextColor = 'hover:text-[#6366F1]'; break;
                            default: dotColor = 'bg-indigo-500'; hoverTextColor = 'hover:text-indigo-500'; break;
                          }

                          return (
                            <div 
                              key={cat.id || idx}
                              onClick={() => setSelectedCategory(cat.slug)}
                              className="flex items-center justify-between group cursor-pointer py-1"
                            >
                              <span className={`font-semibold text-sm transition-all group-hover:pl-2 text-slate-700 ${hoverTextColor} flex items-center gap-2`}>
                                <span>0{idx+1}</span>
                                <span className="capitalize">{cat.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-normal">({cat.count} post{cat.count !== 1 ? 's' : ''})</span>
                              </span>
                              <span className={`w-2.5 h-2.5 rounded-full ${dotColor} group-hover:scale-125 transition-transform`}></span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* High interest dynamic visual bulletin */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left shadow-sm flex flex-col justify-between text-white">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">INSIGHTS WEEKLY</p>
                      <h4 className="text-lg font-bold mt-2 leading-tight text-white font-sans">Join the smart movement</h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">Over 1,400 builders connected</p>
                    </div>

                    <form onSubmit={handleNewsletterJoin} className="mt-4">
                      {subscribedStatus ? (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          <span>Check your inbox today!</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input 
                            type="email" 
                            required
                            placeholder="Email address..." 
                            value={subscriberEmail}
                            onChange={(e) => setSubscriberEmail(e.target.value)}
                            className="w-full h-10 bg-slate-800 border border-slate-800 rounded-xl px-3 text-xs font-medium text-white focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            className="h-10 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                          >
                            Subscribe
                          </button>
                        </div>
                      )}
                    </form>
                  </div>

                </div>

              </div>
            )}

            {/* Standard grid flow of publications */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 text-left">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-800 mt-2">Recent Publications</h3>
                  <p className="text-xs text-slate-400">Dive into raw engineering perspectives and lifestyle architectures</p>
                </div>
                
                {/* Horizontal quick category select */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedCategory === null 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    All Topics
                  </button>
                  {categories.map((c, idx) => (
                    <button
                      key={c.id || idx}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        selectedCategory === c.slug 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16 bg-white border-2 border-dashed border-gray-300 rounded-3xl">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-lg font-bold text-gray-700">No matching articles found</p>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1">Try resetting your category highlights or search criteria to view latest drafts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post, idx) => (
                    <PostCard 
                      key={post.id || idx} 
                      post={post} 
                      onClick={() => { window.location.hash = `#/blog/${post.slug}`; }} 
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : activeView === 'post-detail' && selectedPost ? (
          
          /* VIEW DETAILED POST PAGE */
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            <div>
              <button
                onClick={() => {
                  window.location.hash = '#/home';
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm active:translate-y-[1px]"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                Back to explore
              </button>
            </div>

            {/* Poster Featured visual with premium simple shadow */}
            <div className="relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-900 group shadow-md">
              <img 
                src={selectedPost.featuredImageUrl} 
                alt={selectedPost.title} 
                className="w-full h-full object-cover opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-10 text-left">
                <CategoryBadge category={selectedPost.category} />
              </div>
            </div>

            {/* Main content body structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Write up details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-10 shadow-sm text-left">
                  
                  {/* Heading details */}
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 leading-tight mb-4">
                    {selectedPost.title}
                  </h1>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs font-mono text-slate-500 mb-8">
                    <div className="flex items-center gap-2">
                      <img 
                        src={selectedPost.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'} 
                        alt={selectedPost.authorName} 
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                      />
                      <div>
                        <p className="font-sans font-bold text-sm text-slate-800 hover:underline cursor-pointer">
                          {selectedPost.authorName}
                        </p>
                        <p className="text-[10px]">@{selectedPost.authorUsername}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(selectedPost.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {selectedPost.views || 1} reads
                      </span>
                    </div>
                  </div>

                  {/* Render HTML content securely */}
                  <article 
                    className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed font-normal space-y-6 text-base"
                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                  />

                  {/* Dynamic reaction interaction panel */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
                    
                    {/* Like Trigger with instantaneous state */}
                    <button
                      onClick={handleLikeToggle}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:translate-y-[1px] ${
                        selectedPost.isLiked 
                          ? 'bg-rose-500 text-white hover:bg-rose-600' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${selectedPost.isLiked ? 'fill-white stroke-none' : 'text-white'}`} />
                      {selectedPost.isLiked ? 'Liked!' : 'Like Story'} ({selectedPost.likesCount || 0})
                    </button>

                    {/* Ownership controls */}
                    {currentUser && currentUser.id === selectedPost.authorId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => initiateEditPost(selectedPost)}
                          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Modify
                        </button>
                        <button
                          onClick={() => setPostToDelete(selectedPost.id)}
                          className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}

                  </div>

                </div>

                {/* Commenting section block */}
                <CommentSection
                  comments={comments}
                  onAddComment={handleAddComment}
                  isAuthenticated={!!currentUser}
                  onLoginClick={() => setAuthModal('login')}
                />
              </div>

              {/* Sidebar metadata specifications */}
              <div className="space-y-6">
                
                {/* Author detail profile panel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600"></div>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={selectedPost.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'} 
                      alt={selectedPost.authorName} 
                      className="w-11 h-11 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-none">{selectedPost.authorName}</h4>
                      <p className="text-xs text-blue-600 font-mono mt-1">@{selectedPost.authorUsername}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal mb-4">
                    {selectedPost.authorBio || 'No writer biography updated yet. Follow me to receive insights directly.'}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between text-center">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Total views</p>
                      <p className="text-base font-extrabold text-slate-800 leading-none mt-1">{selectedPost.views || 1}</p>
                    </div>
                    <div className="w-[1px] bg-slate-200"></div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Likes gained</p>
                      <p className="text-base font-extrabold text-slate-800 leading-none mt-1">{selectedPost.likesCount || 0}</p>
                    </div>
                    <div className="w-[1px] bg-slate-200"></div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Critiques</p>
                      <p className="text-base font-extrabold text-slate-800 leading-none mt-1">{selectedPost.commentsCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Categories filtering block widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-left">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">ARTICLE CATEGORY</h3>
                  <div className="inline-block">
                    <CategoryBadge 
                      category={selectedPost.category} 
                      onClick={() => {
                        setSelectedCategory(selectedPost.category);
                        setActiveView('home');
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">Click to discover all works published under this subject category.</p>
                </div>

              </div>

            </div>

          </div>
        ) : activeView === 'dashboard' && currentUser ? (
          
          /* VIEW DASHBOARD PORTAL */
          <div className="space-y-8 animate-in fade-in duration-200 text-left">
            
            {/* Header metadata stats */}
            <div className="bg-white border-3 border-black rounded-3xl p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-3">
                <img 
                  src={currentUser.avatarUrl} 
                  alt={currentUser.fullName} 
                  className="w-16 h-16 rounded-full border-3 border-black object-cover shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                />
                <div>
                  <h2 className="text-2xl font-black font-serif text-black">{currentUser.fullName}</h2>
                  <p className="text-xs text-gray-500 font-mono">@{currentUser.username} • Account active since {new Date(currentUser.createdAt).toLocaleDateString('en-US', {month: 'short', year: 'numeric'})}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={initiateCreatePost}
                  className="px-5 py-2.5 bg-[#ffd600] text-black border-2 border-black text-xs font-black uppercase tracking-wider rounded-xl hover:scale-102 active:translate-y-[1px] flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Write New Story
                </button>
                <button
                  onClick={() => setShowProfileSettings(!showProfileSettings)}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl border-2 border-black transition-all flex items-center gap-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                    showProfileSettings 
                      ? 'bg-black text-white hover:bg-neutral-800' 
                      : 'bg-white text-black hover:bg-neutral-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  {showProfileSettings ? 'Hide Settings' : 'Edit Profile'}
                </button>
              </div>
            </div>

            {/* Profile Modification Area */}
            {showProfileSettings && (
              <form onSubmit={handleProfileUpdate} className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 text-left animate-in slide-in-from-top-4 duration-200">
                <div className="border-b-2 border-black pb-3">
                  <h3 className="text-lg font-black font-serif">Aesthetic Settings</h3>
                  <p className="text-xs text-gray-500">Decorate your avatar photograph, username, full author label, and biography specs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar upload base64 container */}
                  <div className="space-y-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">Author Avatar Image</label>
                    <div className="flex items-center gap-4">
                      <img 
                        src={editAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full border-2 border-black object-cover shadow-sm bg-gray-100"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80';
                        }}
                      />
                      <div className="flex-1">
                        <label className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-black cursor-pointer hover:bg-neutral-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-block">
                          Upload avatar photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                        </label>
                        <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPG up to 12MB. Auto-optimized instantly.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">Author Username</label>
                    <input 
                      type="text" 
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().trim())}
                      className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-black font-bold h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">Full Name Display Label</label>
                    <input 
                      type="text" 
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-black font-bold h-10"
                      required
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-black uppercase tracking-wider text-black">Creative Bibliography (Bio)</label>
                    <textarea 
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-black font-bold"
                    />
                  </div>
                </div>

                {profileSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border-2 border-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Aesthetic profile details saved successfully!</span>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black hover:bg-[#f23c13] border-2 border-black text-white text-xs font-black uppercase tracking-wider rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-102 transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Metric counters Bento style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Stories</span>
                <p className="text-3xl font-black text-black font-serif mt-1">{stats?.totalPosts || 0}</p>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">{stats?.publishedCount || 0} published • {stats?.draftCount || 0} drafts</div>
              </div>

              <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500">Reads Received</span>
                <p className="text-3xl font-black text-[#f23c13] font-serif mt-1">{stats?.totalViews || 0}</p>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">Accumulated across all works</div>
              </div>

              <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_#ffd600] text-left transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">Post Fans (Likes)</span>
                <p className="text-3xl font-black text-black font-serif mt-1">{stats?.totalLikes || 0}</p>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">Reactions toggle feedback</div>
              </div>

              <div className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_#10b981] text-left transition-all">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Opines (Comments)</span>
                <p className="text-3xl font-black text-black font-serif mt-1">{stats?.totalComments || 0}</p>
                <div className="text-[10px] text-gray-500 mt-2 font-mono">From verified thinkers</div>
              </div>

            </div>

            {/* List publications with actions */}
            <div className="bg-white border-3 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-2 border-black/15">
                <div>
                  <h3 className="text-xl font-black font-serif text-black">Manage Publications</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Control, edit, delete, or compile your work pieces seamlessly.</p>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setDashboardFilter('all')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold border ${dashboardFilter === 'all' ? 'bg-black text-white border-black' : 'bg-white hover:bg-slate-50 text-gray-700 border-gray-200'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setDashboardFilter('published')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold border ${dashboardFilter === 'published' ? 'bg-black text-white border-black' : 'bg-white hover:bg-slate-50 text-gray-700 border-gray-200'}`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setDashboardFilter('draft')}
                    className={`px-3 py-1 text-xs rounded-lg font-bold border ${dashboardFilter === 'draft' ? 'bg-black text-white border-black' : 'bg-white hover:bg-slate-50 text-gray-700 border-gray-200'}`}
                  >
                    Drafts
                  </button>
                </div>
              </div>

              {/* Grid / table view of user items */}
              {posts.filter(p => {
                if (p.authorId !== currentUser.id) return false;
                if (dashboardFilter === 'published') return p.status === 'published';
                if (dashboardFilter === 'draft') return p.status === 'draft';
                return true;
              }).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-600">No stories found under filter configuration</p>
                  <button
                    onClick={initiateCreatePost}
                    className="mt-3 text-xs text-[#f23c13] font-black uppercase tracking-wider border-b-2 border-black"
                  >
                    Start writing today
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts
                    .filter(p => {
                      if (p.authorId !== currentUser.id) return false;
                      if (dashboardFilter === 'published') return p.status === 'published';
                      if (dashboardFilter === 'draft') return p.status === 'draft';
                      return true;
                    })
                    .map((post, idx) => (
                      <div 
                        key={post.id || idx}
                        className="p-4 border-2 border-black rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/55 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <img 
                            src={post.featuredImageUrl} 
                            alt={post.title} 
                            className="w-16 h-12 rounded-xl object-cover border border-black/20 shrink-0"
                          />
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-black mr-2 ${
                              post.status === 'published' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {post.status}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">{post.category}</span>
                            <h4 
                              onClick={() => setSelectedPostId(post.slug)}
                              className="font-bold font-serif hover:text-[#f23c13] cursor-pointer text-sm sm:text-base mt-1 text-black"
                            >
                              {post.title}
                            </h4>
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            onClick={() => setSelectedPostId(post.slug)}
                            className="p-1.5 hover:bg-slate-100 border border-black/10 rounded-lg transition-all"
                            title="Read Story"
                          >
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => initiateEditPost(post)}
                            className="p-1.5 hover:bg-[#ffd600]/30 hover:border-black border border-black/10 rounded-lg transition-all"
                            title="Edit Story"
                          >
                            <Edit className="w-4 h-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => setPostToDelete(post.id)}
                            className="p-1.5 hover:bg-rose-50 hover:border-rose-400 border border-black/10 rounded-lg transition-all"
                            title="Delete Story"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        ) : (activeView === 'create-post' || activeView === 'edit-post') && currentUser ? (
          
          /* WRITE / MODIFY POST VIEW FORM */
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 text-left">
            <div>
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  setFormTitle('');
                  setFormContent('');
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-black rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                Back to dashboard
              </button>
            </div>

            <form 
              onSubmit={activeView === 'create-post' ? handleCreatePostSubmit : handleEditPostSubmit} 
              className="bg-white border-3 border-black rounded-3xl p-6 sm:p-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
            >
              <div className="border-b-2 border-black pb-4 text-left">
                <h2 className="text-2xl sm:text-3xl font-black font-serif text-black">
                  {activeView === 'create-post' ? 'Create a New Publication' : 'Modify Story Settings'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Structure, edit, color code guidelines and distribute your story on the hub.</p>
              </div>

              {formError && (
                <div className="bg-rose-50 p-4 border-2 border-rose-400 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-700">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-1.5 md:col-span-2 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Article Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Next.js 15: The New Era of React Frameworks..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-black rounded-xl p-3 text-xs text-black font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Featured Image</label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 border-2 border-black rounded-2xl">
                    {formImage ? (
                      <div className="relative shrink-0">
                        <img 
                          src={formImage} 
                          alt="Featured Preview" 
                          className="w-16 h-16 rounded-xl object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <button 
                          type="button" 
                          onClick={() => setFormImage('')}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-0.5 border border-black shadow-sm"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200 border-2 border-dashed border-slate-400 flex items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-slate-500 text-center px-1">No image uploaded</span>
                      </div>
                    )}
                    <div className="flex-1 space-y-1">
                      <label className="px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider rounded-xl border-2 border-black whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px]">
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handlePostImageUpload} />
                      </label>
                      <p className="text-[10px] text-gray-400 leading-none">Supports jpeg, png formats. Loads on publication listings.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Category Label</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormCategory(val);
                        if (val === 'custom') {
                          setIsCustomCategory(true);
                        } else {
                          setIsCustomCategory(false);
                        }
                      }}
                      className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-[#f23c13] font-bold h-10"
                    >
                      <option value="technology">Technology</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="productivity">Productivity</option>
                      <option value="travel">Travel</option>
                      <option value="personal-growth">Personal Growth</option>
                      <option value="custom">+ Create Custom Category...</option>
                    </select>

                    {isCustomCategory && (
                      <input 
                        type="text" 
                        required
                        placeholder="Type Custom Category Name..."
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-black font-bold h-10 animate-in slide-in-from-left-2 duration-150"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2 text-left">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Story Content (Supports HTML Formatting)</label>
                  <RichTextEditor 
                    value={formContent}
                    onChange={(html) => setFormContent(html)}
                    token={token || undefined}
                    placeholder="Enter paragraphs, list elements or photo insertions using our toolbar options..."
                  />
                </div>

                <div className="space-y-1.5 text-left md:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-black">Publication Status</label>
                  <div className="flex flex-wrap gap-5 p-3 bg-slate-50 border-2 border-black rounded-2xl w-full">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="post_status" 
                        value="published"
                        checked={formStatus === 'published'}
                        onChange={() => setFormStatus('published')}
                        className="accent-black h-4 w-4"
                      />
                      <span className="text-xs font-bold text-black uppercase">Publish Immediately</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="post_status" 
                        value="draft"
                        checked={formStatus === 'draft'}
                        onChange={() => setFormStatus('draft')}
                        className="accent-black h-4 w-4"
                      />
                      <span className="text-xs font-bold text-black uppercase">Save as Draft</span>
                    </label>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="post_status" 
                        value="scheduled"
                        checked={formStatus === 'scheduled'}
                        onChange={() => setFormStatus('scheduled')}
                        className="accent-black h-4 w-4"
                      />
                      <span className="text-xs font-bold text-black uppercase">Schedule Post</span>
                    </label>
                  </div>

                  {formStatus === 'scheduled' && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-150">
                      <label className="block text-[10px] font-black uppercase tracking-wide text-gray-500 mb-1">Select Schedule Date & Time (UTC)</label>
                      <input 
                        type="datetime-local"
                        required
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        className="w-full max-w-sm bg-slate-50 border-2 border-black rounded-xl p-2.5 text-xs text-black font-semibold h-10 shadow-sm focus:outline-none"
                      />
                    </div>
                  )}
                </div>

              </div>

              <div className="flex gap-3 justify-end pt-4 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('dashboard');
                    setFormTitle('');
                    setFormContent('');
                  }}
                  className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border-2 border-black rounded-full text-xs font-black uppercase text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="px-6 py-2.5 bg-black hover:bg-[#f23c13] border-2 border-black text-white text-xs font-black uppercase tracking-widest rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] disabled:bg-gray-400"
                >
                  {isSubmitLoading ? 'Saving...' : (activeView === 'create-post' ? 'Distribute Story' : 'Update Story')}
                </button>
              </div>

            </form>
          </div>
        ) : activeView === 'admin' ? (
          /* ADMINISTRATIVE VIEWS SYSTEM */
          <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 text-left">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 leading-none">Admin Console</h1>
                <p className="text-xs text-rose-600 mt-1.5 font-mono uppercase tracking-wider font-bold">🔒 RESTRICTED INTERNAL UTILITY PANEL</p>
              </div>
              {adminToken && (
                <button
                  onClick={handleAdminLogout}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  Exit Admin Session
                </button>
              )}
            </div>

            {!adminToken ? (
              /* Administrative credentials gate screen layout */
              <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-8 shadow-md text-left">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Settings className="w-6 h-6 animate-spin duration-1000" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Administrator Override</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Please enter the master administrative passkey to lock into full platform privileges.
                  </p>
                </div>

                {adminError && (
                  <div className="bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-600" />
                    <span>{adminError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminVerify} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 tracking-wider">Passkey overrides code</label>
                    <input 
                      type="password"
                      required
                      placeholder="e.g. HaxudioHub..."
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Authenticate Admin
                  </button>
                </form>
              </div>
            ) : (
              /* Administrative deep audit portal workspace panels */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                
                {/* User selection scroll container (left 5 columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                    
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus-within:bg-white focus-within:border-blue-500 transition-colors">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        placeholder="Search accounts name or username..."
                        value={adminSearchQuery}
                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                        className="text-xs font-medium text-slate-800 focus:outline-none placeholder-slate-400 bg-transparent w-full"
                      />
                    </div>

                    {isAdminUsersLoading ? (
                      <p className="text-xs text-slate-400 font-mono py-12 text-center">Interrogating user directories...</p>
                    ) : (
                      <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                        {adminUsers
                          .filter(u => {
                            const term = adminSearchQuery.toLowerCase();
                            return u.fullName.toLowerCase().includes(term) || u.username.toLowerCase().includes(term);
                          })
                          .map((u) => {
                            const isSelected = selectedAdminUser && selectedAdminUser.id === u.id;
                            return (
                              <div 
                                key={u.id}
                                onClick={() => setSelectedAdminUser(u)}
                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isSelected 
                                    ? 'border-blue-500 bg-blue-50/30' 
                                    : 'border-slate-100 hover:bg-slate-50/80 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img 
                                    src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=50&h=50&q=80'} 
                                    alt={u.fullName} 
                                    className="w-9 h-9 rounded-full border border-slate-200 object-cover shrink-0"
                                  />
                                  <div className="text-left min-w-0">
                                    <span className="text-xs font-bold block text-slate-800 truncate">{u.fullName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono block truncate">@{u.username}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {u.isBanned && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-[8px] font-mono text-rose-600 font-bold uppercase tracking-wider block">Banned</span>
                                  )}
                                  <span className="text-[10px] font-mono text-slate-500 block shrink-0">{u.postsCount || 0} posts</span>
                                </div>
                              </div>
                            );
                          })}
                        {adminUsers.length === 0 && (
                          <p className="text-xs text-slate-400 font-mono py-12 text-center">No community creators signed up yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit inspect details drawer interface (right 7 columns) */}
                <div className="lg:col-span-7">
                  {selectedAdminUser ? (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${selectedAdminUser.isBanned ? 'bg-rose-500' : 'bg-blue-600'}`}></div>

                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={selectedAdminUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'} 
                            alt={selectedAdminUser.fullName} 
                            className="w-14 h-14 rounded-full border border-slate-200 object-cover bg-slate-50 shrink-0"
                          />
                          <div className="text-left">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                              {selectedAdminUser.fullName}
                              {selectedAdminUser.isBanned && (
                                <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-full text-[9px] text-rose-600 font-bold uppercase tracking-widest font-mono">Suspended</span>
                              )}
                            </h3>
                            <p className="text-xs text-blue-600 font-mono leading-none mt-1">@{selectedAdminUser.username}</p>
                            <p className="text-[10px] text-slate-400 font-sans mt-2.5">Member since: {new Date(selectedAdminUser.createdAt).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left">
                        <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">BIOGRAPHY PROFILE</h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-normal">
                          {selectedAdminUser.bio || 'No bibliography statement updated by this creator.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-3">PLATFORM AUDIT METRICS</h4>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="block text-[8px] font-bold uppercase text-[#3B82F6] tracking-wider font-sans leading-none mb-1 text-slate-400">Publications</span>
                            <span className="text-lg font-extrabold text-slate-900 leading-none">{selectedAdminUser.postsCount || 0}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="block text-[8px] font-bold uppercase text-[#3B82F6] tracking-wider font-sans leading-none mb-1 text-slate-400">Comments Made</span>
                            <span className="text-lg font-extrabold text-slate-900 leading-none">{selectedAdminUser.commentsCount || 0}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="block text-[8px] font-bold uppercase text-[#3B82F6] tracking-wider font-sans leading-none mb-1 text-slate-400">Views Earned</span>
                            <span className="text-lg font-extrabold text-slate-900 leading-none">{selectedAdminUser.viewsReceived || 0}</span>
                          </div>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                            <span className="block text-[8px] font-bold uppercase text-[#3B82F6] tracking-wider font-sans leading-none mb-1 text-slate-400">Likes Gained</span>
                            <span className="text-lg font-extrabold text-slate-900 leading-none">{selectedAdminUser.likesReceived || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-slate-100">
                        <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-3">ADMINISTRATIVE ACTION CENTER</h4>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                          <button 
                            onClick={() => handleAdminBanToggle(selectedAdminUser.id, !!selectedAdminUser.isBanned)}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                              selectedAdminUser.isBanned 
                                ? 'bg-amber-500 hover:bg-amber-600 text-white font-bold' 
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {selectedAdminUser.isBanned ? 'Unban User Account' : 'Suspend / Ban Account'}
                          </button>

                          <button 
                            onClick={() => setAdminUserToDelete(selectedAdminUser)}
                            className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            Delete Account Completely
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-2.5 leading-relaxed">
                          * WARNING: Deleting an account is irreversible. It completely wipes their profile details, and purges any articles and critiques they wrote from the database. Suspension disables authorization context dynamically.
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full min-h-[360px]">
                      <Settings className="w-10 h-10 text-slate-300 animate-pulse mb-3" />
                      <h3 className="text-sm font-bold text-slate-800">No Target Specified</h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                        Select any registered creator account from the directory list on the left to scrutinize biography details, audit stats, toggle suspensions, or completely purge their data.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        ) : null}

      </main>

      {/* FOOTER SYSTEM */}
      <footer className="bg-slate-900 text-slate-400 py-12 shrink-0 text-left relative z-20 mt-12">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-white font-sans">
              HAX<span className="text-blue-500">HUB</span>
            </span>
          </div>
          
          <div className="flex items-center gap-6 text-xs font-semibold">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a 
              href="#/admin" 
              className="text-slate-500 hover:text-white hover:underline transition-colors flex items-center gap-1 font-mono uppercase text-[10px]"
            >
              🔒 Admin Panel
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 mt-6 pt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 font-medium">
          © 2026 Hax Hub. Full stack editorial engine hosted safely under production sandbox. Use of this platform represents full agreement to editorial guidelines.
        </div>
      </footer>

      {/* MODAL AUTHENTICATION Sign-In / Sign-Up templates */}
      {authModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
            
            <button
              onClick={() => { setAuthModal(null); setAuthError(''); }}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              {authModal === 'login' ? 'Hax Hub Access' : 'Create Credentials'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-medium leading-relaxed">
              {authModal === 'login' ? 'Sign in using your account identifiers for the full blogging suite.' : 'Sign up to write drafts, submit comments, and toggle community reactions.'}
            </p>

            {authError && (
              <div className="bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={authModal === 'login' ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
              
              {authModal === 'signup' && (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Mitchell"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600 tracking-wider">Username</label>
                <input
                  type="text"
                  required
                  placeholder="alice_tech"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase text-slate-600 tracking-wider">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {authModal === 'signup' && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase text-slate-600 tracking-wider">Biography (Bio)</label>
                    <textarea
                      placeholder="Tell the hub readers about your creative goals..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-700 tracking-wider">Avatar Picture Profile</label>
                    <div className="flex items-center gap-3">
                      <img 
                        src={avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'} 
                        alt="Avatar Upload Preview" 
                        className="w-10 h-10 rounded-full border border-slate-200 object-cover bg-slate-50 shrink-0"
                      />
                      <div className="flex-grow">
                        <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-colors inline-block whitespace-nowrap shadow-sm">
                          {signupAvatarUploading ? 'Uploading...' : 'Upload Image'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleRegistrationImageUpload} 
                            disabled={signupAvatarUploading}
                          />
                        </label>
                        <p className="text-[9px] text-slate-400 mt-1 leading-snug">Guide: Maintain a 1:1 aspect ratio layout (square image).</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={signupAvatarUploading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer mt-2 shadow-sm"
              >
                {authModal === 'login' ? 'Authenticate Account' : 'Establish Creator Status'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              {authModal === 'login' ? (
                <p className="text-xs text-slate-500 font-semibold">
                  New to Hax Hub?{' '}
                  <span 
                    onClick={() => { setAuthModal('signup'); setAuthError(''); }}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Open account now
                  </span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 font-semibold">
                  Already possess credentials?{' '}
                  <span 
                    onClick={() => { setAuthModal('login'); setAuthError(''); }}
                    className="text-blue-600 cursor-pointer hover:underline"
                  >
                    Authenticate here
                  </span>
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* CONFIRM DELETION DIALOGUE */}
      <ConfirmModal
        isOpen={postToDelete !== null}
        onClose={() => setPostToDelete(null)}
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
          }
        }}
        title="Delete Story Forever"
        message="Are you absolutely sure you want to delete this publication? This action is high-impact, permanent, and will completely clear the story as well as any associated verified opinions and user reaction records immediately from our databox."
      />

      {/* CONFIRM ADMIN USER DELETION DIALOGUE */}
      <ConfirmModal
        isOpen={adminUserToDelete !== null}
        onClose={() => setAdminUserToDelete(null)}
        onConfirm={async () => {
          if (adminUserToDelete) {
            await handleAdminDeleteUser(adminUserToDelete.id);
            setAdminUserToDelete(null);
          }
        }}
        title="Purge User Account Forever"
        confirmText="Purge Creator"
        message={`Are you absolutely certain you want to delete ${adminUserToDelete?.fullName || 'this user'}? This will completely purge their profile, written posts, critiques/comments, and community reactions on Hax Hub immediately. This action is terminal and irreversible.`}
      />

    </div>
  );
}
