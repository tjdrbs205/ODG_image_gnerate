import { useState } from 'react';
import { api } from '../lib/api';

type Direction = 'front' | 'back' | 'left' | 'right';
type Category = 'character' | 'building' | 'background' | 'illustration';

export function GeneratePage() {
  const [textKo, setTextKo] = useState('');
  const [direction, setDirection] = useState<Direction>('front');
  const [category, setCategory] = useState<Category>('character');
  const [size, setSize] = useState(64);

  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusText(null);
    setSubmitting(true);

    try {
      const res = await api.generateImage({
        textKo,
        direction,
        category,
        imageSize: { width: size, height: size },
      });

      setStatusText(
        `생성 요청 완료 (상태: ${res.status}). 갤러리에서 확인하세요.`,
      );
      setTextKo('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>이미지 생성</h2>
        <span className="badge">생성은 시간이 걸릴 수 있어요</span>
      </div>

      <form className="col" style={{ marginTop: 12 }} onSubmit={submit}>
        <label className="col">
          <span className="muted">한글 설명</span>
          <input
            className="input"
            placeholder="예: 웃는 강아지 캐릭터"
            value={textKo}
            onChange={(e) => setTextKo(e.target.value)}
          />
        </label>

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <label className="col" style={{ flex: 1, minWidth: 160 }}>
            <span className="muted">카테고리</span>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option value="character">캐릭터</option>
              <option value="building">건물</option>
              <option value="background">배경</option>
              <option value="illustration">일러스트</option>
            </select>
          </label>

          <label className="col" style={{ flex: 1, minWidth: 160 }}>
            <span className="muted">방향</span>
            <select
              className="input"
              value={direction}
              onChange={(e) => setDirection(e.target.value as Direction)}
            >
              <option value="front">앞</option>
              <option value="back">뒤</option>
              <option value="left">왼쪽</option>
              <option value="right">오른쪽</option>
            </select>
          </label>

          <label className="col" style={{ flex: 1, minWidth: 160 }}>
            <span className="muted">크기</span>
            <select
              className="input"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            >
              <option value={64}>64×64</option>
              <option value={128}>128×128</option>
              <option value={256}>256×256</option>
              <option value={400}>400×400</option>
            </select>
          </label>
        </div>

        {statusText ? (
          <div style={{ color: '#065f46' }}>{statusText}</div>
        ) : null}
        {submitting ? (
          <div className="muted">생성중… (다른 페이지로 이동해도 됩니다)</div>
        ) : null}
        {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}

        <div className="row" style={{ justifyContent: 'flex-end' }}>
          <button
            className="btn"
            disabled={submitting || textKo.trim().length < 1}
          >
            {submitting ? '요청 중…' : '생성 요청'}
          </button>
        </div>
      </form>
    </div>
  );
}
