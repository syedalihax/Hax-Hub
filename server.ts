import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { UserProfile, Post, Comment, Like, Category } from './src/types';

// Initialize folders and seed files
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const POSTS_FILE = path.join(DATA_DIR, 'posts.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Session Store mapping Tokens to User IDs
const SESSIONS: Record<string, string> = {};

// Helper read/write files safely
function readJSON<T>(file: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultValue;
  }
}

function writeJSON<T>(file: string, data: T): void {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
  }
}

// User schema including password hashes (or clear passwords for simple robust platform)
interface UserRecord extends UserProfile {
  passwordHash: string;
  isBanned?: boolean;
}

// Initial Data seeds
const SEED_USERS: UserRecord[] = [
  {
    id: 'user-alice',
    username: 'alice_tech',
    fullName: 'Alice Peterson',
    bio: 'Tech journalist, lead UI developer, and builder of modern full-stack systems. Writing about web architecture and future AI integrations.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: new Date('2026-01-10T12:00:00Z').toISOString(),
    passwordHash: 'password123'
  },
  {
    id: 'user-marcus',
    username: 'marcus_vance',
    fullName: 'Marcus Aurelius Vance',
    bio: 'Productivity coach, minimalist, and travel writer. Helping creatives structure their morning workflows and travel light across the globe.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    createdAt: new Date('2026-02-15T09:30:00Z').toISOString(),
    passwordHash: 'password123'
  }
];

const SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    title: 'The Future of Web Development: Speed, Hydration, and the Rise of Island Architectures',
    slug: 'future-of-web-dev-island-architectures',
    excerpt: 'Frontends are evolving. Discover how partial hydration, server components, and islands are restoring speed to a bloated, JavaScript-weary web.',
    category: 'technology',
    featuredImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>The JavaScript Inflation Crisis</h2>
      <p>For the past decade, web development has embraced monolithic client-side Single Page Applications. We bundled massive JavaScript runtimes, shipped them to mobile browsers over weak cellular connections, and wondered why Web Vitals painted such a sluggish portrait. First Input Delay crumbled under the weight of main-thread compilation, and cumulative layout shifts became the norm.</p>
      
      <blockquote>"Islands of interactivity surrounded by a sea of fast-rendering, responsive static HTML. That is the philosophy changes are aligning. Web architecture has come full circle."</blockquote>
      
      <h2>What is an Island Architecture?</h2>
      <p>In traditional React or Vue configurations, hydration is "all or nothing." The entire screen is parsed into a virtual DOM, and listener attachments take place from top to bottom. In an Island Architecture, the document remains pure static HTML except for the designated dynamic blocks—the "islands." This partial hydration saves dozens of milliseconds of parse time and renders pages instantly.</p>
      
      <h3>Key Advantages:</h3>
      <ul>
        <li><strong>Sub-second core loading:</strong> Static elements contain zero overhead, improving SEO scores immediately.</li>
        <li><strong>Micro-interactive modules:</strong> A shopping cart or search bar becomes its own individual bundle, completely decoupled from steady editorial grids.</li>
        <li><strong>Reduced battery drain:</strong> CPU-bound browser processes decline dramatically on underpowered tablets and phones.</li>
      </ul>
      
      <h2>Moving Ahead Boldly</h2>
      <p>As frameworks like Astro, Fresh, and full-stack islands mature, standard developer workflows will transition from heavy client-side-first patterns to lightweight server-side generation augmented by localized, hot interactive targets. Developers who prioritize payload efficiency are already winning the search engine competition. The future is light, clean, and highly responsive.</p>
    `,
    authorId: 'user-alice',
    status: 'published',
    createdAt: new Date('2026-06-11T14:20:00Z').toISOString(),
    updatedAt: new Date('2026-06-11T14:20:00Z').toISOString(),
    views: 124
  },
  {
    id: 'post-2',
    title: 'The Art of Digital Focus: Deep Work Habits for Modern Creatives',
    slug: 'art-of-digital-focus-deep-work',
    excerpt: 'In an era of endless push notifications, focus has become a rare superpower. Here is the step-by-step cognitive blueprint to safeguard your creative flow state.',
    category: 'productivity',
    featuredImageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>The Attention Economy vs. Your Brain</h2>
      <p>Every app you install is designed by teams of behavioral psychologists aiming to harvest your attention. Your notification bar is a direct tap to your dopamine receptors. The result is a fragmented mental state where focusing for more than ten minutes consecutively feels like an uphill struggle.</p>
      
      <h2>The Core Principles of Cognitive Guardrails</h2>
      <p>To cultivate true focus, you must transition from reactive task-switching to deliberate schedules. Here are the core pillars used by elite contributors:</p>
      
      <ul>
        <li><strong>Deep Work Blocks:</strong> Carve out 90-minute blocks where your phone is either off or locked in another room. The human brain requires roughly 20 minutes of continuous focus just to reach proper flow state.</li>
        <li><strong>Task Batching:</strong> Respond to emails, update team boards, and process chat logs strictly during pre-allocated slots (e.g., 11:30 AM and 4:30 PM). Never keep communication tabs nested alongside your core IDE or canvas.</li>
        <li><strong>Theme Days:</strong> Allocate entire days to specific tasks. For example, "Tuesday for deep engineering, Thursday for content creation." This eliminates context-switching latency.</li>
      </ul>

      <blockquote>"Your mind is for having ideas, not for holding them. Decluttering physical and digital spaces acts as an immediate force-multiplier on cognitive clarity."</blockquote>

      <h2>Designing a Distraction-Free Workspace</h2>
      <p>Audit your screen right now. If your desktop is riddled with dynamic widgets, unread icons, and cluttered paths, you are bleeding memory cycles. Switch to a single display, run apps in full-screen mode, and style your background with dark, calming off-whites or charcoal grays. Give your eyes a unified physical target. You will notice immediate differences in your creative execution speed.</p>
    `,
    authorId: 'user-marcus',
    status: 'published',
    createdAt: new Date('2026-06-12T08:15:00Z').toISOString(),
    updatedAt: new Date('2026-06-12T09:00:00Z').toISOString(),
    views: 89
  },
  {
    id: 'post-3',
    title: 'Digital Minimalism: How I Reclaimed 25 Hours of My Life Every Week',
    slug: 'digital-minimalism-reclaimed-hours',
    excerpt: 'Unsubscribe, uninstall, and unplug. Here is my personal journey of stripping down to the digital essentials and finding extreme clarity in the quiet space.',
    category: 'lifestyle',
    featuredImageUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>A Saturday Morning Wake-Up Call</h2>
      <p>I woke up, scrolled through microblog feeds for 45 minutes, opened video portals, checked emails, and felt exhausted before my feet even touched the bedroom rug. This was my baseline pattern. I was connected to everything and centered to nothing. I decided to try a radical experiment: a 30-day digital detox.</p>
      
      <h2>The Hard Cut</h2>
      <p>During the first week, the Phantom Vibration Syndrome was real. I would reach for my front pocket every five minutes, expecting a beep or buzz in the margin. But as the silence set in, something beautiful happened. I read books again. I walked without headphones. I listened to my kitchen fill up with actual sounds.</p>
      
      <h3>The Trim-Down Strategies:</h3>
      <ul>
        <li><strong>Single-purpose devices:</strong> I converted an old iPad into a dedicated reading device with all network functions disabled. No browsers, no workspaces, just e-books.</li>
        <li><strong>The 7-Day Waitlist:</strong> When I feel like installing a new application or subscribing to a service, I wait exactly one week. In 90% of cases, the desire fades entirely.</li>
        <li><strong>Greyscale Mode:</strong> Switching my phone display to monochromatic greyscale completely eliminated its visual appeal, turning a slots machine into a boring utility panel.</li>
      </ul>

      <p>The result of these changes? An extra 25 hours per week of undisturbed creation and offline presence. Digital minimalism isn't about avoiding technology—it's about keeping it firmly in its place as a tool rather than a master.</p>
    `,
    authorId: 'user-marcus',
    status: 'published',
    createdAt: new Date('2026-06-09T18:45:00Z').toISOString(),
    updatedAt: new Date('2026-06-09T18:45:00Z').toISOString(),
    views: 142
  },
  {
    id: 'post-4',
    title: 'Tokyo on a Budget: The Ultimate Guide to Affordable Wonder in Japan',
    slug: 'tokyo-on-a-budget-affordable-travel',
    excerpt: 'Think Tokyo is impossibly expensive? From hidden 500-yen ramen bars to beautiful quiet suburban shrines, here is how to dive into the neon capital savefully.',
    category: 'travel',
    featuredImageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>The Myriad Myths of Tokyo Budgets</h2>
      <p>Tokyo ranks high on international index boards, generating the illusion that travel there requires a massive bank balance. But beneath the luxury tower bars and Ginza highhouses lies an wonderfully affordable city built for budget-conscious locals. Here is how to experience it deeply without spending excessively.</p>
      
      <h2>Suburban Sanctuaries and Free Panoramas</h2>
      <p>You do not need to pay premium observation fees to see Tokyo from above. The Tokyo Metropolitan Government Building in Shinjuku offers stunning 45th-floor observation platforms completely free of charge. On clear crisp days, you can even spot Mount Fuji framing the western horizon.</p>

      <blockquote>"Tokyo is a city of concentric circles. Leave the central hubs of Shibuya and Roppongi, and you will find tranquil neighborhoods filled with cobblestone streets, neighborhood tofu shops, and free temples."</blockquote>
      
      <h2>Eating Like a King for Under 1000 Yen</h2>
      <p>Gourmet food in Tokyo does not carry structural premiums. Try eating at Tachigui (stand-and-eat) soba shops, local ramen shops using automated ticket machines, and fresh conveyor-belt sushi bars. Additionally, Tokyo’s massive convenience stores (Seven-Eleven, FamilyMart, Lawson) stock world-class bento sets, sando sandwiches, and hot snacks prepared fresh hourly for a fraction of restaurant prices.</p>
      
      <h3>Top Budget Travel Rules:</h3>
      <ul>
        <li><strong>Get the Tokyo Subway Ticket:</strong> Purchase the 24, 48, or 72-hour metro passes. They offer unlimited transport across major subway lines for cheap.</li>
        <li><strong>Audit the Depachika:</strong> Department store basements yield amazing, high-end food discounts starting at 7:30 PM as vendors clear out fresh stock.</li>
        <li><strong>Stay in Yanaka or Koenji:</strong> These older neighborhoods offer incredibly charming residential hostels, traditional shared rooms, and unmatched local authenticity.</li>
      </ul>
    `,
    authorId: 'user-marcus',
    status: 'published',
    createdAt: new Date('2026-06-05T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-05T10:04:00Z').toISOString(),
    views: 205
  },
  {
    id: 'post-5',
    title: 'From Impostor to Leader: Overcoming Self-Doubt in Tech Workplaces',
    slug: 'from-impostor-to-leader-personal-growth',
    excerpt: 'Impostor syndrome isn’t a personal defect—it is a logical byproduct of rapid growth. Learn how to transform internal friction into constructive courage.',
    category: 'personal-growth',
    featuredImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>The Silence of Shared Insecurity</h2>
      <p>You sit in a room with twelve engineers, managers, or designers, and a creeping thought sets in: <em>"Any second now, they are going to realize I am just winging it."</em> This feeling is so pervasive in modern knowledge work that it represents a silent industry epidemic. Impostor syndrome impacts up to 70% of high achievers during their careers.</p>
      
      <h2>Reframing the Friction</h2>
      <p>Impostor syndrome actually carries an underlying signal: you have pushed past your boundary of comfort. You are dealing with complex challenges, and your brain is struggling to reconcile the sudden growth. The moment you feel like you know everything, you have likely stopped exploring. Self-doubt is simply proof of ambition.</p>
      
      <h3>Practical Reframing Frameworks:</h3>
      <ul>
        <li><strong>The "Wipe Out" Log:</strong> Keep a personal document listing your actual, concrete outputs, resolved bugs, and helpful collaborations. When self-doubt peaks, look at the receipts. Memory is extremely subjective; facts are immutable.</li>
        <li><strong>Switch "I Know" to "I Can Learn":</strong> No one knows the entire landscape of modern technology stacks. Stop trying to look like an all-knowing oracle. Replace it with the confidence of an agile investigator.</li>
        <li><strong>Find a Mentor, Be a Mentor:</strong> Helping junior contributors will trigger the realization of how far you’ve actually traveled. Simultaneously, sharing vulnerabilities with seniors demystifies their status.</li>
      </ul>

      <blockquote>"Confidence is not the absence of fear or uncertainty. It is simply the decision that something else is more important than that fear."</blockquote>

      <h2>Building a Creative Safe-Harbor</h2>
      <p>Growth is a series of clumsy first drafts. Let go of the pressure to be flawless from day one. When you permit yourself to ask silly questions, you unlock rapid skill progression and earn the profound respect of teammates who were too afraid to ask themselves.</p>
    `,
    authorId: 'user-alice',
    status: 'published',
    createdAt: new Date('2026-06-01T15:30:00Z').toISOString(),
    updatedAt: new Date('2026-06-01T15:35:00Z').toISOString(),
    views: 112
  },
  {
    id: 'post-6',
    title: 'AI Tools in Action: A Practical Guide for Modern Creatives and Engineers',
    slug: 'ai-tools-practical-creative-guide',
    excerpt: 'Moving past the chatbot trend. Explore how to integrate advanced LLMs directly into your active coding, composition, and layout pipeline.',
    category: 'technology',
    featuredImageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80',
    content: `
      <h2>Beyond the Chat Window</h2>
      <p>Most people use generative models as lookup encyclopedias or basic spelling checkers. But the real leverage comes from using models to bridge domains, transform file formats, and generate design systems within high-performance dev sandboxes.</p>
      
      <h2>Creating a Hybrid Workspace</h2>
      <p>In our layout builds, we use AI to stub complex data models, produce sample metadata, and test edge conditions. Here's how to structure a productive daily routine:</p>
      
      <ul>
        <li><strong>Rapid Prototyping:</strong> Use models to sketch interfaces in flat Tailwind before translating them into component code. This dramatically cuts design cycle times.</li>
        <li><strong>Context Expansion:</strong> Instead of searching forums for hours, pass your localized configuration, error trace, and framework target to the AI for a precise contextual remedy.</li>
        <li><strong>Code Readability Refactors:</strong> Pass complex legacy code and request: "Break this monolithic function into modular files and declare types early."</li>
      </ul>

      <p>The core skill of the 2026 developer is not memorizing syntax indices, but mastering context assembly. Let the machine execute structural heavy-lifting so you can focus strictly on architecture, typography, and human delight.</p>
    `,
    authorId: 'user-alice',
    status: 'published',
    createdAt: new Date('2026-06-13T11:00:00Z').toISOString(),
    updatedAt: new Date('2026-06-13T11:05:00Z').toISOString(),
    views: 156
  }
];

const SEED_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    authorId: 'user-marcus',
    authorName: 'Marcus Aurelius Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Brilliant article, Alice! Island architecture has been a game-changer for my travel blog site too. The mobile speed improvement is night and day.',
    createdAt: new Date('2026-06-11T16:00:00Z').toISOString()
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    authorId: 'user-alice',
    authorName: 'Alice Peterson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Absolutely! Glad you saw immediate impacts Marcus. Shifting static grids off the JS main thread is the best thing web builders can do right now.',
    createdAt: new Date('2026-06-11T17:15:00Z').toISOString()
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    authorId: 'user-alice',
    authorName: 'Alice Peterson',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Switching my phone display to greyscale mode after reading this today. The sensory overstimulation is real, and we need visual boundaries. Thanks for the tip!',
    createdAt: new Date('2026-06-12T10:30:00Z').toISOString()
  }
];

const SEED_LIKES: Like[] = [
  { id: 'like-1', postId: 'post-1', userId: 'user-marcus', createdAt: new Date('2026-06-11T15:30:00Z').toISOString() },
  { id: 'like-2', postId: 'post-2', userId: 'user-alice', createdAt: new Date('2026-06-12T09:10:00Z').toISOString() }
];

// Initialize DB Files if empty
readJSON<UserRecord[]>(USERS_FILE, SEED_USERS);
readJSON<Post[]>(POSTS_FILE, SEED_POSTS);
readJSON<Comment[]>(COMMENTS_FILE, SEED_COMMENTS);
readJSON<Like[]>(LIKES_FILE, SEED_LIKES);

const loadedSessions = readJSON<Record<string, string>>(SESSIONS_FILE, {});
Object.assign(SESSIONS, loadedSessions);

const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Technology', slug: 'technology', color: 'technology' },
  { id: 'cat-2', name: 'Lifestyle', slug: 'lifestyle', color: 'lifestyle' },
  { id: 'cat-3', name: 'Productivity', slug: 'productivity', color: 'productivity' },
  { id: 'cat-4', name: 'Travel', slug: 'travel', color: 'travel' },
  { id: 'cat-5', name: 'Personal Growth', slug: 'personal-growth', color: 'personal-growth' }
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Middleware to authenticate user via token
  const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.userId = null;
      return next();
    }
    const token = authHeader.substring(7);
    const userId = SESSIONS[token];
    if (userId) {
      // Check if user is banned
      const users = readJSON<any[]>(USERS_FILE, []);
      const user = users.find(u => u.id === userId);
      if (user && user.isBanned) {
        req.userId = null;
        return next();
      }
    }
    req.userId = userId || null;
    next();
  };

  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  };

  app.use(authMiddleware);

  // Serve static uploads
  app.use('/uploads', express.static(UPLOADS_DIR));

  // --- API ROUTES ---

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { username, fullName, password, bio, avatarUrl } = req.body;
    if (!username || !fullName || !password) {
      return res.status(400).json({ error: 'Username, full name and password are required' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const users = readJSON<UserRecord[]>(USERS_FILE, []);

    if (users.some(u => u.username === trimmedUsername)) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const newUser: UserRecord = {
      id: `user-${Date.now()}`,
      username: trimmedUsername,
      fullName: fullName.trim(),
      bio: (bio || '').trim(),
      avatarUrl: avatarUrl || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80`,
      createdAt: new Date().toISOString(),
      passwordHash: password // simple plain comparison for robust prototyping
    };

    users.push(newUser);
    writeJSON(USERS_FILE, users);

    // Create session token
    const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
    SESSIONS[token] = newUser.id;
    writeJSON(SESSIONS_FILE, SESSIONS);

    // returning UserProfile + token
    const { passwordHash, ...profile } = newUser;
    res.status(201).json({ user: profile, token });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const trimmedUsername = username.trim().toLowerCase();
    const users = readJSON<UserRecord[]>(USERS_FILE, []);

    const user = users.find(u => u.username === trimmedUsername);
    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned from Hax Hub. Please contact support.' });
    }

    const token = `token-${Math.random().toString(36).substring(2)}-${Date.now()}`;
    SESSIONS[token] = user.id;
    writeJSON(SESSIONS_FILE, SESSIONS);

    const { passwordHash, ...profile } = user;
    res.json({ user: profile, token });
  });

  // Auth: Current User Info
  app.get('/api/auth/me', (req: any, res) => {
    if (!req.userId) {
      return res.json({ user: null });
    }
    const users = readJSON<UserRecord[]>(USERS_FILE, []);
    const user = users.find(u => u.id === req.userId);
    if (!user) {
      return res.json({ user: null });
    }
    const { passwordHash, ...profile } = user;
    res.json({ user: profile });
  });

  // Auth: Update Profile Settings
  app.put('/api/auth/profile', requireAuth, (req: any, res) => {
    const { fullName, bio, avatarUrl, username } = req.body;
    const users = readJSON<UserRecord[]>(USERS_FILE, []);
    const userIdx = users.findIndex(u => u.id === req.userId);

    if (userIdx === -1) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // If username changes, verify uniqueness
    if (username) {
      const trimmedU = username.trim().toLowerCase();
      if (trimmedU !== users[userIdx].username) {
        if (users.some(u => u.username === trimmedU)) {
          return res.status(400).json({ error: 'Username is already taken' });
        }
        users[userIdx].username = trimmedU;
      }
    }

    if (fullName !== undefined) {
      users[userIdx].fullName = fullName.trim();
    }
    if (bio !== undefined) {
      users[userIdx].bio = bio.trim();
    }
    if (avatarUrl !== undefined) {
      users[userIdx].avatarUrl = avatarUrl;
    }

    writeJSON(USERS_FILE, users);

    // Update comment cache labels for this author to make avatar and name update live across comments
    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    let commentsUpdated = false;
    comments.forEach(c => {
      if (c.authorId === req.userId) {
        c.authorName = users[userIdx].fullName;
        c.authorAvatar = users[userIdx].avatarUrl;
        commentsUpdated = true;
      }
    });
    if (commentsUpdated) {
      writeJSON(COMMENTS_FILE, comments);
    }

    const { passwordHash, ...profile } = users[userIdx];
    res.json({ user: profile });
  });

  // Categories API list
  app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
  });

  // Get Author Public Profile
  app.get('/api/users/:username', (req: any, res) => {
    const { username } = req.params;
    const users = readJSON<UserRecord[]>(USERS_FILE, []);
    const user = users.find(u => u.username === username.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'Author profile not found' });
    }

    const { passwordHash, ...publicProfile } = user;
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    // Limit to published posts only for guest views
    const authorPosts = posts.filter(p => p.authorId === user.id && p.status === 'published');

    res.json({
      profile: publicProfile,
      posts: authorPosts
    });
  });

  // Posts API: List with query filters (search, category, author)
  app.get('/api/posts', (req: any, res) => {
    const { search, category, authorId, status } = req.query;
    let posts = readJSON<Post[]>(POSTS_FILE, []);
    const likes = readJSON<Like[]>(LIKES_FILE, []);
    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    const users = readJSON<UserRecord[]>(USERS_FILE, []);

    // Helper visibility checker for posts
    const isVisiblePost = (p: any, currentUserId: string | null) => {
      if (p.status === 'published') return true;
      if (p.status === 'scheduled') {
        const isPast = p.scheduledAt ? new Date(p.scheduledAt).getTime() <= Date.now() : true;
        if (isPast) return true;
        return currentUserId && p.authorId === currentUserId;
      }
      if (p.status === 'draft') {
        return currentUserId && p.authorId === currentUserId;
      }
      return false;
    };

    // Filter by author if requested
    if (authorId) {
      posts = posts.filter(p => p.authorId === authorId);
      // If we are looking for a specific status, handle it. 
      // If not specified, and looking for someone else's, only output published.
      if (status) {
        posts = posts.filter(p => p.status === status);
      } else {
        posts = posts.filter(p => isVisiblePost(p, req.userId));
      }
    } else {
      // General view outputs published unless draft or scheduled requested
      if (status === 'draft' && req.userId) {
        posts = posts.filter(p => p.authorId === req.userId && p.status === 'draft');
      } else if (status === 'scheduled' && req.userId) {
        posts = posts.filter(p => p.authorId === req.userId && p.status === 'scheduled');
      } else {
        posts = posts.filter(p => {
          if (p.status === 'published') return true;
          if (p.status === 'scheduled') {
            return p.scheduledAt ? new Date(p.scheduledAt).getTime() <= Date.now() : true;
          }
          return false;
        });
      }
    }

    // Filter by Category
    if (category) {
      posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Search text (title / excerpt / content)
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.excerpt.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q)
      );
    }

    // Sort by newest
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Hydrate author details, like counts, comment counts
    const hydratedPosts = posts.map(p => {
      const author = users.find(u => u.id === p.authorId);
      const postLikes = likes.filter(l => l.postId === p.id);
      const postComments = comments.filter(c => c.postId === p.id);
      
      return {
        ...p,
        authorName: author ? author.fullName : 'Anonymous',
        authorAvatar: author ? author.avatarUrl : '',
        authorUsername: author ? author.username : 'deleted_user',
        likesCount: postLikes.length,
        commentsCount: postComments.length,
        isLiked: req.userId ? postLikes.some(l => l.userId === req.userId) : false
      };
    });

    res.json(hydratedPosts);
  });

  // Get Single Post (and increment view count!)
  app.get('/api/posts/:id', (req: any, res) => {
    const { id } = req.params;
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const postIdx = posts.findIndex(p => p.id === id || p.slug === id);

    if (postIdx === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[postIdx];
    
    // Increment view count
    post.views = (post.views || 0) + 1;
    writeJSON(POSTS_FILE, posts);

    const users = readJSON<UserRecord[]>(USERS_FILE, []);
    const author = users.find(u => u.id === post.authorId);
    
    const likes = readJSON<Like[]>(LIKES_FILE, []);
    const postLikes = likes.filter(l => l.postId === post.id);
    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    const postComments = comments.filter(c => c.postId === post.id);

    res.json({
      ...post,
      authorName: author ? author.fullName : 'Anonymous',
      authorAvatar: author ? author.avatarUrl : '',
      authorUsername: author ? author.username : 'deleted_user',
      authorBio: author ? author.bio : '',
      likesCount: postLikes.length,
      commentsCount: postComments.length,
      isLiked: req.userId ? postLikes.some(l => l.userId === req.userId) : false
    });
  });

  // Create Post
  app.post('/api/posts', requireAuth, (req: any, res) => {
    const { title, excerpt, content, featuredImageUrl, category, status, scheduledAt } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: 'Title, content and category are required fields' });
    }

    // Generate unique robust slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${uniqueId}`;

    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const newPost: any = {
      id: `post-${Date.now()}`,
      title,
      slug,
      excerpt: excerpt || (content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'),
      content,
      featuredImageUrl: featuredImageUrl || '',
      category: category.toLowerCase(),
      authorId: req.userId,
      status: (status === 'draft' || status === 'scheduled') ? status : 'published',
      scheduledAt: status === 'scheduled' ? scheduledAt : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0
    };

    posts.push(newPost);
    writeJSON(POSTS_FILE, posts);

    res.status(201).json(newPost);
  });

  // Update Post
  app.put('/api/posts/:id', requireAuth, (req: any, res) => {
    const { id } = req.params;
    const { title, excerpt, content, featuredImageUrl, category, status, scheduledAt } = req.body;

    const posts = readJSON<any[]>(POSTS_FILE, []);
    const postIdx = posts.findIndex(p => p.id === id);

    if (postIdx === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (posts[postIdx].authorId !== req.userId) {
      return res.status(403).json({ error: 'You are not authorized to edit this article' });
    }

    if (title !== undefined) {
      posts[postIdx].title = title;
      // update slug safely matching title modification
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const uniqueId = Math.random().toString(36).substring(2, 6);
      posts[postIdx].slug = `${baseSlug}-${uniqueId}`;
    }
    if (excerpt !== undefined) posts[postIdx].excerpt = excerpt;
    if (content !== undefined) posts[postIdx].content = content;
    if (featuredImageUrl !== undefined) posts[postIdx].featuredImageUrl = featuredImageUrl;
    if (category !== undefined) posts[postIdx].category = category.toLowerCase();
    if (status !== undefined) posts[postIdx].status = status;
    if (scheduledAt !== undefined) posts[postIdx].scheduledAt = scheduledAt;

    posts[postIdx].updatedAt = new Date().toISOString();

    writeJSON(POSTS_FILE, posts);
    res.json(posts[postIdx]);
  });

  // Delete Post
  app.delete('/api/posts/:id', requireAuth, (req: any, res) => {
    const { id } = req.params;
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const postIdx = posts.findIndex(p => p.id === id);

    if (postIdx === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (posts[postIdx].authorId !== req.userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this article' });
    }

    posts.splice(postIdx, 1);
    writeJSON(POSTS_FILE, posts);

    // Clean up corresponding comments and likes
    let comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    comments = comments.filter(c => c.postId !== id);
    writeJSON(COMMENTS_FILE, comments);

    let likes = readJSON<Like[]>(LIKES_FILE, []);
    likes = likes.filter(l => l.postId !== id);
    writeJSON(LIKES_FILE, likes);

    res.json({ success: true, message: 'Article deleted successfully' });
  });

  // Likes API: POST Toggle
  app.post('/api/posts/:id/like', requireAuth, (req: any, res) => {
    const { id } = req.params; // Post ID or slug
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const post = posts.find(p => p.id === id || p.slug === id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found for liking' });
    }

    const likes = readJSON<Like[]>(LIKES_FILE, []);
    const index = likes.findIndex(l => l.postId === post.id && l.userId === req.userId);

    let isLiked = false;
    if (index === -1) {
      likes.push({
        id: `like-${Date.now()}`,
        postId: post.id,
        userId: req.userId,
        createdAt: new Date().toISOString()
      });
      isLiked = true;
    } else {
      likes.splice(index, 1);
      isLiked = false;
    }

    writeJSON(LIKES_FILE, likes);

    const postLikes = likes.filter(l => l.postId === post.id);
    res.json({ likesCount: postLikes.length, isLiked });
  });

  // Comments: GET comments list for post
  app.get('/api/posts/:id/comments', (req, res) => {
    const { id } = req.params;
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const post = posts.find(p => p.id === id || p.slug === id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    const postComments = comments.filter(c => c.postId === post.id);
    // Sort oldest first so comments stream down sequentially
    postComments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    res.json(postComments);
  });

  // Comments: POST comment
  app.post('/api/posts/:id/comments', requireAuth, (req: any, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment body cannot be empty' });
    }

    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const post = posts.find(p => p.id === id || p.slug === id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const users = readJSON<UserRecord[]>(USERS_FILE, []);
    const user = users.find(u => u.id === req.userId);

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      postId: post.id,
      authorId: req.userId,
      authorName: user ? user.fullName : 'Anonymous',
      authorAvatar: user ? user.avatarUrl : '',
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    comments.push(comment);
    writeJSON(COMMENTS_FILE, comments);

    res.status(201).json(comment);
  });

  // Image upload base64 adapter (avoids multipart issues and simplifies client uploads)
  app.post('/api/upload', requireAuth, (req, res) => {
    const { filename, mimeType, base64 } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: 'Bad file payload. Filename and base64 string must be provided.' });
    }

    try {
      // Base64 looks like: "data:image/png;base64,iVBORw0KG..."
      const stripHeaderIdx = base64.indexOf(';base64,');
      const cleanBase64 = stripHeaderIdx !== -1 ? base64.substring(stripHeaderIdx + 8) : base64;
      
      const buffer = Buffer.from(cleanBase64, 'base64');
      const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_.-]+/g, '_');
      const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const savedName = `${fileId}_${cleanFilename}`;
      const savePath = path.join(UPLOADS_DIR, savedName);

      fs.writeFileSync(savePath, buffer);

      res.json({ url: `/uploads/${savedName}` });
    } catch (err) {
      console.error('File write failure:', err);
      res.status(500).json({ error: 'Failed to write upload to server filesystem' });
    }
  });

  // Public signup photo uploader adapter (allows new registration users to set square avatar with ratio 1:1)
  app.post('/api/upload-public', (req, res) => {
    const { filename, mimeType, base64 } = req.body;
    if (!base64 || !filename) {
      return res.status(400).json({ error: 'Bad file payload. Filename and base64 string required.' });
    }

    try {
      const stripHeaderIdx = base64.indexOf(';base64,');
      const cleanBase64 = stripHeaderIdx !== -1 ? base64.substring(stripHeaderIdx + 8) : base64;
      
      const buffer = Buffer.from(cleanBase64, 'base64');
      const cleanFilename = filename.toLowerCase().replace(/[^a-z0-9_.-]+/g, '_');
      const fileId = `${Date.now()}_pub_${Math.random().toString(36).substring(2, 7)}`;
      const savedName = `${fileId}_${cleanFilename}`;
      const savePath = path.join(UPLOADS_DIR, savedName);

      fs.writeFileSync(savePath, buffer);

      res.json({ url: `/uploads/${savedName}` });
    } catch (err) {
      console.error('Public file write failure:', err);
      res.status(500).json({ error: 'Failed to write avatar upload' });
    }
  });

  // Dashboard Stats: count indicators for own profile
  app.get('/api/stats', requireAuth, (req: any, res) => {
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const likes = readJSON<Like[]>(LIKES_FILE, []);
    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);

    const myPosts = posts.filter(p => p.authorId === req.userId);
    const myPostIds = myPosts.map(p => p.id);

    const publishedCount = myPosts.filter(p => p.status === 'published').length;
    const draftCount = myPosts.filter(p => p.status === 'draft').length;
    
    const totalViews = myPosts.reduce((accum, p) => accum + (p.views || 0), 0);
    const totalLikes = likes.filter(l => myPostIds.includes(l.postId)).length;
    const totalComments = comments.filter(c => myPostIds.includes(c.postId)).length;

    res.json({
      totalPosts: myPosts.length,
      publishedCount,
      draftCount,
      totalViews,
      totalLikes,
      totalComments
    });
  });

  // --- ADMINISTRATOR ENDPOINTS ---
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'HaxudioHub') {
      res.json({ token: 'admin-token-supersecure-haxudiohub' });
    } else {
      res.status(401).json({ error: 'Incorrect administrator password' });
    }
  });

  const requireAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    if (authHeader === 'Bearer admin-token-supersecure-haxudiohub') {
      next();
    } else {
      res.status(403).json({ error: 'Administrator clearance required' });
    }
  };

  app.get('/api/admin/users', requireAdmin, (req, res) => {
    const users = readJSON<any[]>(USERS_FILE, []);
    const posts = readJSON<Post[]>(POSTS_FILE, []);
    const comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    const likes = readJSON<Like[]>(LIKES_FILE, []);

    const usersWithStats = users.map(u => {
      const userPosts = posts.filter(p => p.authorId === u.id);
      const userPostIds = userPosts.map(p => p.id);
      const userCommentsWritten = comments.filter(c => c.authorId === u.id);
      
      const viewsReceived = userPosts.reduce((acc, p) => acc + (p.views || 0), 0);
      const likesReceived = likes.filter(l => userPostIds.includes(l.postId)).length;
      const commentsReceived = comments.filter(c => userPostIds.includes(c.postId)).length;

      const { passwordHash, ...safeProfile } = u;

      return {
        ...safeProfile,
        postsCount: userPosts.length,
        commentsCount: userCommentsWritten.length,
        viewsReceived,
        likesReceived,
        commentsReceived,
        isBanned: !!u.isBanned
      };
    });

    res.json(usersWithStats);
  });

  app.post('/api/admin/users/:userId/ban', requireAdmin, (req, res) => {
    const { userId } = req.params;
    const { ban } = req.body;
    const users = readJSON<any[]>(USERS_FILE, []);
    const idx = users.findIndex(u => u.id === userId);

    if (idx === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    users[idx].isBanned = !!ban;
    writeJSON(USERS_FILE, users);

    res.json({ success: true, isBanned: !!ban });
  });

  app.delete('/api/admin/users/:userId', requireAdmin, (req, res) => {
    const { userId } = req.params;
    let users = readJSON<any[]>(USERS_FILE, []);
    const exists = users.some(u => u.id === userId);

    if (!exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    users = users.filter(u => u.id !== userId);
    writeJSON(USERS_FILE, users);

    // clean up related posts
    let posts = readJSON<Post[]>(POSTS_FILE, []);
    posts = posts.filter(p => p.authorId !== userId);
    writeJSON(POSTS_FILE, posts);

    // clean up related comments
    let comments = readJSON<Comment[]>(COMMENTS_FILE, []);
    comments = comments.filter(c => c.authorId !== userId);
    writeJSON(COMMENTS_FILE, comments);

    // clean up related likes
    let likes = readJSON<Like[]>(LIKES_FILE, []);
    likes = likes.filter(l => l.userId !== userId);
    writeJSON(LIKES_FILE, likes);

    res.json({ success: true, message: 'User and all associated assets purged successfully' });
  });

  // Use Vite intermediate layer in Dev mode, Static SPA build outputs in Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[InsightHub Backend] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
