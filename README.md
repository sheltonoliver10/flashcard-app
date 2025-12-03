# Flashcard Study App

A simple, standalone flashcard study application built with Next.js, TypeScript, and Supabase.

## Features

- 📚 Study flashcards by **Subject**, **Subtopic**, or **Random Mix** (25 cards)
- ✅ Mark cards as correct or incorrect
- 🔄 Cards you get wrong are shown again until you get them all right
- 📊 Progress tracking with visual progress bar
- 🎯 Session completion tracking

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the migration file: `supabase/migrations/001_create_tables.sql`
4. Copy your Supabase credentials:
   - Go to **Project Settings** → **API**
   - Copy **Project URL** and **anon/public key**

### 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Add Data to Supabase

You can add flashcards via the Supabase Dashboard:

1. **Add Subjects:**
   - Go to **Table Editor** → `subjects`
   - Insert rows with `name` (e.g., "Contract Law", "Torts")

2. **Add Subtopics:**
   - Go to **Table Editor** → `subtopics`
   - Insert rows with `name` and `subject_id`

3. **Add Flashcards:**
   - Go to **Table Editor** → `flashcards`
   - Insert rows with:
     - `front_text`: The question/front of the card
     - `back_text`: The answer/back of the card
     - `subject_id`: (optional) UUID of a subject
     - `subtopic_id`: (optional) UUID of a subtopic

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
flashcard-app/
├── app/
│   ├── components/
│   │   ├── FlashcardModeSelector.tsx  # Mode selection UI
│   │   └── FlashcardStudy.tsx         # Main flashcard study component
│   ├── page.tsx                       # Main page
│   └── layout.tsx                     # Root layout
├── lib/
│   └── supabaseClient.ts              # Supabase client setup
├── supabase/
│   └── migrations/
│       └── 001_create_tables.sql      # Database schema
└── .env.local                          # Environment variables (create this)
```

## Database Schema

### Tables

- **subjects**: Subject categories (e.g., "Contract Law", "Torts")
- **subtopics**: Subtopics within subjects
- **flashcards**: The actual flashcards with front/back text

### Relationships

- `subtopics.subject_id` → `subjects.id`
- `flashcards.subject_id` → `subjects.id`
- `flashcards.subtopic_id` → `subtopics.id`

## Usage

1. **Choose Study Mode:**
   - **By Subject**: Study all flashcards for a specific subject
   - **By Subtopic**: Study flashcards for a specific subtopic
   - **Random Mix**: Study 25 random flashcards from all topics

2. **Study Flashcards:**
   - Click the flashcard to flip it
   - Mark as "Got it Right" or "Got it Wrong"
   - Cards you get wrong will be shown again after completing the set
   - Continue until you get all cards correct

3. **Track Progress:**
   - Progress bar shows your completion percentage
   - Card counter shows current position

## Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Database and backend
- **React Hooks** - State management

## License

MIT
