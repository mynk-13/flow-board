# Deploying the Analytics MFE (analytics-remote)

The analytics dashboard is a **separate Webpack 5 Module Federation remote** that runs independently from the main Vite host app. You deploy it as its own project on Vercel, then tell the host where to find it.

---

## Local development (run both together)

```bash
# Terminal 1 — analytics remote (Webpack dev server on port 3002)
cd analytics-remote
npm install
npm run dev

# Terminal 2 — host app (Vite on port 5173)
cd ..
npm run dev
```

The host's `.env` already points to `http://localhost:3002`:
```
VITE_ANALYTICS_REMOTE_URL=http://localhost:3002
```

Open `http://localhost:5173` → click **Analytics** in the sidebar.

### Standalone remote dev (no host needed)
```bash
cd analytics-remote
npm run dev
# Open http://localhost:3002 — shows dashboard with mock data
```

---

## Step 1 — Build the remote

```bash
cd analytics-remote
npm install
npm run build
# Output: analytics-remote/dist/  (includes remoteEntry.js)
```

---

## Step 2 — Deploy analytics-remote to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the **same** GitHub repository (`flow-board`)
3. On the configuration screen:
   - **Root Directory**: `analytics-remote`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Framework Preset**: Other
4. Click **Deploy**
5. Vercel gives you a URL like:
   ```
   https://flowboard-analytics.vercel.app
   ```

---

## Step 3 — Update the host on Vercel

1. Go to your **main** `flow-board` Vercel project
2. **Settings → Environment Variables** → Add:

   | Key | Value |
   |-----|-------|
   | `VITE_ANALYTICS_REMOTE_URL` | `https://flowboard-analytics.vercel.app` |

3. **Deployments → latest → Redeploy** (so the host rebuilds with the new remote URL)

---

## Step 4 — Verify

1. Open your Vercel frontend URL
2. Click **Analytics** in the sidebar
3. You should see the dashboard load with your real task data
4. The "MFE" badge in the top bar confirms the remote is active

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Analytics failed to load" error banner | Check that `VITE_ANALYTICS_REMOTE_URL` is set correctly on Vercel and the remote is deployed |
| CORS errors in console | The `webpack.config.js` sets `Access-Control-Allow-Origin: *` — should work out of the box on Vercel |
| `remoteEntry.js` 404 | Confirm the analytics-remote Vercel deployment succeeded and the output dir is `dist` |
| Charts not rendering | Open browser console — usually a missing dep version mismatch; recharts is shared as a singleton |
| Skeleton stays forever | The remote JS failed to load silently — check Network tab for `remoteEntry.js` request |

---

## Architecture reminder

```
Host (Vite on Vercel)
  └── VITE_ANALYTICS_REMOTE_URL  ──→  analytics-remote/remoteEntry.js
                                          └── exposes AnalyticsDashboard
                                                └── 6 Recharts charts
```

The host passes `tasks`, `projects`, and `userId` as **props** — no duplicate Firebase connection in the remote.
