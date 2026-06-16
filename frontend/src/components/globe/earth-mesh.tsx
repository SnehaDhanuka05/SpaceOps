"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { latLonToVector3 } from "@/utils/coords";

interface EarthMeshProps {
  issLat?: number;
  issLon?: number;
  autoRotate: boolean;
  isInteracting: boolean;
}

function EarthMeshInner({
  issLat,
  issLon,
  autoRotate,
  isInteracting,
}: EarthMeshProps) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const issRef = useRef<THREE.Group>(null);

  // Load textures using drei's useTexture (works correctly with Suspense)
  const textures = useTexture({
    map: "/earth-blue-marble.jpg",
    bumpMap: "/earth-topology.png",
    roughnessMap: "/earth-water.png",
    emissiveMap: "/earth-night.jpg",
  });

  // Generate procedural cloud texture on the client
  const proceduralClouds = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 1024, 512);
      for (let i = 0; i < 350; i++) {
        const x = Math.random() * 1024;
        const y = Math.random() * 512;
        const r = 20 + Math.random() * 50;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.4)");
        grad.addColorStop(0.3, "rgba(240, 248, 255, 0.2)");
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Rotate Earth and clouds
  useFrame((state, delta) => {
    if (earthRef.current && autoRotate && !isInteracting) {
      earthRef.current.rotation.y += 0.05 * delta;
    }
    if (cloudRef.current && autoRotate && !isInteracting) {
      cloudRef.current.rotation.y += 0.06 * delta;
      cloudRef.current.rotation.x += 0.01 * delta;
    }
  });

  // Calculate ISS 3D Position
  const [issPos, setIssPos] = useState<[number, number, number]>([0, 0, 0]);

  useEffect(() => {
    if (issLat !== undefined && issLon !== undefined) {
      setIssPos(latLonToVector3(issLat, issLon, 2.25));
    }
  }, [issLat, issLon]);

  return (
    <group>
      <ambientLight intensity={0.4} />

      {/* Earth Base Mesh */}
      <mesh ref={earthRef} castShadow receiveShadow>
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

      {/* Clouds Mesh (slightly larger) */}
      {proceduralClouds && (
        <mesh ref={cloudRef}>
          <sphereGeometry args={[2.02, 64, 64]} />
          <meshStandardMaterial
            alphaMap={proceduralClouds}
            transparent={true}
            depthWrite={false}
            blending={THREE.NormalBlending}
            opacity={0.35}
            color="#ffffff"
          />
        </mesh>
      )}

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
      {issLat !== undefined && issLon !== undefined && (
        <group ref={issRef} position={issPos}>
          {/* Beacon pulse */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent={true}
              opacity={0.6}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh scale={[1.8, 1.8, 1.8]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshBasicMaterial
              color="#06b6d4"
              transparent={true}
              opacity={0.25}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Tiny structural model representing solar panels */}
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
    </group>
  );
}

// Export wrapped in a default export so the parent Suspense boundary works
export default function EarthMesh(props: EarthMeshProps) {
  return <EarthMeshInner {...props} />;
}
