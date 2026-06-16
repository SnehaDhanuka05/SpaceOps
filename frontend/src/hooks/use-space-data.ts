"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/api/client";
import {
  ISSTelemetry,
  NEOHazard,
  SpaceWeather,
  Launch,
  AIExplanationResponse,
} from "@/api/types";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

// --- ISS HOOKS ---
export function useISS() {
  const queryClient = useQueryClient();

  const query = useQuery<ISSTelemetry>({
    queryKey: ["iss-telemetry"],
    queryFn: () => apiFetch<ISSTelemetry>("/api/v1/iss/"),
    refetchInterval: 30000, // Fallback poll every 30 seconds
  });

  // WebSocket for real-time ISS updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      ws = new WebSocket(`${WS_URL}/api/v1/iss/ws`);

      ws.onopen = () => {
        console.log("ISS WebSocket connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.event === "iss_update") {
            // Update the React Query cache immediately
            queryClient.setQueryData<ISSTelemetry>(["iss-telemetry"], (prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude,
                velocity: data.velocity,
                timestamp: data.timestamp,
              };
            });
          }
        } catch (err) {
          console.error("Failed to parse ISS WebSocket data:", err);
        }
      };

      ws.onclose = () => {
        console.log("ISS WebSocket closed, reconnecting...");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("ISS WebSocket error:", err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, [queryClient]);

  return query;
}

export function useSyncISS() {
  const queryClient = useQueryClient();
  return useMutation<ISSTelemetry, Error>({
    mutationFn: () =>
      apiFetch<ISSTelemetry>("/api/v1/iss/sync", { method: "POST" }),
    onSuccess: (data) => {
      queryClient.setQueryData(["iss-telemetry"], data);
    },
  });
}

// --- NEO HAZARDS HOOKS ---
export function useNEOHazards(hazardousOnly = false, limit = 20) {
  return useQuery<NEOHazard[]>({
    queryKey: ["neo-hazards", hazardousOnly, limit],
    queryFn: () =>
      apiFetch<NEOHazard[]>(
        `/api/v1/neo/?hazardous_only=${hazardousOnly}&limit=${limit}`
      ),
  });
}

export function useSyncNEOHazards() {
  const queryClient = useQueryClient();
  return useMutation<NEOHazard[], Error>({
    mutationFn: () =>
      apiFetch<NEOHazard[]>("/api/v1/neo/sync", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["neo-hazards"] });
    },
  });
}

// --- SPACE WEATHER HOOKS ---
export function useSpaceWeather(limit = 10) {
  return useQuery<SpaceWeather[]>({
    queryKey: ["space-weather", limit],
    queryFn: () => apiFetch<SpaceWeather[]>(`/api/v1/space-weather/?limit=${limit}`),
  });
}

export function useSyncSpaceWeather() {
  const queryClient = useQueryClient();
  return useMutation<SpaceWeather[], Error>({
    mutationFn: () =>
      apiFetch<SpaceWeather[]>("/api/v1/space-weather/sync", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["space-weather"] });
    },
  });
}

// --- LAUNCH SCHEDULE HOOKS ---
export function useLaunchSchedule(limit = 10) {
  return useQuery<Launch[]>({
    queryKey: ["launches", limit],
    queryFn: () => apiFetch<Launch[]>(`/api/v1/launches/?limit=${limit}`),
  });
}

export function useSyncLaunchSchedule() {
  const queryClient = useQueryClient();
  return useMutation<Launch[], Error>({
    mutationFn: () =>
      apiFetch<Launch[]>("/api/v1/launches/sync", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launches"] });
    },
  });
}

// --- AI EXPLANATIONS HOOKS (With Local Storage caching) ---
export function useAIExplanation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getExplanation = async (
    category: "space-weather" | "neo" | "launch",
    dataId: string,
    dataSummary: string
  ): Promise<string> => {
    const cacheKey = `spaceops:ai-explain:${category}:${dataId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<AIExplanationResponse>(
        `/api/v1/ai/explain/${category}`,
        {
          method: "POST",
          body: JSON.stringify({
            data_id: dataId,
            data_summary: dataSummary,
          }),
        }
      );
      localStorage.setItem(cacheKey, JSON.stringify(response.explanation));
      return response.explanation;
    } catch (err: any) {
      const msg = err.message || "Failed to fetch AI explanation";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { getExplanation, loading, error };
}
