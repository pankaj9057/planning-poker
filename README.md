# Planning Poker with Supabase

A real-time Planning Poker application built with React and Supabase.

## Features

- 🎴 Create and join Planning Poker games
- 🔐 Anonymous authentication via Supabase
- ⚡ Real-time updates using Supabase Realtime
- 🎨 Dark/Light theme toggle
- 🌍 Multi-language support (English/Spanish)
- 📊 Fibonacci and T-Shirt sizing decks
- 🤖 Auto-reveal when all players vote

## Setup Instructions

### 1. Create a Supabase Project
1. Go to https://app.supabase.com
2. Create a new project
3. Wait for the project to be ready

### 2. Set Up Database
1. In your Supabase project, go to the SQL Editor
2. Copy the contents of supabase-schema.sql
3. Paste and run it in the SQL Editor

### 3. Enable Anonymous Authentication
1. Go to Authentication → Providers in your Supabase dashboard
2. Enable Anonymous sign-ins

### 4. Configure Environment Variables
1. Copy .env.example to .env
2. Get your Supabase URL and anon key from Project Settings → API
3. Update the .env file with your credentials

### 5. Install and Run
```bash
npm install
npm run dev
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub (already done!)
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository: `pankaj9057/planning-poker`
5. Configure environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
6. Click "Deploy"

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pankaj9057/planning-poker)

### Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `pankaj9057/planning-poker`
4. Build settings are auto-detected from `netlify.toml`
# Planning Poker (Supabase + Vite + React)

A lightweight Planning Poker web app built with React, Vite and Supabase for realtime features.

This README has been refreshed. It contains concise, actionable instructions to run, build, and deploy the project.

## Quick start

1. Install dependencies

```bash
npm install
```

2. Create a local `.env` (see `.env.example` if present) and set the following values:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Example (do not commit):

```
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=public-anon-key
```

3. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173

## Build

To build a production artifact:

```bash
npm run build
```

The optimized static output will be in the `dist/` folder.

## Deployment options

This project supports several static-hosting providers. The repository already contains a GitHub Actions workflow that deploys the `dist` artifact to GitHub Pages (using `actions/upload-pages-artifact` + `actions/deploy-pages`).

- Vercel: import the repo and add the two environment variables.
- Netlify: import the repo, set build command to `npm run build` and publish directory to `dist`, and add the environment variables.
- GitHub Pages: CI workflow in `.github/workflows/deploy.yml` will publish on push to `main`.

## Environment variables

Required (for local dev and CI build):

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anonymous public key

Set these in your hosting provider or GitHub repository secrets for CI.

## Contributing

- Follow the existing TypeScript and linting rules.
- Run `npm run lint` before opening a PR.

## Troubleshooting

- If the dev server won't start, ensure Node 20+ and an up-to-date npm are installed.
- If you see missing env variables, verify they are set in `.env` or in your CI environment.

---

If you'd like, I can also:
- Add a small `.env.example` if one is missing.
- Update `netlify.toml` or `vercel.json` to match any specific build settings.
- Commit the README and push to a branch for review.
