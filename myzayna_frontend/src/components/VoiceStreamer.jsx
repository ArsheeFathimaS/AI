import React, { useRef, useState } from "react";

const VoiceStreamer = () => {
  const socketRef = useRef(null);
  const [recording, setRecording] = useState(false);

  const startStreaming = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);

    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    socketRef.current = new WebSocket("ws://localhost:3000");
    socketRef.current.binaryType = "arraybuffer";

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
      setRecording(true);
    };

    processor.onaudioprocess = (e) => {
      if (!recording || socketRef.current.readyState !== 1) return;

      const inputData = e.inputBuffer.getChannelData(0); // Float32Array
      const int16Data = convertFloat32ToInt16(inputData);
      socketRef.current.send(int16Data);
    };

    source.connect(processor);
    processor.connect(audioContext.destination);
  };

  const stopStreaming = () => {
    if (socketRef.current) {
      socketRef.current.close();
      console.log("🛑 WebSocket disconnected");
    }
    setRecording(false);
  };

  const convertFloat32ToInt16 = (buffer) => {
    let l = buffer.length;
    const buf = new Int16Array(l);
    while (l--) {
      buf[l] = Math.max(-1, Math.min(1, buffer[l])) * 0x7fff;
    }
    return buf.buffer;
  };

  return (
    <div className="mt-4">
      <button
        onClick={recording ? stopStreaming : startStreaming}
        className={`px-4 py-2 rounded ${recording ? "bg-red-500" : "bg-green-500"}`}
      >
        {recording ? "Stop 🎙" : "Start Talking 🎤"}
      </button>
    </div>
  );
};

export default VoiceStreamer;