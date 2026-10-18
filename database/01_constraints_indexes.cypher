// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - CONSTRAINTS & INDEXES
// Neo4j 5.x Cypher Script
// ============================================================================

// 1. Uniqueness Constraints (Works on Neo4j Community & AuraDB Free)
// ----------------------------------------------------------------------------
CREATE CONSTRAINT admin_adminId_unique IF NOT EXISTS
FOR (a:Admin) REQUIRE a.adminId IS UNIQUE;

CREATE CONSTRAINT admin_email_unique IF NOT EXISTS
FOR (a:Admin) REQUIRE a.email IS UNIQUE;

CREATE CONSTRAINT student_studentId_unique IF NOT EXISTS
FOR (s:Student) REQUIRE s.studentId IS UNIQUE;

CREATE CONSTRAINT student_email_unique IF NOT EXISTS
FOR (s:Student) REQUIRE s.email IS UNIQUE;

CREATE CONSTRAINT club_clubId_unique IF NOT EXISTS
FOR (c:Club) REQUIRE c.clubId IS UNIQUE;

CREATE CONSTRAINT club_name_unique IF NOT EXISTS
FOR (c:Club) REQUIRE c.name IS UNIQUE;

CREATE CONSTRAINT event_eventId_unique IF NOT EXISTS
FOR (e:Event) REQUIRE e.eventId IS UNIQUE;

CREATE CONSTRAINT team_teamId_unique IF NOT EXISTS
FOR (t:Team) REQUIRE t.teamId IS UNIQUE;

CREATE CONSTRAINT cert_certId_unique IF NOT EXISTS
FOR (cert:Certificate) REQUIRE cert.certificateId IS UNIQUE;

CREATE CONSTRAINT cert_code_unique IF NOT EXISTS
FOR (cert:Certificate) REQUIRE cert.verificationCode IS UNIQUE;

CREATE CONSTRAINT notif_notifId_unique IF NOT EXISTS
FOR (n:Notification) REQUIRE n.notificationId IS UNIQUE;


// 2. Regular Single and Composite B-Tree Indexes
// ----------------------------------------------------------------------------
// Fast lookup for events listing page by status and upcoming start date
CREATE INDEX event_status_startDateTime IF NOT EXISTS
FOR (e:Event) ON (e.status, e.startDateTime);

// Fast filtering of events by category/type (Workshop, Hackathon, Cultural, etc.)
CREATE INDEX event_type IF NOT EXISTS
FOR (e:Event) ON (e.type);

// Fast aggregation and grouping for department participation analytics
CREATE INDEX student_department IF NOT EXISTS
FOR (s:Student) ON (s.department);

// Fast querying of unread notifications for a user
CREATE INDEX notification_status IF NOT EXISTS
FOR (n:Notification) ON (n.status);


// 3. Full-Text Search Index for Event Discovery
// ----------------------------------------------------------------------------
// Enables keyword searching across event title, description, and venue
CREATE FULLTEXT INDEX event_search_index IF NOT EXISTS
FOR (e:Event) ON EACH [e.name, e.description, e.venue];
