import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpaceStore } from "@/store/use-space-store";

export default function AuroraZone() {
  const auroraRefNorth = useRef<THREE.Mesh>(null);
  const auroraRefSouth = useRef<THREE.Mesh>(null);
  
  const hoveredWeatherEventId = useSpaceStore((state) => state.hoveredWeatherEventId);
  const intensity = hoveredWeatherEventId ? 0.8 : 0.2; // Increase intensity if a weather event is hovered

  useFrame((state, delta) => {
    if (auroraRefNorth.current) {
      auroraRefNorth.current.rotation.y += 0.2 * delta;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05 * intensity;
      auroraRefNorth.current.scale.set(scale, scale, scale);
      (auroraRefNorth.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
    if (auroraRefSouth.current) {
      auroraRefSouth.current.rotation.y -= 0.15 * delta;
      const scale = 1 + Math.cos(state.clock.elapsedTime * 1.5) * 0.05 * intensity;
      auroraRefSouth.current.scale.set(scale, scale, scale);
      (auroraRefSouth.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.5 + Math.cos(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group>
      {/* Northern Lights */}
      <mesh ref={auroraRefNorth} position={[0, 1.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.2, 64]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      
      {/* Southern Lights */}
      <mesh ref={auroraRefSouth} position={[0, -1.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 1.2, 64]} />
        <meshBasicMaterial 
          color="#34d399" 
          transparent 
          opacity={0.3} 
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
