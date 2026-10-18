// ============================================================================
// CAMPUS EVENT MANAGEMENT SYSTEM - APOC TRIGGERS (BONUS / SELF-HOSTED ONLY)
// Note: Requires Neo4j self-hosted / Docker with APOC Core + Extended enabled.
// (AuraDB Free does not support APOC triggers, so the system uses Service-Layer
// ACID Transactions as primary architecture).
// ============================================================================

// 1. Enable Triggers in neo4j.conf (Required for APOC triggers to execute):
// apoc.trigger.enabled=true

// 2. Trigger: Automatic AuditLog Creation when an Event's status changes
// Whenever an Event node's 'status' property is updated, write an AuditLog node
/*
CALL apoc.trigger.add(
  'event_status_audit_log',
  'UNWIND $assignedNodeProperties AS prop
   MATCH (e:Event) WHERE id(e) = prop.node AND prop.key = "status"
   CREATE (log:AuditLog {
     logId: randomUUID(),
     actor: "System/Admin",
     action: "STATUS_CHANGE",
     target: e.eventId,
     oldStatus: prop.old,
     newStatus: prop.new,
     timestamp: toString(datetime())
   })',
  {phase: 'after'}
);
*/

// 3. Trigger: Automatically generate Notification when Student registration status changes
/*
CALL apoc.trigger.add(
  'registration_notification_trigger',
  'UNWIND $assignedRelationshipProperties AS prop
   MATCH (s:Student)-[r:REGISTERED_FOR]->(e:Event)
   WHERE id(r) = prop.relationship AND prop.key = "status" AND prop.new = "Registered" AND prop.old = "Waitlisted"
   CREATE (n:Notification {
     notificationId: randomUUID(),
     title: "Waitlist Promotion (APOC Trigger)",
     message: "You were automatically promoted to Registered for " + e.name,
     status: "Unread",
     createdTimestamp: toString(datetime())
   })
   CREATE (s)-[:RECEIVED]->(n)',
  {phase: 'after'}
);
*/

// 4. Listing and Removing Triggers
// CALL apoc.trigger.list();
// CALL apoc.trigger.remove('event_status_audit_log');
// CALL apoc.trigger.remove('registration_notification_trigger');
