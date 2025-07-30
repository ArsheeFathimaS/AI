import { OrbitControls, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React, { Suspense } from "react";
import { Avatar } from "./Avatar";

export default function Experience() {
  return (
    <Canvas
      camera={{ position: [0, 1.5, 3.5], fov: 40 }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <color attach="background" args={["#ececec"]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Avatar position={[0, -1.5, 0]} />
        {/* ✅ Replaced problematic preset */}
        <Environment preset="city" background />
      </Suspense>
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
