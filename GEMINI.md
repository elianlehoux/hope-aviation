# Antigravity AI Guidelines

Welcome to this Next.js + Supabase project. As the AI assistant (Antigravity), you must strictly adhere to the following rules and guidelines when generating, modifying, or reviewing code.

## 1. Technology Stack
- **Frontend & Framework**: Next.js
- **Backend**: Next.js (API Routes / Server Actions)
- **Database & Authentication**: Supabase
- **Styling**: Tailwind CSS

## 2. Reusability and Project Structure
- **CRITICAL - PREVENT DUPLICATION**: Before creating any new UI component, you **MUST** exhaustively search the components folder(s) to verify if a similar component already exists. Reuse, extend, or modify existing components rather than duplicating code.
- **Respect the Architecture**: Strictly follow the existing folders and file structure of the project. Do not create new organizational patterns unless explicitly instructed by the user.

## 3. Language & Documentation
- **ENGLISH ONLY FOR COMMENTS**: Absolutely **ALL** comments inside the codebase (inline comments, block comments, JSDocs, explanations) must be written in **English**. No exceptions. 
- Ensure that variable names, function names, and component names are also clearly written in English and follow standard naming conventions (e.g., camelCase, PascalCase).

## 4. Backend & Security (Maximum Priority)
- **Security First**: The backend (Next.js API/Server layers connecting to Supabase) demands the highest level of security and order.
- **Data Validation**: Always validate, sanitize, and type-check incoming payloads before processing them. 
- **Authentication & Authorization**: Never expose sensitive actions. Always verify the user's session and permissions before executing database operations.
- **Supabase Best Practices**: Rely on Supabase's Row Level Security (RLS) and securely manage Supabase service keys. Never expose secret keys to the client.
- **Error Handling**: Implement strict and secure error handling. Do not leak stack traces or sensitive database details to the frontend.

## 5. Development Best Practices
- Write clean, modular, and maintainable code.
- Prioritize functional and declarative programming paradigms where applicable.
- Keep components small, focused on a single responsibility, and decoupled from complex business logic whenever possible.

## 6. Styling Guidelines
- Strictly use **Tailwind CSS** for all styling needs.
- Avoid writing custom CSS files or using inline `style={{}}` tags unless there is an absolute necessity (e.g., dynamic calculated values that Tailwind cannot handle).
- Build fully responsive interfaces utilizing Tailwind's mobile-first breakpoints.

## 7. Project Structure & Organization
To maintain maximum order, any new code must be placed within its designated directory. Do not drift from this established scaffolding:

- **`app/`**: Contains the Next.js App Router structure.
  - `(auth)/`: Routes for authentication (login, register, forgot password).
  - `(dashboard)/`: Main application/dashboard routes.
  - `campus/`: **Virtual Campus** — the core product area of the application. Contains its own `layout.tsx` (sidebar + top bar) and the following sub-routes:
    - `courses/`: Course catalogue, enrolment, and module content.
    - `schedule/`: Calendar view for classes, exams, and live sessions.
    - `grades/`: Student performance, assessments, and transcripts.
    - `resources/`: Study materials, manuals, and references.
    - `community/`: Forums, discussions, and peer interaction.
    - `settings/`: Profile, preferences, and notification management.
  - `api/`: Backend Next.js API Routes.
- **`actions/`**: Next.js Server Actions for handling form submissions and data mutations securely on the server.
- **`components/`**: 
  - `ui/`: Base, generic, highly reusable UI components (e.g., Shadcn UI Buttons, Inputs).
  - `shared/`: Composite components used across various distinct pages or features.
  - `features/`: Complex, domain-specific components organized by business logic (e.g., `features/auth/LoginForm`, `features/campus/CourseCard`).
- **`hooks/`**: Custom React hooks (`use...`).
- **`lib/`**:
  - `supabase/`: Initialization, configuration, and middleware for the Supabase (Client, Server, Admin) clients.
  - `utils/`: Generic utility functions (e.g., Tailwind merge, formatting dates).
- **`services/`**: Third-party API wrappers or complex standalone business logic decoupled from React.
- **`types/`**: Global TypeScript definitions and interfaces.

## 8. Project Context
**Hope Aviation** is a virtual campus platform for aviation training and education. The root `/` serves a public-facing landing page. The `/campus` route group is the authenticated product area where students access courses, schedules, grades, resources, and community features. All campus-related components should live under `components/features/campus/` and campus-specific types under `types/`.

## 9. UI & Design System (Custom) - PREMIUM APPLE STYLE
To maintain the high-end, professional branding of Hope Aviation, all UI development **MUST** strictly adhere to the established "Premium Apple-style" design system:

- **CRITICAL - REUSE CUSTOM COMPONENTS**: Never recreate base UI elements. Always use the refined versions in `components/ui/` and `components/shared/` (e.g., `Button`, `Badge`, `Navbar`, `Table`, `Modal`).
- **Aesthetics & Effects**:
  - Use `backdrop-blur-xl` for navigation bars, modals, and overlays to create a sleek, translucent effect.
  - Borders should be minimal and subtle (typically `border-slate-100`).
  - Backgrounds for containers should be clean (`bg-white` or `bg-slate-50/50`).
- **Typography**:
  - Use `font-semibold` or `font-bold` with `tracking-tight` for a modern, compact look.
  - Headers should use the `Title` component with appropriate hierarchy.
- **Color Palette Consistency**:
  - **Primary**: Brand Deep Blue (`#00263e`).
  - **Secondary**: Soft Vibrant Blue tint (`bg-accent/10`, `text-accent`, `border-accent/20`).
  - **Accent**: Brand Vibrant Blue (`#1749ff`).
  - **Highlights**: Aviation Orange (`#ffaa00`).
- **Airy Layouts**: Ensure generous vertical padding (`py-4` to `py-10`) to allow content to "breathe" and maintain a premium feel.
- **Reference**: Always refer to the `/componentsdev` page to see the latest, correct implementation of every component and style.
