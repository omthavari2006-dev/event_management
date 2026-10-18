// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - COMPREHENSIVE SAMPLE DATA
// Realistic Campus Dataset for Cypher Demos, Testing, and Viva
// All passwords default to: password123 (bcrypt hash included)
// ============================================================================

// Standard bcrypt hash for "password123":
// $2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i

// 1. Admins
// ----------------------------------------------------------------------------
MERGE (a1:Admin {adminId: 'admin-001'})
ON CREATE SET 
  a1.name = 'Dr. Sharma (Dean of Student Affairs)',
  a1.email = 'admin@campus.edu',
  a1.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

// 2. Students
// ----------------------------------------------------------------------------
MERGE (s1:Student {studentId: 'stud-001'})
ON CREATE SET 
  s1.name = 'Alex Rivera',
  s1.email = 'alex@campus.edu',
  s1.phone = '+1-555-0101',
  s1.department = 'Computer Science',
  s1.year = 3,
  s1.points = 120,
  s1.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s2:Student {studentId: 'stud-002'})
ON CREATE SET 
  s2.name = 'Priya Patel',
  s2.email = 'priya@campus.edu',
  s2.phone = '+1-555-0102',
  s2.department = 'Computer Science',
  s2.year = 3,
  s2.points = 85,
  s2.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s3:Student {studentId: 'stud-003'})
ON CREATE SET 
  s3.name = 'Marcus Chen',
  s3.email = 'marcus@campus.edu',
  s3.phone = '+1-555-0103',
  s3.department = 'Electronics & Comm',
  s3.year = 4,
  s3.points = 150,
  s3.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s4:Student {studentId: 'stud-004'})
ON CREATE SET 
  s4.name = 'Sarah Jenkins',
  s4.email = 'sarah@campus.edu',
  s4.phone = '+1-555-0104',
  s4.department = 'Information Tech',
  s4.year = 2,
  s4.points = 60,
  s4.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s5:Student {studentId: 'stud-005'})
ON CREATE SET 
  s5.name = 'Rahul Verma',
  s5.email = 'rahul@campus.edu',
  s5.phone = '+1-555-0105',
  s5.department = 'Mechanical Engg',
  s5.year = 3,
  s5.points = 45,
  s5.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s6:Student {studentId: 'stud-006'})
ON CREATE SET 
  s6.name = 'Emily Zhang',
  s6.email = 'emily@campus.edu',
  s6.phone = '+1-555-0106',
  s6.department = 'Design & Media',
  s6.year = 2,
  s6.points = 95,
  s6.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s7:Student {studentId: 'stud-007'})
ON CREATE SET 
  s7.name = 'David Kim',
  s7.email = 'david@campus.edu',
  s7.phone = '+1-555-0107',
  s7.department = 'Electrical Engg',
  s7.year = 1,
  s7.points = 20,
  s7.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

MERGE (s8:Student {studentId: 'stud-008'})
ON CREATE SET 
  s8.name = 'Ananya Rao',
  s8.email = 'ananya@campus.edu',
  s8.phone = '+1-555-0108',
  s8.department = 'Biotechnology',
  s8.year = 3,
  s8.points = 40,
  s8.passwordHash = '$2a$10$npt5H74y0V4wM0m6iV4m9eUsqgQ7F8V1bN9L4iKqXjC4lO9Yv8Q2i';

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

// 4. Events
// ----------------------------------------------------------------------------
MERGE (e1:Event {eventId: 'evt-001'})
ON CREATE SET 
  e1.name = 'Campus Hackathon 2026',
  e1.type = 'Hackathon',
  e1.description = 'A 36-hour sprint to build AI-driven campus utilities and social impact tools.',
  e1.venue = 'Auditorium Hall A',
  e1.startDateTime = '2026-11-10T09:00:00Z',
  e1.endDateTime = '2026-11-11T21:00:00Z',
  e1.registrationDeadline = '2026-11-05T23:59:59Z',
  e1.maxParticipants = 30,
  e1.maxTeamSize = 4,
  e1.status = 'Approved',
  e1.createdTimestamp = '2026-10-01T12:00:00Z';

