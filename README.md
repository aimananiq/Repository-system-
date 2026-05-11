# 📁 Repository System

A complete, production-quality **internal staff file repository** built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. Staff can upload, search, browse, and download softcopy documents — with full role-based access control and a dedicated admin panel.

---

## 🚀 Live Demo

> Run locally with the setup instructions below.

**Default Login Credentials:**

| Role | Email | Password |
|------|-------|----------|
| 🔐 Admin | `admin@example.com` | `Admin123!` |
| 👤 Staff (HR) | `sarah.johnson@example.com` | `Staff123!` |
| 👤 Staff (Finance) | `michael.chen@example.com` | `Staff123!` |
| 👤 Staff (Marketing) | `emily.rodriguez@example.com` | `Staff123!` |

---

## ✨ Features

### 🔒 Authentication & Access Control
- Secure login with email or username + password
- Role-based access: **Admin** and **Staff**
- Route protection — unauthenticated users redirected to login
- Staff only see files their department has permission to access
- Inactive accounts are blocked from logging in

### 📊 Staff Dashboard
- Personalized greeting and file overview
- Real-time search by file name, description, category, type, or uploader
- Filter by file type (PDF, Word, Excel, CSV, Spreadsheet)
- Filter by category/department
- Sort by newest, oldest, name A–Z, name Z–A, or file type
- Toggle between **Grid** and **List** (table) view
- Pagination — 12 files per page

### 🔍 Search
- Search bar with **Search button** and **Enter key** support
- Clear/reset button to wipe search instantly
- Loading state while fetching results
- "No files found" empty state with reset action
- Partial keyword and case-insensitive matching
- Combines with filters and sorting

### 📂 Browse Files
- Card view with file icon, title, metadata, category badge
- Table view with sortable columns (responsive — hides columns on mobile)
- File detail page: full description, tags, access level, download button
- External link support for Google Sheets / spreadsheets

### 🛠️ Admin Panel
Dedicated admin section with collapsible sidebar (desktop) and mobile nav:

| Section | Capabilities |
|---------|-------------|
| **Dashboard** | Stats cards, quick actions, recent files |
| **Register Staff** | Create accounts with department, role, and per-category permissions |
| **Manage Staff** | Search, edit, activate/deactivate, delete staff accounts |
| **Upload File** | Drag & drop upload with progress bar, or paste a spreadsheet link |
| **Manage Files** | Search, edit metadata, change permissions, delete files |

### 📤 File Upload
- Drag & drop or click-to-browse file picker
- Accepted formats: PDF, DOC, DOCX, XLS, XLSX, CSV
- File size validation (max 50 MB)
- Upload progress bar (animated simulation)
- Spreadsheet link option (Google Sheets, etc.)
- Per-department access permission picker
- Tags, description, category, and access level fields

---

## 🗂️ Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── login/                  # Login page
│   ├── dashboard/              # Staff dashboard
│   ├── files/
│   │   ├── page.tsx            # Browse files
│   │   └── [id]/page.tsx       # File detail
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── layout.tsx          # Admin layout with sidebar
│   │   ├── staff/
│   │   │   ├── page.tsx        # Manage staff
│   │   │   └── create/page.tsx # Register staff
│   │   └── files/
│   │       ├── page.tsx        # Manage files
│   │       └── upload/page.tsx # Upload file
│   ├── unauthorized/           # 403 page
│   ├── not-found.tsx           # 404 page
│   └── layout.tsx              # Root layout
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top nav for staff view
│   │   ├── Sidebar.tsx         # Collapsible admin sidebar
│   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   └── AdminRoute.tsx      # Admin-only guard
│   ├── files/
│   │   ├── FileCard.tsx        # File card (grid view)
│   │   ├── FileTable.tsx       # File table (list view)
│   │   ├── FileFilters.tsx     # Filter dropdowns
│   │   ├── FileIcon.tsx        # File type icon + badge
│   │   └── SearchBar.tsx       # Search input + button
│   └── ui/
│       ├── Button.tsx          # Multi-variant button
│       ├── Input.tsx           # Labeled input with error
│       ├── Select.tsx          # Styled select dropdown
│       ├── Modal.tsx           # Accessible modal dialog
│       ├── LoadingSpinner.tsx  # Spinner (inline or full-page)
│       ├── EmptyState.tsx      # Empty result state
│       ├── Pagination.tsx      # Page controls
│       └── Badge.tsx           # Status/category badge
│
├── lib/
│   ├── auth.ts                 # Auth service (login, logout, guards)
│   ├── fileService.ts          # File CRUD + search/filter logic
│   ├── staffService.ts         # Staff CRUD
│   ├── mockData.ts             # Pre-seeded users and files
│   ├── storage.ts              # SSR-safe localStorage wrapper
│   └── utils.ts                # Helpers (format, search, id gen)
│
└── types/
    ├── user.ts                 # User, AuthUser, LoginCredentials
    └── repositoryFile.ts       # RepositoryFile, FileFilters, enums
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Data | `localStorage` mock backend (no server needed) |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/aimananiq/Repository-system-.git
cd Repository-system-

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Other Commands

