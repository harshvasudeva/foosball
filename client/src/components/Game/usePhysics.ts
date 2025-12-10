import { useState, useEffect, useRef } from 'react';
import * as CANNON from 'cannon-es';

export function usePhysicsEngine() {
    const [world] = useState(() => new CANNON.World());
    const ballBody = useRef<CANNON.Body>(null);
    const rodBodies = useRef<CANNON.Body[]>([]);
    const goals = useRef<{ home: CANNON.Body, away: CANNON.Body } | null>(null);

    useEffect(() => {
        world.gravity.set(0, -9.82, 0);

        // Materials
        const groundMat = new CANNON.Material();
        const ballMat = new CANNON.Material();
        const wallMat = new CANNON.Material();
        const playerMat = new CANNON.Material();

        const ballGround = new CANNON.ContactMaterial(groundMat, ballMat, { friction: 0.5, restitution: 0.7 });
        const ballWall = new CANNON.ContactMaterial(wallMat, ballMat, { friction: 0.1, restitution: 0.9 });
        const ballPlayer = new CANNON.ContactMaterial(playerMat, ballMat, { friction: 0.3, restitution: 0.8 });

        world.addContactMaterial(ballGround);
        world.addContactMaterial(ballWall);
        world.addContactMaterial(ballPlayer);

        // Ground
        const ground = new CANNON.Body({ type: CANNON.Body.STATIC, shape: new CANNON.Plane(), material: groundMat });
        ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(ground);

        // Walls
        const wallThickness = 0.2;
        const wallHeight = 0.5;
        const playFieldLength = 6.0; // x = -6 to 6
        const playFieldWidth = 3.6;  // z = -3.6 to 3.6
        const goalWidth = 2.0;       // Opening size

        const longWallShape = new CANNON.Box(new CANNON.Vec3(playFieldLength + 0.2, wallHeight, wallThickness));

        // Top Wall (z = -3.6)
        const wall1 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, wallHeight, -playFieldWidth - wallThickness), material: wallMat });
        wall1.addShape(longWallShape);
        world.addBody(wall1);

        // Bottom Wall (z = 3.6)
        const wall2 = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(0, wallHeight, playFieldWidth + wallThickness), material: wallMat });
        wall2.addShape(longWallShape);
        world.addBody(wall2);

        // End Walls with Goal Gaps
        // We need 4 pieces for the corners: Top-Left, Bottom-Left, Top-Right, Bottom-Right
        const cornerWallWidth = (playFieldWidth * 2 - goalWidth) / 2 / 2; // (7.2 - 2) / 4 = 1.3
        const cornerWallShape = new CANNON.Box(new CANNON.Vec3(wallThickness, wallHeight, cornerWallWidth));

        const zPos = goalWidth / 2 + cornerWallWidth; // 1 + 1.3 = 2.3

        // Left End (Home Side)
        const wallTL = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(-playFieldLength - wallThickness, wallHeight, -zPos), material: wallMat }); // Top-Left
        wallTL.addShape(cornerWallShape);
        world.addBody(wallTL);

        const wallBL = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(-playFieldLength - wallThickness, wallHeight, zPos), material: wallMat }); // Bottom-Left
        wallBL.addShape(cornerWallShape);
        world.addBody(wallBL);

        // Right End (Away Side)
        const wallTR = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(playFieldLength + wallThickness, wallHeight, -zPos), material: wallMat }); // Top-Right
        wallTR.addShape(cornerWallShape);
        world.addBody(wallTR);

        const wallBR = new CANNON.Body({ mass: 0, position: new CANNON.Vec3(playFieldLength + wallThickness, wallHeight, zPos), material: wallMat }); // Bottom-Right
        wallBR.addShape(cornerWallShape);
        world.addBody(wallBR);

        // Ball
        const bBody = new CANNON.Body({ mass: 0.45, shape: new CANNON.Sphere(0.2), position: new CANNON.Vec3(0, 1, 0), material: ballMat });
        bBody.linearDamping = 0.2;
        bBody.angularDamping = 0.2;
        // Continuous Collision Detection
        (bBody as any).ccdSpeedThreshold = 1;
        (bBody as any).ccdParallelism = 1;

        world.addBody(bBody);
        ballBody.current = bBody;

        // Goal Sensors (Triggers) placed DEEP inside the goal
        const goalDepth = 1.0;
        const goalSensorShape = new CANNON.Box(new CANNON.Vec3(0.2, 0.5, goalWidth / 2));

        // Home Goal Sensor (Left) - Placed at x = -7.0 (well behind the line at -6.0)
        const homeGoal = new CANNON.Body({ isTrigger: true, position: new CANNON.Vec3(-(playFieldLength + goalDepth), 0.5, 0) });
        homeGoal.addShape(goalSensorShape);
        world.addBody(homeGoal);

        // Away Goal Sensor (Right) - Placed at x = 7.0
        const awayGoal = new CANNON.Body({ isTrigger: true, position: new CANNON.Vec3(playFieldLength + goalDepth, 0.5, 0) });
        awayGoal.addShape(goalSensorShape);
        world.addBody(awayGoal);

        goals.current = { home: homeGoal, away: awayGoal };

        // Rods (Standard Table Layout)
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
            // Store initial position for drift correction
            (body as any).initPosition = new CANNON.Vec3(config.x, 1, 0);

            const players = config.players;
            for (let i = 0; i < players; i++) {
                const z = (i - (players - 1) / 2) * (6 / players);
                // Increased size and offset for better contact
                const shape = new CANNON.Box(new CANNON.Vec3(0.15, 0.5, 0.2));
                body.addShape(shape, new CANNON.Vec3(0, -0.45, z));
            }
            world.addBody(body);
            return body;
        });

    }, [world]);

    return { world, ballBody, rodBodies, goals };
}
