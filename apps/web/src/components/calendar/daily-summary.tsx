import { component$ } from '@builder.io/qwik';
import type { DashboardMetrics } from '../../types/oura';
import { formatTimeJST, formatDateJST } from '../../utils/timezone-utils';

interface DailySummaryProps {
  date: Date;
  data: DashboardMetrics | null;
  isLoading: boolean;
}

export const DailySummary = component$<DailySummaryProps>(({ 
  date, 
  data, 
  isLoading 
}) => {
  if (isLoading) {
    return (
      <div class="daily-summary loading">
        <div class="loading-spinner">🔄</div>
        <p>データを読み込み中...</p>
      </div>
    );
  }

  if (!data || (!data.sleep && !data.activity && !data.readiness)) {
    return (
      <div class="daily-summary no-data">
        <div class="no-data-icon">📊</div>
        <h3>{formatDateJST(date.toISOString().split('T')[0])}</h3>
        <p>この日のデータはありません</p>
      </div>
    );
  }

  return (
    <div class="daily-summary">
      <div class="summary-header">
        <h3>{formatDateJST(date.toISOString().split('T')[0])}</h3>
      </div>

      <div class="summary-cards">
        {data.readiness && (
          <div class="summary-card readiness">
            <div class="card-icon">⚡</div>
            <div class="card-content">
              <h4>Readiness</h4>
              <div class="score">{data.readiness.score}</div>
              <div class="status">
                {data.readiness.score >= 85 ? '最高' : 
                 data.readiness.score >= 70 ? '良好' : 
                 data.readiness.score >= 55 ? '注意' : '要休息'}
              </div>
            </div>
          </div>
        )}

        {data.sleep && (
          <div class="summary-card sleep">
            <div class="card-icon">😴</div>
            <div class="card-content">
              <h4>Sleep</h4>
              <div class="score">{data.sleep.score}</div>
              <div class="details">
                <div class="detail-item">
                  <span class="label">睡眠時間:</span>
                  <span class="value">
                    {Math.floor(data.sleep.total_sleep_duration / 3600)}h {Math.floor((data.sleep.total_sleep_duration % 3600) / 60)}m
                  </span>
                </div>
                <div class="detail-item">
                  <span class="label">効率:</span>
                  <span class="value">{data.sleep.efficiency}%</span>
                </div>
                <div class="detail-item">
                  <span class="label">就寝:</span>
                  <span class="value">{formatTimeJST(data.sleep.bedtime_start)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {data.activity && (
          <div class="summary-card activity">
            <div class="card-icon">🏃</div>
            <div class="card-content">
              <h4>Activity</h4>
              <div class="score">{data.activity.score}</div>
              <div class="details">
                <div class="detail-item">
                  <span class="label">歩数:</span>
                  <span class="value">{data.activity.steps.toLocaleString()}</span>
                </div>
                <div class="detail-item">
                  <span class="label">消費カロリー:</span>
                  <span class="value">{data.activity.active_calories} cal</span>
                </div>
                <div class="detail-item">
                  <span class="label">総カロリー:</span>
                  <span class="value">{data.activity.total_calories} cal</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 詳細セクション */}
      {data.sleep && (
        <div class="detail-section">
          <h4>睡眠詳細</h4>
          <div class="sleep-phases">
            <div class="phase-bar">
              <div 
                class="phase deep" 
                style={{ 
                  width: `${(data.sleep.deep_sleep_duration / data.sleep.total_sleep_duration) * 100}%` 
                }}
                title={`深い睡眠: ${Math.floor(data.sleep.deep_sleep_duration / 3600)}h ${Math.floor((data.sleep.deep_sleep_duration % 3600) / 60)}m`}
              />
              <div 
                class="phase rem" 
                style={{ 
                  width: `${(data.sleep.rem_sleep_duration / data.sleep.total_sleep_duration) * 100}%` 
                }}
                title={`REM睡眠: ${Math.floor(data.sleep.rem_sleep_duration / 3600)}h ${Math.floor((data.sleep.rem_sleep_duration % 3600) / 60)}m`}
              />
              <div 
                class="phase light" 
                style={{ 
                  width: `${(data.sleep.light_sleep_duration / data.sleep.total_sleep_duration) * 100}%` 
                }}
                title={`浅い睡眠: ${Math.floor(data.sleep.light_sleep_duration / 3600)}h ${Math.floor((data.sleep.light_sleep_duration % 3600) / 60)}m`}
              />
            </div>
            <div class="phase-legend">
              <div class="legend-item">
                <div class="legend-color deep"></div>
                <span>深い睡眠</span>
              </div>
              <div class="legend-item">
                <div class="legend-color rem"></div>
                <span>REM睡眠</span>
              </div>
              <div class="legend-item">
                <div class="legend-color light"></div>
                <span>浅い睡眠</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.readiness && (
        <div class="detail-section">
          <h4>コンディション要因</h4>
          <div class="contributors">
            {Object.entries({
              '前夜の睡眠': data.readiness.contributors.previous_night_sleep,
              '睡眠バランス': data.readiness.contributors.sleep_balance,
              '前日の活動': data.readiness.contributors.previous_day_activity,
              '活動バランス': data.readiness.contributors.activity_balance,
              '体温': data.readiness.contributors.body_temperature,
              '安静時心拍数': data.readiness.contributors.resting_heart_rate,
            }).map(([name, score]) => (
              <div key={name} class="contributor-item">
                <span class="contributor-name">{name}</span>
                <div class="contributor-bar">
                  <div 
                    class="contributor-fill"
                    style={{ 
                      width: `${score}%`,
                      backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <span class="contributor-score">{score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});