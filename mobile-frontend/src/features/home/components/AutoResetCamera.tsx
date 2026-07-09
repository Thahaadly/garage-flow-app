import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber/native';

export function AutoResetCamera({ controlsRef, defaultPosition }: { controlsRef: React.RefObject<any>, defaultPosition: [number, number, number] }) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const targetPos = useMemo(() => new THREE.Vector3(...defaultPosition), [defaultPosition]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    let timeout: NodeJS.Timeout;

    const handleStart = () => {
      setIsInteracting(true);
      setShouldReset(false);
      clearTimeout(timeout);
    };

    const handleEnd = () => {
      setIsInteracting(false);
      timeout = setTimeout(() => {
        setShouldReset(true);
      }, 2000); // 2 seconds delay before snapping back
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      clearTimeout(timeout);
    };
  }, [controlsRef]);

  useFrame((state, delta) => {
    if (shouldReset && !isInteracting && controlsRef.current) {
      state.camera.position.lerp(targetPos, delta * 3);
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), delta * 3);
      controlsRef.current.update();
      
      if (state.camera.position.distanceTo(targetPos) < 0.05) {
        setShouldReset(false);
      }
    }
  });

  return null;
}
