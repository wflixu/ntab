# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ntab** - A custom Chrome extension new tab page with search, bookmarks, and Bing daily image backgrounds.

## Tech Stack

- **Framework**: WXT (Web Extension Tools) - Next-gen web extension framework
- **Frontend**: Vue 3 + Vite
- **State Management**: Pinia
- **UI Components**: PrimeVue 4 + PrimeIcons
- **Styling**: Tailwind CSS 4
- **Utilities**: VueUse
- **Linting/Formatting**: Biome

## Commands

```bash
# Development
pnpm dev              # Start dev server (Chrome)
pnpm dev:firefox      # Start dev server (Firefox)

# Build
pnpm build            # Build for Chrome
pnpm build:firefox    # Build for Firefox
pnpm zip              # Package for distribution
pnpm bz               # Build + zip in one command

# Type Checking
pnpm compile          # TypeScript type check (vue-tsc)
```

## Architecture

### Extension Structure

```
entrypoints/
├── background.ts     # Extension background service worker
├── content.ts        # Content scripts
└── newtab/           # New tab page (main UI)
    ├── main.ts       # Vue app entry
    ├── App.vue       # Root component
    ├── router/       # Vue Router (hash-based)
    ├── stores/       # Pinia stores
    ├── views/        # Page components
    │   ├── home/     # Main view (search, bookmarks, navigation)
    │   └── settings/ # Settings panels
    ├── components/   # Reusable components
    ├── assets/       # Images and static resources
    └── style/        # CSS stylesheets
```

### Key Features

1. **HomeView** - Main new tab interface with:
   - SearchBox (multi-engine search)
   - WebNavi (bookmark navigation)
   - CommandTips (keyboard shortcuts)
   - MaskLayer (overlay UI)

2. **Settings Views**:
   - `ConfigBackground.vue` - Background image settings (Bing API integration)
   - `ConfigBookmark.vue` - Bookmark sync configuration
   - `Settings.vue` - Main settings panel

3. **State Management** (`layout.ts` store):
   - Background URL management (persisted to localStorage)
   - Bookmark visibility toggles
   - Sync bookmark folder settings

### Extension Permissions

Declared in `wxt.config.ts`:
- `storage`, `tabs`, `bookmarks`, `history`, `favicon`, `topSites`, `webRequest`, `sessions`
- Host permissions: `dailybing.com`, `global.bing.com`

### Bing Image API

Background images sourced from `https://dailybing.com/api/v1` (see README.md)

## Development Notes

- WXT auto-generates `.wxt/` directory with types and build artifacts
- Vue 3 with Composition API (no Options API)
- TypeScript strict mode enabled
- PrimeVue v4 uses new theming system (`@primeuix/themes`)
- Tailwind CSS v4 uses Vite plugin integration
