# Quick Setup Instructions

## 1. Install Dependencies

```bash
cd "/Users/Shelton/Desktop/Cursor/flashcard-app"
npm install
```

## 2. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In Supabase Dashboard → **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/001_create_tables.sql`
4. Click **Run** to create the tables
5. Copy and paste the contents of `supabase/migrations/002_add_management_policies.sql`
6. Click **Run** to enable management features (create/edit/delete)

## 3. Configure Environment Variables

1. Get your Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - Copy **anon/public key** (long string)

2. Create `.env.local` file in the project root:
   ```bash
   cd "/Users/Shelton/Desktop/Cursor/flashcard-app"
   cp .env.local.example .env.local
   ```

3. Edit `.env.local` and add your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 4. Add Sample Data (Optional)

You can add flashcards in two ways:

**Option 1: Using the Management UI (Recommended)**
- After running the app, click "Management Mode" at the top
- Use the tabs to create Subjects, Subtopics, and Flashcards
- No need to manually enter UUIDs - the UI handles everything!

**Option 2: Via Supabase Dashboard**
- Go to Supabase Dashboard → Table Editor
- Add subjects, subtopics, and flashcards manually

## 5. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Location

Your new flashcard app is located at:
**`/Users/Shelton/Desktop/Cursor/flashcard-app`**

This is a completely separate project from your Bar Prep Course project.

