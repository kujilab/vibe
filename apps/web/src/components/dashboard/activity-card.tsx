import { component$ } from '@builder.io/qwik';
import type { ActivityData } from '../../types/oura';
import { MetricCard } from './metric-card';
import { formatDateJST } from '../../utils/timezone-utils';

interface ActivityCardProps {
  activityData: ActivityData;
}

export const ActivityCard = component$<ActivityCardProps>(({ activityData }) => {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km >= 1 ? `${km.toFixed(1)}km` : `${meters}m`;
  };

  const activityBreakdown = [
    {
      name: 'High Activity',
      duration: activityData.high_activity_time,
      color: '#dc2626',
      met: activityData.high_activity_met_minutes
    },
    {
      name: 'Medium Activity',
      duration: activityData.medium_activity_time,
      color: '#ea580c',
      met: activityData.medium_activity_met_minutes
    },
    {
      name: 'Low Activity',
      duration: activityData.low_activity_time,
      color: '#65a30d',
      met: activityData.low_activity_met_minutes
    },
    {
      name: 'Sedentary',
      duration: activityData.sedentary_time,
      color: '#6b7280',
      met: activityData.sedentary_met_minutes
    }
  ];

  const contributors = [
    { name: 'Daily Targets', score: activityData.contributors.meet_daily_targets, icon: '🎯' },
    { name: 'Move Every Hour', score: activityData.contributors.move_every_hour, icon: '⏰' },
    { name: 'Recovery Time', score: activityData.contributors.recovery_time, icon: '💤' },
    { name: 'Stay Active', score: activityData.contributors.stay_active, icon: '🏃' },
    { name: 'Training Frequency', score: activityData.contributors.training_frequency, icon: '📅' },
    { name: 'Training Volume', score: activityData.contributors.training_volume, icon: '💪' },
  ];

  return (
    <div class="activity-card">
      <div class="card-header">
        <h2>🏃‍♂️ Activity Summary</h2>
        <div class="activity-date">
          <div>{formatDateJST(activityData.day)}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
            JST
          </div>
        </div>
      </div>

      <div class="metrics-grid">
        <MetricCard
          title="Activity Score"
          value={activityData.score}
          unit="/100"
          score={activityData.score}
        />
        
        <MetricCard
          title="Steps"
          value={activityData.steps.toLocaleString()}
          icon="👟"
          trend={activityData.steps >= activityData.target_meters ? 'up' : 'down'}
          subtitle={`Goal: ${(activityData.target_meters / 1000).toFixed(0)}k steps`}
        />
        
        <MetricCard
          title="Active Calories"
          value={activityData.active_calories}
          unit="cal"
          icon="🔥"
          trend={activityData.active_calories >= activityData.target_calories ? 'up' : 'down'}
          subtitle={`Goal: ${activityData.target_calories} cal`}
        />
        
        <MetricCard
          title="Walking Distance"
          value={formatDistance(activityData.equivalent_walking_distance)}
          icon="🚶"
        />
      </div>

      <div class="activity-breakdown">
        <h3>Activity Breakdown</h3>
        <div class="breakdown-chart">
          {activityBreakdown.map((activity) => (
            <div key={activity.name} class="breakdown-item">
              <div class="breakdown-info">
                <div 
                  class="breakdown-color" 
                  style={{ backgroundColor: activity.color }}
                />
                <span class="breakdown-name">{activity.name}</span>
              </div>
              <div class="breakdown-stats">
                <span class="breakdown-duration">{formatTime(activity.duration)}</span>
                <span class="breakdown-met">{activity.met} MET-min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="activity-contributors">
        <h3>Score Contributors</h3>
        <div class="contributors-grid">
          {contributors.map((contributor) => (
            <div key={contributor.name} class="contributor-item">
              <div class="contributor-header">
                <span class="contributor-icon">{contributor.icon}</span>
                <span class="contributor-name">{contributor.name}</span>
              </div>
              <div class="contributor-score">
                <div class="score-bar-small">
                  <div 
                    class="score-fill-small"
                    style={{
                      width: `${contributor.score}%`,
                      backgroundColor: contributor.score >= 80 ? '#10b981' : 
                                     contributor.score >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <span class="score-value">{contributor.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div class="activity-stats">
        <h3>Additional Stats</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">Total Calories</span>
            <span class="stat-value">{activityData.total_calories}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Resting Time</span>
            <span class="stat-value">{formatTime(activityData.resting_time)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Inactivity Alerts</span>
            <span class="stat-value">{activityData.inactivity_alerts}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average MET</span>
            <span class="stat-value">{activityData.average_met_minutes.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});