MERGE (e2:Event {eventId: 'evt-002'})
ON CREATE SET 
  e2.name = 'Deep Learning & Vision Masterclass',
  e2.type = 'Workshop',
  e2.description = 'Hands-on training in PyTorch, Transformer models, and real-time computer vision.',
  e2.venue = 'CS Computer Lab 3',
  e2.startDateTime = '2026-11-15T14:00:00Z',
  e2.endDateTime = '2026-11-15T18:00:00Z',
  e2.registrationDeadline = '2026-11-14T12:00:00Z',
  e2.maxParticipants = 3, // intentionally low to test waitlist
  e2.maxTeamSize = 0, // Individual event
  e2.status = 'Approved',
  e2.createdTimestamp = '2026-10-05T14:00:00Z';

MERGE (e3:Event {eventId: 'evt-003'})
ON CREATE SET 
  e3.name = 'Autonomous Drone Racing Cup',
  e3.type = 'Sports',
  e3.description = 'High-speed FPV and autonomous obstacle course challenge for quadcopters.',
  e3.venue = 'Campus Open Grounds',
  e3.startDateTime = '2026-11-20T10:00:00Z',
  e3.endDateTime = '2026-11-20T17:00:00Z',
  e3.registrationDeadline = '2026-11-18T23:59:59Z',
  e3.maxParticipants = 20,
  e3.maxTeamSize = 2,
  e3.status = 'Approved',
  e3.createdTimestamp = '2026-10-08T09:00:00Z';

MERGE (e4:Event {eventId: 'evt-004'})
ON CREATE SET 
  e4.name = 'UI/UX Design Sprint: Campus Redesign',
  e4.type = 'Workshop',
  e4.description = 'Redesigning everyday student portal flows using modern design systems and Figma.',
  e4.venue = 'Media Innovation Hub',
  e4.startDateTime = '2026-11-25T13:00:00Z',
  e4.endDateTime = '2026-11-25T17:00:00Z',
  e4.registrationDeadline = '2026-11-24T18:00:00Z',
  e4.maxParticipants = 25,
  e4.maxTeamSize = 0,
  e4.status = 'Approved',
  e4.createdTimestamp = '2026-10-10T11:00:00Z';

MERGE (e5:Event {eventId: 'evt-005'})
ON CREATE SET 
  e5.name = 'Collegiate Parliamentary Debate 2026',
  e5.type = 'Cultural',
  e5.description = 'Inter-college Oxford-style parliamentary debate on AI ethics and technology.',
  e5.venue = 'Seminar Hall B',
  e5.startDateTime = '2026-10-01T10:00:00Z',
  e5.endDateTime = '2026-10-01T16:00:00Z',
  e5.registrationDeadline = '2026-09-28T23:59:59Z',
  e5.maxParticipants = 40,
  e5.maxTeamSize = 0,
  e5.status = 'Completed', // Completed event to test attendance, winners, certs, feedback
  e5.createdTimestamp = '2026-09-10T09:00:00Z';

MERGE (e6:Event {eventId: 'evt-006'})
ON CREATE SET 
  e6.name = 'Quantum Computing & Algorithms Symposium',
  e6.type = 'Seminar',
  e6.description = 'Keynotes on quantum gates, entanglement, and cryptographic implications.',
  e6.venue = 'Auditorium Hall A',
  e6.startDateTime = '2026-11-10T11:00:00Z', // Clashes with evt-001 venue & time!
  e6.endDateTime = '2026-11-10T15:00:00Z',
  e6.registrationDeadline = '2026-11-08T23:59:59Z',
  e6.maxParticipants = 100,
  e6.maxTeamSize = 0,
  e6.status = 'Pending', // Pending admin approval with venue clash!
  e6.createdTimestamp = '2026-10-12T16:00:00Z';

// Club ORGANIZES Event & Admin APPROVED Event
MATCH (c:Club {clubId: 'club-001'}), (e:Event {eventId: 'evt-001'})
MERGE (c)-[:ORGANIZES]->(e);
MATCH (a:Admin {adminId: 'admin-001'}), (e:Event {eventId: 'evt-001'})
MERGE (a)-[:APPROVED {approvalTime: '2026-10-02T10:00:00Z'}]->(e);

MATCH (c:Club {clubId: 'club-001'}), (e:Event {eventId: 'evt-002'})
MERGE (c)-[:ORGANIZES]->(e);
MATCH (a:Admin {adminId: 'admin-001'}), (e:Event {eventId: 'evt-002'})
MERGE (a)-[:APPROVED {approvalTime: '2026-10-06T10:00:00Z'}]->(e);

