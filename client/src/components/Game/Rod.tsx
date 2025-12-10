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
                    <group key={i} position={[0, -0.45, z]} rotation={[0, team === 'home' ? Math.PI / 2 : -Math.PI / 2, 0]}>
                        {/* Player Model - Cyber Sport Style */}

                        {/* 1. Head (Glowing Visor) */}
                        <mesh position={[0, 0.35, 0]} castShadow>
                            <boxGeometry args={[0.15, 0.15, 0.15]} />
                            <meshStandardMaterial color="#222" roughness={0.5} />
                        </mesh>
                        <mesh position={[0.06, 0.35, 0]}>
                            <boxGeometry args={[0.05, 0.05, 0.12]} />
                            <meshStandardMaterial color={team === 'home' ? "#00ffff" : "#e879f9"} emissive={team === 'home' ? "#00ffff" : "#e879f9"} emissiveIntensity={2} toneMapped={false} />
                        </mesh>

                        {/* 2. Body / Torso (Armored) */}
                        <mesh position={[0, 0.1, 0]} castShadow>
                            <boxGeometry args={[0.25, 0.35, 0.15]} />
                            <meshStandardMaterial color={team === 'home' ? '#0891b2' : '#c026d3'} metalness={0.8} roughness={0.2} />
                        </mesh>

                        {/* 3. Foot / Kicker (Extended for contact) */}
                        <mesh position={[0.05, -0.25, 0]} castShadow>
                            <boxGeometry args={[0.2, 0.35, 0.25]} />
                            <meshStandardMaterial color="#333" metalness={0.5} roughness={0.5} />
                        </mesh>

                        {/* 4. Toe Accent (Visual Direction) */}
                        <mesh position={[0.15, -0.35, 0]}>
                            <boxGeometry args={[0.05, 0.1, 0.2]} />
                            <meshStandardMaterial color={team === 'home' ? "#00ffff" : "#e879f9"} emissive={team === 'home' ? "#00ffff" : "#e879f9"} emissiveIntensity={1} />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
});

Rod.displayName = 'Rod';
