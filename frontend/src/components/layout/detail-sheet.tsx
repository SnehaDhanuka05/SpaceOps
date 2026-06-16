import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useSpaceStore } from "@/store/use-space-store";
import { useISS, useNEOHazards, useLaunchSchedule, useSpaceWeather } from "@/hooks/use-space-data";

export default function DetailSheet() {
  const selectedEntity = useSpaceStore((state) => state.selectedEntity);
  const setSelectedEntity = useSpaceStore((state) => state.setSelectedEntity);

  const { data: issData } = useISS();
  const { data: neoData } = useNEOHazards(true, 10);
  const { data: launchData } = useLaunchSchedule(10);
  const { data: weatherData } = useSpaceWeather(10);

  const isOpen = selectedEntity !== null;

  let title = "";
  let content = null;

  if (selectedEntity) {
    if (selectedEntity.type === 'neo') {
      const neo = neoData?.find(n => n.neo_reference_id === selectedEntity.id);
      if (neo) {
        title = `NEO: ${neo.name}`;
        content = (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-zinc-500 block">MISS DISTANCE</span>
                <span className="text-zinc-200">{neo.miss_distance_km ? `${Math.round(neo.miss_distance_km).toLocaleString()} km` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">VELOCITY</span>
                <span className="text-zinc-200">{neo.relative_velocity_kph ? `${Math.round(neo.relative_velocity_kph).toLocaleString()} km/h` : 'N/A'}</span>
              </div>
            </div>
            <div>
              <span className="text-zinc-500 block">EST. DIAMETER</span>
              <span className="text-zinc-200">{neo.estimated_diameter_km_max?.toFixed(2)} km</span>
            </div>
            {neo.is_potentially_hazardous_asteroid && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-400 rounded-md">
                ⚠ Potentially Hazardous Asteroid
              </div>
            )}
            {neo.nasa_jpl_url && (
              <a href={neo.nasa_jpl_url} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
                View on NASA JPL
              </a>
            )}
          </div>
        );
      }
    } else if (selectedEntity.type === 'launch') {
      const launch = launchData?.find(l => l.launch_id === selectedEntity.id);
      if (launch) {
        title = `Launch: ${launch.name}`;
        content = (
          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block">STATUS</span>
              <span className="text-indigo-400">{launch.status}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">PROVIDER</span>
              <span className="text-zinc-200">{launch.provider}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">ROCKET</span>
              <span className="text-zinc-200">{launch.rocket_name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">LAUNCH PAD</span>
              <span className="text-zinc-200">{launch.launch_pad}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">WINDOW</span>
              <span className="text-zinc-200">{launch.window_start ? new Date(launch.window_start).toLocaleString() : 'TBD'}</span>
            </div>
            {launch.description && (
              <p className="text-zinc-400 leading-relaxed border-t border-white/10 pt-4 mt-4">
                {launch.description}
              </p>
            )}
          </div>
        );
      }
    } else if (selectedEntity.type === 'weather') {
      const alert = weatherData?.find(w => w.event_id === selectedEntity.id);
      if (alert) {
        title = `Space Weather: ${alert.event_type}`;
        content = (
          <div className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block">SEVERITY</span>
              <span className="text-orange-400">{alert.severity}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">START TIME</span>
              <span className="text-zinc-200">{alert.start_time ? new Date(alert.start_time).toLocaleString() : 'N/A'}</span>
            </div>
            {alert.details && (
              <p className="text-zinc-400 leading-relaxed border-t border-white/10 pt-4 mt-4">
                {alert.details}
              </p>
            )}
          </div>
        );
      }
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && setSelectedEntity(null)}>
      <SheetContent className="bg-black/80 backdrop-blur-xl border-white/10 text-zinc-100 sm:max-w-md w-full p-6 pt-12 overflow-y-auto z-[100]">
        <SheetHeader className="mb-6 px-0 text-left">
          <SheetTitle className="text-xl font-mono text-zinc-100 tracking-wider">
            {title || "Data Link Established"}
          </SheetTitle>
          <SheetDescription className="text-zinc-500 font-mono text-xs">
            Detailed telemetry feed.
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
}
