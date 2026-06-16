"use client";

import React, { useEffect, useState } from "react";
import { Activity, Clock, RefreshCw, Radio, Globe2, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ControlBarProps {
  onSyncAll: () => void;
  isSyncing: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function ControlBar({ onSyncAll, isSyncing }: ControlBarProps) {
  const [utcTime, setUtcTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace("GMT", "UTC"));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between px-6 py-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
        </div>
        <div className="flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-cyan-400" />
          <h1 className="text-lg font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            SPACEOPS
          </h1>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/20">
          Telemetry Active
        </span>
      </div>

      {/* Center - Stats Overview */}
      <div className="hidden md:flex items-center gap-6 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2 border-r border-white/5 pr-6">
          <Clock className="h-4 w-4 text-teal-400" />
          <span>{utcTime}</span>
        </div>
        <div className="flex items-center gap-2 border-r border-white/5 pr-6">
          <Radio className="h-4 w-4 text-indigo-400" />
          <span>ISS: <span className="text-zinc-200">Orbiting</span></span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <span>Solar Storms: <span className="text-emerald-400">Low</span></span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Button
          onClick={onSyncAll}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="relative overflow-hidden group h-9 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all duration-300 gap-2 font-mono text-xs text-zinc-300 hover:text-cyan-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-cyan-400" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          <span>{isSyncing ? "Syncing..." : "Sync All Systems"}</span>
        </Button>
      </div>
    </header>
  );
}
