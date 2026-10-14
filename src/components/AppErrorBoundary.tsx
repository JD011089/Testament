import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Testament failed to render', error, info);
  }

  resetAppData = () => {
    try {
      const keys = Object.keys(localStorage).filter((key) => key.startsWith('testament_'));
      keys.forEach((key) => localStorage.removeItem(key));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#fcfbfa] text-stone-900 flex items-center justify-center p-6">
        <div className="max-w-md text-left space-y-4">
          <h1 className="text-2xl font-serif font-black">Testament hit a saved-data problem</h1>
          <p className="text-sm text-stone-600 leading-relaxed">
            Progress on this device could not be read. Resetting clears Testament data in this browser and reloads a fresh start.
          </p>
          <button
            type="button"
            onClick={this.resetAppData}
            className="btn-primary text-sm"
          >
            Reset app data
          </button>
        </div>
      </div>
    );
  }
}
