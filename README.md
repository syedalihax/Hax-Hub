# InsightHub — Vibrant Magazine Blogging Platform

A colorful, high-contrast, modern full-stack blogging platform styling a creative **Vibrant Palette** theme (Neo-Brutalist inspired layout with thick black borders, vivid highlights, and responsive page flow).

---

## Technical Architecture

InsightHub is designed to represent a robust **Full-Stack SPA Architecture** supporting zero-latency browser communication:
* **Frontend Sandbox**: React 19 Client application coupled with Tailwind CSS 4 utility layout selectors, customizable category identifiers, and responsive typography guidelines.
* **Server-Side Sandbox**: Highly efficient Express 4 production-grade core router equipped with session token authentication, base64 visual file uploads directly into the server filesystem, and automatic view count aggregations.
* **Storage Matrix**: Flat JSON storage systems loaded instantly inside the `/data` directory, guaranteeing full data persistence across container updates other than simulated database restarts.

---

## Unique Features Included

### 1. Unified Search Matrix
* Look up publications matching Title, Excerpt, or Story words instantly from the sticky navigation bar or mobile-only drop indices.

### 2. Verified Opinion Comments Stream
* Authenticated users can submit, sort, and cache comments, labeled with verification markers and user avatars on the fly.

### 3. Integrated Rich Content Editor
* Visual editor supporting structured elements (`H2`, `H3`, `Strong`, `Quote`, List formats, Links) and inline Base64 direct local image loads within paragraph text.

### 4. Interactive Bento Dashboard metrics
* View publication statistics including total likes gained, page clicks/reads received, and draft statuses securely.

---

## Execution Guide

To initialize and run this platform:
1. Ensure all packages are installed:
   ```bash
   npm install
   ```
2. Initialize developer sandbox:
   ```bash
   npm run dev
   ```
3. Open output page in your designated standard browser tab.