MATCH (c:Club {clubId: 'club-002'}), (e:Event {eventId: 'evt-003'})
MERGE (c)-[:ORGANIZES]->(e);
MATCH (a:Admin {adminId: 'admin-001'}), (e:Event {eventId: 'evt-003'})
MERGE (a)-[:APPROVED {approvalTime: '2026-10-09T10:00:00Z'}]->(e);

MATCH (c:Club {clubId: 'club-003'}), (e:Event {eventId: 'evt-004'})
MERGE (c)-[:ORGANIZES]->(e);
MATCH (a:Admin {adminId: 'admin-001'}), (e:Event {eventId: 'evt-004'})
MERGE (a)-[:APPROVED {approvalTime: '2026-10-11T10:00:00Z'}]->(e);

MATCH (c:Club {clubId: 'club-004'}), (e:Event {eventId: 'evt-005'})
MERGE (c)-[:ORGANIZES]->(e);
MATCH (a:Admin {adminId: 'admin-001'}), (e:Event {eventId: 'evt-005'})
MERGE (a)-[:APPROVED {approvalTime: '2026-09-15T10:00:00Z'}]->(e);

MATCH (c:Club {clubId: 'club-001'}), (e:Event {eventId: 'evt-006'})
MERGE (c)-[:ORGANIZES]->(e);

