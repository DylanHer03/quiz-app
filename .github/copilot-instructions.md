# Quiz App — Multiplayer Mini-Games

## Progetto
Web app multiplayer in tempo reale per quiz e mini-giochi. Stile moderno e minimalista.

## Tech Stack
- **Next.js 16** (App Router, Server Actions, SSR)
- **TypeScript** (strict mode)
- **Supabase** (Database PostgreSQL, Auth, Realtime subscriptions)
- **Tailwind CSS** (styling)
- **Vercel** (deploy)

## Struttura Progetto
```
app/
  page.tsx                  ← Home: crea o entra in una stanza
  layout.tsx                ← Layout globale
  actions/
    rooms.ts                ← Server Actions (create, join, start room)
  room/
    [code]/
      page.tsx              ← Lobby stanza + gioco in tempo reale
lib/
  supabaseClient.ts         ← Client Supabase (browser)
```

## Convenzioni Codice
- Usa **"use client"** solo dove serve (componenti con state/hooks)
- Server Actions in `app/actions/` con **"use server"**
- Client Supabase in `lib/supabaseClient.ts`, server Supabase creato inline nelle actions con `SUPABASE_SERVICE_ROLE_KEY`
- Tipi TypeScript espliciti, no `any` → usa `unknown` + type guards
- Stile: inline styles o Tailwind CSS, design moderno e minimalista
- Colori principali: blu `#0070f3`, verde `#10b981`
- Componenti semplici, funzionali, con hooks React
- Gestione errori con try/catch, mostra errori all'utente

## Database Supabase

### Tabella `rooms`
- `id` uuid PK (auto)
- `code` text (codice stanza 5 char, unico)
- `status` text (`lobby` | `playing` | `ended`)
- `created_at` timestamp

### Tabella `players`
- `id` uuid PK (auto)
- `room_id` uuid FK → rooms.id
- `name` text (max 20 char)
- `score` int (default 0)
- `created_at` timestamp

## Realtime
- Supabase Realtime per aggiornamenti live dei giocatori e stato stanza
- Canali per stanza: `room-{room.id}`

## Regole
- Non esporre mai `SUPABASE_SERVICE_ROLE_KEY` al client
- Le variabili `NEXT_PUBLIC_*` sono le uniche accessibili dal browser
- Il primo giocatore che entra è l'host
- Solo l'host può avviare il gioco
- Codici stanza: 5 caratteri alfanumerici (senza lettere ambigue: I, L, O, 0, 1)
