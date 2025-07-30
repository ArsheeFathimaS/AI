import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useChat } from "../hooks/useChat";

const facialExpressions = {
  default: {},
  smile: { browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44, noseSneerLeft: 0.17, noseSneerRight: 0.14, mouthPressLeft: 0.61, mouthPressRight: 0.41 },
  funnyFace: { jawLeft: 0.63, mouthPucker: 0.53, noseSneerLeft: 1, noseSneerRight: 0.39, mouthLeft: 1, eyeLookUpLeft: 1, eyeLookUpRight: 1, cheekPuff: 1, mouthDimpleLeft: 0.41, mouthRollLower: 0.32, mouthSmileLeft: 0.35, mouthSmileRight: 0.35 },
  sad: { mouthFrownLeft: 1, mouthFrownRight: 1, mouthShrugLower: 0.78, browInnerUp: 0.45, eyeSquintLeft: 0.72, eyeSquintRight: 0.75, eyeLookDownLeft: 0.5, eyeLookDownRight: 0.5, jawForward: 1 },
  surprised: { eyeWideLeft: 0.5, eyeWideRight: 0.5, jawOpen: 0.35, mouthFunnel: 1, browInnerUp: 1 },
  angry: { browDownLeft: 1, browDownRight: 1, eyeSquintLeft: 1, eyeSquintRight: 1, jawForward: 1, jawLeft: 1, mouthShrugLower: 1, noseSneerLeft: 1, noseSneerRight: 0.42, eyeLookDownLeft: 0.16, eyeLookDownRight: 0.16, cheekSquintLeft: 1, cheekSquintRight: 1, mouthClose: 0.23, mouthFunnel: 0.63, mouthDimpleRight: 1 },
  crazy: { browInnerUp: 0.9, jawForward: 1, noseSneerLeft: 0.57, noseSneerRight: 0.51, eyeLookDownLeft: 0.39, eyeLookUpRight: 0.4, eyeLookInLeft: 0.96, eyeLookInRight: 0.96, jawOpen: 0.96, mouthDimpleLeft: 0.96, mouthDimpleRight: 0.96, mouthStretchLeft: 0.27, mouthStretchRight: 0.28, mouthSmileLeft: 0.55, mouthSmileRight: 0.38, tongueOut: 0.96 }
};

const corresponding = {
  A: "viseme_PP", B: "viseme_kk", C: "viseme_I", D: "viseme_AA",
  E: "viseme_O", F: "viseme_U", G: "viseme_FF", H: "viseme_TH", X: "viseme_PP"
};

let setupMode = false;

export function Avatar(props) {
  const { nodes, materials, scene } = useGLTF("models/64f1a714fe61576b46f27ca2.glb");
  const { animations } = useGLTF("models/animations.glb");

  const { message, onMessagePlayed, chat } = useChat();
  const [lipsync, setLipsync] = useState();
  const [animation, setAnimation] = useState("Idle");
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);

  const group = useRef();
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (!animations.length) return;
    const idleAnim = animations.find(a => a.name === "Idle");
    setAnimation(idleAnim ? "Idle" : animations[0].name);
  }, [animations]);

  useEffect(() => {
    if (!actions || !actions[animation]) return;
    actions[animation].reset().fadeIn(0.5).play();
    return () => actions[animation].fadeOut(0.5);
  }, [animation]);

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      return;
    }
    setAnimation(message.animation);
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);
    const audio = new Audio("data:audio/mp3;base64," + message.audio);
    audio.play();
    setAudio(audio);
    audio.onended = onMessagePlayed;
  }, [message]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse(child => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index === undefined || child.morphTargetInfluences[index] === undefined) return;
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index], value, speed
        );
        if (!setupMode) {
          try { set({ [target]: value }); } catch (e) {}
        }
      }
    });
  };

  useFrame(() => {
    if (!nodes?.EyeLeft) return;

    Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach(key => {
      const map = facialExpressions[facialExpression];
      if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
      lerpMorphTarget(key, map?.[key] || 0, 0.1);
    });

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    const applied = [];
    if (message && lipsync && audio?.currentTime) {
      const t = audio.currentTime;
      for (let cue of lipsync.mouthCues) {
        if (t >= cue.start && t <= cue.end) {
          const morph = corresponding[cue.value];
          applied.push(morph);
          lerpMorphTarget(morph, 1, 0.2);
          break;
        }
      }
    }

    Object.values(corresponding).forEach(val => {
      if (!applied.includes(val)) lerpMorphTarget(val, 0, 0.1);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => { setWinkLeft(true); setTimeout(() => setWinkLeft(false), 300); }),
    winkRight: button(() => { setWinkRight(true); setTimeout(() => setWinkRight(false), 300); }),
    animation: {
      value: animation,
      options: animations.map(a => a.name),
      onChange: val => setAnimation(val),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: val => setFacialExpression(val),
    },
    enableSetupMode: button(() => { setupMode = true; }),
    disableSetupMode: button(() => { setupMode = false; }),
    logMorphTargetValues: button(() => {
      const values = {};
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach(key => {
        if (["eyeBlinkLeft", "eyeBlinkRight"].includes(key)) return;
        const val = nodes.EyeLeft.morphTargetInfluences[nodes.EyeLeft.morphTargetDictionary[key]];
        if (val > 0.01) values[key] = val;
      });
      console.log(JSON.stringify(values, null, 2));
    })
  });

  const [, set] = useControls("MorphTarget", () =>
    Object.assign({}, ...Object.keys(nodes.EyeLeft?.morphTargetDictionary || {}).map(key => ({
      [key]: {
        label: key, value: 0, min: 0, max: 1,
        onChange: val => setupMode && lerpMorphTarget(key, val, 1)
      }
    })))
  );

  useEffect(() => {
    let timeout;
    const blinkLoop = () => {
      timeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); blinkLoop(); }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    blinkLoop();
    return () => clearTimeout(timeout);
  }, []);

  if (!nodes?.Hips) {
    console.warn("⚠️ Avatar model missing 'Hips'. nodes =", nodes);
    return null;
  }

  return (
    <group {...props} dispose={null} ref={group}>
      <primitive object={nodes.Hips} />
      {[
        "Wolf3D_Body",
        "Wolf3D_Outfit_Bottom",
        "Wolf3D_Outfit_Footwear",
        "Wolf3D_Outfit_Top",
        "Wolf3D_Hair",
        "EyeLeft",
        "EyeRight",
        "Wolf3D_Head",
        "Wolf3D_Teeth"
      ].map((name) => (
        <skinnedMesh
          key={name}
          name={name}
          geometry={nodes[name]?.geometry}
          material={materials[nodes[name]?.material?.name]}
          skeleton={nodes[name]?.skeleton}
          morphTargetDictionary={nodes[name]?.morphTargetDictionary}
          morphTargetInfluences={nodes[name]?.morphTargetInfluences}
        />
      ))}
    </group>
  );
}

useGLTF.preload("models/64f1a714fe61576b46f27ca2.glb");
useGLTF.preload("models/animations.glb");
