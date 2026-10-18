import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function CertificatesPage({ user, onNavigateToVerify }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const res = await api.getMyCertificates();
      setCertificates(res.certificates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Student') {
      loadCertificates();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'Student') {
    return (
      <div style={{ padding: 80, textAlign: 'center', color: '#94a3b8' }}>
        Please sign in as a student to view your awarded certificates.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Award size={28} color="#f59e0b" /> Official Merits & Certificates
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
            Verifiable credentials issued directly through immutable graph relationships.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <Award size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <h3>No certificates issued yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 4 }}>
            Attend events and win competitions to earn verified participation and excellence credentials!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: 24
        }}>
          {certificates.map((cert) => {
            const isWinner = cert.type === 'Winner';

            return (
              <div 
                key={cert.certificateId}
                className="card-interactive"
                style={{
                  padding: 24,
                  border: isWinner ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
                  background: isWinner 
                    ? 'linear-gradient(135deg, rgba(30, 25, 15, 0.8) 0%, rgba(20, 24, 38, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(18, 28, 50, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span className={`badge ${isWinner ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.82rem' }}>
                    {isWinner ? '🏆 Winner Certificate' : '📜 Participation Certificate'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {cert.issueDate}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: 6, color: '#fff' }}>
                  {cert.eventName}
                </h3>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: 16 }}>
                  Organized by <strong style={{ color: '#cbd5e1' }}>{cert.clubName}</strong>
                </div>

                {isWinner && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    fontSize: '0.85rem',
                    color: '#fcd34d',
                    marginBottom: 16
                  }}>
                    Position #{cert.wonPosition} • {cert.wonPrize}
                  </div>
                )}

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  marginBottom: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Code: <strong>{cert.verificationCode}</strong></span>
                  <button 
                    onClick={() => onNavigateToVerify(cert.verificationCode)}
                    style={{ background: 'transparent', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    Verify <ExternalLink size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <a 
                    href={api.getCertificateDownloadUrl(cert.certificateId)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px' }}
                  >
                    <Download size={16} /> Download PDF
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
