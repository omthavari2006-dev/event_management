import React, { useState, useEffect } from 'react';
import { Award, Download, CheckCircle, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';

export default function CertificatesPage({ user }) {
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
            Official student credentials and certificates awarded by campus club organizers.
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
            Attend events and your club organizers will issue and attach your official certificates here!
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
            const fileDownloadUrl = cert.fileUrl 
              ? (cert.fileUrl.startsWith('http') ? cert.fileUrl : `http://localhost:5000${cert.fileUrl}`)
              : api.getCertificateDownloadUrl(cert.certificateId);

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
                  <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                    <ShieldCheck size={14} /> Official Credential
                  </span>
                </div>

                {cert.fileName && (
                  <div style={{ marginBottom: 14, fontSize: '0.8rem', color: '#4338ca', background: 'rgba(99, 102, 241, 0.08)', padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>📎 <strong>File:</strong> {cert.fileName}</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <a 
                    href={fileDownloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  >
                    <Download size={16} /> View / Download Certificate
                  </a>
                  {cert.hasCustomFile && (
                    <a 
                      href={api.getCertificateDownloadUrl(cert.certificateId)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ padding: '10px 12px', fontSize: '0.82rem' }}
                      title="Download Generated Certificate PDF"
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
