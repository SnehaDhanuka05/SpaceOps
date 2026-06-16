import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { NEOHazard } from "@/api/types";
import { Line } from "@react-three/drei";

interface NEOMarkerProps {
  neo: NEOHazard;
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

export default function NEOMarker({ neo, isHovered, onClick }: NEOMarkerProps) {
  const markerRef = useRef<THREE.Group>(null);
  
  const { position, size, color } = useMemo(() => {
    const random = seededRandom(neo.neo_reference_id);
    
    // Scale miss distance: Earth radius is 2, place NEOs between 3 and 7
    const distScale = neo.miss_distance_km ? Math.max(3, Math.min(7, 2 + (neo.miss_distance_km / 5000000))) : 4;
    
    // Random spherical coordinates
    const phi = Math.acos(2 * random() - 1);
    const theta = 2 * Math.PI * random();
    
    const x = distScale * Math.sin(phi) * Math.cos(theta);
    const y = distScale * Math.sin(phi) * Math.sin(theta);
    const z = distScale * Math.cos(phi);
    
    // Size based on diameter
    const diam = neo.estimated_diameter_km_max || 0.5;
    const size = Math.max(0.05, Math.min(0.3, diam * 0.1));
    
    // Color based on hazard
    const color = neo.is_potentially_hazardous_asteroid ? "#ef4444" : "#f59e0b";
    
    return { position: new THREE.Vector3(x, y, z), size, color };
  }, [neo]);

  useFrame((state, delta) => {
    if (markerRef.current) {
      // Slowly orbit
      markerRef.current.rotation.y += 0.1 * delta;
      markerRef.current.rotation.x += 0.05 * delta;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={markerRef}>
        <octahedronGeometry args={[size, 1]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.6} 
          roughness={0.4}
          emissive={color}
          emissiveIntensity={isHovered ? 0.8 : 0.2}
        />
      </mesh>
      
      {/* Target box when hovered */}
      {isHovered && (
        <mesh>
          <boxGeometry args={[size * 3, size * 3, size * 3]} />
          <meshBasicMaterial color="#22d3ee" wireframe={true} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Trajectory line pointing towards Earth (0,0,0) */}
      <Line 
        points={[new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,0).sub(position).normalize().multiplyScalar(-size)]} 
        color={color} 
        transparent 
        opacity={0.3} 
        dashed 
      />
      {/* We draw a line from the NEO partway to earth to show direction */}
      <Line 
        points={[new THREE.Vector3(0,0,0), new THREE.Vector3().copy(position).multiplyScalar(0.7)]} 
        color={color} 
        transparent 
        opacity={isHovered ? 0.6 : 0.1} 
        dashed 
      />
    </group>
  );
}
