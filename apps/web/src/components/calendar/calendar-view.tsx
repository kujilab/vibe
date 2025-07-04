import { component$, useSignal, useStore, useVisibleTask$, $ } from '@builder.io/qwik';
import type { DashboardMetrics } from '../../types/oura';
import { OuraApiClient } from '../../utils/oura-api';
import { Calendar } from './calendar';
import { DailySummary } from './daily-summary';
import { ConditionGraph } from '../graphs/condition-graph';

export const CalendarView = component$(() => {
  const selectedDate = useSignal(new Date());
  const isLoading = useSignal(false);
  
  const dataStore = useStore<{
    dailyData: DashboardMetrics | null;
    dataCache: Record<string, DashboardMetrics>;
    isAuthenticated: boolean;
  }>({
    dailyData: null,
    dataCache: {},
    isAuthenticated: false,
  });


  const loadDataForDate = $(async (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    
    // キャッシュから確認
    if (dataStore.dataCache[dateKey]) {
      dataStore.dailyData = dataStore.dataCache[dateKey];
      return;
    }

    if (!dataStore.isAuthenticated) {
      dataStore.dailyData = null;
      return;
    }

    isLoading.value = true;
    
    try {
      const token = localStorage.getItem('oura_access_token');
      if (!token) {
        dataStore.dailyData = null;
        return;
      }

      const apiClient = new OuraApiClient({ 
        accessToken: token,
        apiUrl: 'https://api.ouraring.com/v2/usercollection'
      });
      const metrics = await apiClient.getDashboardMetrics(dateKey);
      
      // データをキャッシュに保存
      dataStore.dataCache[dateKey] = metrics;
      dataStore.dailyData = metrics;
      
      // LocalStorageにも保存
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('oura_calendar_cache', JSON.stringify(dataStore.dataCache));
        } catch (error) {
          console.error('Failed to save cache to localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load data for date:', error);
      dataStore.dailyData = null;
    } finally {
      isLoading.value = false;
    }
  });

  // 月全体のデータを一括取得する関数
  const loadMonthData = $(async (year: number, month: number) => {
    if (!dataStore.isAuthenticated) {
      return;
    }

    const token = localStorage.getItem('oura_access_token');
    if (!token) {
      return;
    }

    try {
      const apiClient = new OuraApiClient({ 
        accessToken: token,
        apiUrl: 'https://api.ouraring.com/v2/usercollection'
      });

      // その月の日数を取得
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      
      console.log(`Loading month data for ${monthKey} (${daysInMonth} days)...`);

      // 各日のデータを個別に取得して、取得できた順にUIに反映
      const missingDates = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        // キャッシュにない場合のみ取得対象に追加
        if (!dataStore.dataCache[dateKey]) {
          missingDates.push(dateKey);
        }
      }

      if (missingDates.length > 0) {
        console.log(`Fetching ${missingDates.length} missing days for ${monthKey}...`);
        
        let successCount = 0;
        
        // 各日のデータを個別に非同期取得し、取得完了次第UIに反映
        missingDates.forEach(async (dateKey) => {
          try {
            const metrics = await apiClient.getDashboardMetrics(dateKey);
            
            // 取得完了次第、即座にキャッシュに追加（UIが自動更新される）
            dataStore.dataCache[dateKey] = metrics;
            successCount++;
            
            console.log(`✅ Loaded data for ${dateKey} (${successCount}/${missingDates.length})`);
            
            // LocalStorageも個別に更新
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('oura_calendar_cache', JSON.stringify(dataStore.dataCache));
              } catch (error) {
                console.error('Failed to save cache to localStorage:', error);
              }
            }
            
          } catch (error) {
            console.warn(`❌ Failed to load data for ${dateKey}:`, error instanceof Error ? error.message : String(error));
          }
        });
        
        console.log(`🚀 Started fetching ${missingDates.length} days for ${monthKey} in parallel`);
      } else {
        console.log(`All data for ${monthKey} already cached`);
      }
    } catch (error) {
      console.error(`Failed to load month data for ${year}-${month}:`, error);
    }
  });

  // クライアントサイドでコンポーネントが表示された時にLocalStorageから初期化
  useVisibleTask$(async () => {
    try {
      // キャッシュデータの読み込み
      const cachedData = localStorage.getItem('oura_calendar_cache');
      console.log('useVisibleTask$ - Loading from localStorage - cachedData:', cachedData);
      if (cachedData) {
        dataStore.dataCache = JSON.parse(cachedData);
        console.log('useVisibleTask$ - Loaded cache keys:', Object.keys(dataStore.dataCache));
      }
      
      // トークンの確認
      const token = localStorage.getItem('oura_access_token');
      console.log('useVisibleTask$ - Loading from localStorage - token:', !!token);
      dataStore.isAuthenticated = !!token;
      
      // キャッシュがある場合は認証済みとみなす
      if (!dataStore.isAuthenticated && Object.keys(dataStore.dataCache).length > 0) {
        dataStore.isAuthenticated = true;
        console.log('useVisibleTask$ - Authenticated via cache');
      }
      
      console.log('useVisibleTask$ - Final auth state:', dataStore.isAuthenticated);
      
      // 認証済みの場合は初期データ読み込み
      if (dataStore.isAuthenticated && selectedDate.value) {
        await loadDataForDate(selectedDate.value);
        
        // 現在の月のデータも非同期で一括取得
        const currentDate = selectedDate.value;
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        loadMonthData(year, month); // 非同期実行（awaitしない）
      }
    } catch (error) {
      console.error('useVisibleTask$ - Failed to load initial data from localStorage:', error);
    }
  });

  const handleDateSelect = $(async (date: Date) => {
    selectedDate.value = date;
    await loadDataForDate(date);
  });

  const handleMonthChange = $(async (year: number, month: number) => {
    // 月が変わった時にselectedDateも更新（グラフの月ごと表示に反映）
    const newDate = new Date(year, month - 1, 1); // month は 1-based なので -1
    selectedDate.value = newDate;
    
    // 月のデータを一括取得
    await loadMonthData(year, month);
  });

  const connectOura = $(() => {
    if (typeof window !== 'undefined') {
      window.location.href = '/dashboard';
    }
  });

  if (!dataStore.isAuthenticated) {
    return (
      <div class="calendar-view unauthenticated">
        <div class="auth-prompt">
          <div class="auth-icon">🔮</div>
          <h2>Oura Ring データを表示するには</h2>
          <p>
            カレンダー機能を使用するには、まずOura Ring APIトークンを設定してください。
          </p>
          <button onClick$={connectOura} class="btn-primary">
            Oura Ring に接続
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="calendar-view">
      <div class="calendar-header">
        <h1>📅 日毎データ確認</h1>
        <p>カレンダーから日付を選択して、その日のデータを確認できます</p>
      </div>
      
      <div class="calendar-content">
        <div class="calendar-section">
          <Calendar 
            selectedDate={selectedDate.value}
            onDateSelect={handleDateSelect}
            dataCache={dataStore.dataCache}
            onMonthChange={handleMonthChange}
          />
        </div>
        
        <div class="summary-section">
          <DailySummary 
            date={selectedDate.value}
            data={dataStore.dailyData}
            isLoading={isLoading.value}
          />
        </div>
      </div>
      
      <div class="graph-section">
        <ConditionGraph 
          dataCache={dataStore.dataCache}
          selectedDate={selectedDate.value}
        />
      </div>
    </div>
  );
});