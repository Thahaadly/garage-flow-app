/* eslint-disable react/no-unknown-property */
import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei/native';
import twrnc from 'twrnc';
import { AutoResetCamera } from './AutoResetCamera';

import { useAssets } from 'expo-asset';

type CarModelProps = {
  modelUrl: string | number;
  carColor: string;
};

function CarModelInner({ resolvedUrl, carColor }: { resolvedUrl: string, carColor: string }) {
  // Load the GLTF model from the resolved URI or HTTP URL
  const { scene } = useGLTF(resolvedUrl);
  
  // Clone the scene so we don't mutate the cached one if there are multiple cars
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Here we attempt to colorize the body.
        // We apply it to meshes containing "body" or "paint" in their name,
        // or standard meshes if the model has a very generic structure.
        const name = child.name.toLowerCase();
        if (
          name.includes('body') || 
          name.includes('paint') || 
          name.includes('shell') ||
          child.material.name.toLowerCase().includes('body') ||
          child.material.name.toLowerCase().includes('paint') ||
          child.material.name.toLowerCase().includes('attitude_black_pbr_shader53')
        ) {
          // Clone material to avoid affecting other parts sharing the same material
          child.material = child.material.clone();
          child.material.color.set(carColor);
        }
      }
    });
  }, [clonedScene, carColor]);
  
  return <primitive object={clonedScene} />;
}

function CarModel({ modelUrl, carColor }: CarModelProps) {
  // If it's a local require() number, useAssets will resolve it to a local URI
  const [assets] = useAssets(typeof modelUrl === 'number' ? [modelUrl] : []);
  
  const resolvedUrl = typeof modelUrl === 'number' 
    ? (assets && assets.length > 0 ? assets[0].uri || assets[0].localUri : null)
    : modelUrl;

  if (!resolvedUrl) {
    return null; // Still loading the local asset URI
  }

  return <CarModelInner resolvedUrl={resolvedUrl} carColor={carColor} />;
}

export type CarVisualizerProps = {
  modelUrl: string | number;
  carColor: string;
  fallbackImage?: React.ReactNode;
};

export function CarVisualizer({ modelUrl, carColor = '#ffffff', fallbackImage }: CarVisualizerProps) {
  const [hasError, setHasError] = useState(false);
  const controlsRef = useRef<any>(null);

  // We use a simple fetch to pre-check if the GLTF URL exists before rendering the Canvas
  useEffect(() => {
    // If it's a local bundled asset (number from require()), skip HTTP check
    if (typeof modelUrl === 'number') {
      setHasError(false);
      return;
    }

    // Ping the URL to verify it is reachable
    fetch(modelUrl, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          console.warn("3D Model fetch failed:", res.status, res.statusText, modelUrl);
          setHasError(true);
        }
      })
      .catch((err) => {
        console.error("3D Model fetch network error:", err, modelUrl);
        setHasError(true);
      });
  }, [modelUrl]);

  if (hasError && fallbackImage) {
    return <>{fallbackImage}</>;
  }

  return (
    <View style={twrnc`flex-1 h-64 w-full rounded-3xl overflow-hidden bg-slate-100 items-center justify-center`}>
      <Canvas camera={{ position: [-5, 1.5, 5], fov: 45 }}>
        <color attach="background" args={['#f1f5f9']} />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          {/* Stage automatically centers and scales the model */}
          <Stage environment="city" intensity={0.5} adjustCamera={0.75}>
            <CarModel modelUrl={modelUrl} carColor={carColor} />
          </Stage>
        </Suspense>

        {/* OrbitControls allow the user to swipe and rotate the 3D model */}
        <OrbitControls 
          ref={controlsRef}
          enableZoom={true} 
          enablePan={false}
          autoRotate={false} 
          maxPolarAngle={Math.PI / 2 + 0.1} // Prevent looking completely from underneath
          minPolarAngle={Math.PI / 6}
        />
        
        <AutoResetCamera controlsRef={controlsRef} defaultPosition={[-5, 1.5, 5]} />
      </Canvas>
      
      {/* Loading overlay for the 3D Model */}
      <View style={twrnc`absolute top-2 right-4 bg-black/30 px-3 py-1 rounded-full`}>
         <Text style={twrnc`text-[10px] text-white font-bold tracking-widest`}>3D INTERACTIVE</Text>
      </View>
    </View>
  );
}
