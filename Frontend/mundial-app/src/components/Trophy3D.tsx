'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import type { Group } from 'three';

/* TV-camera rig: cinematic zoom in/out + slow arc */
function CameraRig() {
  const { camera } = useThree();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Continuous orbit — starts from aerial top-right view, full lap ~70s
    const arc = t * 0.14 + Math.PI * 0.55;

    // Starts close (2.4) and zooms out to 4.8 — phase offset so sin=-1 at t=0
    const dist = 3.6 + Math.sin(t * 0.08 - Math.PI / 2) * 1.2;

    // Elevation ~52° — high enough for aerial view without losing the stadium
    const height = dist * 1.30;

    camera.position.x = Math.sin(arc) * dist;
    camera.position.z = Math.cos(arc) * dist;
    camera.position.y = height;

    camera.lookAt(0, 0, 0);
  });

  return null;
}

function TrophyScene() {
  const { scene } = useGLTF('/e9fadbdacccde217a1be5a782605c3b8.glb');
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.22;
    ref.current.position.y = Math.sin(clock.getElapsedTime() * 0.55) * 0.06;
  });

  return <primitive ref={ref} object={scene} scale={5.5} />;
}

useGLTF.preload('/e9fadbdacccde217a1be5a782605c3b8.glb');

export default function Trophy3D() {
  return (
    <Canvas
      camera={{ position: [0, 3.1, 2.4], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 7, 5]} intensity={2.2} color="#fff8e7" />
        <pointLight position={[-5, 3, -2]} intensity={2.4} color="#22d3ee" />
        <pointLight position={[5, -2, 4]} intensity={1.8} color="#fbbf24" />
        <pointLight position={[0, 9, 1]} intensity={0.9} color="#ffffff" />

        <CameraRig />
        <TrophyScene />
      </Suspense>
    </Canvas>
  );
}
