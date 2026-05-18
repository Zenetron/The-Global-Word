'use client';

import { useEffect, useState, useRef } from 'react';
import { extend, Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import ThreeGlobe from 'three-globe';
import * as THREE from 'three';

extend({ ThreeGlobe });

interface GlobeProps {
  data: { lat: number; lng: number; size: number; text: string; color: string; country?: string }[];
  ringsData?: { lat: number; lng: number; color: string; maxRadius?: number }[];
  focusCoords?: { lat: number; lng: number; distance?: number } | null;
  onWordClick?: (word: string, country: string, lat?: number, lng?: number) => void;
}

function GlobeInstance({ data, ringsData, onWordClick }: GlobeProps) {
  const [globe, setGlobe] = useState<ThreeGlobe | null>(null);

  useEffect(() => {
    const instance = new ThreeGlobe();
    instance
      .showAtmosphere(true)
      .atmosphereColor('#8000ff') // Halo violet cyber
      .atmosphereAltitude(0.12);

    const material = instance.globeMaterial() as THREE.MeshPhongMaterial;
    if (material) {
      material.color = new THREE.Color('#ffffff');
      material.emissive = new THREE.Color('#111111');
      material.emissiveIntensity = 0.5;
    }

    // Defer texture loading/decoding to avoid blocking initial user interaction
    setTimeout(() => {
      instance
        .globeImageUrl('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png');
    }, 800);

    setGlobe(instance);
  }, []);

  useEffect(() => {
    if (!globe) return;
    globe
      .labelsData(data)
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.text)
      .labelColor((d: any) => d.color)
      .labelAltitude(0.05)
      .labelSize((d: any) => d.size * 1.5 || 1.5)
      .labelDotRadius(0.5)
      .labelResolution(3); // Résolution optimisée (3 au lieu de 6) pour 250+ pays
  }, [globe, data]);

  useEffect(() => {
    if (!globe) return;
    globe
      .ringsData(ringsData || [])
      .ringColor((d: any) => (t: number) => `rgba(${d.color === '#00ffff' ? '0,255,255' : '128,0,255'},${1 - t})`)
      .ringMaxRadius(15)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(1000);
  }, [globe, ringsData]);

  if (!globe) return null;

  return (
    <primitive 
      object={globe} 
      onClick={(e: any) => {
        e.stopPropagation();
        console.log('Clicked on object:', e.object);

        const data = e.object?.__data || e.object?.parent?.__data || e.object?.userData;
        console.log('Object data:', data);

        if (data && data.text) {
          if (onWordClick) {
            onWordClick(data.text, data.country || 'Pays inconnu', data.lat, data.lng);
          }
        } else if (data && data.country) {

            console.log('Country clicked:', data.country);
        }
      }}
    />
  );
}

export default function GlobeComponent({ data, ringsData, focusCoords, onWordClick }: GlobeProps) {
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (focusCoords && controlsRef.current) {
      const phi = (90 - focusCoords.lat) * (Math.PI / 180);
      const theta = (90 - focusCoords.lng) * (Math.PI / 180);
      const r = focusCoords.distance || 180; // Distance de zoom par défaut ou personnalisée
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      controlsRef.current.object.position.set(x, y, z);
      controlsRef.current.update();
    }
  }, [focusCoords]);

  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 300] }}>
        <ambientLight intensity={2} />
        <directionalLight position={[300, 300, 300]} intensity={3} color="#ffffff" />
        
        <pointLight position={[-300, 0, 300]} intensity={20} color="#8000ff" />
        <pointLight position={[300, 0, -300]} intensity={20} color="#00ffff" />
        
        <GlobeInstance data={data} ringsData={ringsData} onWordClick={onWordClick} />
        
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableZoom={true}
          minDistance={120}
          maxDistance={600}
          autoRotate={!focusCoords}
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
