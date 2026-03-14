# Deploy FlowBoard on Vercel — Step-by-step

Connect your GitHub repo so every push to `main` deploys, and every PR gets a preview URL.

---

## 1. Sign up / log in

1. Go to **[vercel.com](https://vercel.com)**.
2. Click **Sign Up** (or **Log In**).
3. Choose **Continue with GitHub** and authorize Vercel to access your GitHub account.

---

## 2. Import the repository

1. On the Vercel dashboard, click **Add New…** → **Project**.
2. You’ll see a list of your GitHub repos. Find **flow-board** (or whatever you named it).
3. Click **Import** next to that repo.
4. If you don’t see it, click **Adjust GitHub App Permissions** and ensure Vercel can access the repo (and the org/account that owns it), then refresh the list.

---

## 3. Configure the project

Vercel usually detects Vite automatically. Check:

- **Framework Preset:** **Vite** (should be auto-selected).
- **Root Directory:** leave as **`.`** (repo root).
- **Build Command:** `npm run build` (default).
- **Output Directory:** `dist` (Vite’s default).
- **Install Command:** `npm install` (default).

Don’t click **Deploy** yet — add env vars first.

---

## 4. Add environment variables (Firebase)

1. On the same import screen, expand **Environment Variables**.
2. Add these **six** variables (same names and values as in your local `.env`):

   | Name | Value (paste from your `.env`) |
   |------|---------------------------------|
   | `VITE_FIREBASE_API_KEY` | (your API key) |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `flow-board-7e9e4.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `flow-board-7e9e4` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `flow-board-7e9e4.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `293864554680` |
   | `VITE_FIREBASE_APP_ID` | `1:293864554680:web:ab205b22e0948ef12d344d` |

3. For each variable, leave **Environment** as **Production**, **Preview**, and **Development** (or at least Production + Preview) so all deployments work.
4. Click **Deploy** (or **Add** for each var, then **Deploy**).

---

## 5. Wait for the first deploy

- Vercel runs `npm install` and `npm run build`.
- When it finishes, you’ll see **Congratulations!** and a **Visit** link, e.g. `flow-board-xxx.vercel.app`.
- Click **Visit** to open the live app.

---

## 6. Allow the Vercel URL in Firebase (for Auth)

1. Open **[Firebase Console](https://console.firebase.google.com)** → your project **flow-board-7e9e4**.
2. Go to **Build** → **Authentication** → **Settings** (or **Sign-in method** tab) → **Authorized domains**.
3. Click **Add domain** and add your Vercel URL, e.g. `flow-board-xxx.vercel.app` (without `https://`).
4. Save. Sign-in will then work on the deployed site.

---

## 7. After the first deploy

- **Production:** Every push to the **main** branch triggers a new production deploy. The main URL (e.g. `flow-board.vercel.app` or your custom domain) updates.
- **Preview:** Every **pull request** gets a unique preview URL (e.g. `flow-board-git-branch-username.vercel.app`) so you can test before merging.
- **Settings:** In the Vercel project → **Settings** you can add a **Custom Domain**, change build commands, or add more env vars.

---

## Quick checklist

- [ ] Signed in to Vercel with GitHub
- [ ] Imported the **flow-board** repo as a new project
- [ ] Added all six `VITE_FIREBASE_*` environment variables
- [ ] Deployed and opened the **Visit** link
- [ ] Added the Vercel domain to Firebase **Authorized domains**

Your repo is now connected; future pushes to `main` will deploy automatically.