```bash
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Lint check
```

---

## 📋 Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Sign-in page |
| `/dashboard` | Staff + Admin | Search & browse files |
| `/files` | Staff + Admin | Browse all accessible files |
| `/files/[id]` | Staff + Admin | File detail + download |
| `/admin` | Admin only | Admin dashboard |
| `/admin/staff` | Admin only | Manage staff accounts |
| `/admin/staff/create` | Admin only | Register new staff |
| `/admin/files` | Admin only | Manage all files |
| `/admin/files/upload` | Admin only | Upload new file |
| `/unauthorized` | Public | 403 access denied |

---

## 🗃️ Data Models

### User
```typescript
{
  id: string
  fullName: string
  email: string
  username: string
  password: string
  role: 'admin' | 'staff'
  department: string
  permissions: string[]   // e.g. ['HR', 'Finance']
  isActive: boolean
  createdAt: string
}
```

### RepositoryFile
```typescript
{
  id: string
  title: string
  originalFileName: string
  description: string
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'csv' | 'sheet'
  fileSize: number
  category: string
  department: string
  accessLevel: 'public' | 'department' | 'restricted'
  accessPermissions: string[]
  uploadedBy: string
  uploadedByName: string
  uploadedAt: string
  fileUrl: string
  spreadsheetLink?: string
  tags: string[]
  isActive: boolean
}
```

---

## 🔐 How Access Control Works

- **Admin** — sees all files, all staff, all admin pages
- **Staff** — sees only files where their department is listed in `accessPermissions`
- Files with `accessLevel: 'public'` are visible to all active staff
- Inactive staff accounts cannot log in

---

## 📦 Pre-seeded Mock Data

The app ships with **15 sample files** and **6 user accounts** stored in `localStorage` on first load:

| Category | Files |
|----------|-------|
| HR | Employee Handbook, Staff Directory, Recruitment Guide, Annual Leave Policy |
| Finance | Q1 Report, Budget Planning Spreadsheet |
| IT | Security Policy, Network Infrastructure Diagram |
| Marketing | Campaign Results, Google Analytics Dashboard |
| Operations | Operations Manual |
| Legal | Contract Templates |
| Sales | Sales Performance Data |
| Procurement | Procurement Policy |
| Engineering | Engineering Standards Guide |

---

## 🔄 Connecting to a Real Backend

All data logic is isolated inside `src/lib/`:

- Replace `fileService.ts` → call your REST/GraphQL API
- Replace `staffService.ts` → call your user management API
- Replace `auth.ts` → integrate JWT / session auth
- The UI components and pages require **zero changes**

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Login | Clean login form with demo credential shortcuts |
| Dashboard | Search bar, filters, grid/list toggle, file cards |
| File Detail | Full metadata, tags, download/open button |
| Admin Dashboard | Stats cards, quick actions, recent files |
| Upload | Drag & drop with progress bar, permission picker |
| Staff Management | Searchable table with inline edit/delete |

---

## 📄 License

MIT — free to use for internal or commercial projects.

---

> Built with ❤️ using Next.js 14 + TypeScript + Tailwind CSS
