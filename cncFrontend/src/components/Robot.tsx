import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, forwardRef, useImperativeHandle } from "react";
import CardRobot from "./CardsModels3D/CardRobot";
import { Canvas } from "@react-three/fiber";

interface RobotHandle {
  saludo: () => void;
  mostrarBola: () => void;
  detener: () => void;
}

export const Robot = forwardRef<RobotHandle, { className?: string, style?: React.CSSProperties }>(({ className, style }, ref) => {
    const { scene, animations } = useGLTF('/robot_playground.glb');
    const cardRobotRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      saludo: () => cardRobotRef.current?.saludo(),
      mostrarBola: () => cardRobotRef.current?.mostrarBola(),
      detener: () => cardRobotRef.current?.detener(),
    }), []);

    return (
        <div className={className} style={style || (className ? {} : { height: '100%', width: '100%' })}>
            <Canvas style={{ height: '100%', width: '100%' }} camera={{ position: [0, 1.5, 4], fov: 45 }}>
                <ambientLight intensity={1.2} />
                <pointLight position={[10, 10, 10]} intensity={1.5} />
                <directionalLight position={[-5, 8, -5]} intensity={0.6} />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
                <Suspense fallback={null}>
                    <CardRobot ref={cardRobotRef} scene={scene} animations={animations} />
                </Suspense>
            </Canvas>
        </div>
    );
});

Robot.displayName = "Robot";
