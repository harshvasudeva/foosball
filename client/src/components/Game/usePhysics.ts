import { useState, useEffect, useRef } from 'react';
import * as CANNON from 'cannon-es';
import { useFrame } from '@react-three/fiber';

export function usePhysicsEngine() {
    const [world] = useState(() => new CANNON.World());
    const ballBody = useRef<CANNON.Body>(null);
    const rodBodies = useRef<CANNON.Body[]>([]);

    useEffect(() => {
        world.gravity.set(0, -9.82, 0);
        // Materials
        const groundMat = new CANNON.Material();
        const ballMat = new CANNON.Material();
        const wallMat = new CANNON.Material();
        const playerMat = new CANNON.Material();

        const ballGround = new CANNON.ContactMaterial(groundMat, ballMat, { friction: 0.5, restitution: 0.6 });
        const ballWall = new CANNON.ContactMaterial(wallMat, ballMat, { friction: 0.1, restitution: 0.8 });
        const ballPlayer = new CANNON.ContactMaterial(playerMat, ballMat, { friction: 0.3, restitution: 0.5 });

        world.addContactMaterial(ballGround);
        world.addContactMaterial(ballWall);
        world.addContactMaterial(ballPlayer);

        // Ground
        const ground = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), material: groundMat });
        ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(ground);

        // Walls
        const wallShape = new CANNON.Box(new CANNON.Vec3(6.2, 0.5, 0.1));
        const wall1 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 0.5, 3.6), material: wallMat });
        wall1.addShape(wallShape);
        world.addBody(wall1);
        const wall2 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, 0.5, -3.6), material: wallMat });
        wall2.addShape(wallShape);
        world.addBody(wall2);

        const goalWallShape = new CANNON.Box(new CANNON.Vec3(0.1, 0.5, 3.7));
        const wall3 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(6.1, 0.5, 0), material: wallMat });
        wall3.addShape(goalWallShape);
        world.addBody(wall3);
        const wall4 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(-6.1, 0.5, 0), material: wallMat });
        wall4.addShape(goalWallShape);
        world.addBody(wall4);

        // Ball
        const bBody = new CANNON.Body({ mass: 0.45, shape: new CANNON.Sphere(0.2), position: new CANNON.Vec3(0, 1, 0), material: ballMat });
        bBody.linearDamping = 0.2;
        bBody.angularDamping = 0.2;
        world.addBody(bBody);
        ballBody.current = bBody;

        // Rods (Standard Table Layout)
        // Team A (Home/Red) vs Team B (Away/Blue)
        // Positions are symmetric around 0. Table length ~12 units (-6 to 6).
        // 1. Goalie A (1)  -6.5 ?? No, table is -6 to 6.
        // 2. Defenders A (2)
        // 3. Strikers B (3)
        // 4. Midfield A (5)
        // 5. Midfield B (5)
        // 6. Strikers A (3)
        // 7. Defenders B (2)
        // 8. Goalie B (1)

        const rodConfigs = [
            { x: -5.5, players: 1 }, // Home Goalie
            { x: -4.0, players: 2 }, // Home Defenders
            { x: -2.0, players: 3 }, // Away Strikers
            { x: -0.7, players: 5 }, // Home Midfield
            { x: 0.7, players: 5 }, // Away Midfield
            { x: 2.0, players: 3 }, // Home Strikers
            { x: 4.0, players: 2 }, // Away Defenders
            { x: 5.5, players: 1 }, // Away Goalie
        ];

        rodBodies.current = rodConfigs.map((config) => {
            const body = new CANNON.Body({
                mass: 0,
                type: CANNON.Body.KINEMATIC,
                position: new CANNON.Vec3(config.x, 1, 0),
                material: playerMat
            });
            const players = config.players;
            for (let i = 0; i < players; i++) {
                const z = (i - (players - 1) / 2) * (6 / players);
                const shape = new CANNON.Box(new CANNON.Vec3(0.15, 0.4, 0.2));
                body.addShape(shape, new CANNON.Vec3(0, -0.3, z));
            }
            world.addBody(body);
            return body;
        });

    }, [world]);

    return { world, ballBody, rodBodies };
}
