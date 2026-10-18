# ER DIAGRAM TO GRAPH MODEL MAPPING
## Campus Event Management System

This document maps the **Campus Event Management System ER Diagram** to the **Neo4j Graph Database Model**.

---

## 1. Relational ER Diagram Breakdown (12 Entities)

```
                            +---------------+               +--------------+
                            |     ADMIN     |---Approves--->|     CLUB     |
                            +---------------+ (1:M)         +--------------+
                                   | (1:M)                         | (1:M)
                                Approves                       Organizes
                                   v                               v
                            +---------------+               +--------------+
              +--Has Teams--|     EVENT     |<-----Has------| REGISTRATION |<--Registers--+
              | (1:M)       +---------------+ (1:M)         +--------------+ (M:1)        |
              v                |    |    |                                                |
       +--------------+        |    |    +---Issues (1:M)--> +-------------+              |
       |     TEAM     |        |    |                        | CERTIFICATE |              |
       +--------------+        |    +--------Declares(1:M)-> +-------------+              |
              | (1:M)          |                             |   WINNER    |              |
         Has Members           +-------------Records (1:M)-> +-------------+              |
              v                                              | ATTENDANCE  |              |
       +--------------+                                      +-------------+              |
       | TEAM_MEMBER  |                                                                   |
       +--------------+                                                             +-----------+
                                                                                    |  STUDENT  |
                                                                                    +-----------+
                                                                                      |       |
                                                                           Gives (1:M)|       | Receives (1:M)
                                                                                      v       v
                                                                               +----------+ +--------------+
                                                                               | FEEDBACK | | NOTIFICATION |
                                                                               +----------+ +--------------+
```

---

## 2. Entity-by-Entity Attribute & Key Specification

