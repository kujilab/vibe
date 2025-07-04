export interface OuraPersonalInfo {
  id: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  biological_sex: string;
}

export interface SleepData {
  id: string;
  day: string;
  bedtime_start: string;
  bedtime_end: string;
  timezone: number;
  duration: number;
  total_sleep_duration: number;
  awake_time: number;
  light_sleep_duration: number;
  deep_sleep_duration: number;
  rem_sleep_duration: number;
  restless: number;
  efficiency: number;
  onset_latency: number;
  midpoint_time: number;
  hr_lowest: number;
  hr_average: number;
  rmssd: number;
  breath_average: number;
  temperature_delta: number;
  hypnogram_5min: string;
  hr_5min: number[];
  rmssd_5min: number[];
  score: number;
  score_total: number;
  score_disturbances: number;
  score_efficiency: number;
  score_latency: number;
  score_rem: number;
  score_deep: number;
  score_alignment: number;
}

export interface ActivityData {
  id: string;
  day: string;
  timezone: number;
  timestamp: string;
  score: number;
  active_calories: number;
  average_met_minutes: number;
  contributors: {
    meet_daily_targets: number;
    move_every_hour: number;
    recovery_time: number;
    stay_active: number;
    training_frequency: number;
    training_volume: number;
  };
  equivalent_walking_distance: number;
  high_activity_met_minutes: number;
  high_activity_time: number;
  inactivity_alerts: number;
  low_activity_met_minutes: number;
  low_activity_time: number;
  medium_activity_met_minutes: number;
  medium_activity_time: number;
  met: {
    interval: number;
    items: number[];
    timestamp: string;
  };
  meters_to_target: number;
  non_wear_time: number;
  resting_time: number;
  sedentary_met_minutes: number;
  sedentary_time: number;
  steps: number;
  target_calories: number;
  target_meters: number;
  total_calories: number;
}

export interface ReadinessData {
  id: string;
  day: string;
  timezone: number;
  timestamp: string;
  score: number;
  temperature_deviation: number;
  temperature_trend_deviation: number;
  contributors: {
    activity_balance: number;
    body_temperature: number;
    hrv_balance: number;
    previous_day_activity: number;
    previous_night_sleep: number;
    recovery_index: number;
    resting_heart_rate: number;
    sleep_balance: number;
  };
}

export interface HeartRateData {
  bpm: number;
  source: string;
  timestamp: string;
}

export interface OuraApiResponse<T> {
  data: T[];
  next_token?: string;
}

export interface DashboardMetrics {
  sleep?: SleepData;
  activity?: ActivityData;
  readiness?: ReadinessData;
  heartRate?: HeartRateData[];
}

export interface OuraConfig {
  accessToken?: string;
  apiUrl: string;
}