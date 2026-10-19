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
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: 10, color: '#0f172a', fontWeight: 800 }}>
            <Award size={28} color="#d97706" /> Official Merits & Certificates
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.96rem', marginTop: 4 }}>
            Verifiable credentials issued directly through immutable graph relationships.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748b', fontSize: '0.96rem' }}>Loading certificates...</div>
      ) : certificates.length === 0 ? (
        <div style={{
          padding: '60px 20px',
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.75)',
          borderRadius: 20,
          border: '1.5px solid rgba(226, 232, 240, 0.9)',
          boxShadow: '0 10px 30px rgba(100, 116, 139, 0.05)'
        }}>
          <Award size={48} style={{ margin: '0 auto 12px', color: '#94a3b8' }} />
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>No certificates issued yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: 4 }}>
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
                  border: isWinner ? '2px solid rgba(245, 158, 11, 0.45)' : '1.5px solid rgba(199, 210, 254, 0.9)',
                  background: isWinner 
                    ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 243, 199, 0.95) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(238, 242, 255, 0.95) 100%)',
                  boxShadow: isWinner 
                    ? '0 12px 28px -6px rgba(245, 158, 11, 0.18), inset 0 1px 1px #fff' 
                    : '0 12px 28px -6px rgba(99, 102, 241, 0.12), inset 0 1px 1px #fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span className={`badge ${isWinner ? 'badge-warning' : 'badge-info'}`} style={{ fontSize: '0.82rem' }}>
                    {isWinner ? '🏆 Winner Certificate' : '📜 Participation Certificate'}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    {cert.issueDate}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: 6, color: '#0f172a', fontWeight: 800 }}>
                  {cert.eventName}
                </h3>
                <div style={{ fontSize: '0.86rem', color: '#475569', marginBottom: 16 }}>
                  Organized by <strong style={{ color: '#0f172a' }}>{cert.clubName}</strong>
                </div>

                {isWinner && (
                  <div style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontSize: '0.88rem',
                    color: '#92400e',
                    fontWeight: 700,
                    marginBottom: 16
                  }}>
                    Position #{cert.wonPosition} • {cert.wonPrize}
                  </div>
                )}

                <div style={{
                  background: 'rgba(241, 245, 249, 0.85)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  color: '#475569',
                  marginBottom: 18,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid rgba(226, 232, 240, 0.9)'
                }}>
                  <span>Code: <strong style={{ color: '#0f172a' }}>{cert.verificationCode}</strong></span>
                  <button 
                    onClick={() => onNavigateToVerify(cert.verificationCode)}
                    style={{ background: 'transparent', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, border: 'none', fontWeight: 700 }}
                  >
                    Verify <ExternalLink size={13} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <a 
                    href={api.getCertificateDownloadUrl(cert.certificateId)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.88rem' }}
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
