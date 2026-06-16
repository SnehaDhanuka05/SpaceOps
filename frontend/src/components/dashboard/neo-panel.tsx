"use client";

import React, { useState } from "react";
import { useNEOHazards, useSyncNEOHazards, useAIExplanation } from "@/hooks/use-space-data";
import { ShieldAlert, RefreshCw, AlertTriangle, Sparkles, HelpCircle, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NEOPanel() {
  const { data: neoList, isLoading, error } = useNEOHazards(true, 10);
  const syncNeo = useSyncNEOHazards();
  const { getExplanation, loading: aiLoading } = useAIExplanation();

  const [explainingId, setExplainingId] = useState<string | null>(null);
  const [explanationMap, setExplanationMap] = useState<Record<string, string>>({});

  const handleSync = async () => {
    try {
      await syncNeo.mutateAsync();
    } catch (err) {
      console.error("Failed to sync NEO:", err);
    }
  };

  const handleExplain = async (id: string, name: string, missDist: number, speed: number) => {
    if (explanationMap[id]) {
      // Toggle
      setExplanationMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }

    setExplainingId(id);
    try {
      const summary = `Asteroid ${name} has a close approach. Miss distance: ${missDist.toLocaleString()} km. Relative velocity: ${speed.toLocaleString()} km/h.`;
      const exp = await getExplanation("neo", id, summary);
      setExplanationMap((prev) => ({ ...prev, [id]: exp }));
    } catch (err) {
      console.error("Failed to explain NEO:", err);
    } finally {
      setExplainingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 backdrop-blur-md p-4 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-300 hover:border-amber-500/30">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-500" />
          <h2 className="text-sm font-semibold tracking-wider font-mono text-zinc-100">
            NEO HAZARDS (CLOSE PROXIMITY)
          </h2>
        </div>
        <Button
          onClick={handleSync}
          disabled={syncNeo.isPending}
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-zinc-400 hover:text-amber-500 hover:bg-white/5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${syncNeo.isPending ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-xs font-mono text-zinc-500 animate-pulse">
          SCANNING PROXIMITY TRAJECTORIES...
        </div>
      )}

      {error && (
        <div className="p-3 rounded bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-mono">
          FAILED TO SCAN HAZARDS
        </div>
      )}

      {neoList && neoList.length === 0 && (
        <div className="py-8 text-center text-xs font-mono text-zinc-500">
          NO HAZARDOUS TRAJECTORIES DETECTED
        </div>
      )}

      {neoList && neoList.length > 0 && (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {neoList.map((neo) => (
            <div
              key={neo.neo_reference_id}
              className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2 hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold font-mono text-zinc-200">{neo.name}</span>
                    {neo.is_potentially_hazardous_asteroid && (
                      <span className="flex h-2 w-2 rounded-full bg-red-500" title="Potentially Hazardous" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ID: {neo.neo_reference_id}
                  </span>
                </div>
                {neo.nasa_jpl_url && (
                  <a
                    href={neo.nasa_jpl_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 border-t border-white/5 pt-2">
                <div>
                  <span className="text-zinc-500 block">MISS DISTANCE</span>
                  <span>
                    {neo.miss_distance_km
                      ? `${Math.round(neo.miss_distance_km).toLocaleString()} km`
                      : "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">VELOCITY</span>
                  <span>
                    {neo.relative_velocity_kph
                      ? `${Math.round(neo.relative_velocity_kph).toLocaleString()} km/h`
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Approach: {neo.close_approach_date}
                </span>

                <Button
                  onClick={() =>
                    handleExplain(
                      neo.neo_reference_id,
                      neo.name,
                      neo.miss_distance_km || 0,
                      neo.relative_velocity_kph || 0
                    )
                  }
                  disabled={explainingId === neo.neo_reference_id}
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-mono text-amber-400 hover:text-amber-300 hover:bg-amber-950/20"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {explainingId === neo.neo_reference_id
                    ? "Evaluating..."
                    : explanationMap[neo.neo_reference_id]
                    ? "Close explanation"
                    : "AI Evaluation"}
                </Button>
              </div>

              {explanationMap[neo.neo_reference_id] && (
                <div className="mt-2 p-2.5 rounded bg-amber-950/10 border border-amber-500/20 text-[10px] leading-relaxed text-amber-200/90 font-mono">
                  {explanationMap[neo.neo_reference_id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
