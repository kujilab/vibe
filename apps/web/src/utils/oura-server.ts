import { server$ } from '@builder.io/qwik-city';
import type { OuraPersonalInfo, SleepData, ActivityData, ReadinessData, OuraApiResponse } from '../types/oura';

export const fetchOuraPersonalInfo = server$(async function(accessToken: string): Promise<OuraPersonalInfo> {
  const response = await fetch('https://api.ouraring.com/v2/usercollection/personal_info', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Oura API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  return response.json();
});

export const fetchOuraSleepData = server$(async function(accessToken: string, startDate?: string, endDate?: string): Promise<SleepData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `https://api.ouraring.com/v2/usercollection/sleep${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Oura API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data: OuraApiResponse<SleepData> = await response.json();
  return data.data || [];
});

export const fetchOuraActivityData = server$(async function(accessToken: string, startDate?: string, endDate?: string): Promise<ActivityData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `https://api.ouraring.com/v2/usercollection/daily_activity${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Oura API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data: OuraApiResponse<ActivityData> = await response.json();
  return data.data || [];
});

export const fetchOuraReadinessData = server$(async function(accessToken: string, startDate?: string, endDate?: string): Promise<ReadinessData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const url = `https://api.ouraring.com/v2/usercollection/daily_readiness${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Oura API error: ${response.status} ${response.statusText}. ${errorText}`);
  }

  const data: OuraApiResponse<ReadinessData> = await response.json();
  return data.data || [];
});