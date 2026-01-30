"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function GeometricShape({ position, rotation, scale, color }: { 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + rotation[0]) * 0.1;
    meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15 + rotation[1]) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.08}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </Float>
  );
}

function TorusShape({ position, scale }: { 
  position: [number, number, number];
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <Float speed={0.8} rotationIntensity={0.1} floatIntensity={0.2}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color="#64748b"
          transparent
          opacity={0.05}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      
      {/* Geometric shapes positioned around the viewport */}
      <GeometricShape 
        position={[-4, 2, -5]} 
        rotation={[0, 0, 0]} 
        scale={1.2} 
        color="#475569"
      />
      <GeometricShape 
        position={[4, -1.5, -6]} 
        rotation={[1, 2, 0]} 
        scale={0.8} 
        color="#64748b"
      />
      <GeometricShape 
        position={[0, 3, -8]} 
        rotation={[2, 1, 1]} 
        scale={1.5} 
        color="#94a3b8"
      />
      <TorusShape 
        position={[-3, -2, -7]} 
        scale={0.6}
      />
      <TorusShape 
        position={[3.5, 1.5, -9]} 
        scale={0.8}
      />
    </>
  );
}

export function Scene3D() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
