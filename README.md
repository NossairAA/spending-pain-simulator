# MindSpend Web App

![MindSpend Logo](public/mindspend-logo.png)

MindSpend is a web app that helps users make intentional purchase decisions by reframing spending as tradeoffs in time, opportunity cost, and long-term goals.


## What this app does

- Converts purchase amounts into practical life-impact comparisons.
- Helps users slow down impulse buying with reflection prompts and cool-off flows.
- Tracks spending patterns and surfaces insights over time.
- Supports guest usage (local) and authenticated usage (cloud sync via Firebase).

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Firebase Authentication / storage integration

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Create your environment file from the template:

```bash
cp .env.example .env.local
```

3. Fill in Firebase values in `.env.local`.

4. Start the development server:

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser.

## Available scripts

- `npm run dev` - Start local development server.
- `npm run build` - Build production bundle.
- `npm run start` - Run production server.
- `npm run lint` - Run ESLint checks.