"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Stars } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { useGameLoop } from "@/lib/state/gameStore";
import { usePowerupCatalog } from "@/lib/constants/powerups";

function FirefighterAvatar() {
  const ref = useRef<THREE.Mesh>(null);
  const { velocity } = useGameLoop((state) => ({ velocity: state.velocity }));

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.position.x += velocity.x * delta;
    ref.current.position.z += velocity.z * delta;
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, Math.atan2(velocity.x, velocity.z || 1), 0.2);
  });

  return (
    <mesh ref={ref} position={[0, 1, 0]}>
      <capsuleGeometry args={[0.6, 1.4, 8, 16]} />
      <meshStandardMaterial color="#ffb347" emissive="#ff4b1f" emissiveIntensity={0.3} metalness={0.1} roughness={0.6} />
    </mesh>
  );
}

function FireZone() {
  const group = useRef<THREE.Group>(null);
  const [elapsed, setElapsed] = useState(0);
  const flameMaterial = useRef(new THREE.MeshStandardMaterial({ color: "#ff4b1f", emissive: "#ff2d00", emissiveIntensity: 1.5 }));

  useFrame((state, delta) => {
    setElapsed((prev) => prev + delta);
    if (!group.current) return;

    const intensity = (Math.sin(elapsed * 2) + 1.5) / 2;
    flameMaterial.current.emissiveIntensity = 1.2 + intensity * 0.8;
    group.current.children.forEach((child, index) => {
      child.position.y = 0.3 + Math.sin(elapsed * 3 + index) * 0.2;
    });

    group.current.rotation.y += delta * 0.1;
    state.gl.setClearColor(new THREE.Color(0.03 + intensity * 0.02, 0.02, 0.02), 1);
  });

  return (
    <group ref={group} position={[0, 0, -4]}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <mesh key={idx} position={[Math.cos((idx / 6) * Math.PI * 2) * 1.4, 0.4, Math.sin((idx / 6) * Math.PI * 2) * 1.4]}>
          <coneGeometry args={[0.4, 1.2, 8, 1]} />
          <primitive object={flameMaterial.current} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function CivilianBeacon() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [timeline] = useState(() => gsap.timeline({ repeat: -1, yoyo: true }));

  useEffect(() => {
    if (!meshRef.current) return;
    timeline.clear();
    timeline.to(meshRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 1.4, ease: "sine.inOut" });
    timeline.pause(0);
  }, [timeline]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      position={[-2.5, 1.4, -6]}
      onPointerOver={() => timeline.play()}
      onPointerOut={() => timeline.pause(0)}
    >
      <icosahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color="#4dd0ff" emissive="#2fb7ff" emissiveIntensity={1.8} />
    </mesh>
  );
}

function PowerupOrbs() {
  const powerups = usePowerupCatalog();

  return (
    <group position={[2.5, 0.8, -5]}>
      {powerups.map((powerup, index) => (
        <mesh key={powerup.id} position={[0, index * 0.9, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshStandardMaterial color={powerup.tint} emissive={powerup.tint} emissiveIntensity={1.4} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function SmokeLayer() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * 0.02;
  });

  return (
    <mesh ref={ref} position={[0, 6, -4]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[10, 32]} />
      <meshBasicMaterial color="#2a2a2a" opacity={0.15} transparent />
    </mesh>
  );
}

function SceneContent() {
  const { difficultyLevel, oxygen, water, time } = useGameLoop((state) => ({
    difficultyLevel: state.difficultyLevel,
    oxygen: state.oxygen,
    water: state.water,
    time: state.time
  }));

  useFrame(() => {
    const heatHaze = (1 - oxygen / 100) * 0.4;
    const fog = (difficultyLevel / 10) * 0.2;
    document.body.style.setProperty("--heat-haze", heatHaze.toFixed(2));
    document.body.style.setProperty("--smoke-density", fog.toFixed(2));
    document.title = `Inferno Run — T${time.toFixed(0)} · O${oxygen.toFixed(0)} · W${water.toFixed(0)}`;
  });

  return (
    <group>
      <FirefighterAvatar />
      <FireZone />
      <CivilianBeacon />
      <PowerupOrbs />
      <SmokeLayer />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#202020" metalness={0.2} roughness={0.9} />
      </mesh>
    </group>
  );
}

export function InfernoScene() {
  return (
    <div className="relative h-screen w-full">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#060606"]} />
        <fog attach="fog" args={["#060606", 10, 35]} />
        <PerspectiveCamera makeDefault position={[0, 6, 8]} fov={60} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[6, 12, 6]}
          intensity={2.5}
          castShadow
          color="#ff7f50"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-3, 3, -3]} intensity={1.3} color="#4dd0ff" distance={10} />
        <Stars radius={30} depth={20} count={3000} factor={2} fade speed={0.6} />
        <SceneContent />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
    </div>
  );
}
