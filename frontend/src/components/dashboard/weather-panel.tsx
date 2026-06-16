"use client";

import React, { useState } from "react";
import { useSpaceWeather, useSyncSpaceWeather, useAIExplanation } from "@/hooks/use-space-data";
import { Flame, RefreshCw, Sun, Activity, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpaceStore } from "@/store/use-space-store";

export default function SpaceWeatherPanel() {
  const { data: weatherList, isLoading, error } = useSpaceWeather(10);
  const syncWeather = useSyncSpaceWeather();
  const { getExplanation, loading: aiLoading } = useAIExplanation();
  const hoveredWeatherEventId = useSpaceStore((state) => state.hoveredWeatherEventId);
  const setHoveredWeatherEventId = useSpaceStore((state) => state.setHoveredWeatherEventId);
  const setSelectedEntity = useSpaceStore((state) => state.setSelectedEntity);

  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});

  const handleSync = async () => {
    try {
      await syncWeather.mutateAsync();
    } catch (err) {
      console.error("Failed to sync weather:", err);
    }
  };

  const handleExplain = async (id: string, type: string, severity: string, details: string) => {
    if (explanationMap[id]) {
      setExplanationMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setExplainingId(id);
    try {
      const summary = `Space Weather Alert: Event ${type}. Severity: ${severity}. Details: ${details}`;
      const exp = await getExplanation("space-weather", id, summary);
      setExplanationMap((prev) => ({ ...prev, [id]: exp }));
    } catch (err) {
      console.error("Failed to explain space weather:", err);
    } finally {
      setExplainingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-red-500/30">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-red-500" />
          <h2 className="text-sm font-semibold tracking-wider font-mono text-zinc-100">
            SPACE SOLAR WEATHER ALERTS
          </h2>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncWeather.isPending}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncWeather.isPending ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <Skeleton key={i} className="h-[100px] w-full bg-white/10 rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          OFFLINE: SOLAR SENSORS ERROR
        </div>
      )}

      {weatherList && weatherList.length === 0 && (
        <div className="py-8 text-center text-xs font-mono text-zinc-500">
          SOLAR ACTIVITY WITHIN NORMAL PARAMETERS
        </div>
      )}

      {weatherList && weatherList.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {weatherList.map((alert) => (
            <div
              key={alert.event_id}
              className={`p-3 rounded-lg border space-y-2 transition-colors cursor-pointer ${
                hoveredWeatherEventId === alert.event_id
                  ? "bg-white/10 border-red-500/50"
                  : "bg-white/5 border-white/5 hover:bg-white/10"
              }`}
              onMouseEnter={() => setHoveredWeatherEventId(alert.event_id)}
              onMouseLeave={() => setHoveredWeatherEventId(null)}
              onClick={() => setSelectedEntity({ id: alert.event_id, type: 'weather' })}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-orange-400" />
                  <div>
                    <span className="text-xs font-bold font-mono text-zinc-200">
                      {alert.event_type}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      ID: {alert.event_id}
                    </span>
                  </div>
                </div>
                {alert.severity && (
                  <span
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                      alert.severity === "Severe" || alert.severity === "Extreme"
                        ? "bg-red-950/40 border border-red-500/30 text-red-400"
                        : "bg-orange-950/40 border border-orange-500/30 text-orange-400"
                    }`}
                  >
                    {alert.severity}
                  </span>
                )}
              </div>

              {alert.details && (
                <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                  {alert.details}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  {alert.start_time ? new Date(alert.start_time).toLocaleDateString() : ""}
                </span>

                <Button
                  onClick={() =>
                    handleExplain(
                      alert.event_id,
                      alert.event_type,
                      alert.severity || "Unknown",
                      alert.details || ""
                    )
                  }
                  disabled={explainingId === alert.event_id}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-mono text-orange-400 hover:text-orange-300 hover:bg-orange-950/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {explainingId === alert.event_id
                    ? "Evaluating..."
                    : explanationMap[alert.event_id]
                    ? "Close explanation"
                    : "AI Analysis"}
                </Button>
              </div>

              {explanationMap[alert.event_id] && (
                <div className="mt-2 p-2.5 rounded bg-orange-950/10 border border-orange-500/20 text-[10px] leading-relaxed text-orange-200/90 font-mono">
                  {explanationMap[alert.event_id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
