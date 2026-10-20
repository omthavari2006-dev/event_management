# Campus Event Management System (Neo4j)

A full-stack DBMS application built on the **Neo4j Graph Database**, **Node.js Express**, and **React**. Designed to showcase graph-native relationships, ACID concurrency control, waitlist auto-promotion, role-based access control, and collaborative event recommendations.

---

## Architecture Overview

```
+-------------------------------------------------------------+
| PRESENTATION LAYER (React + Vite + Modern Vanilla CSS)      |
| • Student Portal & Discovery Catalog                        |
| • Digital Entry Passes with Real-Time QR Codes              |
| • Club Organizer Studio (Attendance, Winners, Certificates) |
| • Admin Command Center (Venue Clash Check, Chart.js Stats)  |
| • Interactive Graph & Viva Voce Traversal Explorer          |
+------------------------------+------------------------------+
                               | REST API (JSON over HTTP)
+------------------------------v------------------------------+
| APPLICATION LAYER (Node.js + Express 4.x)                   |
| • Authentication & Graph-based RBAC (JWT, bcryptjs)         |
| • Controllers -> Services -> Repositories Layering          |
| • ACID Write Transactions & Concurrency Locks               |
| • Deterministic Certificate Generation & PDFKit Engine      |
+------------------------------+------------------------------+
                               | Bolt Protocol (neo4j-driver)
+------------------------------v------------------------------+
| DATA LAYER (Neo4j 5.x / AuraDB Free Cloud)                  |
| • Nodes: Admin, Student, Club, Event, Team, Certificate     |
| • Relationships: REGISTERED_FOR, ATTENDED, WON, LEADS, etc. |
| • Uniqueness Constraints, Composite & Full-Text Indexes     |
+-------------------------------------------------------------+
```

---

## Key Features

1. **Graph-Native Collaborative Filtering Recommendations**:
   - Suggests upcoming events based on peer graph paths: *(Me &rarr; Shared Events &rarr; Peers &rarr; Recommended Events)*.
2. **ACID Concurrency Control & Overbooking Prevention**:
   - Acquires exclusive write locks (`SET e._lock = timestamp()`) during registrations so simultaneous requests queue up sequentially.
3. **Automated Waitlist Promotion**:
   - When a student cancels their registration, the earliest waitlisted student is promoted to `Registered` and notified in the same transaction.
4. **Venue Clash Detection**:
   - Real-time pre-flight verification prevents scheduling two approved events at the same venue and overlapping time window.
5. **Team Formation with Size Limits**:
   - Students register and create teams with strict capacity enforcement.
6. **Digital Entry Passes & QR Verification**:
   - Dynamic QR codes generated for registrations; scan-ready for organizer gate check-ins.
7. **Verifiable PDF Certificates**:
   - Automatic issuance of Winner and Participation certificates with cryptographically signed verification codes and public verification portal.
8. **Admin Analytics Dashboard**:
   - Chart.js visualizations for department-wise participation, attendance rates %, top rated clubs, and no-shows.

---

## Folder Structure

```
Dbms/
├── README.md
├── docker-compose.yml              # Local Neo4j 5.x Docker setup with APOC
├── package.json                    # Root setup scripts
├── .env.example                    # Sample environment variables
│
├── database/
│   ├── 01_constraints_indexes.cypher  # Uniqueness constraints & indexes
│   ├── 02_sample_data.cypher          # Campus dataset with bcrypt passwords
│   ├── 03_core_operations.cypher      # Core transactional operations
│   ├── 04_analytics_queries.cypher    # 11 Standard & Graph-only Cypher queries
│   ├── 05_apoc_triggers.cypher        # APOC trigger reference (self-hosted)
│   └── seed.js                        # Automated Node.js seeder script
│
├── backend/
│   ├── package.json
│   ├── .env                           # Backend environment file
│   └── src/
│       ├── server.js                  # Entry point & connection verification
│       ├── app.js                     # Express app configuration
│       ├── config/                    # Neo4j driver & env variables
│       ├── middleware/                # JWT auth, RBAC roles, error handler
│       ├── routes/                    # REST API endpoints
│       ├── controllers/               # HTTP request handlers
│       ├── services/                  # Business logic & PDF generator
│       ├── repositories/              # Parameterized Cypher database queries
│       └── utils/                     # Neo4j result normalizer & helpers
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    # Root state coordinator
│       ├── index.css                  # Modern glassmorphic design system
│       ├── api/client.js              # Centralized API HTTP client
│       ├── components/                # Navbar, Event Modal, Pass QR, Auth
│       └── pages/                     # Events, Passes, Certs, Studio, Admin, Viva
│
└── docs/
    ├── er_to_graph_mapping.md         # RDBMS vs Graph mapping analysis
    ├── data_dictionary.md             # Node labels, types, constraints
    └── viva_prep.md                   # Examiner Q&A, demo workflows, ACID tips
```

---

## Quick Start Setup

### Step 1: Start Neo4j (Choose One)

#### Option A: Neo4j AuraDB (Cloud Database - Recommended)
1. Sign up for a free cloud instance at [Neo4j AuraDB](https://neo4j.com/cloud/platform/aura-graph-database/).
2. Copy your Connection URI (e.g. `neo4j+s://<id>.databases.neo4j.io`), username (`neo4j`), and password.
3. Paste these credentials into `backend/.env`.

#### Option B: Local Docker
Run the official Neo4j 5.x container with APOC enabled:
```bash
docker-compose up -d
```
Neo4j Browser will be available at `http://localhost:7474` (User: `neo4j` / Password: `campuspassword123`).

---

### Step 2: Seed the Database
Populate all constraints, indexes, clubs, students, events, registrations, and certificates automatically:
```bash
# From workspace root:
npm run seed
```

---

### Step 3: Run the Application

#### Start the Backend API:
```bash
npm run dev:backend
```
Backend API will start at: **`http://localhost:5000`**

#### Start the Frontend React Portal:
```bash
npm run dev:frontend
```
Frontend client will open at: **`http://localhost:5173`**

---

## User Accounts & Role-Based Access
 
Users can register and sign in with their own `@gmail.com` accounts directly via the Role-Based Login Screen (`http://localhost:5173`):
- **Admin**: Approve/reject clubs & events, monitor system-wide attendance, analytics, and completed event audits.
- **Organizer**: Create events for approved clubs, issue approvals to Admin, manage registrations, track check-ins, and conclude events.
- **Student**: Discover events, register within schedule windows, view passes, check-in, and download verifiable certificates.

---

## REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Public | User authentication with JWT |
| `/api/auth/register` | POST | Public | New student registration |
| `/api/events` | GET | Public | Filtered & full-text searched events |
| `/api/events` | POST | Organizer | Create club event |
| `/api/events/:id/approve` | PUT | Admin | Approve event (runs venue clash check) |
| `/api/registrations/:id` | POST | Student | Register with lock & auto-waitlist |
| `/api/registrations/:id` | DELETE | Student | Cancel registration & auto-promote peer |
| `/api/attendance/event/:id` | POST | Organizer | Mark student attendance |
| `/api/winners/event/:id` | POST | Organizer | Declare positions and prizes |
| `/api/certificates/my` | GET | Student | List user's verified certificates |
| `/api/certificates/verify` | GET | Public | Real-time verification by unique code |
| `/api/certificates/:id/download` | GET | Public | Stream official PDF certificate with QR |
| `/api/recommendations/events` | GET | Student | Collaborative filtering graph traversal |
| `/api/analytics/admin` | GET | Admin | System statistics & attendance metrics |
| `/api/analytics/leaderboard` | GET | Public | Points leaderboard (attendance + wins) |
