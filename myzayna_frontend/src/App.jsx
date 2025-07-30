import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Suspense } from "react";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import VoiceStreamer from "./components/VoiceStreamer";

function App() {
  return (
    <>
      <Loader />
      <Leva hidden />
      <UI />
      <VoiceStreamer />
      <Suspense fallback={null}>
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </Suspense>
    </>
  );
}

export default App;
