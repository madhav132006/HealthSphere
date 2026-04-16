import { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AISymptomChecker = () => {
  const { isAuthenticated } = useAuth();
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await api.post('/ai/analyze', { symptoms, age, gender, duration });
      setResult(res.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (severity) => {
    const s = severity?.toLowerCase();
    if (s === 'high') return 'severity-high';
    if (s === 'medium') return 'severity-medium';
    return 'severity-low';
  };

  const getProbabilityClass = (prob) => {
    const p = prob?.toLowerCase();
    if (p === 'high') return 'probability-high';
    if (p === 'medium') return 'probability-medium';
    return 'probability-low';
  };

  return (
    <div className="page-wrapper" id="symptom-checker-page">
      <div className="container">
        <div className="page-header" style={{textAlign: 'center'}}>
          <span className="section-tag">AI-Powered</span>
          <h1>🤖 Symptom Checker</h1>
          <p>Describe your symptoms and our AI will provide a preliminary health analysis with possible conditions and recommended actions.</p>
        </div>

        <div className="symptom-checker">
          <form onSubmit={handleAnalyze} className="symptom-form glass-card-static">
            <div className="form-group">
              <label className="form-label">Describe your symptoms *</label>
              <textarea
                className="form-textarea"
                placeholder="E.g., I've been having a persistent headache for 3 days, along with mild fever and body ache. The headache gets worse in the evening..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                required
                rows={5}
                id="symptom-input"
              />
            </div>

            <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label className="form-label">Age</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="25"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  id="symptom-age"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)} id="symptom-gender">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., 3 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  id="symptom-duration"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{width: '100%'}} disabled={loading} id="analyze-btn">
              {loading ? (
                <><span className="spinner"></span> Analyzing Symptoms...</>
              ) : (
                '🔍 Analyze Symptoms'
              )}
            </button>
          </form>

          {error && (
            <div className="alert alert-error" style={{marginTop: '1.5rem'}}>⚠️ {error}</div>
          )}

          {result && (
            <div style={{marginTop: '2rem', animation: 'fadeInUp 0.5s ease'}}>
              {/* Severity Badge */}
              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem'}}>
                <h2 style={{fontFamily: 'var(--font-heading)', fontWeight: 800}}>📋 Analysis Results</h2>
                <span className={`severity-indicator ${getSeverityClass(result.severity)}`}>
                  {result.severity === 'high' ? '🔴' : result.severity === 'medium' ? '🟡' : '🟢'}
                  {' '}Severity: {result.severity?.charAt(0).toUpperCase() + result.severity?.slice(1)}
                </span>
              </div>

              {/* Possible Conditions */}
              {result.conditions && result.conditions.length > 0 && (
                <div className="result-section">
                  <h3>🔬 Possible Conditions</h3>
                  {result.conditions.map((condition, i) => (
                    <div className="condition-card" key={i}>
                      <div className="condition-header">
                        <span className="condition-name">{condition.name}</span>
                        <span className={`probability-badge ${getProbabilityClass(condition.probability)}`}>
                          {condition.probability} Probability
                        </span>
                      </div>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{condition.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Medicines */}
              {result.medicines && result.medicines.length > 0 && (
                <div className="result-section">
                  <h3>💊 Recommended Medicines</h3>
                  {result.medicines.map((med, i) => (
                    <div className="medicine-card" key={i}>
                      <div className="medicine-name">{med.name}</div>
                      <span className="medicine-type">{med.type}</span>
                      <div className="medicine-detail"><strong>Dosage:</strong> {med.dosage}</div>
                      {med.note && <div className="medicine-detail" style={{color: 'var(--text-tertiary)', fontStyle: 'italic'}}>💡 {med.note}</div>}
                    </div>
                  ))}
                </div>
              )}

              {/* Advice */}
              {result.advice && (
                <div className="result-section">
                  <h3>📝 Medical Advice</h3>
                  <div className="advice-box">{result.advice}</div>
                </div>
              )}

              {/* See Doctor Recommendation */}
              {result.seeDoctor && (
                <div className="result-section">
                  <div style={{
                    background: 'rgba(124, 58, 237, 0.08)', 
                    border: '1px solid rgba(124, 58, 237, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div>
                      <h4 style={{marginBottom: '0.25rem'}}>👨‍⚕️ Doctor Consultation Recommended</h4>
                      <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Based on your symptoms, we recommend consulting a specialist for proper diagnosis.</p>
                    </div>
                    <a href="/doctors" className="btn btn-primary" id="consult-doctor-btn">Find a Doctor →</a>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              {result.disclaimer && (
                <div className="disclaimer-box" style={{marginTop: '1.5rem'}}>{result.disclaimer}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISymptomChecker;
