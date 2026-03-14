# Deploying the Socket.io Server on Railway

Railway gives you a **free persistent server** (500 hrs/month free tier) — perfect for the FlowBoard real-time backend.

---

## Step 1 — Create a Railway account

1. Go to [https://railway.app](https://railway.app)
2. Click **Login** → continue with GitHub (same account you use for this repo)

---

## Step 2 — Create a new project from GitHub

1. On the Railway dashboard click **New Project**
2. Choose **Deploy from GitHub repo**
3. Select your `flow-board` repository
4. Railway will detect the repo. **Do NOT auto-deploy yet** — you need to tell it which folder is the server.

---

## Step 3 — Configure the Root Directory

Railway needs to know the server is inside `server/`, not the repo root.

1. Click on the service → **Settings** tab
2. Under **Source** → set **Root Directory** to `server`
3. Under **Build** → Build Command:
   ```
   npm install && npm run build
   ```
4. Under **Deploy** → Start Command:
   ```
   node dist/index.js
   ```

---

## Step 4 — Add environment variables

In Railway → your service → **Variables** tab, add:

| Key | Value |
|-----|-------|
| `PORT` | `3001` (Railway auto-sets this — you can leave it or override) |
| `CORS_ORIGIN` | `https://your-app.vercel.app` ← your Vercel frontend URL |

> **Important:** Replace `https://your-app.vercel.app` with your actual Vercel deployment URL. You can also set it to `*` during testing.

---

## Step 5 — Deploy

1. Click **Deploy** (or push a commit — Railway auto-deploys on push)
2. Wait ~1 minute for the build to complete
3. Railway gives you a public URL like:
   ```
   https://flowboard-server-production.up.railway.app
   ```

---

## Step 6 — Update your Vercel environment variable

1. Go to [https://vercel.com](https://vercel.com) → your `flow-board` project
2. **Settings** → **Environment Variables**
3. Add (or update):
   | Key | Value |
   |-----|-------|
   | `VITE_SOCKET_URL` | `https://flowboard-server-production.up.railway.app` |
4. **Redeploy** the frontend on Vercel (Deployments → the latest → Redeploy)

---

## Step 7 — Test locally

To run the socket server locally for development:

```bash
# Terminal 1 — socket server
cd server
npm install
npm run dev    # starts on http://localhost:3001

# Terminal 2 — frontend
cd ..           # back to project root
npm run dev    # starts on http://localhost:5173
```

The frontend's `VITE_SOCKET_URL=http://localhost:3001` in `.env` already points to local dev.

---

## Verify it's working

Open the board in two **separate browser windows** (or incognito + normal).  
Log in with two different accounts (or the same account in both tabs).

You should see:
- ✅ **"Live"** badge with green Wifi icon in the board top bar
- ✅ **Presence avatars** — colored circles with initials for other users
- ✅ **Live cursors** — colored mouse pointers with email labels
- ✅ **Task sync** — create/move/delete a task in one tab; it appears in the other instantly

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Board shows "Offline" | Check Railway logs; ensure `CORS_ORIGIN` includes your frontend URL |
| CORS error in browser console | Set `CORS_ORIGIN=*` temporarily to verify, then restrict to your URL |
| `dist/index.js` not found | Make sure `npm run build` ran successfully in Railway build logs |
| Railway build fails | Check that `server/package.json` has both `build` and `start` scripts |
