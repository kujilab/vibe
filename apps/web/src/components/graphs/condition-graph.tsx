import { component$, useSignal, useVisibleTask$, noSerialize } from '@builder.io/qwik';
import type { DashboardMetrics } from '../../types/oura';

interface ConditionGraphProps {
  dataCache: Record<string, DashboardMetrics>;
  selectedDate: Date;
}

export const ConditionGraph = component$<ConditionGraphProps>(({ dataCache, selectedDate }) => {
  const canvasRef = useSignal<HTMLCanvasElement>();
  const chartInstanceRef = useSignal<any>();
  const viewMode = useSignal<'30days' | 'monthly'>('30days');

  useVisibleTask$(async ({ track }) => {
    track(() => dataCache);
    track(() => selectedDate);
    track(() => viewMode.value);

    if (!canvasRef.value) return;

    // Chart.jsのロード状態を確認
    const loadChart = async () => {
      let Chart = (globalThis as any).Chart;
      
      if (!Chart) {
        // Chart.jsをロード
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
          script.onload = () => {
            Chart = (globalThis as any).Chart;
            resolve();
          };
          script.onerror = () => reject(new Error('Failed to load Chart.js'));
          document.head.appendChild(script);
        });
      }

      return Chart;
    };

    // データ取得ロジック（表示モードによって切り替え）
    const dataPoints = [];
    const labels = [];

      if (viewMode.value === '30days') {
        // 利用可能なデータから最新30日分を取得
        const availableDates = Object.keys(dataCache)
          .filter(date => date <= selectedDate.toISOString().split('T')[0])
          .sort()
          .slice(-30);
        
        // データがない場合は当月のデータを表示
        if (availableDates.length === 0) {
          const currentDate = new Date(selectedDate);
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            const data = dataCache[dateKey];
            
            if (data) {
              labels.push(date.toLocaleDateString('ja-JP', { 
                month: 'short', 
                day: 'numeric' 
              }));
              
              dataPoints.push({
                readiness: data?.readiness?.score || null,
                sleep: data?.sleep?.score || null,
                activity: data?.activity?.score || null,
              });
            }
          }
        } else {
          availableDates.forEach(dateKey => {
            const data = dataCache[dateKey];
            const date = new Date(dateKey);
            
            labels.push(date.toLocaleDateString('ja-JP', { 
              month: 'short', 
              day: 'numeric' 
            }));
            
            dataPoints.push({
              readiness: data?.readiness?.score || null,
              sleep: data?.sleep?.score || null,
              activity: data?.activity?.score || null,
            });
          });
        }
      } else {
        // 月ごとのデータ（選択した月の全日）
        const currentDate = new Date(selectedDate);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          const dateKey = date.toISOString().split('T')[0];
          const data = dataCache[dateKey];
          
          labels.push(date.toLocaleDateString('ja-JP', { 
            day: 'numeric' 
          }));
          
          dataPoints.push({
            readiness: data?.readiness?.score || null,
            sleep: data?.sleep?.score || null,
            activity: data?.activity?.score || null,
          });
        }
      }

    try {
      const Chart = await loadChart();
      if (!Chart || !canvasRef.value) return;

      // 既存のチャートがある場合は更新、ない場合は新規作成
      if (chartInstanceRef.value) {
        // データとタイトルを更新
        chartInstanceRef.value.data.labels = labels;
        chartInstanceRef.value.data.datasets[0].data = dataPoints.map(d => d.readiness);
        chartInstanceRef.value.data.datasets[1].data = dataPoints.map(d => d.sleep);
        chartInstanceRef.value.data.datasets[2].data = dataPoints.map(d => d.activity);
        chartInstanceRef.value.options.plugins.title.text = viewMode.value === '30days' 
          ? 'コンディション推移 (過去30日)' 
          : `コンディション推移 (${selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })})`;
        chartInstanceRef.value.update();
        return;
      }

      const ctx = canvasRef.value.getContext('2d');
      if (!ctx) return;

      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Readiness',
              data: dataPoints.map(d => d.readiness),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: false,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Sleep',
              data: dataPoints.map(d => d.sleep),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: false,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Activity',
              data: dataPoints.map(d => d.activity),
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              fill: false,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 6,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: viewMode.value === '30days' 
                ? 'コンディション推移 (過去30日)' 
                : `コンディション推移 (${selectedDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })})`,
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              display: true,
              position: 'top' as const,
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                title: (context: any) => {
                  return `${context[0].label}`;
                },
                label: (context: any) => {
                  const value = context.parsed.y;
                  return value !== null ? `${context.dataset.label}: ${value}` : `${context.dataset.label}: データなし`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                stepSize: 20,
                callback: function(value) {
                  return value + '';
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          },
          elements: {
            line: {
              borderWidth: 2
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      });
      
      chartInstanceRef.value = noSerialize(chartInstance);
    } catch (error) {
      console.error('Failed to initialize chart:', error);
    }
  });

  return (
    <div class="condition-graph">
      <div class="graph-header">
        <div class="view-toggle">
          <button 
            class={`toggle-btn ${viewMode.value === '30days' ? 'active' : ''}`}
            onClick$={() => viewMode.value = '30days'}
          >
            過去30日
          </button>
          <button 
            class={`toggle-btn ${viewMode.value === 'monthly' ? 'active' : ''}`}
            onClick$={() => viewMode.value = 'monthly'}
          >
            月ごと表示
          </button>
        </div>
      </div>
      
      <div class="graph-container">
        <canvas ref={canvasRef} />
      </div>
      
      <div class="legend-info">
        <div class="legend-item">
          <div class="legend-color readiness"></div>
          <span>Readiness - 体調・回復度</span>
        </div>
        <div class="legend-item">
          <div class="legend-color sleep"></div>
          <span>Sleep - 睡眠の質</span>
        </div>
        <div class="legend-item">
          <div class="legend-color activity"></div>
          <span>Activity - 活動量</span>
        </div>
      </div>
    </div>
  );
});