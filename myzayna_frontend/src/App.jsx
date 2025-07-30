import { Loader } from "@react-three/drei";
import { Leva } from "leva";
import { Suspense } from "react";
import Experience from "./components/Experience";
import { UI } from "./components/UI";
import VoiceStreamer from "./components/VoiceStreamer";

function App() {
  return (
    <>
      <Leva hidden />
      <UI />
      <VoiceStreamer />
      <Suspense fallback={<Loader />}>
        <Experience />
      </Suspense>
    </>
  );
}

export default App;
