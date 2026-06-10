'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
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

// NOTA: el modelo .glb pesa ~39 MB. NO se hace `useGLTF.preload(...)` a nivel de
// módulo a propósito: precargarlo competía con los recursos críticos del login
// (CSS, JS, fuentes) y retrasaba la primera pintura. Se carga de forma diferida
// cuando el Canvas se monta (ver gate de "idle" abajo), dentro de <Suspense>.
// Mejora pendiente recomendada: recomprimir el modelo con Draco/meshopt para
// bajarlo a pocos MB.

export default function Trophy3D() {
  // Difiere el montaje del Canvas (y la descarga del modelo) hasta que el
  // navegador esté libre tras la primera pintura, para que el login aparezca ya.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as any;
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;

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
