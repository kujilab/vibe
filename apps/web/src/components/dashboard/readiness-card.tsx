import { component$ } from '@builder.io/qwik';
import type { ReadinessData } from '../../types/oura';
import { MetricCard } from './metric-card';
import { formatDateJST } from '../../utils/timezone-utils';

interface ReadinessCardProps {
  readinessData: ReadinessData;
}

export const ReadinessCard = component$<ReadinessCardProps>(({ readinessData }) => {
  const contributors = [
    { 
      name: 'Previous Night Sleep', 
      score: readinessData.contributors.previous_night_sleep, 
      icon: '🛌',
      description: 'How well you slept last night'
    },
    { 
      name: 'Sleep Balance', 
      score: readinessData.contributors.sleep_balance, 
      icon: '⚖️',
      description: 'Your recent sleep pattern'
    },
    { 
      name: 'Previous Day Activity', 
      score: readinessData.contributors.previous_day_activity, 
      icon: '🏃',
      description: 'Yesterday\'s activity level'
    },
    { 
      name: 'Activity Balance', 
      score: readinessData.contributors.activity_balance, 
      icon: '📊',
      description: 'Recent activity consistency'
    },
    { 
      name: 'Body Temperature', 
      score: readinessData.contributors.body_temperature, 
      icon: '🌡️',
      description: 'Temperature variation'
    },
    { 
      name: 'Resting Heart Rate', 
      score: readinessData.contributors.resting_heart_rate, 
      icon: '❤️',
      description: 'Heart rate recovery'
    },
    { 
      name: 'HRV Balance', 
      score: readinessData.contributors.hrv_balance, 
      icon: '📈',
      description: 'Heart rate variability'
    },
    { 
      name: 'Recovery Index', 
      score: readinessData.contributors.recovery_index, 
      icon: '🔄',
      description: 'Overall recovery status'
    },
  ];

  const getReadinessMessage = (score: number): string => {
    if (score >= 85) return "You're ready to take on challenges!";
    if (score >= 70) return "Good to go, but listen to your body.";
    if (score >= 55) return "Consider taking it easier today.";
    return "Your body needs rest and recovery.";
  };

  const getReadinessColor = (score: number): string => {
    if (score >= 85) return '#10b981';
    if (score >= 70) return '#f59e0b';
    if (score >= 55) return '#f97316';
    return '#ef4444';
  };

  return (
    <div class="readiness-card">
      <div class="card-header">
        <h2>⚡ Readiness Score</h2>
        <div class="readiness-date">
          <div>{formatDateJST(readinessData.day)}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>
            JST
          </div>
        </div>
      </div>

      <div class="readiness-overview">
        <div class="readiness-score-display">
          <div 
            class="readiness-circle"
            style={{
              background: `conic-gradient(${getReadinessColor(readinessData.score)} ${readinessData.score * 3.6}deg, #e5e7eb 0deg)`
            }}
          >
            <div class="readiness-inner">
              <span class="readiness-number">{readinessData.score}</span>
              <span class="readiness-label">Readiness</span>
            </div>
          </div>
          <div class="readiness-message">
            <p style={{ color: getReadinessColor(readinessData.score) }}>
              {getReadinessMessage(readinessData.score)}
            </p>
          </div>
        </div>
      </div>

      <div class="temperature-info">
        <h3>🌡️ Body Temperature</h3>
        <div class="temperature-stats">
          <MetricCard
            title="Temperature Deviation"
            value={readinessData.temperature_deviation > 0 ? '+' : ''}
            unit={`${readinessData.temperature_deviation.toFixed(2)}°C`}
            trend={Math.abs(readinessData.temperature_deviation) <= 0.3 ? 'neutral' : 'down'}
            subtitle="From your baseline"
          />
          <MetricCard
            title="Temperature Trend"
            value={readinessData.temperature_trend_deviation > 0 ? '+' : ''}
            unit={`${readinessData.temperature_trend_deviation.toFixed(2)}°C`}
            subtitle="Recent trend deviation"
          />
        </div>
      </div>

      <div class="readiness-contributors">
        <h3>What's Affecting Your Readiness</h3>
        <div class="contributors-detailed">
          {contributors
            .sort((a, b) => b.score - a.score)
            .map((contributor) => (
            <div key={contributor.name} class="contributor-detailed">
              <div class="contributor-main">
                <div class="contributor-info">
                  <span class="contributor-icon-large">{contributor.icon}</span>
                  <div class="contributor-text">
                    <h4 class="contributor-title">{contributor.name}</h4>
                    <p class="contributor-description">{contributor.description}</p>
                  </div>
                </div>
                <div class="contributor-score-large">
                  <span 
                    class="score-number"
                    style={{ 
                      color: contributor.score >= 80 ? '#10b981' : 
                             contributor.score >= 60 ? '#f59e0b' : '#ef4444' 
                    }}
                  >
                    {contributor.score}
                  </span>
                </div>
              </div>
              <div class="contributor-bar">
                <div 
                  class="contributor-progress"
                  style={{
                    width: `${contributor.score}%`,
                    backgroundColor: contributor.score >= 80 ? '#10b981' : 
                                   contributor.score >= 60 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});