# ER Diagram to Graph Model Mapping

## 1. Conceptual Shift: Relational (MySQL) to Graph (Neo4j)

Campus event management is fundamentally about connected networks: students register for events organized by clubs, collaborate in teams, win distinctions, and leave feedback. 

In a relational database, traversals across these connections require multi-table JOINs across junction tables (e.g., `Event_Registrations`, `Team_Members`). In Neo4j, these connections are **first-class citizens (Relationships)** that point directly to adjacent nodes in memory (Index-Free Adjacency).

| Relational Concept (RDBMS) | Graph Concept (Neo4j) | Implementation in this Project |
| :--- | :--- | :--- |
| **Table** | **Node Label** | `:Student`, `:Club`, `:Event`, `:Team`, `:Certificate`, `:Admin`, `:Notification` |
| **Row** | **Node** | An individual student, event, or club entity |
| **Foreign Key (FK)** | **Relationship** | `(:Student)-[:PRESIDENT_OF]->(:Club)` replaces `Club.president_id` |
| **Junction Table** | **Relationship with Properties** | `(:Student)-[:REGISTERED_FOR {status, time}]->(:Event)` |
| **Costly Multi-Table JOINs** | **Index-Free Traversals** | Traversed in $O(k)$ time proportional to relationships, not table size |
| **Triggers (Native)** | **Service-Layer Transactions / APOC** | Node write-lock concurrency and atomic waitlist promotion |
| **Normalization (1NF–3NF)** | **Query-Driven Modeling** | No junction tables; relationships carry context |

---

## 2. ER Element to Graph Model Translation

```
                              (Admin)
                             /       \
                      APPROVED       APPROVED
                           v           v
 (Student)---PRESIDENT_OF / MEMBER_OF_CLUB--->(Club)---ORGANIZES--->(Event)
     |                                                                ^ ^ ^ ^
     |---REGISTERED_FOR (status, time)--------------------------------+ | | |
     |---ATTENDED (timeMarked)----------------------------------------+ | |
     |---WON (position, prize)------------------------------------------+ |
     |---GAVE_FEEDBACK (rating, comment)----------------------------------+
     |
     |---LEADS--->(Team)---FOR_EVENT--->(Event)
     |---IN_TEAM--->(Team)
     |
     |---RECEIVED--->(Notification)
     <---AWARDED_TO---(Certificate)<---ISSUES---(Event)
```

### Detailed Mapping Breakdown:

1. **ADMIN, STUDENT, CLUB, EVENT**:
   - Modeled as primary Nodes (`:Admin`, `:Student`, `:Club`, `:Event`).
   - Unique identifiers (`adminId`, `studentId`, `clubId`, `eventId`) backed by uniqueness constraints.

2. **REGISTRATION Junction Table &rarr; `REGISTERED_FOR` Relationship**:
   - Instead of a table with foreign keys `(student_id, event_id)`, a directed relationship `(s)-[:REGISTERED_FOR]->(e)` is used.
   - Properties: `registrationId`, `time`, `status` (`Registered`, `Waitlisted`, `Cancelled`).
   - Prevent duplicates: Enforced using Cypher `MERGE`.

3. **ATTENDANCE &rarr; `ATTENDED` Relationship**:
   - Relational foreign keys replaced with `(s)-[:ATTENDED {timeMarked}]->(e)`.
   - Absence is simply the non-existence of this relationship.

4. **WINNERS &rarr; `WON` Relationship**:
   - `(s)-[:WON {position, prize}]->(e)`.
   - Requires an existing `ATTENDED` relationship (business rule).

5. **FEEDBACK &rarr; `GAVE_FEEDBACK` Relationship**:
   - `(s)-[:GAVE_FEEDBACK {feedbackId, rating, comment, time}]->(e)`.
   - `MERGE` ensures only 1 feedback per student per event.

6. **TEAMS & TEAM MEMBERS**:
   - `Team` is a node because it has its own identity, name, and attributes.
   - `(s)-[:LEADS]->(t)` designates the team leader.
   - `(s)-[:IN_TEAM]->(t)` captures membership (including the leader).
   - `(t)-[:FOR_EVENT]->(e)` binds the team to a specific event.

7. **CERTIFICATES**:
   - Fixed original ER ambiguity (where Certificate was duplicated across entities).
   - Modeled as a single node `:Certificate` with deterministic ID `eventId + '_' + studentId`.
   - Linked via `(e)-[:ISSUES]->(cert)` and `(cert)-[:AWARDED_TO]->(s)`.
   - Includes unique public `verificationCode` and PDF file link.

8. **CLUB MEMBERSHIP & ORGANIZER ROLES**:
   - `(s)-[:PRESIDENT_OF]->(c)` and `(s)-[:MEMBER_OF_CLUB {role, joinedDate}]->(c)`.
   - Organizers and Presidents hold event-creation rights through graph-based role checks.
