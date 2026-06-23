"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useISS, useSyncISS } from "@/hooks/use-space-data";
import { useSpaceStore } from "@/store/use-space-store";
import { Navigation, Compass, AlertCircle, RefreshCw, Milestone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ISSPanel() {
  const { data: queryTelemetry, isLoading, error } = useISS();
  const issLocation = useSpaceStore((state) => state.issLocation);
  const telemetry = issLocation || queryTelemetry;
  const syncISS = useSyncISS();

  const handleSync = async () => {
    try {
      await syncISS.mutateAsync();
    } catch (err) {
      console.error("Failed to sync ISS manually:", err);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-cyan-500/30">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold tracking-wider font-mono text-zinc-100">
            ISS TELEMETRY & TRACKER
          </h2>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncISS.isPending}
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-7 md:w-7 text-zinc-400 hover:text-cyan-400 hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncISS.isPending ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 w-full bg-white/10 rounded-lg" />
            <Skeleton className="h-16 w-full bg-white/10 rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-full bg-white/10 rounded" />
            <Skeleton className="h-6 w-full bg-white/10 rounded" />
            <Skeleton className="h-6 w-full bg-white/10 rounded" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>OFFLINE: {error.message}</span>
        </div>
      )}

      {telemetry && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono block mb-1">LATITUDE</span>
              <span className="text-base font-semibold font-mono text-zinc-200">
                {telemetry.latitude.toFixed(4)}°
              </span>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[10px] text-zinc-500 font-mono block mb-1">LONGITUDE</span>
              <span className="text-base font-semibold font-mono text-zinc-200">
                {telemetry.longitude.toFixed(4)}°
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
              <span className="text-zinc-500">ALTITUDE</span>
              <span className="text-zinc-300 font-semibold">
                {telemetry.altitude ? `${telemetry.altitude.toFixed(1)} km` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
              <span className="text-zinc-500">ORBITAL VELOCITY</span>
              <span className="text-zinc-300 font-semibold">
                {telemetry.velocity ? `${telemetry.velocity.toLocaleString()} km/h` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono pb-1">
              <span className="text-zinc-500">LAST TELEMETRY LOCK</span>
              <span className="text-zinc-400 text-[10px]">
                {new Date(telemetry.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
