import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { getAccessToken } from '../lib/auth';

type Item = {
  id: string;
  prompt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  error?: string;
  imageUrl?: string;
};

type ImageUpdatedEvent = {
  id?: string;
  status?: 'PENDING' | 'COMPLETED' | 'FAILED' | string;
  createdAt?: string;
  prompt?: string;
  error?: string;
  imageUrl?: string;
};

export function GalleryPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; alt: string } | null>(
    null,
  );

  const refresh = async () => {
    setError(null);
    try {
      const data = await api.listGallery();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '갤러리 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const es = new EventSource(`/api/sse?token=${encodeURIComponent(token)}`);

    const onUpdate = (e: MessageEvent) => {
      let data: ImageUpdatedEvent;
      try {
        data = JSON.parse(e.data) as ImageUpdatedEvent;
      } catch {
        return;
      }

      const id = data?.id;
      const status = data?.status;
      if (!id || (status !== 'PENDING' && status !== 'COMPLETED' && status !== 'FAILED')) {
        return;
      }

      setItems((prev) => {
        const idx = prev.findIndex((p) => p.id === id);
        if (idx === -1) {
          const createdAt = data.createdAt ?? new Date().toISOString();
          const prompt = data.prompt ?? '';
          const next: Item = {
            id,
            status,
            createdAt,
            prompt,
            error: data.error,
            imageUrl: data.imageUrl,
          };
          return [next, ...prev];
        }

        const current = prev[idx];
        const updated: Item = {
          ...current,
          status,
          ...(data.prompt ? { prompt: data.prompt } : null),
          ...(data.createdAt ? { createdAt: data.createdAt } : null),
          ...(typeof data.error !== 'undefined' ? { error: data.error } : null),
          ...(typeof data.imageUrl !== 'undefined' ? { imageUrl: data.imageUrl } : null),
        };

        const copy = prev.slice();
        copy[idx] = updated;
        return copy;
      });
    };

    es.addEventListener('image.updated', onUpdate as any);
    return () => {
      es.removeEventListener('image.updated', onUpdate as any);
      es.close();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.status === 'PENDING').length;
    const completed = items.filter((i) => i.status === 'COMPLETED').length;
    const failed = items.filter((i) => i.status === 'FAILED').length;
    return { pending, completed, failed };
  }, [items]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      alert('이미지 다운로드에 실패했습니다.');
    }
  };

  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>갤러리</h2>
        <div className="row" style={{ gap: 8 }}>
          <span className="badge">완료 {stats.completed}</span>
          <span className="badge">생성중 {stats.pending}</span>
          <span className="badge">실패 {stats.failed}</span>
          <button className="btn secondary" onClick={() => void refresh()}>
            새로고침
          </button>
        </div>
      </div>

      {loading ? <div className="muted">불러오는 중…</div> : null}
      {error ? <div style={{ color: '#b91c1c' }}>{error}</div> : null}

      <div className="grid">
        {items.map((item) => {
          const url = item.imageUrl ?? null;
          return (
            <div key={item.id} className="card">
              {url ? (
                <button
                  type="button"
                  className="thumbButton"
                  onClick={() => setLightbox({ url, alt: item.prompt })}
                  aria-label="이미지 확대 보기"
                >
                  <img
                    className="thumb"
                    src={url}
                    alt={item.prompt}
                    loading="lazy"
                  />
                </button>
              ) : (
                <div className="thumb" />
              )}

              <div
                className="row"
                style={{ justifyContent: 'space-between', marginTop: 10 }}
              >
                <span className="badge">
                  {item.status === 'PENDING'
                    ? '생성중'
                    : item.status === 'COMPLETED'
                      ? '완료'
                      : '실패'}
                </span>
                <span className="muted" style={{ fontSize: 12 }}>
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              {item.status === 'FAILED' && item.error ? (
                <div style={{ marginTop: 6, color: '#b91c1c', fontSize: 12 }}>
                  {item.error}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {lightbox ? (
        <div
          className="modalBackdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <div
              className="row"
              style={{ justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}
            >
              <button
                className="btn primary"
                type="button"
                onClick={() =>
                  void handleDownload(
                    lightbox.url,
                    `${lightbox.alt.slice(0, 20).trim() || 'image'}.png`,
                  )
                }
              >
                다운로드
              </button>
              <button
                className="modalClose btn secondary"
                type="button"
                onClick={() => setLightbox(null)}
              >
                닫기
              </button>
            </div>
            <img className="modalImage" src={lightbox.url} alt={lightbox.alt} />
          </div>
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="muted">아직 생성된 이미지가 없습니다.</div>
      ) : null}
    </div>
  );
}
