"use client";

import React, { useState } from "react";
import ControlBar from "@/components/layout/control-bar";
import PanelStack from "@/components/layout/panel-stack";
import ISSPanel from "@/components/dashboard/iss-panel";
import NEOPanel from "@/components/dashboard/neo-panel";
import SpaceWeatherPanel from "@/components/dashboard/weather-panel";
import LaunchesPanel from "@/components/dashboard/launches-panel";
import GlobeWrapper from "@/components/globe/globe-wrapper";
import { useISS, useSyncISS, useSyncNEOHazards, useSyncSpaceWeather, useSyncLaunchSchedule } from "@/hooks/use-space-data";
import { useWebSocketManager } from "@/hooks/use-websocket";
import DetailSheet from "@/components/layout/detail-sheet";
import GlobalSearch from "@/components/layout/global-search";
import { ErrorBoundary } from "@/components/layout/error-boundary";
import { Target, ShieldAlert, Radio, X, Sun, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  useWebSocketManager();
  const { data: issData } = useISS();
  const [trackISS, setTrackISS] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<'iss' | 'weather' | 'neo' | 'launches' | null>(null);

  // Sync Mutations
  const syncISS = useSyncISS();
  const syncNEO = useSyncNEOHazards();
  const syncWeather = useSyncSpaceWeather();
  const syncLaunches = useSyncLaunchSchedule();

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        syncISS.mutateAsync().catch((e) => console.error("ISS Sync error", e)),
        syncNEO.mutateAsync().catch((e) => console.error("NEO Sync error", e)),
        syncWeather.mutateAsync().catch((e) => console.error("Weather Sync error", e)),
        syncLaunches.mutateAsync().catch((e) => console.error("Launches Sync error", e)),
      ]);
    } catch (err) {
      console.error("Error during full systems sync:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-x-hidden overflow-y-auto md:overflow-hidden flex flex-col">
      {/* 3D Globe Underlay */}
      <div className="fixed inset-0 z-0 pointer-events-none md:pointer-events-auto">
        <ErrorBoundary>
          <GlobeWrapper
            trackISS={trackISS}
          />
        </ErrorBoundary>
      </div>

      {/* Top Navigation Control Bar */}
      <ControlBar onSyncAll={handleSyncAll} isSyncing={isSyncing} />

      {/* Left Overlay Column (ISS control & details) */}
      <div className={`fixed bottom-[84px] left-4 right-4 md:relative md:absolute md:left-4 md:top-24 md:bottom-4 md:w-80 z-40 flex-col gap-4 mt-24 md:mt-0 px-0 md:pr-1 overflow-y-auto scrollbar-none flex-none pointer-events-auto transition-transform duration-300 scale-[0.85] md:scale-100 origin-bottom md:origin-top-left ${activeMobilePanel === 'iss' ? 'flex' : 'hidden md:flex'}`}>
        <div className="flex justify-between items-center md:hidden mb-1 px-2 bg-black/60 rounded-xl p-3 border border-white/10 backdrop-blur-md">
          <span className="text-xs font-mono font-bold text-cyan-400">ISS CONTROL</span>
          <button onClick={() => setActiveMobilePanel(null)}><X className="h-5 w-5 text-zinc-400 hover:text-white" /></button>
        </div>
        {/* Cam tracking controller */}
        <div className="rounded-xl border border-white/10 bg-black/80 md:bg-black/40 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-3">
          <span className="text-[10px] text-zinc-500 font-mono block">TACTICAL CAMERA OVERLAY</span>
          <Button
            onClick={() => setTrackISS((prev) => !prev)}
            variant={trackISS ? "default" : "outline"}
            className={`w-full h-11 md:h-9 font-mono text-xs gap-2 transition-all duration-300 ${trackISS
                ? "bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.5)] border-transparent"
                : "border-white/10 hover:border-cyan-500/50 hover:bg-cyan-950/10 text-zinc-300"
              }`}
          >
            <Target className={`h-4 w-4 ${trackISS ? "animate-pulse" : ""}`} />
            <span>{trackISS ? "CAM LOCK: ISS (ON)" : "LOCK CAM TO ISS"}</span>
          </Button>
        </div>

        {/* Real-time Telemetry Panel */}
        <ErrorBoundary>
          <ISSPanel />
        </ErrorBoundary>
      </div>

      {/* Right Sidebar Stack Container */}
      <ErrorBoundary>
        <PanelStack className={`fixed bottom-[84px] left-4 right-4 md:relative md:absolute md:right-4 md:top-24 md:bottom-4 md:w-96 z-40 flex-col gap-4 pb-0 md:pb-8 md:p-0 md:pr-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-none pointer-events-auto transition-transform duration-300 scale-[0.85] md:scale-100 origin-bottom md:origin-top-right ${activeMobilePanel && activeMobilePanel !== 'iss' ? 'flex' : 'hidden md:flex'}`}>

          {(activeMobilePanel === 'weather' || !activeMobilePanel) && (
            <div className={`flex-col gap-4 ${activeMobilePanel === 'weather' ? 'flex' : 'hidden md:flex'}`}>
              <div className="flex justify-between items-center md:hidden mb-1 px-2 bg-black/60 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono font-bold text-orange-400">SPACE WEATHER</span>
                <button onClick={() => setActiveMobilePanel(null)}><X className="h-5 w-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <SpaceWeatherPanel />
            </div>
          )}

          {(activeMobilePanel === 'neo' || !activeMobilePanel) && (
            <div className={`flex-col gap-4 ${activeMobilePanel === 'neo' ? 'flex' : 'hidden md:flex'}`}>
              <div className="flex justify-between items-center md:hidden mb-1 px-2 bg-black/60 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono font-bold text-amber-400">NEO HAZARDS</span>
                <button onClick={() => setActiveMobilePanel(null)}><X className="h-5 w-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <NEOPanel />
            </div>
          )}

          {(activeMobilePanel === 'launches' || !activeMobilePanel) && (
            <div className={`flex-col gap-4 ${activeMobilePanel === 'launches' ? 'flex' : 'hidden md:flex'}`}>
              <div className="flex justify-between items-center md:hidden mb-1 px-2 bg-black/60 rounded-xl p-3 border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono font-bold text-indigo-400">LAUNCH SCHEDULE</span>
                <button onClick={() => setActiveMobilePanel(null)}><X className="h-5 w-5 text-zinc-400 hover:text-white" /></button>
              </div>
              <LaunchesPanel />
            </div>
          )}
        </PanelStack>
      </ErrorBoundary>

      <DetailSheet />
      <GlobalSearch />

      {/* Bottom overlay decorative lines */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/30 backdrop-blur-sm text-[9px] font-mono text-zinc-500">
        <Radio className="h-3 w-3 text-cyan-500 animate-pulse" />
        <span>SECURE COM LINK ESTABLISHED</span>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden bg-black/80 backdrop-blur-xl border-t border-white/10 p-2 pb-4 justify-around items-center">
        <button onClick={() => setActiveMobilePanel(prev => prev === 'iss' ? null : 'iss')} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[72px] transition-colors ${activeMobilePanel === 'iss' ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
          <Target className="h-5 w-5" />
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider">ISS Cords</span>
        </button>
        <button onClick={() => setActiveMobilePanel(prev => prev === 'weather' ? null : 'weather')} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[72px] transition-colors ${activeMobilePanel === 'weather' ? 'text-orange-400 bg-orange-950/50 border border-orange-500/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
          <Sun className="h-5 w-5" />
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Weather</span>
        </button>
        <button onClick={() => setActiveMobilePanel(prev => prev === 'neo' ? null : 'neo')} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[72px] transition-colors ${activeMobilePanel === 'neo' ? 'text-amber-400 bg-amber-950/50 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
          <ShieldAlert className="h-5 w-5" />
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider">NEO Alerts</span>
        </button>
        <button onClick={() => setActiveMobilePanel(prev => prev === 'launches' ? null : 'launches')} className={`p-2 rounded-xl flex flex-col items-center gap-1 min-w-[72px] transition-colors ${activeMobilePanel === 'launches' ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-500/30' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'}`}>
          <Rocket className="h-5 w-5" />
          <span className="text-[9px] font-mono uppercase font-bold tracking-wider">Launches</span>
        </button>
      </div>
    </div>
  );
}
