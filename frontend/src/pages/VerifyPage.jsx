import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldCheck, Search, Award, Calendar, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function VerifyPage({ initialCode = '' }) {
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleVerify = async (codeToVerify) => {
    const c = (codeToVerify || code).trim();
    if (!c) return;
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await api.verifyCertificate(c);
      setResult(res.certificate);
    } catch (err) {
      setError(err.message || 'Certificate verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleVerify(initialCode);
    }
  }, [initialCode]);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#059669',
          boxShadow: '0 8px 20px rgba(16, 185, 129, 0.12)'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8, color: '#0f172a', fontWeight: 800 }}>Public Credential Verification</h1>
        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
          Instantly verify the authenticity of student participation and winner certificates issued by campus clubs.
        </p>
      </div>

      {/* Verification Input Box */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(226, 232, 240, 0.95)',
        borderRadius: 20,
        padding: 26,
        marginBottom: 32,
        boxShadow: '0 16px 36px -8px rgba(100, 116, 139, 0.1), inset 0 1px 2px #ffffff'
      }}>
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="e.g. VERIFY-WIN-78901"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ width: '100%', paddingLeft: 42, height: 48, fontSize: '1rem', letterSpacing: '0.04em' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 48, padding: '0 24px', borderRadius: 12 }}>
            {loading ? 'Verifying...' : 'Verify Online'}
          </button>
        </form>

        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>Try sample codes:</span>
          <button 
            type="button"
            onClick={() => { setCode('VERIFY-WIN-78901'); handleVerify('VERIFY-WIN-78901'); }}
            style={{ background: 'transparent', color: '#4f46e5', textDecoration: 'underline', cursor: 'pointer', border: 'none', fontWeight: 600 }}
          >
            VERIFY-WIN-78901 (Winner)
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => { setCode('VERIFY-PAR-33445'); handleVerify('VERIFY-PAR-33445'); }}
            style={{ background: 'transparent', color: '#4f46e5', textDecoration: 'underline', cursor: 'pointer', border: 'none', fontWeight: 600 }}
          >
            VERIFY-PAR-33445 (Participation)
          </button>
        </div>
      </div>

      {/* Verification Error */}
      {error && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(254, 242, 242, 0.95)',
          border: '1.5px solid rgba(239, 68, 68, 0.3)',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
        }}>
          <AlertCircle size={24} color="#dc2626" />
          <div>
            <div style={{ fontWeight: 800 }}>Invalid Certificate</div>
            <div style={{ fontSize: '0.86rem' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Verification Success Box */}
      {result && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(236, 253, 245, 0.96) 0%, rgba(240, 253, 250, 0.96) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.45)',
          borderRadius: 22,
          padding: 32,
          boxShadow: '0 20px 48px -12px rgba(16, 185, 129, 0.18), inset 0 1px 2px #ffffff',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>Verified Authenticity</div>
              <div style={{ fontSize: '0.8rem', color: '#065f46' }}>Cryptographically registered in Neo4j Knowledge Graph</div>
            </div>
            <span className={`badge ${result.type === 'Winner' ? 'badge-warning' : 'badge-info'}`} style={{ marginLeft: 'auto', fontSize: '0.88rem', padding: '6px 14px' }}>
              {result.type} Certificate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 24, paddingTop: 20, borderTop: '1.5px solid rgba(16, 185, 129, 0.2)' }}>
            <div>
              <div style={{ fontSize: '0.74rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Recipient Student</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{result.studentName}</div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>{result.department} (ID: {result.studentId})</div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Event Completed</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{result.eventName}</div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>Hosted by {result.clubName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: '#047857', textTransform: 'uppercase', fontWeight: 700 }}>Issue Date</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{result.issueDate}</div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>Code: {result.verificationCode}</div>
            </div>

            {result.position && (
              <div>
                <div style={{ fontSize: '0.74rem', color: '#b45309', textTransform: 'uppercase', fontWeight: 700 }}>Distinction</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#92400e', marginTop: 2 }}>
                  Position #{result.position}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>{result.prize}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
