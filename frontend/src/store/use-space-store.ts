import { create } from "zustand";

export interface ISSLocation {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: string;
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected";

interface SpaceStore {
  issLocation: ISSLocation | null;
  setIssLocation: (location: ISSLocation) => void;
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
  
  // Real-time tracking
  trackISS: boolean;
  setTrackISS: (track: boolean) => void;
  
  // Interactions
  hoveredNeoId: string | null;
  setHoveredNeoId: (id: string | null) => void;

  hoveredLaunchId: string | null;
  setHoveredLaunchId: (id: string | null) => void;

  hoveredWeatherEventId: string | null;
  setHoveredWeatherEventId: (id: string | null) => void;

  selectedEntity: { id: string; type: 'iss' | 'neo' | 'launch' | 'weather' } | null;
  setSelectedEntity: (entity: { id: string; type: 'iss' | 'neo' | 'launch' | 'weather' } | null) => void;

  // Layer toggles
  showISS: boolean;
  setShowISS: (show: boolean) => void;
  showNEOs: boolean;
  setShowNEOs: (show: boolean) => void;
  showLaunches: boolean;
  setShowLaunches: (show: boolean) => void;
  showWeather: boolean;
  setShowWeather: (show: boolean) => void;
}

export const useSpaceStore = create<SpaceStore>((set) => ({
  issLocation: null,
  setIssLocation: (location) => set({ issLocation: location }),
  
  connectionStatus: "disconnected",
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  trackISS: false,
  setTrackISS: (track) => set({ trackISS: track }),

  hoveredNeoId: null,
  setHoveredNeoId: (id) => set({ hoveredNeoId: id }),

  hoveredLaunchId: null,
  setHoveredLaunchId: (id) => set({ hoveredLaunchId: id }),

  hoveredWeatherEventId: null,
  setHoveredWeatherEventId: (id) => set({ hoveredWeatherEventId: id }),

  selectedEntity: null,
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),

  showISS: true,
  setShowISS: (show) => set({ showISS: show }),
  showNEOs: true,
  setShowNEOs: (show) => set({ showNEOs: show }),
  showLaunches: true,
  setShowLaunches: (show) => set({ showLaunches: show }),
  showWeather: true,
  setShowWeather: (show) => set({ showWeather: show }),
}));
