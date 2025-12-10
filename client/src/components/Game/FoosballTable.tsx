import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { usePlayerControls } from './useControls';
import { useGameStore } from '../../stores/useGameStore';
import { Rod } from './Rod';
import { usePhysicsEngine } from './usePhysics';

export function FoosballTable() {
    const { role, socket, roomId } = useGameStore();
    const allControls = usePlayerControls();

    // Physics
    const { world, ballBody, rodBodies, goals } = usePhysicsEngine();

    // Goal Detection (Host Authoritative for simplicity, or simpler: both report? Host preferably)
    useEffect(() => {
        if (role !== 'host' || !goals.current) return;

        const handleScore = (e: any) => {
            // If Home Goal is hit, Away Scored
            if (e.body === goals.current?.home) {
                socket?.emit('goal_scored', { roomId, team: 'away' });
            }
            // If Away Goal is hit, Home Scored
            else if (e.body === goals.current?.away) {
                socket?.emit('goal_scored', { roomId, team: 'home' });
            }
        };

        // Cannon.js collision events usually on the body
        // We can listen to 'collide' on the goals
        const homeGoal = goals.current.home;
        const awayGoal = goals.current.away;

        homeGoal.addEventListener('collide', handleScore);
        awayGoal.addEventListener('collide', handleScore);

        return () => {
            homeGoal.removeEventListener('collide', handleScore);
            awayGoal.removeEventListener('collide', handleScore);
        };
    }, [role, socket, roomId, goals]);

    // Visual Refs
    const ballRef = useRef<THREE.Mesh>(null);
    const rodRefs = useRef<(THREE.Group | null)[]>([]);

    // Determine my specific controls based on role
    // Host -> P1 (WASD), Guest -> P2 (Arrows)
    const myControls = role === 'host' ? allControls.p1 : allControls.p2;

    // Netcode Refs
    const remoteControlsRef = useRef<any>({ up: false, down: false, left: false, right: false });
    const prevControlsRef = useRef<any>(myControls);

    // Sync Netcode Inputs
    // Sync Netcode Inputs & Game Logic
    useEffect(() => {
        if (!socket) return;
        const handleInputUpdate = (data: any) => {
            remoteControlsRef.current = data.inputs;
        };
        const handleBallReset = () => {
            if (ballBody.current) {
                ballBody.current.position.set(0, 1, 0);
                ballBody.current.velocity.set(0, 0, 0);
                ballBody.current.angularVelocity.set(0, 0, 0);
            }
        };

        socket.on('input_update', handleInputUpdate);
        socket.on('ball_reset', handleBallReset);

        return () => {
            socket.off('input_update', handleInputUpdate);
            socket.off('ball_reset', handleBallReset);
        };
    }, [socket, ballBody]);

    // Game Loop
    useFrame((_, delta) => {
        // 0. Sync Inputs
        if (JSON.stringify(prevControlsRef.current) !== JSON.stringify(myControls)) {
            socket?.emit('input_change', { roomId, inputs: myControls });
            prevControlsRef.current = myControls;
        }

        // 1. Apply Input to Rods
        // Velocity-based movement for better physics
        const moveSpeed = 6; // Meters per second
        const rotSpeed = 8; // Reduced speed as requested

        const myTeam = role === 'host' ? 'home' : role === 'guest' ? 'away' : null;
        const homeIndices = [0, 1, 3, 5];
        const awayIndices = [2, 4, 6, 7];

        const applyLogic = (indices: number[], ctrl: any) => {
            let zVel = 0;
            let rotVel = 0;

            if (ctrl.up) zVel = -moveSpeed;
            if (ctrl.down) zVel = moveSpeed;

            // Both players view the board from the same angle, so controls should be absolute direction
            // Left Key = Rotate Top to Left (Negative Rotation?)
            // Right Key = Rotate Top to Right

            if (ctrl.left) rotVel = -rotSpeed;
            if (ctrl.right) rotVel = rotSpeed;

            indices.forEach(idx => {
                const body = rodBodies.current[idx];
                if (body) {
                    // Slide (Velocity-based)
                    // We set velocity so the physics engine handles momentum transfer

                    // Check bounds before applying velocity
                    const z = body.position.z;
                    let actualZVel = zVel;

                    if (z > 2.5 && zVel > 0) actualZVel = 0;
                    if (z < -2.5 && zVel < 0) actualZVel = 0;

                    body.velocity.set(0, 0, actualZVel);

                    // Rotation (Angular Velocity-based)
                    // Spin around Z axis (0, 0, 1)
                    body.angularVelocity.set(0, 0, rotVel);

                    // Correction: Keep X/Y position constant to prevent drift from collisions
                    // Kinematic bodies shouldn't drift, but good to be safe if types change
                    body.position.x = (body as any).initPosition.x;
                    body.position.y = (body as any).initPosition.y;

                    // IMPORTANT: Wake up body
                    body.wakeUp();
                }
            });
        };

        if (myTeam === 'home') applyLogic(homeIndices, myControls);
        else if (myTeam === 'away') applyLogic(awayIndices, myControls);

        // Apply Remote
        if (myTeam === 'home') applyLogic(awayIndices, remoteControlsRef.current);
        else if (myTeam === 'away') applyLogic(homeIndices, remoteControlsRef.current);

        // 2. Step Physics
        world.step(1 / 60, delta, 3);

        // 3. Sync Visuals
        if (ballBody.current && ballRef.current) {
            ballRef.current.position.copy(ballBody.current.position as any);
            ballRef.current.quaternion.copy(ballBody.current.quaternion as any);
        }

        rodBodies.current.forEach((body, i) => {
            const visual = rodRefs.current[i];
            if (visual) {
                visual.position.copy(body.position as any);
                visual.quaternion.copy(body.quaternion as any);
            }
        });
    });

    // Render helper
    const setRodRef = (el: THREE.Group | null, index: number) => {
        rodRefs.current[index] = el;
    };

    return (
        <group>
            {/* Field */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[12, 7]} />
                <meshStandardMaterial color="#2c8c45" roughness={0.6} />
            </mesh>

            {/* Field Markings */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[12, 7]} />
                <meshBasicMaterial color="white" transparent opacity={0.3} wireframe={true} />
            </mesh>

            {/* Side Walls (Long) */}
            <mesh position={[0, 0.5, -3.8]} receiveShadow castShadow>
                <boxGeometry args={[12.4, 1, 0.4]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            <mesh position={[0, 0.5, 3.8]} receiveShadow castShadow>
                <boxGeometry args={[12.4, 1, 0.4]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>

            {/* Corner Walls (Leaving gap for goal) */}
            {/* Left Top */}
            <mesh position={[-6.2, 0.5, -2.3]} receiveShadow castShadow>
                <boxGeometry args={[0.4, 1, 2.6]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            {/* Left Bottom */}
            <mesh position={[-6.2, 0.5, 2.3]} receiveShadow castShadow>
                <boxGeometry args={[0.4, 1, 2.6]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            {/* Right Top */}
            <mesh position={[6.2, 0.5, -2.3]} receiveShadow castShadow>
                <boxGeometry args={[0.4, 1, 2.6]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>
            {/* Right Bottom */}
            <mesh position={[6.2, 0.5, 2.3]} receiveShadow castShadow>
                <boxGeometry args={[0.4, 1, 2.6]} />
                <meshStandardMaterial color="#4a3b32" />
            </mesh>


            {/* Goal Boxes (Visuals) */}

            {/* Home Goal Box (Left) */}
            <group position={[-7.0, 0.5, 0]}>
                {/* Back Netting */}
                <mesh position={[-0.5, 0, 0]} receiveShadow>
                    <boxGeometry args={[0.1, 1, 2.2]} />
                    <meshStandardMaterial color="#111" emissive="#00ffff" emissiveIntensity={0.2} transparent opacity={0.8} />
                </mesh>
                {/* Top/Bottom Frame */}
                <mesh position={[0, 0.45, 0]}>
                    <boxGeometry args={[1, 0.1, 2.2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, -0.45, 0]}>
                    <boxGeometry args={[1, 0.1, 2.2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                {/* Floor glow */}
                <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1, 2]} />
                    <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
                </mesh>
            </group>

            {/* Away Goal Box (Right) */}
            <group position={[7.0, 0.5, 0]}>
                {/* Back Netting */}
                <mesh position={[0.5, 0, 0]} receiveShadow>
                    <boxGeometry args={[0.1, 1, 2.2]} />
                    <meshStandardMaterial color="#111" emissive="#e879f9" emissiveIntensity={0.2} transparent opacity={0.8} />
                </mesh>
                {/* Top/Bottom Frame */}
                <mesh position={[0, 0.45, 0]}>
                    <boxGeometry args={[1, 0.1, 2.2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                <mesh position={[0, -0.45, 0]}>
                    <boxGeometry args={[1, 0.1, 2.2]} />
                    <meshStandardMaterial color="#222" />
                </mesh>
                {/* Floor glow */}
                <mesh position={[0, -0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[1, 2]} />
                    <meshBasicMaterial color="#e879f9" transparent opacity={0.3} />
                </mesh>
            </group>

            {/* Rods */}
            {/* Rods */}
            {/* Home: Indices 0, 1, 3, 5 */}
            {/* Away: Indices 2, 4, 6, 7 */}

            <Rod ref={(el) => setRodRef(el, 0)} position={[-5.5, 0]} players={1} team="home" />
            <Rod ref={(el) => setRodRef(el, 1)} position={[-4.0, 0]} players={2} team="home" />
            <Rod ref={(el) => setRodRef(el, 2)} position={[-2.0, 0]} players={3} team="away" />
            <Rod ref={(el) => setRodRef(el, 3)} position={[-0.7, 0]} players={5} team="home" />
            <Rod ref={(el) => setRodRef(el, 4)} position={[0.7, 0]} players={5} team="away" />
            <Rod ref={(el) => setRodRef(el, 5)} position={[2.0, 0]} players={3} team="home" />
            <Rod ref={(el) => setRodRef(el, 6)} position={[4.0, 0]} players={2} team="away" />
            <Rod ref={(el) => setRodRef(el, 7)} position={[5.5, 0]} players={1} team="away" />

            {/* Ball */}
            <mesh ref={ballRef} castShadow>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
}
