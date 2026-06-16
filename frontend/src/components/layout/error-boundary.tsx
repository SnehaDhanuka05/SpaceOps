"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-950/20 border border-red-500/20 rounded-xl m-4 backdrop-blur-sm">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-4 animate-pulse" />
          <h2 className="text-sm font-bold font-mono text-zinc-100 mb-2">CRITICAL SYSTEM FAILURE</h2>
          <p className="text-xs font-mono text-zinc-400 mb-6 text-center max-w-md">
            The sub-system encountered an unexpected fault and was safely isolated to prevent cascading failure.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-950/50"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            REBOOT SYSTEM
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