| Entity / Table | Attributes (* = Primary Key, # = Foreign Key) | Relational Type | Role in Campus System |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `*AdminID`, `Name`, `Email`, `Password` | Strong Entity | Dean / Campus Administrator approving clubs & events |
| **CLUB** | `*ClubID`, `ClubName`, `Description`, `FacultyAdvisor`, `#PresidentID`, `CreatedDate` | Strong Entity | Student club organizing campus events |
| **EVENT** | `*EventID`, `EventName`, `EventType`, `Description`, `Venue`, `Date`, `Time`, `RegDeadline`, `MaxParticipants`, `Status` | Strong Entity | Workshops, hackathons, sports, cultural events |
| **STUDENT** | `*StudentID`, `Name`, `Email`, `Phone`, `Department`, `Year`, `Password` | Strong Entity | Campus student registering, forming teams, winning prizes |
| **REGISTRATION**| `*RegistrationID`, `#StudentID`, `#EventID`, `RegistrationDate`, `Status` | Junction / Weak | Links student registration to event with capacity & waitlist |
| **TEAM** | `*TeamID`, `#EventID`, `TeamName`, `#LeaderID` | Entity | Student project / hackathon team for an event |
| **TEAM_MEMBER** | `*#TeamID`, `*#StudentID` *(Composite Primary Key)* | Junction Table | Resolves Many-to-Many team membership |
| **ATTENDANCE** | `*AttendanceID`, `#EventID`, `#StudentID`, `Status`, `TimeMarked` | Junction / Weak | Check-in attendance records per event |
| **WINNER** | `*WinnerID`, `#EventID`, `#StudentID`, `Position`, `Prize` | Junction / Weak | 1st, 2nd, 3rd place distinctions |
| **CERTIFICATE**| `*CertificateID`, `#StudentID`, `#EventID`, `CertificateURL`, `IssueDate` | Entity | Verifiable credential with verification code and PDF link |
| **FEEDBACK** | `*FeedbackID`, `#StudentID`, `#EventID`, `Rating`, `Comment`, `Date` | Junction / Weak | 1 to 5 star student review per completed event |
| **NOTIFICATION**| `*NotificationID`, `#StudentID`, `Title`, `Message`, `Status`, `CreatedAt` | Weak Entity | Alerts for registration, promotions, and certificates |

---

## 3. How the Relational Model Translates to Neo4j Graph Model

In a relational database (MySQL), relationships between entities require foreign key columns and separate junction tables (`REGISTRATION`, `TEAM_MEMBER`, `ATTENDANCE`, `WINNER`, `FEEDBACK`).

In Neo4j, **junction tables disappear**. They become **direct graph relationships (edges)** that carry their own properties.

| Relational ER Element | Graph Representation | Graph Implementation & Properties |
| :--- | :--- | :--- |
| `ADMIN` table | Node `:Admin` | `(:Admin {adminId, name, email, passwordHash})` |
| `CLUB` table | Node `:Club` | `(:Club {clubId, name, description, facultyAdvisor, status, createdDate})` |
| `EVENT` table | Node `:Event` | `(:Event {eventId, name, type, description, venue, startDateTime, endDateTime, registrationDeadline, maxParticipants, maxTeamSize, status})` |
| `STUDENT` table | Node `:Student` | `(:Student {studentId, name, email, phone, department, year, passwordHash, points})` |
| `TEAM` table | Node `:Team` | `(:Team {teamId, name, createdTimestamp})` |
| `CERTIFICATE` table | Node `:Certificate` | `(:Certificate {certificateId, type, verificationCode, fileUrl, issueDate})` |
| `NOTIFICATION` table | Node `:Notification` | `(:Notification {notificationId, title, message, status, createdTimestamp})` |
| `ADMIN Approves CLUB` | Relationship | `(Admin)-[:APPROVED {approvalTime}]->(Club)` |
| `ADMIN Approves EVENT`| Relationship | `(Admin)-[:APPROVED {approvalTime}]->(Event)` |
| `CLUB Organizes EVENT`| Relationship | `(Club)-[:ORGANIZES]->(Event)` |
| `CLUB.PresidentID` FK | Relationship | `(Student)-[:PRESIDENT_OF {sinceDate}]->(Club)` |
| `REGISTRATION` table | Relationship | `(Student)-[:REGISTERED_FOR {registrationId, time, status}]->(Event)` |
| `ATTENDANCE` table | Relationship | `(Student)-[:ATTENDED {timeMarked}]->(Event)` |
| `WINNER` table | Relationship | `(Student)-[:WON {position, prize, declaredAt}]->(Event)` |
| `FEEDBACK` table | Relationship | `(Student)-[:GAVE_FEEDBACK {feedbackId, rating, comment, time}]->(Event)` |
| `TEAM.EventID` FK | Relationship | `(Team)-[:FOR_EVENT]->(Event)` |
| `TEAM.LeaderID` FK | Relationship | `(Student)-[:LEADS]->(Team)` |
| `TEAM_MEMBER` table | Relationship | `(Student)-[:IN_TEAM {joinedTime}]->(Team)` |
| `EVENT Issues CERTIFICATE` | Relationship | `(Event)-[:ISSUES]->(Certificate)` |
| `CERTIFICATE to STUDENT` | Relationship | `(Certificate)-[:AWARDED_TO]->(Student)` |
| `STUDENT Receives NOTIFICATION` | Relationship | `(Student)-[:RECEIVED]->(Notification)` |

---

## 4. Key Advantages of the Graph Model over Relational Model

1. **Junction Tables are Eliminated**:
   - `TEAM_MEMBER`, `REGISTRATION`, `ATTENDANCE`, `WINNER`, and `FEEDBACK` do not need separate tables or foreign key constraints. Relationships natively connect nodes and store attributes.

2. **Index-Free Adjacency**:
   - In MySQL, answering *"Which events did friends of Alex attend?"* requires 5 JOINs across `Student`, `Registration`, `Event`, `Registration`, and `Student`.
   - In Neo4j, it is a direct pointer traversal:
     ```cypher
     MATCH (s:Student {studentId: 'stud-001'})-[:ATTENDED]->(e:Event)<-[:ATTENDED]-(peer:Student)
     RETURN peer.name, e.name;
     ```

3. **Data Integrity & Non-Duplication**:
   - Handled via `MERGE` on relationships, ensuring a student cannot be registered twice for the same event or submit multiple feedback entries for the same event.
