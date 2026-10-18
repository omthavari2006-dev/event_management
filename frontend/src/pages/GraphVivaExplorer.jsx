import React, { useState, useEffect } from 'react';
import { 
  Network, Sparkles, GitCommit, ArrowRight, Terminal, 
  HelpCircle, Code2, Users, Award, ShieldCheck 
} from 'lucide-react';
import { api } from '../api/client';

export default function GraphVivaExplorer({ user }) {
  const [activeDemo, setActiveDemo] = useState('recommendations');
  const [student1, setStudent1] = useState('stud-001');
  const [student2, setStudent2] = useState('stud-003');
  const [shortestPathData, setShortestPathData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  const studentsList = [
    { id: 'stud-001', name: 'Alex Rivera (CS, CodeCraft President)' },
    { id: 'stud-002', name: 'Priya Patel (CS, Organizer)' },
    { id: 'stud-003', name: 'Marcus Chen (ECE, Robotics President)' },
    { id: 'stud-004', name: 'Sarah Jenkins (IT, Year 2)' },
    { id: 'stud-005', name: 'Rahul Verma (Mech, Year 3)' },
    { id: 'stud-006', name: 'Emily Zhang (Design President)' }
  ];

  const loadShortestPath = async () => {
    try {
      setLoading(true);
      const res = await api.getDegreesOfConnection(student1, student2);
      setShortestPathData(res.connection || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeDemo === 'degrees') {
      loadShortestPath();
    } else if (activeDemo === 'leaderboard') {
      loadLeaderboard();
    }
  }, [activeDemo, student1, student2]);

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '4px 12px',
          borderRadius: 20,
          background: 'rgba(6, 182, 212, 0.15)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#38bdf8',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: 12
        }}>
          <Sparkles size={14} /> Interactive Graph Showcase & Viva Defense
        </div>
        <h1 style={{ fontSize: '2.4rem', letterSpacing: '-0.02em', marginBottom: 8 }}>
          Graph Database vs Relational (Neo4j in Action)
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 840, lineHeight: 1.6 }}>
          Explore live Cypher graph traversals demonstrating collaborative filtering, degrees of separation, 
          social peer indicators, and the complete Viva examination defense checklist.
        </p>
      </div>

      {/* Demo Selector Navigation */}
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 28,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: 16
      }}>
        {[
          { id: 'recommendations', label: '1. Event Recommendations (Path Matching)' },
          { id: 'degrees', label: '2. Degrees of Connection (Shortest Path)' },
          { id: 'friends', label: '3. "Friends Going" Traversal' },
          { id: 'leaderboard', label: '4. Graph-Aggregated Leaderboard' },
          { id: 'viva_faq', label: '5. Viva Checklist & Defense Q&A' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveDemo(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              fontSize: '0.9rem',
              fontWeight: 600,
              background: activeDemo === tab.id ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.04)',
              color: activeDemo === tab.id ? '#fff' : '#94a3b8',
              border: `1px solid ${activeDemo === tab.id ? 'transparent' : 'rgba(255, 255, 255, 0.08)'}`
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Demo 1: Collaborative Filtering Recommendations */}
      {activeDemo === 'recommendations' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Network size={24} color="#818cf8" /> Collaborative Filtering via Graph Paths
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
            In a relational SQL database, finding events attended by peers who also attended events you attended requires 
            chaining 5 JOINs across Students, Registrations, Events, and Peer Registrations. In Neo4j, it is a single index-free path traversal!
          </p>

          {/* Visual Graph Path Flow */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 14,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#6366f1', color: '#fff', fontWeight: 700 }}>
                (me:Student)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>You (Alex Rivera)</div>
            </div>

            <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>-[:ATTENDED]-&gt;</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#0ea5e9', color: '#fff', fontWeight: 700 }}>
                (shared:Event)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Past Shared Event</div>
            </div>

            <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>&lt;-[:ATTENDED]-</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#10b981', color: '#fff', fontWeight: 700 }}>
                (peer:Student)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Like-minded Peer</div>
            </div>

            <div style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.85rem' }}>-[:REGISTERED_FOR]-&gt;</div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ padding: '10px 16px', borderRadius: 10, background: '#ec4899', color: '#fff', fontWeight: 700 }}>
                (rec:Event)
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Recommended For You!</div>
            </div>
          </div>

          {/* Cypher Code Box */}
          <div style={{
            background: '#090d16',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'monospace',
            fontSize: '0.88rem',
            color: '#38bdf8',
            overflowX: 'auto',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#64748b', marginBottom: 6 }}>// Cypher Query 7: Peer Collaborative Recommendation</div>
            MATCH (me:Student &#123;studentId: $studentId&#125;)-[:ATTENDED|REGISTERED_FOR]-&gt;(sharedEvt:Event)<br />
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;-[:ATTENDED|REGISTERED_FOR]-(peer:Student)<br />
            WHERE peer &lt;&gt; me<br />
            MATCH (peer)-[:REGISTERED_FOR &#123;status: 'Registered'&#125;]-&gt;(recEvt:Event)<br />
            WHERE recEvt.status = 'Approved'<br />
            &nbsp;&nbsp;AND NOT (me)-[:REGISTERED_FOR]-&gt;(recEvt)<br />
            RETURN recEvt.name AS eventName, count(DISTINCT peer) AS peerScore<br />
            ORDER BY peerScore DESC LIMIT 5;
          </div>
        </div>
      )}

      {/* Demo 2: Degrees of Connection (Shortest Path) */}
      {activeDemo === 'degrees' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <GitCommit size={24} color="#38bdf8" /> Degrees of Separation (shortestPath Algorithm)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
            Find how any two students on campus are connected through shared events, clubs, or hackathon teams.
          </p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Student A</label>
              <select value={student1} onChange={(e) => setStudent1(e.target.value)} style={{ width: '100%' }}>
                {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: 6 }}>Student B</label>
              <select value={student2} onChange={(e) => setStudent2(e.target.value)} style={{ width: '100%' }}>
                {studentsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Traversing graph relationships...</div>
          ) : shortestPathData ? (
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 14,
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399', marginBottom: 16 }}>
                Shortest Connection Path Found ({shortestPathData.degreesOfSeparation} Degrees of Separation):
              </div>

              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                {shortestPathData.pathNodes?.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <div style={{
                      padding: '8px 14px',
                      borderRadius: 10,
                      background: node.labels?.includes('Student') ? '#6366f1' : node.labels?.includes('Event') ? '#0ea5e9' : '#10b981',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}>
                      {node.name}
                      <span style={{ fontSize: '0.68rem', display: 'block', opacity: 0.8 }}>{node.labels?.[0]}</span>
                    </div>
                    {idx < shortestPathData.pathNodes.length - 1 && (
                      <span style={{ color: '#818cf8', fontWeight: 700 }}>&rarr;</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, color: '#64748b' }}>No path found between these nodes.</div>
          )}

          {/* Cypher Snippet */}
          <div style={{
            background: '#090d16',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'monospace',
            fontSize: '0.88rem',
            color: '#38bdf8',
            overflowX: 'auto',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#64748b', marginBottom: 6 }}>// Cypher Query 9: Shortest Path Algorithm</div>
            MATCH p = shortestPath((s1:Student &#123;studentId: $studentId1&#125;)-[*..6]-(s2:Student &#123;studentId: $studentId2&#125;))<br />
            RETURN [n IN nodes(p) | n.name] AS connectionPath, length(p) AS degreesOfSeparation;
          </div>
        </div>
      )}

      {/* Demo 3: Friends Going */}
      {activeDemo === 'friends' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} color="#ec4899" /> "Friends Going" Graph Pattern
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
            When viewing an upcoming event page, Neo4j immediately answers: "Which students that I worked with on past teams 
            or attended past events with are already registered for this one?"
          </p>

          <div style={{
            background: '#090d16',
            borderRadius: 12,
            padding: 20,
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontFamily: 'monospace',
            fontSize: '0.88rem',
            color: '#38bdf8',
            overflowX: 'auto',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#64748b', marginBottom: 6 }}>// Cypher Query 8: Friends Going on Event Page</div>
            MATCH (me:Student &#123;studentId: $studentId&#125;)-[:ATTENDED|IN_TEAM]-&gt;()&lt;-[:ATTENDED|IN_TEAM]-(friend:Student)<br />
            WHERE friend &lt;&gt; me<br />
            MATCH (friend)-[:REGISTERED_FOR &#123;status: 'Registered'&#125;]-&gt;(targetEvt:Event &#123;eventId: $eventId&#125;)<br />
            RETURN friend.name AS name, friend.department AS department;
          </div>
        </div>
      )}

      {/* Demo 4: Leaderboard */}
      {activeDemo === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={24} color="#f59e0b" /> Campus Graph Leaderboard (Query #6)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 20 }}>
            Points formula: 10 points per event attended + 50 points for 1st place, 30 for 2nd, 20 for 3rd place!
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                  <th style={{ padding: 12 }}>Rank</th>
                  <th style={{ padding: 12 }}>Student</th>
                  <th style={{ padding: 12 }}>Department</th>
                  <th style={{ padding: 12 }}>Year</th>
                  <th style={{ padding: 12 }}>Calculated Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => (
                  <tr key={item.studentId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ padding: 12, fontWeight: 700, color: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#b45309' : '#94a3b8' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: 12, fontWeight: 600, color: '#f8fafc' }}>{item.studentName}</td>
                    <td style={{ padding: 12, color: '#cbd5e1' }}>{item.department}</td>
                    <td style={{ padding: 12, color: '#94a3b8' }}>Year {item.year}</td>
                    <td style={{ padding: 12 }}>
                      <span className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                        {item.calculatedPoints} pts
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Demo 5: Viva Q&A Defense */}
      {activeDemo === 'viva_faq' && (
        <div className="glass-panel" style={{ padding: 32 }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <HelpCircle size={24} color="#34d399" /> Viva Voce & Defense Checklist
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: 24 }}>
            Direct answers to the most common viva questions asked by external examiners.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                q: 'Why did you choose Neo4j instead of MySQL/PostgreSQL?',
                a: 'This domain is relationship-heavy: students attend events, clubs organize events, students lead teams, and students win prizes. Recommendations and "friends going" are simple traversals in a graph (O(k)) but chains of 5+ JOINs in SQL. Junction tables disappear in Neo4j because relationships carry their own properties.'
              },
              {
                q: 'How do you prevent overbooking / race conditions for the last seat?',
                a: 'In a single write transaction, we touch and write to the event node first (SET e._lock = timestamp()). In Neo4j, writing to a node takes an exclusive write lock. Concurrent registration requests queue up and are processed strictly one by one.'
              },
              {
                q: 'How are duplicate registrations and duplicate certificates prevented?',
                a: 'By using MERGE on the relationship (s)-[:REGISTERED_FOR]->(e) rather than CREATE. For certificates, we use deterministic IDs built from eventId + "_" + studentId.'
              },
              {
                q: 'Does Neo4j have triggers like MySQL?',
                a: 'Not natively in Community Edition. We implement triggers via Service Layer ACID transactions (handling automatic waitlist promotion and notifications). Alternatively, self-hosted instances can use APOC triggers.'
              },
              {
                q: 'Is Neo4j ACID compliant?',
                a: 'Yes, Neo4j provides full ACID transaction guarantees through Write-Ahead Logging (WAL) and exclusive node locks during writes.'
              }
            ].map((faq, i) => (
              <div key={i} style={{
                padding: 16,
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div style={{ fontWeight: 700, fontSize: '1.02rem', color: '#f8fafc', marginBottom: 6 }}>
                  Q: {faq.q}
                </div>
                <div style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#34d399' }}>Answer:</strong> {faq.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
