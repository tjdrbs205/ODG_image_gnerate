import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDone(null);
    setLoading(true);
    try {
      const res = await api.signup({ username, password });
      setDone(res.message);
      window.setTimeout(() => navigate('/login'), 600);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>회원가입</h2>
      <form className="col" onSubmit={onSubmit}>
        <label className="col">
          <span className="muted">아이디 (4자 이상)</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="col">
          <span className="muted">비밀번호 (8자 이상)</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}
        {done ? <div style={{ color: '#065f46' }}>{done}</div> : null}

        <button className="btn" disabled={loading}>
          {loading ? '가입 중…' : '회원가입'}
        </button>

        <div className="muted" style={{ fontSize: 12 }}>
          이미 계정이 있나요?{' '}
          <Link to="/login" style={{ textDecoration: 'underline' }}>
            로그인
          </Link>
        </div>
      </form>
    </div>
  );
}
