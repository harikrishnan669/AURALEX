![Frame 3](https://github.com/user-attachments/assets/109059f6-0e7c-4399-b3f1-bd77d65a43aa)

## AURALEX — FIR Generator & Legal Section Analyzer

 A compact, internal tool for intake and drafting of First Information Reports (FIRs) and for mapping incident facts to likely IPC/CrPC sections. Built with Next.js (App Router) for the frontend and a small Python utility for optional audio processing.The IPC/CrPC sections and Legal Section Analysis are integrated into it using another backend file:

## Quick summary

- Purpose: Rapidly capture incident narratives (voice or text), generate AI-assisted FIR drafts, and suggest relevant legal sections.
- Stack: Next.js (App Router), React, Firebase (Auth + Firestore), optional Python audio utilities.
- Local HTTPS: included self-signed certs + `server.js` for dev convenience.

## Quick start (development)

1. Install dependencies

   pnpm install

   (or `npm install` / `yarn`)

2. Create `.env.local` in the repo root with Firebase config (see Environment section below).

3. Start the app

    - Use Next dev (HTTP):

      pnpm dev

    - Or use included HTTPS helper (serves on the IP in the certs):

      node server.js

4. Open the URL printed by the server (e.g. https://192.168.0.9:3000).

## Environment

Create `.env.local` with these variables (replace with your Firebase values):

NEXT_PUBLIC_FIREBASE_API_KEY=

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=

NEXT_PUBLIC_FIREBASE_PROJECT_ID=

NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=

NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=

NEXT_PUBLIC_FIREBASE_APP_ID=

Add any secret keys for AI providers (OpenAI, etc.) as needed — do not commit `.env.local`.

## Firebase (minimal)

1. Create a Firebase project.
2. Enable Authentication (Email/Password or preferred provider).
3. Create a Firestore database and set appropriate rules.
4. Add the web app in Firebase console and copy config to `.env.local`.

The frontend initializes Firebase from `lib/firebase.ts` using `NEXT_PUBLIC_*` vars.

## Local HTTPS

This repo contains self-signed cert files and `server.js` to run an HTTPS server for local testing. These are for developer convenience only — remove for production.

## Project structure (essential)

- `app/` — Next.js routes and pages (App Router)
    - `new-fir/` — voice recording + FIR generation UI
    - `legal-analyzer/` — legal section analysis UI
    - `login/` — authentication
- `components/` — UI primitives and shared components
- `lib/` — Firebase initialization and client helpers
- `backend/` — optional Python audio utilities
- `public/` — static assets
- `server.js` — local HTTPS helper
- `certificates/` and root cert files — local dev certs

## Important files

- `lib/firebase.ts` — Firebase init
- `app/new-fir/page.tsx` — FIR recording & generation flow
- `app/legal-analyzer/page.tsx` — legal section analyzer
- `backend/audio.py` — optional audio processing utility
- `server.js` — start local HTTPS server


