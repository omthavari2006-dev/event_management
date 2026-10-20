// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - BASELINE CLUBS & INFRASTRUCTURE
// Clean baseline dataset containing campus clubs.
// Accounts (Admin, Organizers, Students) are registered dynamically via the UI.
// ============================================================================

// 1. Campus Clubs
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
