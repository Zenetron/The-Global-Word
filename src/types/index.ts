export interface Vote {
  id: number;
  word: string;
  country: string;
  created_at: string;
  lat?: number;
  lng?: number;
  color?: string;
  city?: string;
}

export interface GlobeDataPoint {
  lat: number;
  lng: number;
  size: number;
  text: string;
  color: string;
  country: string;
}

export interface TopWord {
  word: string;
  count: number;
  color: string;
  distribution: Record<string, number>;
}

export interface Profile {
  username: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
}

export interface RecentVote {
  id: number;
  text: string;
  country: string;
  color: string;
  created_at: string;
}
