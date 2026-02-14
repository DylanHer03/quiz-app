# 🎯 Quiz App — Multiplayer Mini-Games

Web app multiplayer in tempo reale per quiz e mini-giochi. Stile moderno e minimalista, ottimizzato per velocità.

## 🛠 Tech Stack

| Tool       | Usage                        |
|------------|------------------------------|
| **Next.js 16** | App Router, Server Actions, SSR |
| **TypeScript** | Type safety                  |
| **Supabase**   | Database, Auth, Realtime     |
| **Tailwind CSS** | Styling moderno e minimal  |
| **Vercel**     | Deploy & Hosting             |

## 📁 Struttura Progetto

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

## 🎮 Funzionalità

### Implementate
- [x] Creazione stanza con codice unico (5 caratteri)
- [x] Join stanza con codice
- [x] Lobby in tempo reale (Supabase Realtime)
- [x] Ruolo host (primo giocatore)
- [x] Start game dall'host

### Da implementare
- [ ] **Quiz Mode** — Domande a risposta multipla con timer
- [ ] **Classifica live** — Punteggi aggiornati in tempo reale
- [ ] **Mini-giochi** — Altre modalità oltre al quiz
- [ ] **Auth** — Login opzionale (Supabase Auth)
- [ ] **Temi/Categorie** — Scelta argomento quiz
- [ ] **Mobile responsive** — UI ottimizzata per mobile

## 🗄 Database (Supabase)

### Tabella `rooms`
| Colonna      | Tipo      | Note                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | auto-generato                |
| code        | text      | codice unico 5 char          |
| status      | text      | `lobby` / `playing` / `ended`|
| created_at  | timestamp | default now()                |

### Tabella `players`
| Colonna      | Tipo      | Note                        |
|-------------|-----------|------------------------------|
| id          | uuid (PK) | auto-generato                |
| room_id     | uuid (FK) | → rooms.id                   |
| name        | text      | nome giocatore (max 20 char) |
| score       | int       | default 0                    |
| created_at  | timestamp | default now()                |

## 🚀 Setup Locale

```bash
# 1. Clona il repo
git clone https://github.com/DylanHer03/quiz-app.git
cd quiz-app

# 2. Installa dipendenze
npm install

# 3. Configura .env
cp .env.example .env
# → Inserisci le tue chiavi Supabase

# 4. Avvia dev server
npm run dev
```

## 🔑 Variabili d'Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
```

## 📦 Deploy su Vercel

1. Push su GitHub
2. Collega il repo a [vercel.com](https://vercel.com)
3. Aggiungi le variabili d'ambiente nel dashboard Vercel
4. Deploy automatico ad ogni push

## 🎨 Design Guidelines

- **Stile**: Moderno, minimalista, pulito
- **Colori**: Palette scura/chiara con accenti blu (#0070f3) e verde (#10b981)
- **Font**: Geist (default Vercel)
- **UI**: Card-based, bordi arrotondati, spaziatura generosa
- **Animazioni**: Subtle, non invasive
