import { component$, useStore, useTask$, useSignal, $ } from '@builder.io/qwik';
import type { DashboardMetrics } from '../../types/oura';
import { OuraApiClient, mockOuraData } from '../../utils/oura-api';
import { SleepCard } from './sleep-card';
import { ActivityCard } from './activity-card';
import { ReadinessCard } from './readiness-card';
import { AuthModal } from './auth-modal';

export const OuraDashboard = component$(() => {
  const dashboardState = useStore<{
    metrics: DashboardMetrics | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    lastUpdated: Date | null;
  }>({
    metrics: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    lastUpdated: null,
  });

  const showAuthModal = useSignal(false);
  const useMockData = useSignal(true); // Toggle for demo mode

  // Check for stored token on component mount
  useTask$(async () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('oura_access_token');
      if (storedToken) {
        dashboardState.isAuthenticated = true;
        await loadDashboardData(storedToken);
      } else {
        // Use mock data for demo
        dashboardState.metrics = mockOuraData;
        dashboardState.lastUpdated = new Date();
      }
    }
  });

  const loadDashboardData = $(async (accessToken: string) => {
    dashboardState.isLoading = true;
    dashboardState.error = null;

    try {
      const apiClient = new OuraApiClient({ accessToken });
      
      // First test the connection by getting personal info
      await apiClient.getPersonalInfo();
      
      // Then get dashboard metrics
      const metrics = await apiClient.getDashboardMetrics();
      console.log('Dashboard metrics received:', metrics);
      
      // Only set metrics if we actually got data
      if (metrics && (metrics.sleep || metrics.activity || metrics.readiness)) {
        dashboardState.metrics = metrics;
        dashboardState.lastUpdated = new Date();
        useMockData.value = false;
      } else {
        // No data available for the current date, try yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const yesterdayMetrics = await apiClient.getDashboardMetrics(yesterdayStr);
        if (yesterdayMetrics && (yesterdayMetrics.sleep || yesterdayMetrics.activity || yesterdayMetrics.readiness)) {
          dashboardState.metrics = yesterdayMetrics;
          dashboardState.lastUpdated = new Date();
          useMockData.value = false;
        } else {
          dashboardState.error = 'No data available for today or yesterday. Make sure your Oura Ring is synced.';
          dashboardState.metrics = mockOuraData;
          useMockData.value = true;
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      
      let errorMessage = 'Failed to load data';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more helpful error messages
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to Oura API. Please check your internet connection and try again.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'CORS error detected. The app needs to be served from a proper web server.';
        }
      }
      
      dashboardState.error = errorMessage;
      
      // Fall back to mock data on error
      dashboardState.metrics = mockOuraData;
      dashboardState.lastUpdated = new Date();
      useMockData.value = true;
    } finally {
      dashboardState.isLoading = false;
    }
  });

  const handleTokenSubmit = $(async (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oura_access_token', token);
    }
    
    dashboardState.isAuthenticated = true;
    useMockData.value = false;
    await loadDashboardData(token);
  });

  const handleDisconnect = $(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('oura_access_token');
    }
    
    dashboardState.isAuthenticated = false;
    dashboardState.metrics = mockOuraData; // Switch back to mock data
    dashboardState.lastUpdated = new Date();
    useMockData.value = true;
  });

  const handleRefresh = $(async () => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('oura_access_token');
      if (storedToken) {
        await loadDashboardData(storedToken);
      }
    }
  });

  return (
    <div class="oura-dashboard">
      <div class="dashboard-header">
        <div class="header-content">
          <h1>🔮 Oura Ring Dashboard</h1>
          <div class="header-actions">
            {useMockData.value && (
              <span class="demo-badge">Demo Mode</span>
            )}
            
            {dashboardState.lastUpdated && (
              <span class="last-updated">
                Updated: {dashboardState.lastUpdated.toLocaleTimeString()}
              </span>
            )}
            
            <button
              onClick$={handleRefresh}
              class="btn-refresh"
              disabled={dashboardState.isLoading}
            >
              {dashboardState.isLoading ? '🔄' : '↻'} Refresh
            </button>
            
            {dashboardState.isAuthenticated ? (
              <button onClick$={handleDisconnect} class="btn-secondary">
                Disconnect
              </button>
            ) : (
              <button onClick$={() => showAuthModal.value = true} class="btn-primary">
                Connect Oura Ring
              </button>
            )}
          </div>
        </div>
        
        {dashboardState.error && (
          <div class="error-banner">
            <p>⚠️ {dashboardState.error}</p>
            {useMockData.value && <p>Showing demo data instead.</p>}
          </div>
        )}
      </div>

      {dashboardState.isLoading ? (
        <div class="loading-state">
          <div class="loading-spinner">🔄</div>
          <p>Loading your health data...</p>
        </div>
      ) : dashboardState.metrics ? (
        <div class="dashboard-content">
          <div class="metrics-overview">
            <div class="overview-cards">
              {dashboardState.metrics.readiness && (
                <div class="overview-card readiness">
                  <h3>⚡ Readiness</h3>
                  <div class="score">{dashboardState.metrics.readiness.score}</div>
                </div>
              )}
              
              {dashboardState.metrics.sleep && (
                <div class="overview-card sleep">
                  <h3>😴 Sleep</h3>
                  <div class="score">{dashboardState.metrics.sleep.score}</div>
                </div>
              )}
              
              {dashboardState.metrics.activity && (
                <div class="overview-card activity">
                  <h3>🏃 Activity</h3>
                  <div class="score">{dashboardState.metrics.activity.score}</div>
                </div>
              )}
            </div>
          </div>

          <div class="dashboard-cards">
            {dashboardState.metrics.readiness && (
              <ReadinessCard readinessData={dashboardState.metrics.readiness} />
            )}
            
            {dashboardState.metrics.sleep && (
              <SleepCard sleepData={dashboardState.metrics.sleep} />
            )}
            
            {dashboardState.metrics.activity && (
              <ActivityCard activityData={dashboardState.metrics.activity} />
            )}
          </div>
        </div>
      ) : (
        <div class="empty-state">
          <div class="empty-icon">📊</div>
          <h2>No Data Available</h2>
          <p>Connect your Oura Ring to view your health metrics</p>
          <button onClick$={() => showAuthModal.value = true} class="btn-primary">
            Connect Oura Ring
          </button>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal.value}
        onClose={$(() => showAuthModal.value = false)}
        onTokenSubmit={handleTokenSubmit}
      />
    </div>
  );
});