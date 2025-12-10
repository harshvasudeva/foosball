import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { FoosballTable } from './FoosballTable';
import { Suspense } from 'react';

export function Scene() {
    return (
        <div className="w-full h-full bg-gray-900">
            <Canvas shadows camera={{ position: [0, 15, 0], fov: 45 }}>
                <fog attach="fog" args={['#1a1a1a', 10, 50]} />
                <ambientLight intensity={0.5} />
                <spotLight
                    position={[10, 20, 10]}
                    angle={0.3}
                    penumbra={1}
                    intensity={2}
                    castShadow
                    shadow-mapSize-width={2048}
                    shadow-mapSize-height={2048}
                />
                <pointLight position={[-10, 10, -10]} intensity={1} color="#ffd700" />

                <Suspense fallback={<mesh><boxGeometry /><meshBasicMaterial color="red" wireframe /></mesh>}>
                    <Environment preset="city" />
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                    <FoosballTable />
                </Suspense>

                <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2.5} minPolarAngle={Math.PI / 4} />
            </Canvas>
        </div>
    );
}
