import { useState, useRef } from 'react';
import { supabase } from '../services/supabase';
import './BrandLogin.css';

export default function BrandLogin({ onLogin }) {
  const [brandName, setBrandName] = useState('');
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const inputRefs = useRef([]);

  const isLockedOut = lockoutUntil && new Date() < lockoutUntil;

  const handleCodeChange = (value, index) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && index === 4 && brandName) {
      setTimeout(() => handleSubmit(newCode.join('')), 100);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (submittedCode) => {
    const finalCode = submittedCode || code.join('');

    if (isLockedOut) {
      const remainingSeconds = Math.ceil((lockoutUntil - new Date()) / 1000);
      setError(`Too many attempts. Try again in ${remainingSeconds} seconds.`);
      return;
    }

    if (!brandName.trim()) {
      setError('Please enter your brand name');
      return;
    }

    if (finalCode.length !== 5) {
      setError('Please enter all 5 digits');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate brand access code
      const { data: codeData, error: codeError } = await supabase
        .from('brand_access_codes')
        .select('id, brand_name, code, is_revoked')
        .eq('brand_name', brandName.trim())
        .eq('code', finalCode)
        .eq('is_revoked', false)
        .single();

      if (codeError || !codeData) {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);

        if (newAttemptCount >= 5) {
          const lockoutTime = new Date(Date.now() + 5 * 60 * 1000);
          setLockoutUntil(lockoutTime);
          setError('Too many failed attempts. Locked out for 5 minutes.');
        } else {
          setError(`Invalid brand name or access code. ${5 - newAttemptCount} attempts remaining.`);
        }
        
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Get brand profile
      const { data: profileData, error: profileError } = await supabase
        .from('brand_profiles')
        .select('id, brand_name')
        .eq('access_code_id', codeData.id)
        .single();

      if (profileError || !profileData) {
        setError('No profile found for this brand. Contact support.');
        setCode(['', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Success
      setAttemptCount(0);
      setLockoutUntil(null);
      await onLogin(finalCode, codeData.brand_name, codeData.id);
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-login-container">
      <div className="brand-login-card">
        <div className="login-header">
          <h1>Brand Partner Portal</h1>
          <p>Enter your credentials to access the ads dashboard</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="form-group">
            <label htmlFor="brandName">Brand Name</label>
            <input
              id="brandName"
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter your brand name"
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Access Code</label>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(ref) => { inputRefs.current[index] = ref; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyPress(e, index)}
                  disabled={loading}
                  className="code-input"
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading || !brandName.trim() || !code.every(d => d !== '') || isLockedOut}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        <p className="help-text">
          Need access? Contact your Pairap account manager.
        </p>
      </div>
    </div>
  );
}