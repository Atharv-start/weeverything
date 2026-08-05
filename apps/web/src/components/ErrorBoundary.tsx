'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Client Error Boundary Caught Exception]:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-[var(--color-bg)] text-[var(--color-text)] text-center space-y-4 transition-colors duration-300">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">warning</span>
          </div>
          <h2 className="font-display font-bold text-xl text-[var(--color-text)]">Application Exception Recovered</h2>
          <p className="font-mono text-xs text-[var(--color-text-muted)] max-w-md">
            {this.state.error?.message || 'An unexpected runtime error occurred in this module component.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            aria-label="Reload module"
            className="btn-neon px-6 py-2.5 cursor-pointer"
          >
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
