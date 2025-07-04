import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Link } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      <div style={{ textAlign: 'center', padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', color: '#1f2937' }}>
          🔮 Vibe
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '40px' }}>
          Your personal health and wellness dashboard
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1f2937' }}>
              🔮 Oura Ring Dashboard
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Track your sleep, activity, and readiness metrics with beautiful visualizations
            </p>
            <Link href="/dashboard" style={{
              display: 'inline-block',
              background: '#3b82f6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}>
              View Dashboard
            </Link>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1f2937' }}>
              📅 日毎データ確認
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              カレンダーから日付を選択して、その日のOura Ringデータを詳しく確認
            </p>
            <Link href="/calendar" style={{
              display: 'inline-block',
              background: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}>
              Calendar View
            </Link>
          </div>
          
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#1f2937' }}>
              ♟️ Chess Game
            </h2>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Play chess with a friend or practice your moves on an interactive board
            </p>
            <Link href="/chess" style={{
              display: 'inline-block',
              background: '#10b981',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'background 0.2s'
            }}>
              Play Chess
            </Link>
          </div>
        </div>
        
        <div style={{
          background: '#f8fafc',
          padding: '30px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '15px', color: '#1f2937' }}>
            Features
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            textAlign: 'left'
          }}>
            <div>
              <strong style={{ color: '#1f2937' }}>📊 Health Analytics</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Comprehensive Oura Ring data visualization
              </p>
            </div>
            <div>
              <strong style={{ color: '#1f2937' }}>🎮 Interactive Games</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Chess and other engaging activities
              </p>
            </div>
            <div>
              <strong style={{ color: '#1f2937' }}>📱 Responsive Design</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Works beautifully on all devices
              </p>
            </div>
            <div>
              <strong style={{ color: '#1f2937' }}>🔒 Privacy First</strong>
              <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                Your data stays in your browser
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "Vibe - Personal Health & Wellness Dashboard",
  meta: [
    {
      name: "description",
      content: "Track your health metrics with Oura Ring integration and enjoy interactive features",
    },
  ],
};
