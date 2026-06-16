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
import { Target, ShieldAlert, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  useWebSocketManager();
  const { data: issData } = useISS();
  const [trackISS, setTrackISS] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
    <div className="relative w-screen h-screen overflow-hidden flex flex-col">
      {/* 3D Globe Underlay */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary>
          <GlobeWrapper
            trackISS={trackISS}
          />
        </ErrorBoundary>
      </div>

      {/* Top Navigation Control Bar */}
      <ControlBar onSyncAll={handleSyncAll} isSyncing={isSyncing} />

      {/* Left Overlay Column (ISS control & details) */}
      <div className="absolute left-4 top-24 bottom-4 w-80 z-20 flex flex-col gap-4 overflow-y-auto pr-1 scrollbar-none">
        {/* Cam tracking controller */}
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3">
          <span className="text-[10px] text-zinc-500 font-mono block">TACTICAL CAMERA OVERLAY</span>
          <Button
            onClick={() => setTrackISS((prev) => !prev)}
            variant={trackISS ? "default" : "outline"}
            className={`w-full font-mono text-xs gap-2 transition-all duration-300 ${
              trackISS
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
        <PanelStack>
          <SpaceWeatherPanel />
          <NEOPanel />
          <LaunchesPanel />
        </PanelStack>
      </ErrorBoundary>

      <DetailSheet />
      <GlobalSearch />

      {/* Bottom overlay decorative lines */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-black/30 backdrop-blur-sm text-[9px] font-mono text-zinc-500">
        <Radio className="h-3 w-3 text-cyan-500 animate-pulse" />
        <span>SECURE COM LINK ESTABLISHED</span>
      </div>
    </div>
  );
}
