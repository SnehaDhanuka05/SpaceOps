export interface ISSTelemetry {
  id: number;
  latitude: float;
  longitude: float;
  altitude?: number;
  velocity?: number;
  timestamp: string;
}

export type float = number;

export interface NEOHazard {
  id: number;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url?: string;
  absolute_magnitude_h?: number;
  estimated_diameter_km_max?: number;
  is_potentially_hazardous_asteroid: boolean;
  close_approach_date: string;
  miss_distance_km?: number;
  relative_velocity_kph?: number;
}

export interface SpaceWeather {
  id: number;
  event_id: string;
  event_type: string;
  start_time?: string;
  peak_time?: string;
  k_index?: number;
  severity?: string;
  details?: string;
}

export interface Launch {
  id: number;
  launch_id: string;
  name: string;
  provider?: string;
  status?: string;
  window_start?: string;
  window_end?: string;
  rocket_name?: string;
  launch_pad?: string;
  description?: string;
}

export interface AIExplanationRequest {
  data_id: string;
  data_summary: string;
}

export interface AIExplanationResponse {
  event_type: string;
  data_id: string;
  explanation: string;
  cached: boolean;
}
