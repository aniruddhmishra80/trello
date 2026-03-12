<<<<<<< HEAD
<<<<<<< HEAD
# trello
=======
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
=======
# SprintMatrix (Trello Clone)
>>>>>>> a8b8672 (Initial commit)

A modern, production-ready Project Management Tool (Trello Clone) built with Next.js 15, tailored for agile teams and rigorous performance standards.

**Developed by Aniruddh Mishra (Bennett University) for the SDE Internship assessment.**

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Drag and Drop**: [@dnd-kit/core](https://dndkit.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🛠️ Local Setup Instructions

1. **Clone the repository** (if not already local)
   ```bash
   git clone <repository-url>
   cd trello-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file in the root directory and add the following keys from your Supabase and Clerk dashboards:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Database Migrations**
   Execute the SQL commands found in `database_schema.sql` within your Supabase SQL Editor to set up the advanced features layout (Labels, Due Dates, Checklists).

5. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🗄️ Database Schema Design

<<<<<<< HEAD
Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
>>>>>>> 8d69204 (Initial commit from Create Next App)
=======
This project utilizes a robust relational schema in Supabase PostgreSQL to handle the advanced Trello features.

### `workspaces`
- `id` (UUID, Primary Key)
- `title` (Text)
- `color` (Text)
- `user_id` (Text) - Links to Clerk Auth

### `sprint_phases` (Lists)
- `id` (UUID, Primary Key)
- `workspace_id` (UUID, Foreign Key)
- `title` (Text)
- `sort_order` (Integer)

### `tickets` (Cards)
- `id` (UUID, Primary Key)
- `phase_id` (UUID, Foreign Key)
- `title` (Text)
- `description` (Text)
- `priority` (Enum: low, medium, high)
- `sort_order` (Integer)
- `due_date` (Timestamp)
- `labels` (JSONB) - Stores an array of text labels
- `assignee` (Text)

### `checklists`
- `id` (UUID, Primary Key)
- `card_id` (UUID, Foreign Key to `tickets`)
- `title` (Text)
- `created_at` (Timestamp)

### `checklist_items`
- `id` (UUID, Primary Key)
- `checklist_id` (UUID, Foreign Key to `checklists`)
- `content` (Text)
- `is_completed` (Boolean)

## 🏗️ Architecture & Best Practices

- **Modularity**: Data-fetching logic has been decoupled from the UI blocks into dedicated service files (`lib/services/boardService.ts`, `lib/services/listService.ts`, `lib/services/cardService.ts`).
- **Custom Hooks**: The complex drag-and-drop mechanics using `@dnd-kit` have been extracted into `useKanbanDnD.ts` for clean Separation of Concerns.
- **Production Readiness**: Implements Next.js Error Boundaries (`error.tsx`) and concurrent Suspense loading (`loading.tsx` and Shadcn Skeletons) to ensure graceful error handling and high-quality UX.

## 🚢 Deployment (Vercel)

This application is structurally prepared for 1-click Vercel deployment.
1. Push your code to a GitHub repository.
2. Link the repository to a new Vercel Project.
3. Ensure you add all exactly matching environment variables (`.env.local`) to the Vercel project settings.
4. Deploy! Vercel handles the Next.js App Router optimizations automatically.

---
*End of README*
>>>>>>> a8b8672 (Initial commit)
