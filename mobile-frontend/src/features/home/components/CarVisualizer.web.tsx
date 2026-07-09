/* eslint-disable react/no-unknown-property */
import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { View, Text } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage } from '@react-three/drei';
import twrnc from 'twrnc';
import { AutoResetCamera } from './AutoResetCamera';

type CarModelProps = {
  modelUrl: string;
  carColor: string;
};

function CarModel({ modelUrl, carColor }: CarModelProps) {
  // Load the GLTF model from the HTTP URL
  const { scene } = useGLTF(modelUrl);
  
  // Clone the scene so we don't mutate the cached one if there are multiple cars
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        const name = child.name.toLowerCase();
        if (
          name.includes('body') || 
          name.includes('paint') || 
          name.includes('shell') ||
          child.material.name.toLowerCase().includes('body') ||
          child.material.name.toLowerCase().includes('paint') ||
          child.material.name.toLowerCase().includes('attitude_black_pbr_shader53')
        ) {
          child.material = child.material.clone();
          child.material.color.set(carColor);
        }
      }
    });
  }, [clonedScene, carColor]);
  
  return <primitive object={clonedScene} />;
}

export function CarVisualizer({ modelUrl, carColor = '#ffffff', fallbackImage }: { modelUrl: string, carColor?: string, fallbackImage?: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const controlsRef = useRef<any>(null);

  // We use a simple fetch to pre-check if the GLTF URL exists
  useEffect(() => {
    fetch(modelUrl, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          console.error("3D Model fetch failed:", res.status, res.statusText, modelUrl);
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
      {/* On the web, we use standard react-three-fiber Canvas */}
      <Canvas camera={{ position: [-5, 1.5, 5], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <color attach="background" args={['#f1f5f9']} />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />
        
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} adjustCamera={0.7}>
            <CarModel modelUrl={modelUrl} carColor={carColor} />
          </Stage>
        </Suspense>

        <OrbitControls 
          ref={controlsRef}
          enableZoom={true} 
          enablePan={false}
          autoRotate={false} 
          maxPolarAngle={Math.PI / 2 + 0.1} 
          minPolarAngle={Math.PI / 6}
        />
        
        <AutoResetCamera controlsRef={controlsRef} defaultPosition={[-5, 1.5, 5]} />
      </Canvas>
      
      {/* Loading overlay for the 3D Model */}
      <View style={twrnc`absolute top-2 right-4 bg-black/30 px-3 py-1 rounded-full`}>
         <Text style={twrnc`text-[10px] text-white font-bold tracking-widest`}>3D INTERACTIVE (WEB)</Text>
      </View>
    </View>
  );
}