// 5. Registrations (Testing Capacity & Waitlist)
// ----------------------------------------------------------------------------
// For evt-002: capacity = 3.
// 3 students registered, 1 waitlisted:
MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-002'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-001', time: '2026-10-06T11:00:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-002'}), (e:Event {eventId: 'evt-002'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-002', time: '2026-10-06T11:05:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-004'}), (e:Event {eventId: 'evt-002'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-003', time: '2026-10-06T11:10:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-005'}), (e:Event {eventId: 'evt-002'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-004', time: '2026-10-06T11:20:00Z', status: 'Waitlisted'}]->(e);

// Registrations for Hackathon (evt-001)
MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-001'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-005', time: '2026-10-02T12:00:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-002'}), (e:Event {eventId: 'evt-001'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-006', time: '2026-10-02T12:05:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-004'}), (e:Event {eventId: 'evt-001'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-007', time: '2026-10-02T12:10:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-007'}), (e:Event {eventId: 'evt-001'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-008', time: '2026-10-02T12:15:00Z', status: 'Registered'}]->(e);

// Registrations for Completed Event evt-005 (for testing analytics)
MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-009', time: '2026-09-20T10:00:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-003'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-010', time: '2026-09-20T10:15:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-006'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-011', time: '2026-09-20T10:30:00Z', status: 'Registered'}]->(e);

MATCH (s:Student {studentId: 'stud-008'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:REGISTERED_FOR {registrationId: 'reg-012', time: '2026-09-20T10:45:00Z', status: 'Registered'}]->(e);

// 6. Teams (for evt-001 Hackathon)
// ----------------------------------------------------------------------------
MERGE (t1:Team {teamId: 'team-001'})
ON CREATE SET 
  t1.name = 'Binary Bandits',
  t1.createdTimestamp = '2026-10-03T14:00:00Z';

MATCH (t:Team {teamId: 'team-001'}), (e:Event {eventId: 'evt-001'})
MERGE (t)-[:FOR_EVENT]->(e);

MATCH (s:Student {studentId: 'stud-001'}), (t:Team {teamId: 'team-001'})
MERGE (s)-[:LEADS]->(t)
MERGE (s)-[:IN_TEAM {joinedTime: '2026-10-03T14:00:00Z'}]->(t);

MATCH (s:Student {studentId: 'stud-002'}), (t:Team {teamId: 'team-001'})
MERGE (s)-[:IN_TEAM {joinedTime: '2026-10-03T14:15:00Z'}]->(t);

// 7. Attendance (for completed event evt-005)
// stud-001, stud-003, stud-006 attended; stud-008 registered but did NOT attend (tests query #4!)
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:ATTENDED {timeMarked: '2026-10-01T10:05:00Z'}]->(e);

MATCH (s:Student {studentId: 'stud-003'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:ATTENDED {timeMarked: '2026-10-01T10:08:00Z'}]->(e);

MATCH (s:Student {studentId: 'stud-006'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:ATTENDED {timeMarked: '2026-10-01T10:12:00Z'}]->(e);

// 8. Winners
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: 'stud-003'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:WON {position: 1, prize: '$300 Best Orator'}]->(e);

MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:WON {position: 2, prize: '$150 Runner Up'}]->(e);

// 9. Feedback
// ----------------------------------------------------------------------------
MATCH (s:Student {studentId: 'stud-001'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:GAVE_FEEDBACK {feedbackId: 'fb-001', rating: 5, comment: 'Phenomenal moderation and thought-provoking motions!', time: '2026-10-01T17:30:00Z'}]->(e);

MATCH (s:Student {studentId: 'stud-003'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:GAVE_FEEDBACK {feedbackId: 'fb-002', rating: 5, comment: 'Well organized schedule and high competitive spirit.', time: '2026-10-01T18:00:00Z'}]->(e);

MATCH (s:Student {studentId: 'stud-006'}), (e:Event {eventId: 'evt-005'})
MERGE (s)-[:GAVE_FEEDBACK {feedbackId: 'fb-003', rating: 4, comment: 'Great debate topics. Sound system in Hall B could be improved.', time: '2026-10-01T18:15:00Z'}]->(e);

// 10. Certificates (Deterministic ID: eventId + '_' + studentId)
// ----------------------------------------------------------------------------
MERGE (cert1:Certificate {certificateId: 'evt-005_stud-003'})
ON CREATE SET 
  cert1.type = 'Winner',
  cert1.verificationCode = 'VERIFY-WIN-78901',
  cert1.fileUrl = '/api/certificates/evt-005_stud-003/download',
  cert1.issueDate = '2026-10-02';

MATCH (e:Event {eventId: 'evt-005'}), (cert:Certificate {certificateId: 'evt-005_stud-003'}), (s:Student {studentId: 'stud-003'})
MERGE (e)-[:ISSUES]->(cert)
MERGE (cert)-[:AWARDED_TO]->(s);

MERGE (cert2:Certificate {certificateId: 'evt-005_stud-001'})
ON CREATE SET 
  cert2.type = 'Winner',
  cert2.verificationCode = 'VERIFY-WIN-78902',
  cert2.fileUrl = '/api/certificates/evt-005_stud-001/download',
  cert2.issueDate = '2026-10-02';

MATCH (e:Event {eventId: 'evt-005'}), (cert:Certificate {certificateId: 'evt-005_stud-001'}), (s:Student {studentId: 'stud-001'})
MERGE (e)-[:ISSUES]->(cert)
MERGE (cert)-[:AWARDED_TO]->(s);

MERGE (cert3:Certificate {certificateId: 'evt-005_stud-006'})
ON CREATE SET 
  cert3.type = 'Participation',
  cert3.verificationCode = 'VERIFY-PAR-33445',
  cert3.fileUrl = '/api/certificates/evt-005_stud-006/download',
  cert3.issueDate = '2026-10-02';

MATCH (e:Event {eventId: 'evt-005'}), (cert:Certificate {certificateId: 'evt-005_stud-006'}), (s:Student {studentId: 'stud-006'})
MERGE (e)-[:ISSUES]->(cert)
MERGE (cert)-[:AWARDED_TO]->(s);

// 11. Notifications
// ----------------------------------------------------------------------------
MERGE (n1:Notification {notificationId: 'notif-001'})
ON CREATE SET 
  n1.title = 'Registration Confirmed',
  n1.message = 'You have successfully registered for Campus Hackathon 2026!',
  n1.status = 'Read',
  n1.createdTimestamp = '2026-10-02T12:00:00Z';

MATCH (s:Student {studentId: 'stud-001'}), (n:Notification {notificationId: 'notif-001'})
MERGE (s)-[:RECEIVED]->(n);

MERGE (n2:Notification {notificationId: 'notif-002'})
ON CREATE SET 
  n2.title = 'Certificate Available',
  n2.message = 'Your 2nd Place Winner Certificate for Collegiate Parliamentary Debate is ready!',
  n2.status = 'Unread',
  n2.createdTimestamp = '2026-10-02T15:00:00Z';

MATCH (s:Student {studentId: 'stud-001'}), (n:Notification {notificationId: 'notif-002'})
MERGE (s)-[:RECEIVED]->(n);

MERGE (n3:Notification {notificationId: 'notif-003'})
ON CREATE SET 
  n3.title = 'Added to Waitlist',
  n3.message = 'Deep Learning & Vision Masterclass is currently full. You are on the waitlist.',
  n3.status = 'Unread',
  n3.createdTimestamp = '2026-10-06T11:20:00Z';

MATCH (s:Student {studentId: 'stud-005'}), (n:Notification {notificationId: 'notif-003'})
MERGE (s)-[:RECEIVED]->(n);
