import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { Avatar } from "./Avatar";

export default function Experience() {
  return (
    <Canvas camera={{ position: [0, 1.5, 3.5], fov: 40 }} gl={{ preserveDrawingBuffer: true }}>
      {/* Gradient background comes from CSS now */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 5]} intensity={1.5} castShadow />
      <Suspense fallback={null}>
        <Avatar position={[0, -1.5, 0]} />
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
