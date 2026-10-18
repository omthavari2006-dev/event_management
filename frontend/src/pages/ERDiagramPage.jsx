import React, { useState } from 'react';
import { Database, GitFork, ArrowRight, Shield, Layers, HelpCircle, Eye } from 'lucide-react';

export default function ERDiagramPage() {
  const [activeTab, setActiveTab] = useState('diagram');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const entities = [
    {
      name: 'ADMIN',
      type: 'Strong Entity',
      color: '#059669',
      pk: 'AdminID',
      attributes: [
        { name: 'AdminID', isPk: true },
        { name: 'Name' },
        { name: 'Email' },
        { name: 'Password' }
      ],
      relationships: [
        { verb: 'Approves', target: 'CLUB', card: '1 : M' },
        { verb: 'Approves', target: 'EVENT', card: '1 : M' }
      ],
      graphMapping: 'Node: (:Admin {adminId, name, email, passwordHash})'
    },
    {
      name: 'CLUB',
      type: 'Strong Entity',
      color: '#059669',
      pk: 'ClubID',
      attributes: [
        { name: 'ClubID', isPk: true },
        { name: 'ClubName' },
        { name: 'Description' },
        { name: 'FacultyAdvisor' },
        { name: 'PresidentID', isFk: true },
        { name: 'CreatedDate' }
      ],
      relationships: [
        { verb: 'Organizes', target: 'EVENT', card: '1 : M' },
        { verb: 'Approves', source: 'ADMIN', card: 'M : 1' }
      ],
      graphMapping: 'Node: (:Club) with (:Student)-[:PRESIDENT_OF]->(:Club)'
    },
    {
      name: 'EVENT',
      type: 'Strong Entity',
      color: '#059669',
      pk: 'EventID',
      attributes: [
        { name: 'EventID', isPk: true },
        { name: 'EventName' },
        { name: 'EventType' },
        { name: 'Description' },
        { name: 'Venue' },
        { name: 'Date' },
        { name: 'Time' },
        { name: 'RegDeadline' },
        { name: 'MaxParticipants' },
        { name: 'Status' }
      ],
      relationships: [
        { verb: 'Organizes', source: 'CLUB', card: 'M : 1' },
        { verb: 'Approves', source: 'ADMIN', card: 'M : 1' },
        { verb: 'Has', target: 'REGISTRATION', card: '1 : M' },
        { verb: 'Has Teams', target: 'TEAM', card: '1 : M' },
        { verb: 'Records', target: 'ATTENDANCE', card: '1 : M' },
        { verb: 'Declares', target: 'WINNER', card: '1 : M' },
        { verb: 'Issues', target: 'CERTIFICATE', card: '1 : M' }
      ],
      graphMapping: 'Node: (:Event {eventId, name, type, venue, startDateTime, ...})'
    },
    {
      name: 'REGISTRATION',
      type: 'Junction Table',
      color: '#0d9488',
      pk: 'RegistrationID',
      attributes: [
        { name: 'RegistrationID', isPk: true },
        { name: 'StudentID', isFk: true },
        { name: 'EventID', isFk: true },
        { name: 'RegistrationDate' },
        { name: 'Status' }
      ],
      relationships: [
        { verb: 'Has', source: 'EVENT', card: 'M : 1' },
        { verb: 'Registers', source: 'STUDENT', card: 'M : 1' }
      ],
      graphMapping: 'Relationship: (:Student)-[:REGISTERED_FOR {registrationId, status, time}]->(:Event)'
    },
    {
      name: 'STUDENT',
      type: 'Strong Entity',
      color: '#059669',
      pk: 'StudentID',
      attributes: [
        { name: 'StudentID', isPk: true },
        { name: 'Name' },
        { name: 'Email' },
        { name: 'Phone' },
        { name: 'Department' },
        { name: 'Year' },
        { name: 'Password' }
      ],
      relationships: [
        { verb: 'Registers', target: 'REGISTRATION', card: '1 : M' },
        { verb: 'Gives', target: 'FEEDBACK', card: '1 : M' },
        { verb: 'Receives', target: 'NOTIFICATION', card: '1 : M' }
      ],
      graphMapping: 'Node: (:Student {studentId, name, email, department, year, points})'
    },
    {
      name: 'TEAM',
      type: 'Entity',
      color: '#059669',
      pk: 'TeamID',
      attributes: [
        { name: 'TeamID', isPk: true },
        { name: 'EventID', isFk: true },
        { name: 'TeamName' },
        { name: 'LeaderID', isFk: true }
      ],
      relationships: [
        { verb: 'Has Teams', source: 'EVENT', card: 'M : 1' },
        { verb: 'Has Members', target: 'TEAM_MEMBER', card: '1 : M' }
      ],
      graphMapping: 'Node: (:Team) with (:Student)-[:LEADS]->(:Team) and (:Team)-[:FOR_EVENT]->(:Event)'
    },
    {
      name: 'TEAM_MEMBER',
      type: 'Junction Table (Composite PK)',
      color: '#0d9488',
      pk: 'TeamID + StudentID',
      attributes: [
        { name: 'TeamID', isPk: true, isFk: true },
        { name: 'StudentID', isPk: true, isFk: true }
      ],
      relationships: [
        { verb: 'Has Members', source: 'TEAM', card: 'M : 1' }
      ],
      graphMapping: 'Relationship: (:Student)-[:IN_TEAM {joinedTime}]->(:Team)'
    },
    {
      name: 'ATTENDANCE',
      type: 'Junction Table',
      color: '#0d9488',
      pk: 'AttendanceID',
      attributes: [
        { name: 'AttendanceID', isPk: true },
        { name: 'EventID', isFk: true },
        { name: 'StudentID', isFk: true },
        { name: 'Status' },
        { name: 'TimeMarked' }
      ],
      relationships: [
        { verb: 'Records', source: 'EVENT', card: 'M : 1' }
      ],
      graphMapping: 'Relationship: (:Student)-[:ATTENDED {timeMarked}]->(:Event)'
    },
    {
      name: 'WINNER',
      type: 'Junction Table',
      color: '#0d9488',
      pk: 'WinnerID',
      attributes: [
        { name: 'WinnerID', isPk: true },
        { name: 'EventID', isFk: true },
        { name: 'StudentID', isFk: true },
        { name: 'Position' },
        { name: 'Prize' }
      ],
      relationships: [
        { verb: 'Declares', source: 'EVENT', card: 'M : 1' }
      ],
      graphMapping: 'Relationship: (:Student)-[:WON {position, prize, declaredAt}]->(:Event)'
    },
    {
      name: 'CERTIFICATE',
      type: 'Entity',
      color: '#059669',
      pk: 'CertificateID',
      attributes: [
        { name: 'CertificateID', isPk: true },
        { name: 'StudentID', isFk: true },
        { name: 'EventID', isFk: true },
        { name: 'CertificateURL' },
        { name: 'IssueDate' }
      ],
      relationships: [
        { verb: 'Issues', source: 'EVENT', card: 'M : 1' }
      ],
      graphMapping: 'Node: (:Certificate) with (:Event)-[:ISSUES]->(:Certificate)-[:AWARDED_TO]->(:Student)'
    },
    {
      name: 'FEEDBACK',
      type: 'Junction Table',
      color: '#0d9488',
      pk: 'FeedbackID',
      attributes: [
        { name: 'FeedbackID', isPk: true },
        { name: 'StudentID', isFk: true },
        { name: 'EventID', isFk: true },
        { name: 'Rating' },
        { name: 'Comment' },
        { name: 'Date' }
      ],
      relationships: [
        { verb: 'Gives', source: 'STUDENT', card: 'M : 1' }
      ],
      graphMapping: 'Relationship: (:Student)-[:GAVE_FEEDBACK {feedbackId, rating, comment, time}]->(:Event)'
    },
    {
      name: 'NOTIFICATION',
      type: 'Weak Entity',
      color: '#059669',
      pk: 'NotificationID',
      attributes: [
        { name: 'NotificationID', isPk: true },
        { name: 'StudentID', isFk: true },
        { name: 'Title' },
        { name: 'Message' },
        { name: 'Status' },
        { name: 'CreatedAt' }
      ],
      relationships: [
        { verb: 'Receives', source: 'STUDENT', card: 'M : 1' }
      ],
      graphMapping: 'Node: (:Notification) with (:Student)-[:RECEIVED]->(:Notification)'
    }
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
      {/* Title */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: 12
        }}>
          <Database size={14} /> Official Schema Reference (Handwritten ER Diagram Match)
        </div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
          ER Diagram & Graph Model Architecture
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 900, lineHeight: 1.6 }}>
          Explore the exact 12-entity schema from the project specification, showing all attributes, 
          primary keys, foreign keys, and their 1-to-1 transformation into Neo4j graph nodes and relationships.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 16 }}>
        <button
          onClick={() => setActiveTab('diagram')}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 600,
            background: activeTab === 'diagram' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'diagram' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTab === 'diagram' ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`
          }}
        >
          Interactive ER Schema (12 Entities)
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 600,
            background: activeTab === 'graph' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'graph' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTab === 'graph' ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`
          }}
        >
          Neo4j Graph Model Translation
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          style={{
            padding: '10px 20px',
            borderRadius: 12,
            fontSize: '0.9rem',
            fontWeight: 600,
            background: activeTab === 'matrix' ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
            color: activeTab === 'matrix' ? '#fff' : '#94a3b8',
            border: `1px solid ${activeTab === 'matrix' ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`
          }}
        >
          Relational vs Graph Mapping Table
        </button>
      </div>

      {/* TAB 1: INTERACTIVE ER DIAGRAM */}
      {activeTab === 'diagram' && (
        <div>
          {/* Legend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '12px 20px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: 24,
            fontSize: '0.85rem'
          }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>Diagram Legend:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, background: '#10b981', borderRadius: 3 }} />
              <strong>Entity Rectangle</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, background: '#a855f7', borderRadius: '50%' }} />
              <strong>Attribute Oval</strong> (Underline = Primary Key)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, background: '#3b82f6', transform: 'rotate(45deg)' }} />
              <strong>Relationship Diamond</strong> (1 : M / M : M)
            </span>
          </div>

          {/* Entities Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 20
          }}>
            {entities.map((e, idx) => (
              <div 
                key={idx}
                className="card-interactive"
                onClick={() => setSelectedEntity(selectedEntity?.name === e.name ? null : e)}
                style={{
                  padding: 22,
                  border: selectedEntity?.name === e.name ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  cursor: 'pointer'
                }}
              >
                {/* Entity Box */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1.5px solid #10b981',
                    padding: '6px 14px',
                    borderRadius: 8,
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#34d399',
                    letterSpacing: '0.04em'
                  }}>
                    {e.name}
                  </div>
                  <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                    {e.type}
                  </span>
                </div>

                {/* Primary Key Callout */}
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 }}>
                  Primary Key: <strong style={{ color: '#fcd34d', textDecoration: 'underline' }}>{e.pk}</strong>
                </div>

                {/* Attributes as Ovals */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                  {e.attributes.map((attr, aIdx) => (
                    <span
                      key={aIdx}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 20,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: attr.isPk ? 'rgba(245, 158, 11, 0.15)' : 'rgba(168, 85, 247, 0.12)',
                        border: `1px solid ${attr.isPk ? 'rgba(245, 158, 11, 0.4)' : 'rgba(168, 85, 247, 0.3)'}`,
                        color: attr.isPk ? '#fbbf24' : '#d8b4fe',
                        textDecoration: attr.isPk ? 'underline' : 'none'
                      }}
                    >
                      {attr.name} {attr.isFk ? '(FK)' : ''}
                    </span>
                  ))}
                </div>

                {/* Relationships (Diamonds) */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: 10 }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: 6 }}>
                    Connected Relationships:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {e.relationships.map((rel, rIdx) => (
                      <div key={rIdx} style={{ fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: '#38bdf8', fontWeight: 700 }}>&lt;&gt;</span>
                        <span>
                          [{rel.verb}] {rel.target ? `&rarr; ${rel.target}` : `&larr; from ${rel.source}`}
                        </span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255, 255, 255, 0.06)', padding: '1px 6px', borderRadius: 4 }}>
                          {rel.card}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph Mapping Footer */}
                <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px dashed rgba(255, 255, 255, 0.08)', fontSize: '0.75rem', color: '#34d399' }}>
                  <strong>Neo4j Equivalent:</strong> {e.graphMapping}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: NEO4J GRAPH MODEL */}
      {activeTab === 'graph' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitFork size={24} color="#818cf8" /> Neo4j Graph Model Translation
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24, lineHeight: 1.6 }}>
            In Neo4j, junction tables disappear. A foreign key or link table becomes a direct relationship (edge) 
            that stores properties like <code>status</code>, <code>timeMarked</code>, <code>position</code>, and <code>rating</code>.
          </p>

          {/* ASCII / Visual Graph Architecture */}
          <div style={{
            background: '#090d16',
            borderRadius: 16,
            padding: 28,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontFamily: 'monospace',
            fontSize: '0.86rem',
            color: '#38bdf8',
            overflowX: 'auto',
            lineHeight: 1.8
          }}>
            <div style={{ color: '#64748b', marginBottom: 10 }}>// Graph Database Topology (Direct Pointer Traversals)</div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(:Admin)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;APPROVED&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;APPROVED<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v<br />
            &nbsp;(:Student)---PRESIDENT_OF / MEMBER_OF_CLUB---&gt;(:Club)---ORGANIZES---&gt;(:Event)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^ ^ ^ ^<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---REGISTERED_FOR &#123;status, time&#125;---------------------------------+ | | |<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---ATTENDED &#123;timeMarked&#125;----------------------------------------+ | |<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---WON &#123;position, prize&#125;------------------------------------------+ |<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---GAVE_FEEDBACK &#123;rating, comment&#125;----------------------------------+<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---LEADS---&gt;(:Team)---FOR_EVENT---&gt;(:Event)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---IN_TEAM---&gt;(:Team)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|---RECEIVED---&gt;(:Notification)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;---AWARDED_TO---(:Certificate)&lt;---ISSUES---(:Event)
          </div>
        </div>
      )}

      {/* TAB 3: SIDE-BY-SIDE MATRIX */}
      {activeTab === 'matrix' && (
        <div className="glass-panel" style={{ padding: 28 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 16 }}>
            Relational (MySQL) vs Graph (Neo4j) Translation Matrix
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: 12 }}>Relational ER Element</th>
                  <th style={{ padding: 12 }}>Relational Form</th>
                  <th style={{ padding: 12 }}>Neo4j Graph Implementation</th>
                  <th style={{ padding: 12 }}>Why Graph is Better</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    rel: 'REGISTRATION',
                    type: 'Junction Table (StudentID, EventID, Status)',
                    graph: '(:Student)-[:REGISTERED_FOR {status, time}]->(:Event)',
                    why: 'Eliminates junction table; directly connects Student & Event'
                  },
                  {
                    rel: 'ATTENDANCE',
                    type: 'Junction Table (StudentID, EventID, TimeMarked)',
                    graph: '(:Student)-[:ATTENDED {timeMarked}]->(:Event)',
                    why: 'Absence is non-existence of edge; simple relationship lookup'
                  },
                  {
                    rel: 'WINNER',
                    type: 'Junction Table (StudentID, EventID, Position, Prize)',
                    graph: '(:Student)-[:WON {position, prize}]->(:Event)',
                    why: 'Natural extension of attendee node traversal'
                  },
                  {
                    rel: 'FEEDBACK',
                    type: 'Junction Table (StudentID, EventID, Rating, Comment)',
                    graph: '(:Student)-[:GAVE_FEEDBACK {rating, comment}]->(:Event)',
                    why: 'One-to-one edge with MERGE prevents duplicate reviews'
                  },
                  {
                    rel: 'TEAM_MEMBER',
                    type: 'Junction Table (Composite PK: TeamID, StudentID)',
                    graph: '(:Student)-[:IN_TEAM {joinedTime}]->(:Team)',
                    why: 'Junction table completely vanishes; pointer edge to Team node'
                  },
                  {
                    rel: 'Club President',
                    type: 'Foreign Key (Club.PresidentID -> Student.StudentID)',
                    graph: '(:Student)-[:PRESIDENT_OF {sinceDate}]->(:Club)',
                    why: 'Directional graph traversal enables graph-based role checks'
                  },
                  {
                    rel: 'ADMIN Approvals',
                    type: 'Foreign Key / Relationship table',
                    graph: '(:Admin)-[:APPROVED {approvalTime}]->(Club or Event)',
                    why: 'One admin node directly points to approved entities'
                  }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: 12, fontWeight: 700, color: '#f8fafc' }}>{row.rel}</td>
                    <td style={{ padding: 12, color: '#cbd5e1' }}>{row.type}</td>
                    <td style={{ padding: 12, color: '#38bdf8', fontFamily: 'monospace' }}>{row.graph}</td>
                    <td style={{ padding: 12, color: '#34d399' }}>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
