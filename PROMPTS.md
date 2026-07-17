# AI Tooling Chat History (PROMPTS.md)

This file contains the prompts and instructions provided to the AI assistant during the development of the Car Dealership Inventory System.

## Chat Session: 2026-07-17

### Prompt 1 (User Request):
```text
yes i want to built an website but i can access easily that way i have to made
```

*Response*: Greeted the user, introduced Antigravity, suggested creating a project at `C:\Users\Dell\.gemini\antigravity\scratch\car-dealership-inventory` using HTML/CSS/JS or Node/React.

---

### Prompt 2 (User Request):
```text
TDD Kata: Car Dealership Inventory System 

Objective 
The goal of this kata is to design, build, and test a full-stack Car Dealership Inventory System...
[Included full requirements for Backend API, User Authentication, Endpoints, React + Tailwind Frontend, TDD, AI Co-authorship rules, and deliverables]
...
my all clg friend will use ai tools make some best website with mern stack technologies with all provided detailed that make my website different websites from others dont make complex and the company is incybyte which is asking for assesment round and the comapny also focus on test driven development so make proper and modern website wirth simpler code 
```

*Response*: Created an implementation plan explaining the MERN/TypeScript/SQLite project structure, routing, components, testing strategy using Vitest, and requested user feedback.

---

### Prompt 3 (User Request):
```text
okay run this if all is as per job description and this is my github https://github.com/parshwa016
```

*Response*: Set up task checklist, initialized Git repository locally, configured user name and email to align with the candidate's GitHub, and wrote `.gitignore`.

---

### Prompts 4-10 (Development Phase - Automated Execution):
During the automated execution phase, the AI pair-programmer performed the following instructions sequentially:

1. **Backend Scaffolding & Setup**:
   - Initialized a Node.js + TypeScript project under `/backend`.
   - Setup Prisma ORM with SQLite (`dev.db`) for a zero-configuration persistent storage model.
   - Installed Express, Vitest, Supertest, JWT, and Bcrypt dependencies.

2. **TDD Auth Loop (Red-Green-Refactor)**:
   - Wrote auth integration tests (`auth.test.ts`) covering register, login, duplicate email handling, and password comparison.
   - Witnessed compilation and test failures (Red).
   - Implemented `authController.ts`, `authRoutes.ts`, and `app.ts` to satisfy requirements.
   - Executed Vitest to verify all 6 auth integration tests passed (Green).

3. **TDD Vehicle Loop (Red-Green-Refactor)**:
   - Wrote vehicle integration tests (`vehicles.test.ts`) covering listing, search queries, creation, updates, and deletion.
   - Witnessed 13 test failures (Red).
   - Implemented `authMiddleware.ts` to verify JWT, `vehicleController.ts` for CRUD actions, and mapped Express routes.
   - Executed Vitest to verify all 20 tests passed (Green).

4. **TDD Inventory Loop (Red-Green-Refactor)**:
   - Wrote inventory integration tests (`inventory.test.ts`) for car purchases (decreases stock) and restocking (admin only).
   - Witnessed failures (Red).
   - Implemented `purchaseVehicle` and `restockVehicle` controller endpoints.
   - Created `vitest.config.ts` to run test suites sequentially, preventing SQLite thread collisions.
   - Executed Vitest to verify all 28 backend tests passed (Green).

5. **Frontend Scaffolding & Tailwind**:
   - Bootstrapped React + TypeScript app in `/frontend` using Vite.
   - Installed Tailwind CSS, PostCSS, Autoprefixer, Lucide Icons, and React Router.
   - Wrote `index.css` incorporating custom scrollbars and base layout styles.

6. **Frontend Component & Page Development**:
   - Created `api.ts` utility for handling requests with automatic JWT header inclusion.
   - Created `AuthContext.tsx` for token and user session persistence.
   - Built a beautiful responsive `Navbar.tsx`, `SearchBar.tsx`, `VehicleCard.tsx` (using category-based SVG car gradients), and `VehicleModal.tsx` for admin actions.
   - Built `Login.tsx`, `Register.tsx` (with User/Admin role toggle), `Dashboard.tsx` (with live search filters and analytics stats), and a dedicated `AdminPanel.tsx` database audit hub.

7. **TDD Frontend Utility**:
   - Wrote unit tests for client-side search query, category, and pricing filter logic (`filters.test.ts`).
   - Witnessed failure (Red).
   - Implemented `filters.ts` utility.
   - Executed Vitest to verify all 6 frontend tests passed (Green).

8. **Database Seeder**:
   - Wrote `seed.ts` to seed the database with 9 premium vehicles (Tesla, Porsche, BMW, etc.) to populate the UI automatically.
   - Configured `package.json` to trigger seeding on push resets.

9. **Documentation**:
   - Created `README.md` with full technical description, setup guide, testing reports, and AI Usage reflection.

10. **Startup Automation**:
    - Created `run.bat` at the project root to launch both the Express backend and Vite frontend development servers concurrently in separate command prompt windows.
