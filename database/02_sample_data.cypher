// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - CORE BASELINE DATA
// Realistic Campus Dataset for Cypher Demos, Testing, and Viva
// All passwords default to: password123 (bcrypt hash included)
// ============================================================================

// Standard bcrypt hash for "password123":
// $2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u

// 1. Admins
// ----------------------------------------------------------------------------
MERGE (a1:Admin {adminId: 'admin-001'})
ON CREATE SET 
  a1.name = 'Dr. Sharma (Dean of Student Affairs)',
  a1.email = 'admin@gmail.com',
  a1.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

// 2. Students
// ----------------------------------------------------------------------------
MERGE (s1:Student {studentId: 'stud-001'})
ON CREATE SET 
  s1.name = 'Alex Rivera',
  s1.email = 'alex@gmail.com',
  s1.phone = '+1-555-0101',
  s1.department = 'Computer Science',
  s1.year = 3,
  s1.points = 0,
  s1.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s2:Student {studentId: 'stud-002'})
ON CREATE SET 
  s2.name = 'Priya Patel',
  s2.email = 'priya@gmail.com',
  s2.phone = '+1-555-0102',
  s2.department = 'Computer Science',
  s2.year = 3,
  s2.points = 0,
  s2.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s3:Student {studentId: 'stud-003'})
ON CREATE SET 
  s3.name = 'Marcus Chen',
  s3.email = 'marcus@gmail.com',
  s3.phone = '+1-555-0103',
  s3.department = 'Electronics & Comm',
  s3.year = 4,
  s3.points = 0,
  s3.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s4:Student {studentId: 'stud-004'})
ON CREATE SET 
  s4.name = 'Sarah Jenkins',
  s4.email = 'sarah@gmail.com',
  s4.phone = '+1-555-0104',
  s4.department = 'Information Tech',
  s4.year = 2,
  s4.points = 0,
  s4.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s5:Student {studentId: 'stud-005'})
ON CREATE SET 
  s5.name = 'Rahul Verma',
  s5.email = 'rahul@gmail.com',
  s5.phone = '+1-555-0105',
  s5.department = 'Mechanical Engg',
  s5.year = 3,
  s5.points = 0,
  s5.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s6:Student {studentId: 'stud-006'})
ON CREATE SET 
  s6.name = 'Emily Zhang',
  s6.email = 'emily@gmail.com',
  s6.phone = '+1-555-0106',
  s6.department = 'Design & Media',
  s6.year = 2,
  s6.points = 0,
  s6.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s7:Student {studentId: 'stud-007'})
ON CREATE SET 
  s7.name = 'David Kim',
  s7.email = 'david@gmail.com',
  s7.phone = '+1-555-0107',
  s7.department = 'Electrical Engg',
  s7.year = 1,
  s7.points = 0,
  s7.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

MERGE (s8:Student {studentId: 'stud-008'})
ON CREATE SET 
  s8.name = 'Ananya Rao',
  s8.email = 'ananya@gmail.com',
  s8.phone = '+1-555-0108',
  s8.department = 'Biotechnology',
  s8.year = 3,
  s8.points = 0,
  s8.passwordHash = '$2a$10$0CB91wZ5CV/LImfLGA29BOpGoWm3GDLGqRZPczLJCNjh72N1U2H9u';

// 3. Clubs
// ----------------------------------------------------------------------------
MERGE (c1:Club {clubId: 'club-001'})
ON CREATE SET 
  c1.name = 'CodeCraft Developers Club',
  c1.description = 'The premier coding community focusing on Web3, AI, and Open Source software.',
  c1.facultyAdvisor = 'Dr. Alan Turing',
  c1.status = 'Approved',
  c1.createdDate = '2025-08-15';

MERGE (c2:Club {clubId: 'club-002'})
ON CREATE SET 
  c2.name = 'Robotics & Automation Society',
  c2.description = 'Building autonomous rovers, drones, and competing in National Mechatronics contests.',
  c2.facultyAdvisor = 'Dr. Grace Hopper',
  c2.status = 'Approved',
  c2.createdDate = '2025-08-20';

MERGE (c3:Club {clubId: 'club-003'})
ON CREATE SET 
  c3.name = 'Design & Multimedia Guild',
  c3.description = 'Crafting digital experiences, 3D animations, UI/UX, and graphic identities.',
  c3.facultyAdvisor = 'Prof. Steve Wozniak',
  c3.status = 'Approved',
  c3.createdDate = '2025-09-01';

MERGE (c4:Club {clubId: 'club-004'})
ON CREATE SET 
  c4.name = 'Literary & Debating Society',
  c4.description = 'Fostering critical discourse, parliamentary debates, and creative expression.',
  c4.facultyAdvisor = 'Prof. Virginia Woolf',
  c4.status = 'Approved',
  c4.createdDate = '2025-09-10';

MERGE (c5:Club {clubId: 'club-005'})
ON CREATE SET 
  c5.name = 'CyberSecurity & Ethical Hacking League',
  c5.description = 'Capture-The-Flag challenges, red-teaming, cryptography, and defense workshops.',
  c5.facultyAdvisor = 'Prof. Bruce Schneier',
  c5.status = 'Pending',
  c5.createdDate = '2026-03-01';

// Admin approval of clubs
MATCH (a:Admin {adminId: 'admin-001'}), (c:Club)
WHERE c.status = 'Approved'
MERGE (a)-[:APPROVED {approvalTime: '2025-09-15T10:00:00Z'}]->(c);

// Student club memberships and roles
MATCH (s:Student {studentId: 'stud-001'}), (c:Club {clubId: 'club-001'})
MERGE (s)-[:PRESIDENT_OF {sinceDate: '2025-08-15'}]->(c)
MERGE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: '2025-08-15'}]->(c);

MATCH (s:Student {studentId: 'stud-002'}), (c:Club {clubId: 'club-001'})
MERGE (s)-[:MEMBER_OF_CLUB {role: 'Organizer', joinedDate: '2025-08-20'}]->(c);

MATCH (s:Student {studentId: 'stud-003'}), (c:Club {clubId: 'club-002'})
MERGE (s)-[:PRESIDENT_OF {sinceDate: '2025-08-20'}]->(c)
MERGE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: '2025-08-20'}]->(c);

MATCH (s:Student {studentId: 'stud-006'}), (c:Club {clubId: 'club-003'})
MERGE (s)-[:PRESIDENT_OF {sinceDate: '2025-09-01'}]->(c)
MERGE (s)-[:MEMBER_OF_CLUB {role: 'President', joinedDate: '2025-09-01'}]->(c);

MATCH (s:Student {studentId: 'stud-004'}), (c:Club {clubId: 'club-001'})
MERGE (s)-[:MEMBER_OF_CLUB {role: 'Member', joinedDate: '2025-10-01'}]->(c);

MATCH (s:Student {studentId: 'stud-005'}), (c:Club {clubId: 'club-002'})
MERGE (s)-[:MEMBER_OF_CLUB {role: 'Member', joinedDate: '2025-10-05'}]->(c);

// ============================================================================
// Events, Registrations, and Certificates are created dynamically via UI:
// 1. Organizers create events in the Studio (status: Pending)
// 2. Campus Admins approve events in Admin Dashboard (status: Approved)
// 3. Students register for approved events on the Discover page
// ============================================================================
