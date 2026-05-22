import { useFrame } from "@react-three/fiber";
import { useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { AnimationMixer, Vector3, Euler, LoopRepeat } from "three";

interface RobotAnimationHandle {
  saludo: () => void;
  mostrarBola: () => void;
  detener: () => void;
}

const CardRobot = forwardRef<RobotAnimationHandle, { scene: any; animations: any }>(
  ({ scene, animations }, ref) => {
    const mixerRef = useRef<AnimationMixer | null>(null);
    const actionRef = useRef<any>(null);
    const initialRotationRef = useRef<Euler | null>(null);
    const initialPositionRef = useRef<Vector3 | null>(null);

    useEffect(() => {
      if (scene && !initialRotationRef.current) {
        initialRotationRef.current = scene.rotation.clone();
        initialPositionRef.current = scene.position.clone();
      }

      if (!mixerRef.current && scene && animations && animations.length > 0) {
        mixerRef.current = new AnimationMixer(scene);
        const action = mixerRef.current.clipAction(animations[0]);
        action.loop = LoopRepeat;
        action.play();
        actionRef.current = action;
      }

      return () => {
        if (mixerRef.current) {
          mixerRef.current.stopAllAction();
        }
      };
    }, [scene, animations]);

    const saludo = () => {
      if (actionRef.current) {
        actionRef.current.play();
      }
    };

    const mostrarBola = () => {
      if (actionRef.current) {
        actionRef.current.play();
      }
    };

    const detener = () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };

    useImperativeHandle(
      ref,
      () => ({
        saludo,
        mostrarBola,
        detener,
      }),
      []
    );

    useFrame((_, delta) => {
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }
    });

    return <primitive object={scene} scale={0.9} />;
  }
);

CardRobot.displayName = "CardRobot";

export default CardRobot;
