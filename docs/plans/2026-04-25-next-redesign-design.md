# Next.js Redesign Design

## Goal

Rebuild the static Vue page as a Next.js, TypeScript, and TailwindCSS app with a redesigned "night-market decision machine" interface.

## Current Issues

- Runtime Vue is loaded from a CDN, so the page depends on external script availability.
- Most behavior lives in one large `js/app.js` file, mixing state, storage, animation, DOM access, and wheel math.
- CSS is global and difficult to reuse or reason about.
- `localStorage`, canvas animation, audio playback, and timers need lifecycle cleanup in a component model.
- The existing page works, but the visual hierarchy is flat and the tool can feel more intentional.

## Design Direction

The redesigned app should feel like a playful neon food stall control panel:

- A large spin wheel remains the primary action.
- Candidate foods become editable menu chips with color swatches.
- A result dock shows the chosen food, image, and recent picks.
- Fireworks and sound remain celebratory effects after a result.
- The first viewport is the usable app, not a landing page.

## Architecture

- `app/page.tsx` renders the redesigned client experience.
- `components/food-decider.tsx` owns interactive state.
- `components/fireworks-canvas.tsx` owns canvas setup, animation, and cleanup.
- `components/toast.tsx` renders short status messages.
- `lib/foods.ts` stores defaults and palette data.
- `lib/spin.ts` contains pure wheel selection math.
- `hooks/use-local-foods.ts` handles browser storage safely after hydration.

## Verification

- Unit test the pure spin calculation.
- Run lint and production build.
- Start the local Next.js dev server for browser review.
