export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface StartupProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  stage: string;
  team_size: number;
  funding_raised: number;
  location: string;
  founded_date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  content_type: string;
  category: string;
  tags: string[];
  industry_tags: string[];
  stage_tags: string[];
  difficulty_level: string;
  estimated_time: number;
  url?: string;
  thumbnail_url?: string;
  author?: string;
  published_at: string;
  view_count: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserInteraction {
  id: string;
  user_id: string;
  resource_id: string;
  interaction_type: 'view' | 'click' | 'bookmark' | 'complete' | 'rate' | 'share';
  time_spent: number;
  rating?: number;
  context_data: Record<string, any>;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_industries: string[];
  preferred_content_types: string[];
  preferred_difficulty: string;
  excluded_tags: string[];
  notification_frequency: string;
  created_at: string;
  updated_at: string;
}

export interface SearchQuery {
  id: string;
  user_id: string;
  query: string;
  filters: Record<string, any>;
  results_count: number;
  clicked_resource_id?: string;
  created_at: string;
}

export interface RecommendationCache {
  id: string;
  user_id: string;
  resource_ids: string[];
  algorithm: string;
  score_data: Record<string, any>;
  expires_at: string;
  created_at: string;
}

export interface TrendingData {
  id: string;
  resource_id: string;
  period: 'daily' | 'weekly' | 'monthly';
  view_count: number;
  interaction_count: number;
  trend_score: number;
  calculated_at: string;
}

export interface RecommendationResult {
  resource: Resource;
  score: number;
  reasoning: string;
}
