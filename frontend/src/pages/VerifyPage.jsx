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
          borderRadius: 16,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#34d399'
        }}>
          <ShieldCheck size={32} />
        </div>
        <h1 style={{ fontSize: '2.2rem', marginBottom: 8 }}>Public Credential Verification</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 540, margin: '0 auto' }}>
          Instantly verify the authenticity of student participation and winner certificates issued by campus clubs.
        </p>
      </div>

      {/* Verification Input Box */}
      <div style={{
        background: 'rgba(23, 31, 51, 0.75)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)'
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
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: 48, padding: '0 24px' }}>
            {loading ? 'Verifying...' : 'Verify Online'}
          </button>
        </form>

        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>Try sample codes:</span>
          <button 
            type="button"
            onClick={() => { setCode('VERIFY-WIN-78901'); handleVerify('VERIFY-WIN-78901'); }}
            style={{ background: 'transparent', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }}
          >
            VERIFY-WIN-78901 (Winner)
          </button>
          <span>•</span>
          <button 
            type="button"
            onClick={() => { setCode('VERIFY-PAR-33445'); handleVerify('VERIFY-PAR-33445'); }}
            style={{ background: 'transparent', color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }}
          >
            VERIFY-PAR-33445 (Participation)
          </button>
        </div>
      </div>

      {/* Verification Error */}
      {error && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 12,
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24
        }}>
          <AlertCircle size={24} color="#f87171" />
          <div>
            <div style={{ fontWeight: 700 }}>Invalid Certificate</div>
            <div style={{ fontSize: '0.85rem' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Verification Success Box */}
      {result && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%)',
          border: '2px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 20,
          padding: 32,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>Verified Authenticity</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Cryptographically registered in Neo4j Knowledge Graph</div>
            </div>
            <span className={`badge ${result.type === 'Winner' ? 'badge-warning' : 'badge-info'}`} style={{ marginLeft: 'auto', fontSize: '0.88rem', padding: '6px 14px' }}>
              {result.type} Certificate
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Recipient Student</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>{result.studentName}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{result.department} (ID: {result.studentId})</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Event Completed</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>{result.eventName}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Hosted by {result.clubName}</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Issue Date</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>{result.issueDate}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Code: {result.verificationCode}</div>
            </div>

            {result.position && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase' }}>Distinction</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fcd34d', marginTop: 2 }}>
                  Position #{result.position}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#fcd34d' }}>{result.prize}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
