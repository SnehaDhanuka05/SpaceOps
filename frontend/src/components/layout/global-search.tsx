import React, { useEffect, useState } from "react";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useSpaceStore } from "@/store/use-space-store";
import { useISS, useNEOHazards, useLaunchSchedule, useSpaceWeather } from "@/hooks/use-space-data";
import { Rocket, ShieldAlert, Sun, Target } from "lucide-react";

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const setSelectedEntity = useSpaceStore((state) => state.setSelectedEntity);
  const setTrackISS = useSpaceStore((state) => state.setTrackISS);

  const { data: neoData } = useNEOHazards(true, 10);
  const { data: launchData } = useLaunchSchedule(10);
  const { data: weatherData } = useSpaceWeather(10);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (type: 'iss' | 'neo' | 'launch' | 'weather', id: string) => {
    setOpen(false);
    if (type === 'iss') {
      setTrackISS(true);
    } else {
      setSelectedEntity({ id, type });
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="bg-black/90 border-white/10 text-zinc-100 backdrop-blur-xl">
      <CommandInput placeholder="Search telemetry data... (Press ⌘K)" className="text-zinc-100 placeholder:text-zinc-500" />
      <CommandList className="scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[300px]">
        <CommandEmpty className="text-zinc-500 font-mono text-xs">No telemetry found.</CommandEmpty>
        
        <CommandGroup heading="Tracking Stations" className="text-zinc-400">
          <CommandItem onSelect={() => handleSelect('iss', 'iss')} className="text-zinc-200 cursor-pointer data-[selected=true]:bg-white/10">
            <Target className="mr-2 h-4 w-4 text-cyan-500" />
            <span>International Space Station (ISS)</span>
          </CommandItem>
        </CommandGroup>

        {neoData && neoData.length > 0 && (
          <CommandGroup heading="NEO Hazards" className="text-zinc-400">
            {neoData.map((neo) => (
              <CommandItem 
                key={neo.neo_reference_id} 
                onSelect={() => handleSelect('neo', neo.neo_reference_id)}
                className="text-zinc-200 cursor-pointer data-[selected=true]:bg-white/10"
              >
                <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" />
                <span>{neo.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {launchData && launchData.length > 0 && (
          <CommandGroup heading="Upcoming Launches" className="text-zinc-400">
            {launchData.map((launch) => (
              <CommandItem 
                key={launch.launch_id} 
                onSelect={() => handleSelect('launch', launch.launch_id)}
                className="text-zinc-200 cursor-pointer data-[selected=true]:bg-white/10"
              >
                <Rocket className="mr-2 h-4 w-4 text-indigo-400" />
                <span>{launch.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {weatherData && weatherData.length > 0 && (
          <CommandGroup heading="Space Weather Alerts" className="text-zinc-400">
            {weatherData.map((alert) => (
              <CommandItem 
                key={alert.event_id} 
                onSelect={() => handleSelect('weather', alert.event_id)}
                className="text-zinc-200 cursor-pointer data-[selected=true]:bg-white/10"
              >
                <Sun className="mr-2 h-4 w-4 text-orange-400" />
                <span>{alert.event_type} - {alert.severity}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
