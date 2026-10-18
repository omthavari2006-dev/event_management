# Viva Voce & Defense Checklist

This document contains proven answers to examiner questions, demonstration workflows, and key technical concepts implemented in the **Campus Event Management System (Neo4j)**.

---

## 1. Top Viva Voce Questions & Crisp Answers

### Q1: Why did you choose a Graph Database (Neo4j) instead of a Relational Database (MySQL / PostgreSQL)?
> **Examiner-Ready Answer:**
> Campus event management is inherently a **highly connected network**. Students attend events, clubs organize events, students lead and form teams, and students win awards. 
> In MySQL, queries like *"Find events recommended based on peers who attended the same events as me"* or *"Find friends going to this event"* require 4 to 6 JOINs across junction tables (`Students`, `Registrations`, `Events`, `Club_Memberships`), which scales poorly ($O(N)$ table scans).
> In Neo4j, relationships are **first-class citizens with Index-Free Adjacency** — traversing from a student to their friends and events is a pointer hop that takes $O(k)$ time, proportional to connected nodes rather than total table size. Furthermore, junction tables disappear because relationships themselves carry properties.

### Q2: How do you prevent overbooking and race conditions when multiple students register for the last seat?
> **Examiner-Ready Answer:**
> We implement **strict concurrency control inside a single ACID write transaction**:
> 1. We first execute a write update on the target Event node: `SET e._lock = timestamp()`.
> 2. In Neo4j, updating a property on a node acquires an **exclusive write lock** on that node for the duration of the transaction.
> 3. Concurrent requests attempting to register for the same event queue up sequentially behind that lock.
> 4. Inside the locked transaction, we count the current `Registered` students.
> 5. If seats remain, the status is set to `Registered`; if full, it is automatically assigned `Waitlisted`.
> 6. Because check and write occur atomically under the lock, race conditions and overbooking are physically impossible.

### Q3: How do you prevent duplicate registrations, feedback, and certificates?
> **Examiner-Ready Answer:**
> 1. **Registrations & Feedback:** We use the Cypher `MERGE` clause instead of `CREATE`:
>    `MERGE (s)-[reg:REGISTERED_FOR]->(e)`. `MERGE` guarantees idempotent execution — if the relationship already exists, it updates properties instead of duplicating.
> 2. **Certificates:** We enforce deterministic natural keys: `certificateId = eventId + '_' + studentId` with a database **Uniqueness Constraint**.

### Q4: Does Neo4j support Triggers like SQL?
> **Examiner-Ready Answer:**
> Neo4j Community Edition and AuraDB Free do not have native SQL-like triggers. We handle triggers through **Service-Layer ACID Transactions** (Approach A), where actions like waitlist auto-promotion and notification creation run atomically in the same write transaction as the triggering cancellation.
> For self-hosted enterprise setups, Neo4j supports **APOC Triggers** (`apoc.trigger.add`), which we have documented and prepared in `database/05_apoc_triggers.cypher`.

### Q5: Is Neo4j ACID Compliant?
> **Examiner-Ready Answer:**
> Yes, Neo4j is fully ACID compliant:
> - **Atomicity:** All operations within `session.executeWrite()` commit together or rollback completely on error.
> - **Consistency:** Enforced via schema uniqueness constraints and existence validation.
> - **Isolation:** Uses Read Committed isolation with exclusive write locks on modified nodes and relationships.
> - **Durability:** Changes are recorded in Write-Ahead Transaction Logs (WAL) before confirmation.

### Q6: Why is there no Normalization (1NF–3NF) in your project?
> **Examiner-Ready Answer:**
> Normalization is a relational design technique to eliminate redundancy caused by decomposing tables into tabular rows. In graph modeling, we model **directly around query traversal patterns**. Data is stored as connected nodes and relationships, which inherently removes junction tables without requiring artificial normalization steps.

---

## 2. Live Viva Demonstration Steps

During your project defense, demonstrate these features live:

### Demo 1: Graph-Powered Collaborative Recommendations
1. Open the **Discover** tab as `Alex Rivera`.
2. Notice the **Recommended for You** banner at the top.
3. Show the examiner that it suggests events registered by peers who shared past events with Alex (`evt-005` Collegiate Debate).
4. Switch to the **Graph & Viva** tab &rarr; click **1. Event Recommendations** to show the live Cypher query and visual path.

### Demo 2: Concurrency & Waitlist Auto-Promotion
1. Open `Deep Learning & Vision Masterclass` (which has capacity set to 3).
2. Show that 3 seats are full (`stud-001`, `stud-002`, `stud-004`) and `Rahul Verma` (`stud-005`) is on the waitlist.
3. Click **Cancel Registration** for `Alex Rivera`.
4. Point out the live alert: *"A seat opened up! Student Rahul Verma was automatically promoted from the waitlist!"*.
5. Show the notification received in Rahul's inbox.

### Demo 3: Venue Clash Prevention
1. Go to **Admin** tab.
2. Under **Pending Events**, show `Quantum Computing Symposium` scheduled at `Auditorium Hall A`.
3. Highlight the red **Venue Conflict Warning**: It clashes with `Campus Hackathon 2026` already approved at that same venue and time window.

### Demo 4: Shortest Path Between Students
1. Navigate to **Graph & Viva** tab &rarr; select **2. Degrees of Connection**.
2. Pick `Student A: Alex Rivera` and `Student B: Marcus Chen`.
3. View the shortest path traversal: `(Alex)-[:ATTENDED]->(Collegiate Debate)<-[:ATTENDED]-(Marcus)` (2 degrees of separation).

### Demo 5: Verifiable PDF Certificates with QR Code
1. Navigate to **Certificates** tab.
2. Click **Download PDF** on the Winner Certificate.
3. Open the PDF to show the official certificate layout, dean signature, and embedded verification QR code.
4. Scan the QR code or enter the code on the **Verify** tab to prove public instant verification.

---

## 3. Query Profiling & Performance (EXPLAIN and PROFILE)

To impress your examiner with performance tuning:
1. Open Neo4j Browser (`http://localhost:7474`).
2. Run:
   ```cypher
   PROFILE MATCH (e:Event {status: 'Approved'})
   RETURN e.name, e.startDateTime;
   ```
3. Show that Neo4j uses `NodeIndexSeek` on `event_status_startDateTime` instead of an expensive full table/node scan `AllNodesScan`.
