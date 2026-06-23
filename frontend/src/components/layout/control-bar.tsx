"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw, Globe2, Target, ShieldAlert, Rocket, Sun, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpaceStore } from "@/store/use-space-store";

interface ControlBarProps {
  onSyncAll: () => void;
  isSyncing: boolean;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function ControlBar({ onSyncAll, isSyncing }: ControlBarProps) {
  const connectionStatus = useSpaceStore((state) => state.connectionStatus);
  const showISS = useSpaceStore((state) => state.showISS);
  const setShowISS = useSpaceStore((state) => state.setShowISS);
  const showNEOs = useSpaceStore((state) => state.showNEOs);
  const setShowNEOs = useSpaceStore((state) => state.setShowNEOs);
  const showLaunches = useSpaceStore((state) => state.showLaunches);
  const setShowLaunches = useSpaceStore((state) => state.setShowLaunches);
  const showWeather = useSpaceStore((state) => state.showWeather);
  const setShowWeather = useSpaceStore((state) => state.setShowWeather);

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
    <header className="fixed md:absolute top-4 left-4 right-4 z-40 flex items-center justify-between px-4 md:px-6 py-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-white/5 bg-black/20">
          <div
            className={`h-2 w-2 rounded-full ${connectionStatus === "connected"
              ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              : connectionStatus === "connecting"
                ? "bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              }`}
          />
          <span className="text-[10px] uppercase font-mono text-zinc-400">
            {connectionStatus === "connected"
              ? "Live"
              : connectionStatus === "connecting"
                ? "Connecting"
                : "Offline"}
          </span>
        </div>
      </div>

      {/* Center - Layer Toggles */}
      <div className="hidden md:flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
        <span className="text-[10px] font-mono text-zinc-500 mr-2 uppercase">Layers:</span>
        <button onClick={() => setShowISS(!showISS)} className={`group flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out ${showISS ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
          <Target className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[80px] group-hover:ml-1.5 group-hover:mr-0.5 transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100">ISS</span>
        </button>
        <button onClick={() => setShowNEOs(!showNEOs)} className={`group flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out ${showNEOs ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[80px] group-hover:ml-1.5 group-hover:mr-0.5 transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100">NEOs Hazards</span>
        </button>
        <button onClick={() => setShowLaunches(!showLaunches)} className={`group flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out ${showLaunches ? 'bg-indigo-500/20 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
          <Rocket className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[80px] group-hover:ml-1.5 group-hover:mr-0.5 transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100">Launches</span>
        </button>
        <button onClick={() => setShowWeather(!showWeather)} className={`group flex items-center p-1.5 rounded-md transition-all duration-300 ease-in-out ${showWeather ? 'bg-orange-500/20 text-orange-400' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>
          <Sun className="h-4 w-4 shrink-0" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[80px] group-hover:ml-1.5 group-hover:mr-0.5 transition-all duration-300 text-[10px] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100">Space Weather</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-zinc-500 border border-white/10 bg-black/30 px-3 py-1.5 rounded-md">
          <Search className="h-3.5 w-3.5" />
          <span>Press ⌘K to search</span>
        </div>

        <Button
          onClick={onSyncAll}
          disabled={isSyncing}
          variant="outline"
          size="sm"
          className="relative overflow-hidden group h-9 border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all duration-300 gap-2 font-mono text-xs text-zinc-300 hover:text-cyan-400"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-cyan-400" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          <span>{isSyncing ? "Syncing..." : "Sync All"}</span>
        </Button>
      </div>
    </header>
  );
}
