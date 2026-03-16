import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Web-only animated background using three.js r182.
 * On native platforms this renders nothing.
 */
export function ThreeBackground() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cleanup: (() => void) | undefined;

    const ensureScriptAndStart = () => {
      const win = window as typeof window & { THREE?: any };
      if (win.THREE) {
        cleanup = initScene(win.THREE);
        return;
      }

      const existingScript = document.getElementById('three-bg-script') as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (win.THREE) {
            cleanup = initScene(win.THREE);
          }
        });
        return;
      }

      const script = document.createElement('script');
      script.id = 'three-bg-script';
      script.src = 'https://unpkg.com/three@0.182.0/build/three.min.js';
      script.async = true;
      script.onload = () => {
        if (win.THREE) {
          cleanup = initScene(win.THREE);
        }
      };
      document.body.appendChild(script);
    };

    const initScene = (THREE: any) => {
      const existing = document.getElementById('three-bg-canvas') as HTMLCanvasElement | null;
      if (existing) {
        return () => {};
      }

      const canvas = document.createElement('canvas');
      canvas.id = 'three-bg-canvas';
      canvas.style.position = 'fixed';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = '-1';
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x020617, 0.0025);

      const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 40);

      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
      });
      renderer.setPixelRatio(window.devicePixelRatio || 1);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x020617, 1);

      const particleCount = 750;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const speeds = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 160;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
        speeds[i] = 0.04 + Math.random() * 0.09;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const colors = new Float32Array(particleCount * 3);
      const color = new THREE.Color();
      for (let i = 0; i < particleCount; i++) {
        color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.6);
        colors[i * 3 + 0] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
      });

      const points = new THREE.Points(geometry, material);
      scene.add(points);

      let frameId: number | null = null;

      const onResize = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', onResize);

      let t = 0;
      const animate = () => {
        frameId = requestAnimationFrame(animate);

        t += 0.0025;
        const pos = geometry.getAttribute('position') as any;
        const arr = pos.array as Float32Array;

        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3 + 1;
          arr[idx] += speeds[i];
          if (arr[idx] > 50) {
            arr[idx] = -50;
          }
        }

        pos.needsUpdate = true;

        camera.position.x = Math.sin(t) * 6;
        camera.position.y = Math.cos(t * 0.5) * 3;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        if (frameId !== null) cancelAnimationFrame(frameId);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        scene.clear();
        if (canvas.parentElement) {
          canvas.parentElement.removeChild(canvas);
        }
      };
    };

    ensureScriptAndStart();

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return null;
}

