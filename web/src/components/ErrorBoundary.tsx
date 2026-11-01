import { Component, type ReactNode } from "react";

/** Shows the error instead of a blank page, with a one-click reset of saved sign-in data. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="mx-auto max-w-xl p-4">
        <div role="alert" className="card border-alert bg-alert-soft">
          <h1 className="text-xl font-bold text-alert">Something broke on this page</h1>
          <pre className="my-3 whitespace-pre-wrap text-sm">{this.state.error.message}</pre>
          <button className="btn-primary" onClick={() => { localStorage.clear(); location.href = "/"; }}>Clear saved data and reload</button>
        </div>
      </main>
    );
  }
}
