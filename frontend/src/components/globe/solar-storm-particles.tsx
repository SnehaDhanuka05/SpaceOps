import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSpaceStore } from "@/store/use-space-store";

export default function SolarStormParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const hoveredWeatherEventId = useSpaceStore((state) => state.hoveredWeatherEventId);

  const particleCount = 2000;

  const [positions, initialPhases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Create a shell of particles around Earth
      const r = 2.5 + Math.random() * 2;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      phases[i] = Math.random() * Math.PI * 2;
    }
    return [pos, phases];
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Speed up rotation when hovered
      const speed = hoveredWeatherEventId ? 0.3 : 0.05;
      pointsRef.current.rotation.y += speed * delta;

      // We can also animate particles individually if we use a custom shader, 
      // but for simplicity we just rotate the group and pulse the opacity
      const material = pointsRef.current.material as THREE.PointsMaterial;
      material.opacity = hoveredWeatherEventId ? 0.8 : 0.2;
      material.size = hoveredWeatherEventId ? 0.05 : 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#f97316"
        size={0.02}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
