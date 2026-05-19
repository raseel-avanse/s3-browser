# Graph Report - .  (2026-05-19)

## Corpus Check
- Corpus is ~49,028 words - fits in a single context window. You may not need a graph.

## Summary
- 718 nodes · 1333 edges · 48 communities (41 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 34 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_User Management & RBAC|User Management & RBAC]]
- [[_COMMUNITY_REST API Routes|REST API Routes]]
- [[_COMMUNITY_App Pages & Navigation|App Pages & Navigation]]
- [[_COMMUNITY_NPM Runtime Dependencies|NPM Runtime Dependencies]]
- [[_COMMUNITY_Sidebar UI Components|Sidebar UI Components]]
- [[_COMMUNITY_Dev & Build Tools|Dev & Build Tools]]
- [[_COMMUNITY_Toast Notification State|Toast Notification State]]
- [[_COMMUNITY_shadcn Form Components|shadcn Form Components]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_shadcn Component Config|shadcn Component Config]]
- [[_COMMUNITY_File-Based Audit Logging|File-Based Audit Logging]]
- [[_COMMUNITY_Menubar Component|Menubar Component]]
- [[_COMMUNITY_S3 Browser UI|S3 Browser UI]]
- [[_COMMUNITY_Object Details Panel|Object Details Panel]]
- [[_COMMUNITY_Carousel Component|Carousel Component]]
- [[_COMMUNITY_S3 Client Operations|S3 Client Operations]]
- [[_COMMUNITY_Database Architecture Docs|Database Architecture Docs]]
- [[_COMMUNITY_PostgreSQL Migration & Infrastructure|PostgreSQL Migration & Infrastructure]]
- [[_COMMUNITY_shadcn Utility Components|shadcn Utility Components]]
- [[_COMMUNITY_Chart Component|Chart Component]]
- [[_COMMUNITY_Database Schema|Database Schema]]
- [[_COMMUNITY_Encryption & Bucket API|Encryption & Bucket API]]
- [[_COMMUNITY_Core Project Features|Core Project Features]]
- [[_COMMUNITY_Dropdown Component|Dropdown Component]]
- [[_COMMUNITY_Project Setup & Admin|Project Setup & Admin]]
- [[_COMMUNITY_localStorage Migration Script|localStorage Migration Script]]
- [[_COMMUNITY_Docker Deployment|Docker Deployment]]
- [[_COMMUNITY_App Icon & Branding|App Icon & Branding]]
- [[_COMMUNITY_Bucket Assignments & Permissions|Bucket Assignments & Permissions]]
- [[_COMMUNITY_Cloud & AI Integration|Cloud & AI Integration]]
- [[_COMMUNITY_Bucket Context & State|Bucket Context & State]]
- [[_COMMUNITY_DB Migration Script|DB Migration Script]]
- [[_COMMUNITY_Auth Middleware|Auth Middleware]]
- [[_COMMUNITY_Design Blueprint|Design Blueprint]]
- [[_COMMUNITY_Key Generation|Key Generation]]
- [[_COMMUNITY_DB Reset Script|DB Reset Script]]
- [[_COMMUNITY_DB Seed Script|DB Seed Script]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_IDE Settings|IDE Settings]]
- [[_COMMUNITY_Genkit AI Config|Genkit AI Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_TypeScript Language|TypeScript Language]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 55 edges
2. `dependencies` - 48 edges
3. `validateSession()` - 28 edges
4. `useAuth()` - 23 edges
5. `useToast()` - 21 edges
6. `compilerOptions` - 16 edges
7. `Button` - 15 edges
8. `transaction()` - 15 edges
9. `S3 Navigator Project` - 14 edges
10. `scripts` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `Firebase App Hosting` --semantically_similar_to--> `S3 Navigator Replit Environment Setup`  [INFERRED] [semantically similar]
  apphosting.yaml → docs/replit.md
- `First-Time Setup Guide` --semantically_similar_to--> `Quick Setup Steps (5-minute guide)`  [INFERRED] [semantically similar]
  docs/SETUP.md → QUICKSTART.md
- `Phase 1: Forced Password Change Flow` --semantically_similar_to--> `Forced Password Change on First Login`  [INFERRED] [semantically similar]
  docs/PHASE1_TESTING.md → QUICKSTART.md
- `Audit Logging for Bucket Operations` --semantically_similar_to--> `PCI-DSS Compliant Audit Trail`  [INFERRED] [semantically similar]
  docs/PHASE2_TESTING.md → README.md

## Hyperedges (group relationships)
- **Phased Migration from localStorage to PostgreSQL** — migration_guide_localstorage_to_pg, database_todo_phase_roadmap, setup_summary_db_infrastructure, phase1_forced_password_change, phase2_bucket_management, phase3_ui_integration [EXTRACTED 0.95]
- **Security Triad: Encryption + Authentication + Audit Logging** — readme_aes_256_gcm_encryption, readme_db_authentication, readme_pci_dss_audit_trail, database_todo_src_lib_encryption, database_todo_src_lib_auth, database_todo_src_lib_audit [INFERRED 0.88]
- **Docker Deployment Stack (App + PostgreSQL + pgAdmin)** — dockercompose_s3_navigator_service, dockercompose_db_postgres_service, dockercompose_db_pgadmin_service, docker_md_docker_guide [EXTRACTED 0.92]
- **App Icon Visual Identity Components** — icon_app_icon, icon_database_symbol, icon_gradient_style, icon_rounded_square_bg [INFERRED 0.90]

## Communities (48 total, 7 thin omitted)

### Community 0 - "User Management & RBAC"
Cohesion: 0.05
Nodes (75): ViewType, actionColors, ApiUser, roleBadgeClass, roleLabels, UserRole, UploadDialogProps, UploadFile (+67 more)

### Community 1 - "REST API Routes"
Cohesion: 0.06
Nodes (69): GET(), GET(), POST(), POST(), DELETE(), GET(), PATCH(), AuditLog (+61 more)

### Community 2 - "App Pages & Navigation"
Cohesion: 0.08
Nodes (41): AdminSettingsPage(), metadata, HomePage(), AuditLogPage(), BucketAssignmentsPage(), AppSidebar(), AppSidebarProps, roleBadgeClass (+33 more)

### Community 3 - "NPM Runtime Dependencies"
Cohesion: 0.04
Nodes (48): dependencies, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, bcrypt, class-variance-authority, clsx, date-fns, dotenv (+40 more)

### Community 4 - "Sidebar UI Components"
Cohesion: 0.07
Nodes (28): useIsMobile(), Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent (+20 more)

### Community 5 - "Dev & Build Tools"
Cohesion: 0.07
Nodes (27): devDependencies, genkit-cli, postcss, tailwindcss, @types/bcrypt, @types/jszip, @types/node, @types/pg (+19 more)

### Community 6 - "Toast Notification State"
Cohesion: 0.12
Nodes (22): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+14 more)

