import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense } from "react";
// import Experience from "./components/Experience";  // Comment out for now
import { UI } from "./components/UI";
import VoiceStreamer from "./components/VoiceStreamer";

function App() {
  return (
    <>
      {/* Step 1: Test basic rendering */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', padding: '10px' }}>
        <h2>App is loading...</h2>
      </div>
      
      <Loader />
      <Leva hidden />
      <UI />
      <VoiceStreamer />

      {/* Step 2: Comment out 3D canvas for now */}
      {/*
      <Suspense fallback={null}>
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </Suspense>
      */}
      
      {/* Step 3: Add a simple canvas to test Three.js */}
      <Suspense fallback={<div>Loading 3D...</div>}>
        <Canvas style={{ height: '100vh' }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={'orange'} />
          </mesh>
        </Canvas>
      </Suspense>
    </>
  );
}

export default App;