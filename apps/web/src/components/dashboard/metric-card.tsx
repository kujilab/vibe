import { component$ } from '@builder.io/qwik';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  score?: number;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
}

export const MetricCard = component$<MetricCardProps>(({
  title,
  value,
  unit = '',
  score,
  icon,
  trend,
  subtitle
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981'; // green
    if (score >= 70) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      default: return '→';
    }
  };

  return (
    <div class="metric-card">
      <div class="metric-header">
        <h3 class="metric-title">
          {icon && <span class="metric-icon">{icon}</span>}
          {title}
        </h3>
        {trend && (
          <span class={`trend trend-${trend}`}>
            {getTrendIcon(trend)}
          </span>
        )}
      </div>
      
      <div class="metric-content">
        <div class="metric-value">
          <span class="value">{value}</span>
          {unit && <span class="unit">{unit}</span>}
        </div>
        
        {score !== undefined && (
          <div class="score-container">
            <div 
              class="score-bar"
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                class="score-fill"
                style={{
                  width: `${score}%`,
                  height: '100%',
                  backgroundColor: getScoreColor(score),
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
            <span class="score-text" style={{ color: getScoreColor(score) }}>
              {score}/100
            </span>
          </div>
        )}
        
        {subtitle && (
          <p class="metric-subtitle">{subtitle}</p>
        )}
      </div>
    </div>
  );
});