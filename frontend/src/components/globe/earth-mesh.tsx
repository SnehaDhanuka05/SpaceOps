"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useTexture, Line } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVector3 } from "@/utils/coords";
import AuroraZone from "./aurora-zone";
import SolarStormParticles from "./solar-storm-particles";

interface EarthMeshProps {
  issLat?: number;
  issLon?: number;
  autoRotate?: boolean;
  isInteracting?: boolean;
  showISS?: boolean;
  showWeather?: boolean;
  children?: React.ReactNode;
}

function EarthMeshInner({
  issLat,
  issLon,
  autoRotate = true,
  isInteracting = false,
  showISS = true,
  showWeather = true,
  children,
}: EarthMeshProps) {
  const earthRef = useRef<THREE.Group>(null);
  const issRef = useRef<THREE.Group>(null);
  const [isHovered, setHovered] = useState(false);

  // Load textures using drei's useTexture (works correctly with Suspense)
  const textures = useTexture({
    map: "/earth-blue-marble.jpg",
    bumpMap: "/earth-topology.png",
    roughnessMap: "/earth-water.png",
    emissiveMap: "/earth-night.jpg",
  });

  // Generate procedural cloud texture on the client

  // Rotate Earth and clouds
  useFrame((state, delta) => {
    if (earthRef.current && autoRotate && !isInteracting) {
      earthRef.current.rotation.y += 0.05 * delta;
    }
  });

  // Calculate ISS 3D Position
  const [issPos, setIssPos] = useState<[number, number, number]>([0, 0, 0]);
  const [trail, setTrail] = useState<THREE.Vector3[]>([]);

  useEffect(() => {
    if (issLat !== undefined && issLon !== undefined) {
      const newPos = latLonToVector3(issLat, issLon, 2.25);
      setIssPos(newPos);
      setTrail((prev) => {
        const newTrail = [...prev, new THREE.Vector3(...newPos)];
        if (newTrail.length > 200) newTrail.shift();
        return newTrail;
      });
    }
  }, [issLat, issLon]);

  return (
    <group>
      <ambientLight intensity={0.4} />

      <group ref={earthRef}>
        {/* Earth Base Mesh */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={textures.map}
            bumpMap={textures.bumpMap}
            bumpScale={0.05}
            roughnessMap={textures.roughnessMap}
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>

        /* Clouds Mesh (slightly larger) */

        {/* Atmosphere Glow Mesh (translucent blue border) */}
        <mesh>
          <sphereGeometry args={[2.08, 32, 32]} />
          <meshBasicMaterial
            color="#00a8ff"
            transparent={true}
            opacity={0.08}
            side={THREE.BackSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* ISS satellite marker */}
        {showISS && issLat !== undefined && issLon !== undefined && (
          <group ref={issRef} position={issPos} scale={isHovered ? 1.5 : 1} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
            {/* Main Body */}
            <mesh>
              <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Solar Panels */}
            <mesh rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[0.02, 0.25, 0.06]} />
              <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]}>
              <boxGeometry args={[0.02, 0.25, 0.06]} />
              <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        )}

        {/* Orbital Trail */}
        {showISS && trail.length > 1 && (
          <Line
            points={trail}
            color="#06b6d4"
            lineWidth={2}
            transparent={true}
            opacity={0.4}
          />
        )}

        {/* Space Weather Visuals */}
        {showWeather && (
          <>
            <AuroraZone />
            <SolarStormParticles />
          </>
        )}

        {/* Passed in Markers (NEOs, Launches) */}
        {children}
      </group>
    </group>
  );
}

// Export wrapped in a default export so the parent Suspense boundary works
export default function EarthMesh(props: EarthMeshProps) {
  return <EarthMeshInner {...props} />;
}
