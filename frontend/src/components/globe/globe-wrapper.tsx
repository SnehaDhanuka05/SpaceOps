"use client";
import { useSpaceStore } from "@/store/use-space-store";

import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import EarthMesh from "./earth-mesh";
import NEOMarker from "./neo-marker";
import LaunchMarker from "./launch-marker";
import { latLonToVector3 } from "@/utils/coords";
import { useNEOHazards, useLaunchSchedule, useISS } from "@/hooks/use-space-data";

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
  earthRef,
}: {
  issLat?: number;
  issLon?: number;
  trackISS: boolean;
  setIsInteracting: (val: boolean) => void;
  earthRef: React.RefObject<THREE.Group | null>;
}) {
  const { camera } = useThree();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useFrame(() => {
    if (trackISS && issLat !== undefined && issLon !== undefined && controlsRef.current) {
      // Get ISS 3D coordinates
      const [x, y, z] = latLonToVector3(issLat, issLon, 2.25);
      const targetPos = new THREE.Vector3(x, y, z);

      // Apply Earth's current rotation to get the world position
      if (earthRef.current) {
        targetPos.applyEuler(earthRef.current.rotation);
      }

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
  trackISS = false,
}: GlobeWrapperProps) {
  const earthRef = useRef<THREE.Group>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const issLocation = useSpaceStore((state) => state.issLocation);
  const { data: issData } = useISS();
  const issLat = issLocation?.latitude ?? issData?.latitude;
  const issLon = issLocation?.longitude ?? issData?.longitude;
  const hoveredNeoId = useSpaceStore((state) => state.hoveredNeoId);
  const hoveredLaunchId = useSpaceStore((state) => state.hoveredLaunchId);
  const setSelectedEntity = useSpaceStore((state) => state.setSelectedEntity);
  const showISS = useSpaceStore((state) => state.showISS);
  const showNEOs = useSpaceStore((state) => state.showNEOs);
  const showLaunches = useSpaceStore((state) => state.showLaunches);
  const showWeather = useSpaceStore((state) => state.showWeather);

  const { data: neoData } = useNEOHazards(true, 10); // Fetch top 10 hazardous NEOs
  const { data: launchesData } = useLaunchSchedule(10); // Fetch upcoming launches

  return (
    <div className="w-full h-full relative bg-[#03030c]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
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
            intensity={2}
            castShadow
          />

          {/* Gentle fill light */}
          <ambientLight intensity={0.5} />

          {/* Earth Mesh and its intrinsic visuals (trails, weather) */}
          <EarthMesh
            earthGroupRef={earthRef}
            issLat={issLat}
            issLon={issLon}
            isInteracting={isInteracting}
            autoRotate={!trackISS}
            showISS={showISS}
            showWeather={showWeather}
          >
            {/* NEO Hazard Markers */}
            {showNEOs && neoData?.map((neo) => (
              <NEOMarker
                key={neo.id}
                neo={neo}
                isHovered={hoveredNeoId === neo.neo_reference_id}
                onClick={() => setSelectedEntity({ id: neo.neo_reference_id, type: 'neo' })}
              />
            ))}

            {/* Launch Site Markers */}
            {showLaunches && launchesData?.map((launch) => (
              <LaunchMarker
                key={launch.id}
                launch={launch}
                isHovered={hoveredLaunchId === launch.launch_id}
                onClick={() => setSelectedEntity({ id: launch.launch_id, type: 'launch' })}
              />
            ))}
          </EarthMesh>

          <CameraController
            issLat={issLat}
            issLon={issLon}
            trackISS={trackISS}
            setIsInteracting={setIsInteracting}
            earthRef={earthRef}
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
