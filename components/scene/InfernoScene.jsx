"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameLoop } from "@/lib/state/gameStore";
import { usePowerupCatalog } from "@/lib/constants/powerups";

function createFirefighter() {
  const geometry = new THREE.CapsuleGeometry(0.6, 1.4, 8, 16);
  const material = new THREE.MeshStandardMaterial({
    color: "#ffb347",
    emissive: "#ff4b1f",
    emissiveIntensity: 0.3,
    metalness: 0.1,
    roughness: 0.6
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 1, 0);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createFireZone() {
  const group = new THREE.Group();
  const flameMaterial = new THREE.MeshStandardMaterial({
    color: "#ff4b1f",
    emissive: "#ff2d00",
    emissiveIntensity: 1.5
  });

  for (let idx = 0; idx < 6; idx += 1) {
    const mesh = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 8, 1), flameMaterial);
    const angle = (idx / 6) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * 1.4, 0.4, Math.sin(angle) * 1.4);
    mesh.castShadow = true;
    group.add(mesh);
  }

  group.position.set(0, 0, -4);
  return { group, flameMaterial };
}

function createCivilianBeacon() {
  const geometry = new THREE.IcosahedronGeometry(0.6, 0);
  const material = new THREE.MeshStandardMaterial({
    color: "#4dd0ff",
    emissive: "#2fb7ff",
    emissiveIntensity: 1.8
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(-2.5, 1.4, -6);
  mesh.castShadow = true;
  return mesh;
}

function createPowerupOrbs(powerups) {
  const group = new THREE.Group();
  powerups.forEach((powerup, index) => {
    const geometry = new THREE.SphereGeometry(0.35, 24, 24);
    const material = new THREE.MeshStandardMaterial({
      color: powerup.tint,
      emissive: powerup.tint,
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.85
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, index * 0.9, 0);
    mesh.castShadow = true;
    group.add(mesh);
  });

  group.position.set(2.5, 0.8, -5);
  return group;
}

function createSmokeLayer() {
  const geometry = new THREE.CircleGeometry(10, 32);
  const material = new THREE.MeshBasicMaterial({ color: "#2a2a2a", opacity: 0.15, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(Math.PI / 2, 0, 0);
  mesh.position.set(0, 6, -4);
  return mesh;
}

function createStarsField(count = 3000) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 20 + Math.random() * 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: "#ffffff", size: 0.12, sizeAttenuation: true, transparent: true, opacity: 0.75 });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return points;
}

export function InfernoScene() {
  const mountRef = useRef(null);
  const powerups = usePowerupCatalog();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#060606");
    scene.fog = new THREE.Fog("#060606", 10, 35);

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 6, 8);
    camera.lookAt(0, 1, -4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(new THREE.Color("#ff7f50"), 2.5);
    directionalLight.position.set(6, 12, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(1024, 1024);
    scene.add(directionalLight);

    const beaconLight = new THREE.PointLight(new THREE.Color("#4dd0ff"), 1.3, 10);
    beaconLight.position.set(-3, 3, -3);
    scene.add(beaconLight);

    const firefighter = createFirefighter();
    scene.add(firefighter);

    const fireZone = createFireZone();
    scene.add(fireZone.group);

    const civilianBeacon = createCivilianBeacon();
    scene.add(civilianBeacon);

    const powerupOrbs = createPowerupOrbs(powerups);
    scene.add(powerupOrbs);

    const smokeLayer = createSmokeLayer();
    scene.add(smokeLayer);

    const starsField = createStarsField();
    scene.add(starsField);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: "#202020", metalness: 0.2, roughness: 0.9 })
    );
    ground.rotation.set(-Math.PI / 2, 0, 0);
    ground.receiveShadow = true;
    scene.add(ground);

    const resizeHandler = () => {
      const newWidth = mount.clientWidth;
      const newHeight = mount.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", resizeHandler);

    let elapsed = 0;
    const clock = new THREE.Clock();
    let rafId = 0;

    const animate = () => {
      const delta = clock.getDelta();
      elapsed += delta;

      const state = useGameLoop.getState();
      firefighter.position.x += state.velocity.x * delta;
      firefighter.position.z += state.velocity.z * delta;
      firefighter.rotation.y = THREE.MathUtils.lerp(
        firefighter.rotation.y,
        Math.atan2(state.velocity.x, state.velocity.z || 1),
        0.2
      );

      const intensity = (Math.sin(elapsed * 2) + 1.5) / 2;
      fireZone.flameMaterial.emissiveIntensity = 1.2 + intensity * 0.8;
      fireZone.group.children.forEach((child, index) => {
        child.position.y = 0.3 + Math.sin(elapsed * 3 + index) * 0.2;
      });
      fireZone.group.rotation.y += delta * 0.1;
      renderer.setClearColor(new THREE.Color(0.03 + intensity * 0.02, 0.02, 0.02), 1);

      civilianBeacon.rotation.y += delta * 0.6;
      const beaconScale = 1 + Math.sin(elapsed * 1.2) * 0.1;
      civilianBeacon.scale.set(beaconScale, beaconScale, beaconScale);

      powerupOrbs.children.forEach((child, index) => {
        child.position.x = Math.sin(elapsed * 1.5 + index) * 0.1;
      });

      smokeLayer.rotation.z += delta * 0.02;
      starsField.rotation.y += delta * 0.02;

      const heatHaze = (1 - state.oxygen / 100) * 0.4;
      const fog = (state.difficultyLevel / 10) * 0.2;
      document.body.style.setProperty("--heat-haze", heatHaze.toFixed(2));
      document.body.style.setProperty("--smoke-density", fog.toFixed(2));
      document.title = `Inferno Run — T${state.time.toFixed(0)} · O${state.oxygen.toFixed(0)} · W${state.water.toFixed(0)}`;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeHandler);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, [powerups]);

  return <div ref={mountRef} className="relative h-screen w-full bg-black" />;
}
