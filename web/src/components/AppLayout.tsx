import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import { clearAccessToken, getAccessToken } from '../lib/auth';
import { api } from '../lib/api';

type Notice = { id: string; text: string };

function DachshundLogo() {
  return (
    <svg className="logo" viewBox="0 0 160 44" role="img" aria-label="닥스훈트">
      <title>닥스훈트</title>
      <path
        d="M24 25c-2.6 0-4.9-1.6-5.8-4l-2-6.2c-.4-1.2.5-2.5 1.8-2.5h10.8c1.3 0 2.2 1.3 1.8 2.5l-2 6.2c-.9 2.4-3.2 4-5.8 4Z"
        fill="#c08457"
        opacity=".9"
      />
      <path
        d="M42 24h67c10 0 18 8 18 18v0H53c-8.3 0-15-6.7-15-15v-3.5c0-.8.7-1.5 1.5-1.5H42Z"
        fill="#111827"
      />
      <path
        d="M121 42c0-7.7 6.3-14 14-14h13c6.1 0 11 4.9 11 11v3"
        fill="none"
        stroke="#111827"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M20 14c-3.5 0-6.5 2.1-7.7 5.1"
        fill="none"
        stroke="#c08457"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="26" cy="18" r="2.5" fill="#111827" />
      <path
        d="M16 9c-2.2 1.3-4 3.1-5.3 5.3"
        fill="none"
        stroke="#c08457"
        strokeWidth="5"
        strokeLinecap="round"
        opacity=".8"
      />
      <path
        d="M58 42v-8"
        fill="none"
        stroke="#c08457"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M92 42v-8"
        fill="none"
        stroke="#c08457"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MagicWandIcon() {
  return (
    <svg className="navIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20 14 10l2 2L6 22H4v-2Z" fill="currentColor" />
      <path
        d="M15.5 5.5 18.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 3v2M21 11h-2M17 7h2M7 17v2M3 13h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg className="navIcon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M7 15l3-3 3 3 2-2 3 3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function AppLayout() {
  const navigate = useNavigate();
  const authed = Boolean(getAccessToken());

  const [notices, setNotices] = useState<Notice[]>([]);
  const prevStatusById = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!authed) return;

    const tick = async () => {
      try {
        const items = await api.listGallery();
        const prev = prevStatusById.current;

        for (const item of items) {
          const prevStatus = prev[item.id];
          if (prevStatus && prevStatus !== item.status) {
            if (item.status === 'COMPLETED') {
              setNotices((n) => [
                {
                  id: `${item.id}:${Date.now()}`,
                  text: '이미지 생성이 완료되었습니다.',
                },
                ...n,
              ]);
            }
            if (item.status === 'FAILED') {
              setNotices((n) => [
                {
                  id: `${item.id}:${Date.now()}`,
                  text: '이미지 생성이 실패했습니다.',
                },
                ...n,
              ]);
            }
          }
          prev[item.id] = item.status;
        }
      } catch {
        // ignore polling errors
      }
    };

    tick();
    const t = window.setInterval(tick, 3000);
    return () => window.clearInterval(t);
  }, [authed]);

  const logout = () => {
    clearAccessToken();
    navigate('/login');
  };

  return (
    <div>
      <div className="nav">
        <div className="container navBar">
          <div className="navLeft">
            <DachshundLogo />
          </div>

          {authed ? (
            <div className="navCenter" aria-label="주요 메뉴">
              <NavLink
                to="/generate"
                aria-label="생성"
                className={({ isActive }) =>
                  `navItem${isActive ? ' active' : ''}`
                }
              >
                <MagicWandIcon />
                <span className="srOnly">생성</span>
              </NavLink>
              <NavLink
                to="/gallery"
                aria-label="갤러리"
                className={({ isActive }) =>
                  `navItem${isActive ? ' active' : ''}`
                }
              >
                <GalleryIcon />
                <span className="srOnly">갤러리</span>
              </NavLink>
            </div>
          ) : (
            <div className="navCenter" />
          )}

          <div className="navRight">
            {authed ? (
              <button className="btn secondary" onClick={logout}>
                로그아웃
              </button>
            ) : (
              <span className="muted" style={{ fontSize: 12 }}>
                로그인 후 사용 가능
              </span>
            )}
          </div>
        </div>
      </div>

      {notices.length ? (
        <div className="container" style={{ paddingBottom: 0 }}>
          <div className="card" style={{ borderColor: '#d1d5db' }}>
            <div className="col" style={{ gap: 6 }}>
              {notices.slice(0, 3).map((n) => (
                <div key={n.id}>{n.text}</div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="container" style={{ paddingTop: 16 }}>
        <Outlet />
      </div>
    </div>
  );
}
