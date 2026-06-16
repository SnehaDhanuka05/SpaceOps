"use client";

import React, { useState } from "react";
import { useLaunchSchedule, useSyncLaunchSchedule, useAIExplanation } from "@/hooks/use-space-data";
import { Rocket, RefreshCw, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LaunchesPanel() {
  const { data: launchList, isLoading, error } = useLaunchSchedule(10);
  const syncLaunches = useSyncLaunchSchedule();
  const { getExplanation, loading: aiLoading } = useAIExplanation();

  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});

  const handleSync = async () => {
    try {
      await syncLaunches.mutateAsync();
    } catch (err) {
      console.error("Failed to sync launches:", err);
    }
  };

  const handleExplain = async (id: string, name: string, rocket: string, pad: string) => {
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
      const summary = `Rocket Launch: ${name}. Rocket: ${rocket}. Location: ${pad}.`;
      const exp = await getExplanation("launch", id, summary);
      setExplanationMap((prev) => ({ ...prev, [id]: exp }));
    } catch (err) {
      console.error("Failed to explain launch:", err);
    } finally {
      setExplainingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-indigo-500/30">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Rocket className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold tracking-wider font-mono text-zinc-100">
            UPCOMING LAUNCH SCHEDULE
          </h2>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncLaunches.isPending}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-indigo-400 hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncLaunches.isPending ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
          QUEUING LAUNCH SCHEDULE FEEDS...
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          OFFLINE: LAUNCH CALENDAR OFFLINE
        </div>
      )}

      {launchList && launchList.length === 0 && (
        <div className="py-8 text-center text-xs font-mono text-zinc-500">
          NO UPCOMING LAUNCHES REGISTERED
        </div>
      )}

      {launchList && launchList.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {launchList.map((launch) => (
            <div
              key={launch.launch_id}
              className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold font-mono text-zinc-200 block">
                    {launch.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Provider: {launch.provider || "Unknown"}
                  </span>
                </div>
                {launch.status && (
                  <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-400">
                    {launch.status}
                  </span>
                )}
              </div>

              <div className="text-[10px] font-mono text-zinc-400 space-y-1">
                <div>
                  <span className="text-zinc-500">ROCKET:</span> {launch.rocket_name || "N/A"}
                </div>
                <div>
                  <span className="text-zinc-500">PAD:</span> {launch.launch_pad || "N/A"}
                </div>
              </div>

              {launch.description && (
                <p className="text-[10px] text-zinc-400 font-mono line-clamp-2 leading-relaxed border-t border-white/5 pt-2">
                  {launch.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {launch.window_start ? new Date(launch.window_start).toLocaleDateString() : "TBD"}
                </span>

                <Button
                  onClick={() =>
                    handleExplain(
                      launch.launch_id,
                      launch.name,
                      launch.rocket_name || "Unknown Rocket",
                      launch.launch_pad || "Unknown Pad"
                    )
                  }
                  disabled={explainingId === launch.launch_id}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {explainingId === launch.launch_id
                    ? "Evaluating..."
                    : explanationMap[launch.launch_id]
                    ? "Close explanation"
                    : "AI Forecast"}
                </Button>
              </div>

              {explanationMap[launch.launch_id] && (
                <div className="mt-2 p-2.5 rounded bg-indigo-950/10 border border-indigo-500/20 text-[10px] leading-relaxed text-indigo-200/90 font-mono">
                  {explanationMap[launch.launch_id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
