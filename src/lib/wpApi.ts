export type RecItem = {
  id: number;
  title: string;
  excerpt: string;
  permalink: string;
  score: number;
  explanations: string;
};

const WP_BASE = (import.meta as any).env?.VITE_WP_BASE_URL || '/';

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${WP_BASE.replace(/\/$/, '')}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WP API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function fetchRecommendations(params: {
  user_id?: number;
  session_id?: string;
  limit?: number;
  industry?: string;
  stage?: string;
  team_size?: string;
  funding?: string;
  region?: string;
  q?: string;
}): Promise<RecItem[]> {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && `${v}`.length > 0) usp.set(k, `${v}`);
  });
  return http<RecItem[]>(`/wp-json/pre/v1/recommendations?${usp.toString()}`);
}

export async function postInteraction(payload: {
  user_id?: number;
  session_id?: string;
  resource_id: number;
  action: 'view' | 'click' | 'like' | 'bookmark' | 'dismiss';
  weight?: number;
  detail?: Record<string, unknown>;
}): Promise<{ ok: boolean }>{
  return http<{ ok: boolean }>(`/wp-json/pre/v1/interactions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UserPreferences = {
  preferred_industries: string[];
  preferred_content_types: string[];
  preferred_difficulty: string;
  excluded_tags: string[];
  notification_frequency: string;
};

export async function fetchPreferences(): Promise<UserPreferences> {
  return http<UserPreferences>(`/wp-json/pre/v1/preferences`);
}

export async function savePreferences(partial: Partial<UserPreferences>): Promise<{ ok: boolean }>{
  return http<{ ok: boolean }>(`/wp-json/pre/v1/preferences`, {
    method: 'POST',
    body: JSON.stringify(partial),
  });
}


