import { useEffect } from "react";
import { useSpaceStore } from "@/store/use-space-store";
import { toast } from "sonner";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useWebSocketManager() {
  const setIssLocation = useSpaceStore((state) => state.setIssLocation);
  const setConnectionStatus = useSpaceStore((state) => state.setConnectionStatus);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setConnectionStatus("connecting");
      ws = new WebSocket(`${WS_URL}/api/v1/iss/ws`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnectionStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data && data.event === "iss_update") {
            setIssLocation({
              latitude: data.latitude,
              longitude: data.longitude,
              altitude: data.altitude,
              velocity: data.velocity,
              timestamp: data.timestamp,
            });
          }
          
          if (data && data.event === "space_weather_alert") {
            toast.error("Space Weather Alert", {
              description: data.details || "A new space weather event has been detected.",
            });
          }
        } catch (err) {
          console.error("Failed to parse WebSocket data:", err);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket closed, reconnecting...");
        setConnectionStatus("disconnected");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws?.close();
      };
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      clearTimeout(reconnectTimeout);
    };
  }, [setIssLocation, setConnectionStatus]);
}
