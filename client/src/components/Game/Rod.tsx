import { forwardRef } from 'react';
import * as THREE from 'three';

interface RodProps {
    position: [number, number];
    players: number;
    team: 'home' | 'away';
}

export const Rod = forwardRef<THREE.Group, RodProps>(({ position, players, team }, ref) => {
    const x = position[0];
    return (
        <group ref={ref} position={[x, 1, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.05, 0.05, 8, 16]} />
                <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
            </mesh>
            {Array.from({ length: players }).map((_, i) => {
                const z = (i - (players - 1) / 2) * (6 / players);
                return (
                    <mesh key={i} position={[0, -0.45, z]} castShadow>
                        <boxGeometry args={[0.3, 1.0, 0.4]} />
                        <meshStandardMaterial color={team === 'home' ? '#e63946' : '#1d3557'} />
                    </mesh>
                );
            })}
        </group>
    );
});

Rod.displayName = 'Rod';
