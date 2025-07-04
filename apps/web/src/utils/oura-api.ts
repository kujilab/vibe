import type {
  OuraApiResponse,
  SleepData,
  ActivityData,
  ReadinessData,
  HeartRateData,
  OuraPersonalInfo,
  OuraConfig,
  DashboardMetrics
} from '../types/oura';
import { 
  fetchOuraPersonalInfo, 
  fetchOuraSleepData, 
  fetchOuraActivityData, 
  fetchOuraReadinessData 
} from './oura-server';

const OURA_API_BASE = 'https://api.ouraring.com/v2/usercollection';

export class OuraApiClient {
  private config: OuraConfig;

  constructor(config: OuraConfig) {
    this.config = {
      apiUrl: OURA_API_BASE,
      ...config
    };
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<OuraApiResponse<T>> {
    if (!this.config.accessToken) {
      throw new Error('Access token is required');
    }

    const url = new URL(`${this.config.apiUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Oura API error: ${response.status} ${response.statusText}`;
      
      if (response.status === 401) {
        errorMessage = 'Invalid access token. Please check your Oura API token.';
      } else if (response.status === 403) {
        errorMessage = 'Access forbidden. Please check your Oura API permissions.';
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (errorText) {
        errorMessage += `. ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getPersonalInfo(): Promise<OuraPersonalInfo> {
    if (!this.config.accessToken) {
      throw new Error('Access token is required');
    }

    return fetchOuraPersonalInfo(this.config.accessToken);
  }

  async getSleepData(startDate?: string, endDate?: string): Promise<SleepData[]> {
    if (!this.config.accessToken) {
      throw new Error('Access token is required');
    }

    return fetchOuraSleepData(this.config.accessToken, startDate, endDate);
  }

  async getActivityData(startDate?: string, endDate?: string): Promise<ActivityData[]> {
    if (!this.config.accessToken) {
      throw new Error('Access token is required');
    }

    return fetchOuraActivityData(this.config.accessToken, startDate, endDate);
  }

  async getReadinessData(startDate?: string, endDate?: string): Promise<ReadinessData[]> {
    if (!this.config.accessToken) {
      throw new Error('Access token is required');
    }

    return fetchOuraReadinessData(this.config.accessToken, startDate, endDate);
  }

  async getHeartRateData(startDate?: string, endDate?: string): Promise<HeartRateData[]> {
    const params: Record<string, string> = {};
    if (startDate) params.start_datetime = startDate;
    if (endDate) params.end_datetime = endDate;

    const response = await this.makeRequest<HeartRateData>('/heartrate', params);
    return response.data;
  }

  async getDashboardMetrics(date?: string): Promise<DashboardMetrics> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    try {
      const [sleepData, activityData, readinessData] = await Promise.allSettled([
        this.getSleepData(targetDate, targetDate),
        this.getActivityData(targetDate, targetDate),
        this.getReadinessData(targetDate, targetDate),
      ]);

      const metrics: DashboardMetrics = {};

      if (sleepData.status === 'fulfilled' && sleepData.value.length > 0) {
        metrics.sleep = sleepData.value[0];
      }

      if (activityData.status === 'fulfilled' && activityData.value.length > 0) {
        metrics.activity = activityData.value[0];
      }

      if (readinessData.status === 'fulfilled' && readinessData.value.length > 0) {
        metrics.readiness = readinessData.value[0];
      }

      // If no data was successfully fetched and we have a test token, return mock data
      const hasAnyData = Object.keys(metrics).length > 0;
      if (!hasAnyData && this.config.accessToken?.includes('test')) {
        console.log(`Using mock data for ${targetDate} (test token detected)`);
        return {
          ...mockOuraData,
          sleep: { ...mockOuraData.sleep!, day: targetDate },
          activity: { ...mockOuraData.activity!, day: targetDate },
          readiness: { ...mockOuraData.readiness!, day: targetDate }
        };
      }

      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }
}

// Mock data for development/demo purposes
export const mockOuraData: DashboardMetrics = {
  sleep: {
    id: 'mock-sleep-1',
    day: '2024-01-15',
    bedtime_start: '2024-01-14T23:30:00+00:00',
    bedtime_end: '2024-01-15T07:15:00+00:00',
    timezone: 32400, // JST (UTC+9) = 9 * 3600 seconds
    duration: 28500,
    total_sleep_duration: 25200,
    awake_time: 3300,
    light_sleep_duration: 14400,
    deep_sleep_duration: 7200,
    rem_sleep_duration: 3600,
    restless: 42,
    efficiency: 88,
    onset_latency: 480,
    midpoint_time: 12600,
    hr_lowest: 48,
    hr_average: 52,
    rmssd: 45,
    breath_average: 14.5,
    temperature_delta: -0.2,
    hypnogram_5min: '443432234443321123443443',
    hr_5min: [52, 51, 50, 49, 48],
    rmssd_5min: [45, 44, 46, 47, 45],
    score: 85,
    score_total: 85,
    score_disturbances: 78,
    score_efficiency: 92,
    score_latency: 88,
    score_rem: 82,
    score_deep: 89,
    score_alignment: 95
  },
  activity: {
    id: 'mock-activity-1',
    day: '2024-01-15',
    timezone: 32400, // JST (UTC+9) = 9 * 3600 seconds
    timestamp: '2024-01-15T00:00:00+00:00',
    score: 82,
    active_calories: 450,
    average_met_minutes: 1.8,
    contributors: {
      meet_daily_targets: 78,
      move_every_hour: 85,
      recovery_time: 90,
      stay_active: 75,
      training_frequency: 80,
      training_volume: 70
    },
    equivalent_walking_distance: 8500,
    high_activity_met_minutes: 45,
    high_activity_time: 1800,
    inactivity_alerts: 3,
    low_activity_met_minutes: 180,
    low_activity_time: 14400,
    medium_activity_met_minutes: 90,
    medium_activity_time: 5400,
    met: {
      interval: 60,
      items: [1.2, 1.8, 2.1, 1.5, 1.3],
      timestamp: '2024-01-15T00:00:00+00:00'
    },
    meters_to_target: 2000,
    non_wear_time: 0,
    resting_time: 28800,
    sedentary_met_minutes: 720,
    sedentary_time: 28800,
    steps: 8547,
    target_calories: 500,
    target_meters: 10000,
    total_calories: 2150
  },
  readiness: {
    id: 'mock-readiness-1',
    day: '2024-01-15',
    timezone: 32400, // JST (UTC+9) = 9 * 3600 seconds
    timestamp: '2024-01-15T00:00:00+00:00',
    score: 78,
    temperature_deviation: -0.2,
    temperature_trend_deviation: 0.1,
    contributors: {
      activity_balance: 82,
      body_temperature: 75,
      hrv_balance: 80,
      previous_day_activity: 78,
      previous_night_sleep: 85,
      recovery_index: 72,
      resting_heart_rate: 88,
      sleep_balance: 90
    }
  }
};