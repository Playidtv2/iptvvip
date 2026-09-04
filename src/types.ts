export interface UserInfo {
  username: string;
  password?: string;
  message?: string;
  auth: number;
  status: string;
  exp_date: string | number;
  is_trial: string;
  active_cons: string;
  created_at: string;
  max_connections: string;
  allowed_output_formats: string[];
}

export interface ServerInfo {
  url?: string;
  port?: string;
  https_port?: string;
  server_protocol?: string;
  rtmp_port?: string;
  timezone?: string;
  timestamp_now?: number;
  time_now?: string;
}

export interface XtreamLoginResponse {
  user_info: UserInfo;
  server_info?: ServerInfo;
}

export interface Category {
  category_id: string;
  category_name: string;
  parent_id?: number;
  count?: number;
}

export interface LiveStream {
  num?: number;
  name: string;
  stream_type?: string;
  stream_id: number | string;
  stream_icon?: string;
  epg_channel_id?: string;
  added?: string;
  category_id: string;
  custom_sid?: string;
  tv_archive?: number;
  direct_source?: string;
  tv_archive_duration?: number;
  is_adult?: boolean;
}

export interface VodStream {
  num?: number;
  name: string;
  stream_type?: string;
  stream_id: number | string;
  stream_icon?: string;
  rating?: string | number;
  rating_5based?: number;
  added?: string;
  category_id: string;
  container_extension?: string;
  custom_sid?: string;
  direct_source?: string;
  is_adult?: boolean;
  year?: string;
  release_date?: string;
}

export interface SeriesItem {
  num?: number;
  name: string;
  series_id: number | string;
  cover?: string;
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  releaseDate?: string;
  last_modified?: string;
  rating?: string | number;
  rating_5based?: number;
  category_id: string;
  is_adult?: boolean;
}

export interface Episode {
  id: string | number;
  episode_num: number;
  title: string;
  container_extension: string;
  info?: {
    plot?: string;
    duration_secs?: number;
    duration?: string;
    movie_image?: string;
  };
  custom_sid?: string;
  added?: string;
  season?: number;
}

export interface SeriesDetail {
  seasons: {
    air_date?: string;
    episode_count?: number;
    id?: number;
    name?: string;
    overview?: string;
    season_number: number;
    cover?: string;
  }[];
  info: {
    name?: string;
    cover?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    rating?: string | number;
  };
  episodes: Record<string, Episode[]>;
}

export interface VodDetail {
  info: {
    name?: string;
    movie_image?: string;
    tmdb_id?: string;
    plot?: string;
    cast?: string;
    director?: string;
    genre?: string;
    releaseDate?: string;
    year?: string;
    duration_secs?: number;
    duration?: string;
    rating?: string | number;
  };
  movie_data?: {
    stream_id: number | string;
    name: string;
    container_extension: string;
  };
}

export interface WatchHistoryItem {
  id: string | number;
  name: string;
  cover?: string;
  kind: 'live' | 'vod' | 'series';
  pos?: number;
  duration?: number;
  epIndex?: number;
  epTitle?: string;
  ext?: string;
  timestamp: number;
}

export interface AuthSession {
  serverUrl: string;
  anyname?: string;
  username: string;
  password: string;
  userInfo?: UserInfo;
}
