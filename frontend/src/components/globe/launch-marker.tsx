import React, { useMemo } from "react";
import * as THREE from "three";
import { Launch } from "@/api/types";
import { latLonToVector3 } from "@/utils/coords";
import { Line } from "@react-three/drei";

interface LaunchMarkerProps {
  launch: Launch;
  isHovered?: boolean;
  onClick?: () => void;
}

// Pseudo-random number generator based on string
function seededRandom(seedStr: string) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(1597334677, h);
    return ((h >>> 0) / 4294967296);
  };
}

export default function LaunchMarker({ launch, isHovered, onClick }: LaunchMarkerProps) {
  const { position, arcPoints } = useMemo(() => {
    const random = seededRandom(launch.launch_id);
    
    // Random lat/lon for visualization
    const lat = (random() * 140) - 70; // -70 to 70
    const lon = (random() * 360) - 180;
    
    const pos = latLonToVector3(lat, lon, 2.0); // Surface of earth
    const position = new THREE.Vector3(...pos);
    
    // Generate a simple trajectory arc prediction
    const points = [];
    const targetLat = lat + (random() * 20 - 10);
    const targetLon = lon + (random() * 40 - 20);
    
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const currentLat = lat + (targetLat - lat) * t;
      const currentLon = lon + (targetLon - lon) * t;
      // Arc goes up and down
      const altitude = 2.0 + Math.sin(t * Math.PI) * 0.5;
      points.push(new THREE.Vector3(...latLonToVector3(currentLat, currentLon, altitude)));
    }
    
    return { position, arcPoints: points };
  }, [launch.launch_id]);

  return (
    <group position={position} onClick={onClick}>
      {/* Surface Pin */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.0, 0.1, 8]} />
        <meshBasicMaterial color="#a855f7" />
      </mesh>
      
      {/* Pulse effect */}
      <mesh position={[0, 0.01, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={isHovered ? 0.8 : 0.4} />
      </mesh>
      
      {/* Trajectory Prediction Arc */}
      {isHovered && (
        <Line
          points={arcPoints.map(p => p.clone().sub(position))} // Local space relative to group
          color="#d8b4fe"
          lineWidth={2}
          transparent
          opacity={0.6}
          dashed
        />
      )}
    </group>
  );
}
