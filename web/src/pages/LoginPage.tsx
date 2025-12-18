import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { setAccessToken } from '../lib/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ username, password });
      setAccessToken(res.accessToken);
      navigate('/generate');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>로그인</h2>
      <form className="col" onSubmit={onSubmit}>
        <label className="col">
          <span className="muted">아이디</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label className="col">
          <span className="muted">비밀번호</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}

        <button className="btn" disabled={loading}>
          {loading ? '로그인 중…' : '로그인'}
        </button>

        <div className="muted" style={{ fontSize: 12 }}>
          계정이 없나요?{' '}
          <Link to="/signup" style={{ textDecoration: 'underline' }}>
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
}
