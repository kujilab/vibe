import { component$, useSignal, $ } from '@builder.io/qwik';

import type { QRL } from '@builder.io/qwik';

interface AuthModalProps {
  isOpen: boolean;
  onClose: QRL<() => void>;
  onTokenSubmit: QRL<(token: string) => void>;
}

export const AuthModal = component$<AuthModalProps>(({ isOpen, onClose, onTokenSubmit }) => {
  const tokenInput = useSignal('');
  const isLoading = useSignal(false);

  const handleSubmit = $(async (event: SubmitEvent) => {
    event.preventDefault();
    if (!tokenInput.value.trim()) return;
    
    isLoading.value = true;
    try {
      await onTokenSubmit(tokenInput.value.trim());
      tokenInput.value = '';
      await onClose();
    } catch (error) {
      console.error('Token validation failed:', error);
      alert('Invalid token. Please check your Oura API token and try again.');
    } finally {
      isLoading.value = false;
    }
  });

  if (!isOpen) return null;

  return (
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Connect Your Oura Ring</h2>
          <button class="modal-close" onClick$={onClose}>×</button>
        </div>
        
        <div class="modal-body">
          <p class="modal-description">
            To view your health data, you'll need to provide your Oura API access token.
          </p>
          
          <div class="setup-instructions">
            <h3>How to get your Oura API token:</h3>
            <ol>
              <li>Go to <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer">
                Oura Cloud Personal Access Tokens
              </a></li>
              <li>Sign in with your Oura account</li>
              <li>Click "Create New Personal Access Token"</li>
              <li>Give it a name (e.g., "Vibe Dashboard")</li>
              <li>Copy the generated token and paste it below</li>
            </ol>
            
          </div>

          <form onSubmit$={handleSubmit} class="token-form">
            <div class="form-group">
              <label for="oura-token">Oura API Access Token</label>
              <input
                id="oura-token"
                type="password"
                value={tokenInput.value}
                onInput$={(e) => tokenInput.value = (e.target as HTMLInputElement).value}
                placeholder="Paste your Oura API token here..."
                class="token-input"
                required
              />
            </div>
            
            <div class="form-actions">
              <button type="button" onClick$={onClose} class="btn-secondary">
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn-primary"
                disabled={isLoading.value || !tokenInput.value.trim()}
              >
                {isLoading.value ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </form>

          <div class="security-note">
            <p>
              <strong>Security Note:</strong> Your token is stored locally in your browser 
              and is only used to fetch your data from Oura's API through our secure proxy. 
              Your data is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});