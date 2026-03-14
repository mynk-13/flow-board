# Firebase setup — what you need to do

FlowBoard uses **Firebase** for authentication and (optionally) **Firestore** for data. Follow these steps once.

---

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** (or use an existing one).
3. Enter a project name (e.g. **flowboard**) and follow the prompts (Google Analytics optional).
4. Wait until the project is created.

---

## 2. Register the web app

1. In the project overview, click the **Web** icon (</>).
2. Enter an app nickname (e.g. **FlowBoard Web**).
3. Do **not** check “Firebase Hosting” for now (we use Vercel/Netlify).
4. Click **Register app**.
5. You’ll see a `firebaseConfig` object. Copy the values — you’ll need them for step 4.

---

## 3. Enable Authentication

1. In the left sidebar, go to **Build → Authentication**.
2. Click **Get started**.
3. Open the **Sign-in method** tab.
4. Enable at least one provider:
   - **Email/Password** — enable “Email/Password” and save.
   - **Google** — enable “Google”, set support email, save.
   - Add **GitHub** or others later if you want (from the same Sign-in method list).

---

## 4. Enable Firestore (for workspaces, projects, tasks)

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** for development (we’ll add security rules later).
4. Pick a region close to you and confirm.

---

## 5. Add env vars locally

1. In the project root, copy the example env file:
   ```bash
   copy .env.example .env
   ```
   (On macOS/Linux: `cp .env.example .env`.)

2. Open **Firebase Console → Project settings** (gear icon) → **General** → scroll to **Your apps** → select your web app.

3. Copy each value from the config into `.env`:

   | Firebase config key | Your .env variable |
   |---------------------|----------------------|
   | `apiKey`            | `VITE_FIREBASE_API_KEY` |
   | `authDomain`        | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `projectId`         | `VITE_FIREBASE_PROJECT_ID` |
   | `storageBucket`     | `VITE_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId`             | `VITE_FIREBASE_APP_ID` |

4. Save `.env`. **Do not commit it** (it’s in `.gitignore`).

---

## 6. Add env vars on Vercel/Netlify

When you connect your GitHub repo to Vercel or Netlify:

1. Open the project in Vercel or Netlify.
2. Go to **Settings → Environment variables**.
3. Add the **same six** variables (`VITE_FIREBASE_*`) with the same values as in your `.env`.
4. Redeploy so the build uses the new env vars.

---

## 7. Optional: Auth domain for localhost

- For **local dev**, Firebase allows `localhost` by default.
- For **production**, your app URL (e.g. `flowboard.vercel.app`) must be allowed:  
  **Authentication → Settings → Authorized domains** — your deploy URL should appear after first deploy, or add it manually.

---

## Summary checklist

- [ ] Firebase project created
- [ ] Web app registered (config copied)
- [ ] Authentication enabled (Email/Password and/or Google)
- [ ] Firestore created (test mode for dev)
- [ ] `.env` created and all six `VITE_FIREBASE_*` vars filled
- [ ] Same six vars added in Vercel/Netlify environment variables
- [ ] Run `npm run dev` and sign in to confirm auth works

After this, the app can use `auth` and `db` from `@/lib/firebase` and the `useAuth()` hook from `@/features/auth`.
