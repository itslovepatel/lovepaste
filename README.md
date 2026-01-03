# LovePaste ❤️

A modern, minimal, and distraction-free paste sharing service built with Next.js 15, Tailwind CSS, and shadcn/ui.

## ✨ Features

- **🎨 Clean Monochrome Design** - Lots of whitespace, Inter font, subtle gray borders
- **⚡ Instant Link Generation** - Get your shareable link in milliseconds
- **📋 One-Click Copy** - Copy code or share link with smooth feedback animation
- **🔍 Auto Language Detection** - Automatically detects JavaScript, Python, TypeScript, and more
- **🎯 Syntax Highlighting** - Beautiful code highlighting with Prism.js
- **⏰ Expiration Options** - Set pastes to expire after 1 hour, 1 day, 7 days, or 30 days
- **📝 Raw View** - View raw content for easy `curl` or script usage
- **⌨️ Keyboard Shortcuts** - Press `Ctrl/Cmd + S` to instantly share

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database:** In-memory store (ready for [Supabase](https://supabase.com/) integration)
- **Syntax Highlighting:** [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- **ID Generation:** [nanoid](https://github.com/ai/nanoid)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 📁 Project Structure

```
zenpaste/
├── src/
│   ├── app/
│   │   ├── api/paste/          # API route for creating pastes
│   │   ├── p/[id]/             # Dynamic route for viewing pastes
│   │   │   ├── page.tsx        # Paste view page
│   │   │   ├── raw/page.tsx    # Raw view page
│   │   │   └── not-found.tsx   # 404 for missing pastes
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page (editor)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── CodeEditor.tsx      # Main editor component
│   │   ├── CodeViewer.tsx      # Syntax highlighted viewer
│   │   └── CopyButton.tsx      # Copy button with animation
│   └── lib/
│       ├── db.ts               # Database operations
│       └── utils.ts            # Utility functions
├── .env.example                # Example environment variables
└── package.json
```

## 🗄️ Database Setup (Supabase)

The app comes with an in-memory store for development. For production, use Supabase:

### 1. Create a Supabase Project

Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Create the Pastes Table

Run this SQL in the Supabase SQL Editor:

```sql
CREATE TABLE pastes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  language TEXT DEFAULT 'plaintext',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pastes_expires_at ON pastes(expires_at);
```

### 3. Configure Environment Variables

Update your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Update the Database File

Uncomment the Supabase code in `src/lib/db.ts`.

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [vercel.com](https://vercel.com)
3. Add your environment variables
4. Deploy!

## 📄 License

MIT License