### Community 7 - "shadcn Form Components"
Cohesion: 0.09
Nodes (14): AccordionContent, AccordionItem, AccordionTrigger, PopoverContent, RadioGroup, RadioGroupItem, ScrollArea, ScrollBar (+6 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.1
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 9 - "shadcn Component Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 10 - "File-Based Audit Logging"
Cohesion: 0.14
Nodes (15): AuditEntry, AuditLogFile, getAuditLogPath(), listAuditLogDates(), readAuditLog(), writeAuditLog(), getLogoUrl(), LOGO_DIR (+7 more)

### Community 11 - "Menubar Component"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 12 - "S3 Browser UI"
Cohesion: 0.17
Nodes (13): CommonPrefix, S3BrowserProps, S3Item, Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList (+5 more)

### Community 13 - "Object Details Panel"
Cohesion: 0.18
Nodes (13): ObjectDetails(), ObjectDetailsProps, S3Item, formatBytes(), Separator, SheetContent, SheetContentProps, SheetDescription (+5 more)

### Community 14 - "Carousel Component"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 15 - "S3 Client Operations"
Cohesion: 0.29
Nodes (12): fetchAllObjectKeys(), getFolderContentsAsZip(), getItemsAsZip(), getObjectContent(), getObjectUrl(), getS3Client(), listObjects(), S3Config (+4 more)

### Community 16 - "Database Architecture Docs"
Cohesion: 0.19
Nodes (13): Open Design Questions (NextAuth vs custom, Redis vs PG sessions), 4-Phase Database Implementation Roadmap, src/lib/audit.ts (Audit Logging), src/lib/auth.ts (Authentication Utilities), src/lib/buckets.ts (Bucket CRUD), src/lib/db.ts (Connection Pool), src/lib/users.ts (User CRUD), Authentication Audit Logging (+5 more)

### Community 17 - "PostgreSQL Migration & Infrastructure"
Cohesion: 0.15
Nodes (13): pgAdmin 4 Docker Service, PostgreSQL 16 Docker Service, PostgreSQL Data Volume, Migration Guide: localStorage to PostgreSQL, Rationale: localStorage Limitations (no multi-device, no backup, plaintext creds), Rationale: PostgreSQL Benefits (persistent, auditable, encrypted), Migration Security Checklist, Legacy localStorage Storage (+5 more)

### Community 18 - "shadcn Utility Components"
Cohesion: 0.27
Nodes (11): cn(), ButtonProps, buttonVariants, Calendar(), CalendarProps, Pagination(), PaginationEllipsis(), PaginationLink() (+3 more)

### Community 19 - "Chart Component"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 20 - "Database Schema"
Cohesion: 0.2
Nodes (10): App Settings Table Schema, Audit Logs Table Schema (JSONB details), Bucket Assignments Table Schema, Buckets Table Schema (encrypted credentials), Database Schema (6 tables), Users Table Schema, Admin Self-Protection (cannot delete/deactivate self), Audit Log API (/api/audit) (+2 more)

### Community 21 - "Encryption & Bucket API"
Cohesion: 0.2
Nodes (10): src/lib/encryption.ts (AES-256-GCM), Audit Logging for Bucket Operations, Bucket CRUD REST API (/api/buckets), Phase 2: Bucket Management with Encrypted Credentials, Encrypted Credentials in Database, ENCRYPTION_KEY Environment Variable, localStorage to Database Migration Script, Permission-Based Bucket Access (+2 more)

### Community 22 - "Core Project Features"
Cohesion: 0.22
Nodes (10): AWS SDK @aws-sdk/client-s3, bcrypt Password Hashing, Database-Backed Authentication, Multi-Bucket Management Feature, Next.js 15 (App Router), Role-Based Access Control (RBAC), S3 Navigator Project, Next.js Server Actions (S3 operations) (+2 more)

### Community 23 - "Dropdown Component"
Cohesion: 0.2
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 24 - "Project Setup & Admin"
Cohesion: 0.25
Nodes (9): Default Admin Login (admin/admin), Audit Trail Feature, db.sh Management Script, Key Generation (npm run generate-keys), S3 Browser Application, Quick Setup Steps (5-minute guide), Architecture Overview (Next.js + PostgreSQL + pgAdmin), Production Deployment Checklist (+1 more)

### Community 25 - "localStorage Migration Script"
Cohesion: 0.32
Nodes (7): args, { Client }, crypto, encrypt(), fs, getEncryptionKey(), migrate()

### Community 26 - "Docker Deployment"
Cohesion: 0.29
Nodes (7): Docker Deployment Guide, Multi-Stage Docker Build Optimization, Nginx Reverse Proxy Configuration, Non-Root User Docker Security, Docker Healthcheck, Application Port 3000, s3-navigator Docker Service

### Community 27 - "App Icon & Branding"
Cohesion: 0.47
Nodes (6): S3 Browser App Icon, Database / Storage Cylinder Symbol, Orange-to-Pink Gradient Visual Style, Object / Bucket Storage Concept, Rounded Square Background Shape, S3 Browser Project

### Community 28 - "Bucket Assignments & Permissions"
Cohesion: 0.33
Nodes (6): BucketAssignmentContext, Bucket Assignments in localStorage (s3-bucket-assignments), Bucket Assignments Management Page, Permission Matrix (Owner/R-W/R-O), Provider Hierarchy (UserProvider > AuthProvider > BucketAssignmentProvider > BucketProvider), Enhanced BucketContext with Permissions

### Community 29 - "Cloud & AI Integration"
Cohesion: 0.33
Nodes (6): Firebase App Hosting, Max Instances Config (maxInstances: 1), Google AI Gemini 2.0 Flash (AI Integration), Google Genkit Framework, Development Port 5000, S3 Navigator Replit Environment Setup

### Community 30 - "Bucket Context & State"
Cohesion: 0.33
Nodes (3): Bucket, BucketContext, BucketContextType

### Community 31 - "DB Migration Script"
Cohesion: 0.4
Nodes (3): { Client }, fs, path

### Community 32 - "Auth Middleware"
Cohesion: 0.4
Nodes (3): authCheckRoutes, config, publicRoutes

### Community 33 - "Design Blueprint"
Cohesion: 0.5
Nodes (4): Credential Storage Core Feature, Folder/Object Navigation Feature, S3 Navigator Design Blueprint, UI Style Guidelines (Inter font, light blue #ADD8E6)

### Community 34 - "Key Generation"
Cohesion: 0.5
Nodes (3): crypto, encryptionKey, nextAuthSecret

### Community 37 - "Avatar Component"
Cohesion: 0.5
Nodes (3): Avatar, AvatarFallback, AvatarImage

## Knowledge Gaps
- **331 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+326 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `shadcn Utility Components` to `User Management & RBAC`, `NPM Runtime Dependencies`, `Sidebar UI Components`, `Avatar Component`, `Toast Notification State`, `shadcn Form Components`, `Menubar Component`, `S3 Browser UI`, `Object Details Panel`, `Carousel Component`, `Chart Component`, `Dropdown Component`?**
  _High betweenness centrality (0.195) - this node is a cross-community bridge._
- **Why does `BucketBrowserPage()` connect `App Pages & Navigation` to `REST API Routes`?**
  _High betweenness centrality (0.158) - this node is a cross-community bridge._
- **Why does `getBucketById()` connect `REST API Routes` to `App Pages & Navigation`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _331 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `User Management & RBAC` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `REST API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `App Pages & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._