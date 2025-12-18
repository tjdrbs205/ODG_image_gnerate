import { clearAccessToken, getAccessToken } from './auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

type HttpMethod = 'GET' | 'POST';

const IS_DEV = Boolean(import.meta.env?.DEV);

function userMessageForHttpStatus(status: number): string {
  if (status === 0)
    return '서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.';
  if (status === 400) return '요청이 올바르지 않아요. 입력값을 확인해주세요.';
  if (status === 401) return '로그인이 필요해요. 다시 로그인해주세요.';
  if (status === 403) return '권한이 없어요.';
  if (status === 404) return '요청한 정보를 찾을 수 없어요.';
  if (status === 409)
    return '이미 사용 중인 값이 있어요. 다른 값으로 시도해주세요.';
  if (status === 422) return '입력값을 확인해주세요.';
  if (status === 429) return '요청이 많아요. 잠시 후 다시 시도해주세요.';
  if (status >= 500)
    return '서버에서 문제가 발생했어요. 잠시 후 다시 시도해주세요.';
  return '요청에 실패했어요. 잠시 후 다시 시도해주세요.';
}

async function request<T>(
  path: string,
  method: HttpMethod,
  body?: unknown,
): Promise<T> {
  const token = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (IS_DEV) {
      console.error('API network error', {
        method,
        url: `${API_BASE}${path}`,
        err,
      });
    }
    throw new Error('서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.');
  }

  if (!res.ok) {
    let detail: unknown;
    try {
      detail = await res.json();
    } catch {
      detail = await res.text();
    }

    if (IS_DEV) {
      console.error('API http error', {
        method,
        url: `${API_BASE}${path}`,
        status: res.status,
        detail,
      });
    }

    if (res.status === 401 && token) {
      clearAccessToken();
    }

    throw new Error(userMessageForHttpStatus(res.status));
  }

  return (await res.json()) as T;
}

export const api = {
  signup: (payload: { username: string; password: string }) =>
    request<{ message: string }>('/auth/signup', 'POST', payload),

  login: (payload: { username: string; password: string }) =>
    request<{ accessToken: string }>('/auth/login', 'POST', payload),

  generateImage: (payload: {
    textKo: string;
    imageSize: { width: number; height: number };
    direction?: 'front' | 'back' | 'left' | 'right';
    category?: 'character' | 'building' | 'background' | 'illustration';
  }) =>
    request<{
      id: string;
      promptEn: string;
      status: 'PENDING' | 'COMPLETED' | 'FAILED';
    }>('/generate/image', 'POST', payload),

  listGallery: () =>
    request<
      Array<{
        id: string;
        prompt: string;
        status: 'PENDING' | 'COMPLETED' | 'FAILED';
        createdAt: string;
        error?: string;
        imageUrl?: string;
      }>
    >('/gallery', 'GET'),
};
