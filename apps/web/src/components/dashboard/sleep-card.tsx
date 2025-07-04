import { component$ } from '@builder.io/qwik';
import type { SleepData } from '../../types/oura';
import { MetricCard } from './metric-card';
import { formatTimeJST, formatDateJST } from '../../utils/timezone-utils';

interface SleepCardProps {
  sleepData: SleepData;
}

export const SleepCard = component$<SleepCardProps>(({ sleepData }) => {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timeString: string): string => {
    return formatTimeJST(timeString);
  };

  const sleepPhases = [
    {
      name: 'Deep Sleep',
      duration: sleepData.deep_sleep_duration,
      color: '#1e3a8a',
      percentage: Math.round((sleepData.deep_sleep_duration / sleepData.total_sleep_duration) * 100)
    },
    {
      name: 'REM Sleep',
      duration: sleepData.rem_sleep_duration,
      color: '#7c3aed',
      percentage: Math.round((sleepData.rem_sleep_duration / sleepData.total_sleep_duration) * 100)
    },
    {
      name: 'Light Sleep',
      duration: sleepData.light_sleep_duration,
      color: '#06b6d4',
      percentage: Math.round((sleepData.light_sleep_duration / sleepData.total_sleep_duration) * 100)
    },
    {
      name: 'Awake',
      duration: sleepData.awake_time,
      color: '#ef4444',
      percentage: Math.round((sleepData.awake_time / sleepData.duration) * 100)
    }
  ];

  return (
    <div class="sleep-card">
      <div class="card-header">
        <h2>🛌 Sleep Summary</h2>
        <div class="sleep-times">
          <div>{formatTime(sleepData.bedtime_start)} - {formatTime(sleepData.bedtime_end)}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
            {formatDateJST(sleepData.day)} (JST)
          </div>
        </div>
      </div>

      <div class="metrics-grid">
        <MetricCard
          title="Total Sleep"
          value={formatDuration(sleepData.total_sleep_duration)}
          score={sleepData.score}
          trend="neutral"
        />
        
        <MetricCard
          title="Sleep Efficiency"
          value={sleepData.efficiency}
          unit="%"
          trend={sleepData.efficiency >= 85 ? 'up' : sleepData.efficiency >= 75 ? 'neutral' : 'down'}
        />
        
        <MetricCard
          title="Sleep Onset"
          value={Math.round(sleepData.onset_latency / 60)}
          unit="min"
          subtitle="Time to fall asleep"
        />
        
        <MetricCard
          title="Restless Periods"
          value={sleepData.restless}
          trend={sleepData.restless <= 20 ? 'up' : sleepData.restless <= 40 ? 'neutral' : 'down'}
        />
      </div>

      <div class="sleep-phases">
        <h3>Sleep Phases</h3>
        <div class="phases-chart">
          {sleepPhases.map((phase) => (
            <div key={phase.name} class="phase-item">
              <div class="phase-info">
                <div 
                  class="phase-color" 
                  style={{ backgroundColor: phase.color }}
                />
                <span class="phase-name">{phase.name}</span>
              </div>
              <div class="phase-stats">
                <span class="phase-duration">{formatDuration(phase.duration)}</span>
                <span class="phase-percentage">({phase.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="sleep-vitals">
        <h3>Sleep Vitals</h3>
        <div class="vitals-grid">
          <div class="vital-item">
            <span class="vital-label">Heart Rate</span>
            <span class="vital-value">{sleepData.hr_average} bpm avg</span>
            <span class="vital-detail">Lowest: {sleepData.hr_lowest} bpm</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">HRV</span>
            <span class="vital-value">{sleepData.rmssd} ms</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">Breathing Rate</span>
            <span class="vital-value">{sleepData.breath_average.toFixed(1)} /min</span>
          </div>
          <div class="vital-item">
            <span class="vital-label">Temperature</span>
            <span class="vital-value">{sleepData.temperature_delta > 0 ? '+' : ''}{sleepData.temperature_delta.toFixed(1)}°C</span>
          </div>
        </div>
      </div>
    </div>
  );
});