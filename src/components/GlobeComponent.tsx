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
  const [globe] = useState(() => new ThreeGlobe());
  const lastUpdateDist = useRef<number>(0);

  useEffect(() => {
    // Mode Ultra Premium : Image claire + Glow
    globe
      .globeImageUrl('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-topology.png')
      .showAtmosphere(true)
      .atmosphereColor('#8000ff') // Halo violet cyber
      .atmosphereAltitude(0.12);

    // Gérer les mots flottants en mode HTML
    globe
      .htmlElementsData(data)
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlElement((d: any) => {
        const el = document.createElement('div');
        el.style.color = d.color;
        el.style.fontWeight = 'bold';
        el.style.fontSize = '14px';
        el.style.padding = '2px 8px';
        el.style.background = 'rgba(0,0,0,0.6)';
        el.style.borderRadius = '10px';
        el.style.border = `1px solid ${d.color}88`;
        el.style.whiteSpace = 'nowrap';
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.textContent = d.text;
        
        el.onclick = () => {
          if (onWordClick) onWordClick(d.text, d.country || 'Pays inconnu', d.lat, d.lng);
        };
        return el;
      })
      .htmlAltitude(0.06);

    // Gérer les ondes de choc (Rings)
    globe
      .ringsData(ringsData || [])
      .ringColor((d: any) => (t: number) => `rgba(${d.color === '#00ffff' ? '0,255,255' : '128,0,255'},${1 - t})`)
      .ringMaxRadius(15)
      .ringPropagationSpeed(3)
      .ringRepeatPeriod(1000);

    // Ajuster le matériel du globe de base pour qu'il soit bien visible
    const material = globe.globeMaterial() as THREE.MeshPhongMaterial;
    if (material) {
      material.color = new THREE.Color('#ffffff'); // Blanc de base pour ne pas assombrir la texture
      material.emissive = new THREE.Color('#111111'); // Légère émission pour ne jamais être 100% noir
      material.emissiveIntensity = 0.5;
    }
  }, [globe, data, ringsData]);

  // Ajuster la taille des labels en fonction du zoom avec un seuil pour éviter le clignotement
  useFrame(({ camera }) => {
    const dist = camera.position.length();
    
    // On n'actualise que si le changement est > 1% pour éviter le flickering
    if (Math.abs(dist - lastUpdateDist.current) > (lastUpdateDist.current * 0.01)) {
      const scaleFactor = dist / 300;
      
      globe
        .labelSize((d: any) => d.size * scaleFactor * 1.8)
        .labelDotRadius((d: any) => Math.max(d.size * scaleFactor * 0.4, 0.8 * scaleFactor));
        
      lastUpdateDist.current = dist;
    }
  });

  return (
    <primitive 
      object={globe} 
      onClick={(e: any) => {
        e.stopPropagation();
        console.log('Clicked on object:', e.object);
        
        // Sometimes ThreeGlobe attaches data to the parent or directly
        const data = e.object?.__data || e.object?.parent?.__data || e.object?.userData;
        console.log('Object data:', data);

        if (data && data.text) {
          if (onWordClick) {
            onWordClick(data.text, data.country || 'Pays inconnu', data.lat, data.lng);
          }
        } else if (data && data.country) {
            // si c'est le pays qui est cliqué
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
        {/* Lumières néon pour illuminer les bords */}
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
