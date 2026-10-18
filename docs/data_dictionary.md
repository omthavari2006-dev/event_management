# Campus Event Management System - Graph Data Dictionary

## 1. Node Labels & Properties

### 1.1 `Admin`
Represents university administrators and deans who govern clubs, approve events, and monitor analytics.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `adminId` | String | UNIQUE | Unique identifier (e.g., `admin-001`) |
| `name` | String | Mandatory | Full name of the administrator |
| `email` | String | UNIQUE | University email address |
| `passwordHash` | String | Mandatory | bcrypt hashed password |

### 1.2 `Student`
Campus students who register for events, create teams, win awards, and join clubs.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `studentId` | String | UNIQUE | Unique student ID (e.g., `stud-001`) |
| `name` | String | Mandatory | Full name of the student |
| `email` | String | UNIQUE | Campus email address |
| `phone` | String | Optional | Contact telephone number |
| `department` | String | Indexed | Academic department (CS, ECE, Mech, etc.) |
| `year` | Integer | Mandatory | Year of study (1 to 4) |
| `points` | Integer | Default 0 | Gamified points earned from participation and wins |
| `passwordHash` | String | Mandatory | bcrypt hashed password |

### 1.3 `Club`
Student-led academic, cultural, or sports organizations.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `clubId` | String | UNIQUE | Unique identifier (e.g., `club-001`) |
| `name` | String | UNIQUE | Official club name |
| `description` | String | Optional | Mission statement and overview |
| `facultyAdvisor` | String | Mandatory | Supervising professor name |
| `status` | String | Mandatory | `Pending`, `Approved`, or `Rejected` |
| `createdDate` | String | Mandatory | ISO date of creation |

### 1.4 `Event`
Workshops, hackathons, seminars, cultural fests, and competitions.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `eventId` | String | UNIQUE | Unique identifier (e.g., `evt-001`) |
| `name` | String | Full-Text Indexed | Event title |
| `type` | String | Indexed | `Workshop`, `Hackathon`, `Seminar`, `Cultural`, `Sports` |
| `description` | String | Full-Text Indexed | Detailed overview and syllabus |
| `venue` | String | Full-Text Indexed | Campus location / hall name |
| `startDateTime` | String | Indexed | ISO UTC timestamp for start |
| `endDateTime` | String | Mandatory | ISO UTC timestamp for conclusion |
| `registrationDeadline` | String | Mandatory | Cutoff timestamp for registrations |
| `maxParticipants` | Integer | Mandatory | Maximum seat capacity |
| `maxTeamSize` | Integer | Mandatory | Max members per team (0 = individual event) |
| `status` | String | Indexed | `Pending`, `Approved`, `Completed`, `Cancelled`, `Rejected` |
| `createdTimestamp` | String | Mandatory | Audit creation timestamp |

### 1.5 `Team`
Groups of students collaborating for team-based events.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `teamId` | String | UNIQUE | Unique team ID (e.g., `team-001`) |
| `name` | String | Mandatory | Team display name |
| `createdTimestamp` | String | Mandatory | ISO timestamp |

### 1.6 `Certificate`
Verifiable digital credentials awarded to attendees and winners.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `certificateId` | String | UNIQUE | Deterministic ID: `eventId + '_' + studentId` |
| `type` | String | Mandatory | `Winner` or `Participation` |
| `verificationCode` | String | UNIQUE | Public code (e.g., `VERIFY-WIN-78901`) |
| `fileUrl` | String | Mandatory | REST endpoint to download PDF |
| `issueDate` | String | Mandatory | Date issued |

### 1.7 `Notification`
In-app alerts for registration confirmations, waitlist promotions, and certificates.
| Property | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `notificationId` | String | UNIQUE | Unique identifier |
| `title` | String | Mandatory | Brief subject line |
| `message` | String | Mandatory | Detailed alert content |
| `status` | String | Indexed | `Unread` or `Read` |
| `createdTimestamp` | String | Mandatory | ISO timestamp |

---

## 2. Graph Relationship Types

| Relationship | Source &rarr; Target | Properties | Cardinality | Meaning |
| :--- | :--- | :--- | :--- | :--- |
| `APPROVED` | `(Admin) -> (Club)` | `approvalTime` | 1 to Many | Admin approves club charter |
| `APPROVED` | `(Admin) -> (Event)` | `approvalTime` | 1 to Many | Admin approves event after venue clash check |
| `ORGANIZES` | `(Club) -> (Event)` | None | 1 to Many | Club hosts the event |
| `PRESIDENT_OF`| `(Student) -> (Club)` | `sinceDate` | 1 to 1 | Student acts as Club President |
| `MEMBER_OF_CLUB`| `(Student) -> (Club)`| `role`, `joinedDate` | Many to Many | Membership and role (Member, Organizer, Treasurer) |
| `REGISTERED_FOR`| `(Student) -> (Event)`| `registrationId`, `time`, `status` | Many to Many | `Registered`, `Waitlisted`, or `Cancelled` |
| `ATTENDED` | `(Student) -> (Event)`| `timeMarked` | Many to Many | Attendance recorded by Organizer |
| `WON` | `(Student) -> (Event)`| `position`, `prize`, `declaredAt` | Many to Many | Winner distinctions (Position 1, 2, 3) |
| `GAVE_FEEDBACK`| `(Student) -> (Event)`| `feedbackId`, `rating`, `comment`, `time` | Many to Many | 1 to 5 star rating & feedback |
| `FOR_EVENT` | `(Team) -> (Event)` | None | Many to 1 | Team formed for this specific event |
| `LEADS` | `(Student) -> (Team)` | None | 1 to Many | Team creator & captain |
| `IN_TEAM` | `(Student) -> (Team)` | `joinedTime` | Many to Many | Team membership |
| `ISSUES` | `(Event) -> (Certificate)` | None | 1 to Many | Event issues certificate |
| `AWARDED_TO` | `(Certificate) -> (Student)`| None | Many to 1 | Certificate owner |
| `RECEIVED` | `(Student) -> (Notification)`| None | 1 to Many | Student alert inbox |
