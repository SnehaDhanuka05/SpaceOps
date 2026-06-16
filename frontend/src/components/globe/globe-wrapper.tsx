"use client";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import EarthMesh from "./earth-mesh";
import { latLonToVector3 } from "@/utils/coords";

interface GlobeWrapperProps {
  issLat?: number;
  issLon?: number;
  trackISS?: boolean;
}

// Subcomponent to animate camera/controls target
function CameraController({
  issLat,
  issLon,
  trackISS,
  setIsInteracting,
}: {
  issLat?: number;
  issLon?: number;
  trackISS: boolean;
  setIsInteracting: (val: boolean) => void;
}) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (trackISS && issLat !== undefined && issLon !== undefined && controlsRef.current) {
      // Get ISS 3D coordinates
      const [x, y, z] = latLonToVector3(issLat, issLon, 2.25);
      const targetPos = new THREE.Vector3(x, y, z);

      // Smoothly lerp control target to ISS position
      controlsRef.current.target.lerp(targetPos, 0.05);

      // Maintain a relative camera distance but look at ISS
      const relativeCamDir = camera.position.clone().sub(controlsRef.current.target).normalize();
      const desiredCamPos = controlsRef.current.target.clone().add(relativeCamDir.multiplyScalar(4.5));
      camera.position.lerp(desiredCamPos, 0.05);

      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={2.8}
      maxDistance={10}
      onStart={() => setIsInteracting(true)}
      onEnd={() => {
        // Delay resetting interaction slightly so it doesn't snap instantly
        setTimeout(() => setIsInteracting(false), 1000);
      }}
    />
  );
}

export default function GlobeWrapper({
  issLat,
  issLon,
  trackISS = false,
}: GlobeWrapperProps) {
  const [isInteracting, setIsInteracting] = useState(false);

  return (
    <div className="w-full h-full relative bg-[#03030c]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {/* Cosmic Starfield */}
          <Stars
            radius={100}
            depth={50}
            count={3000}
            factor={4}
            saturation={0.5}
            fade
            speed={1}
          />

          {/* Core sunlight (Directional) */}
          <directionalLight
            position={[5, 3, 5]}
            intensity={1.5}
            castShadow
          />

          {/* Gentle fill light */}
          <ambientLight intensity={0.1} />

          {/* Rotating Earth, atmosphere and ISS satellite */}
          <EarthMesh
            issLat={issLat}
            issLon={issLon}
            autoRotate={!trackISS}
            isInteracting={isInteracting}
          />

          <CameraController
            issLat={issLat}
            issLon={issLon}
            trackISS={trackISS}
            setIsInteracting={setIsInteracting}
          />
        </Suspense>
      </Canvas>

      {/* Floating coordinates indicator */}
      {issLat !== undefined && issLon !== undefined && (
        <div className="absolute bottom-6 left-6 z-20 font-mono text-[10px] text-zinc-400 bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5 space-y-1">
          <span className="text-cyan-400 font-bold block mb-1">TARGET LOCK: ISS</span>
          <div>LAT: {issLat.toFixed(6)}°</div>
          <div>LON: {issLon.toFixed(6)}°</div>
        </div>
      )}
    </div>
  );
}
