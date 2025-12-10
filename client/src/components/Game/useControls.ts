import { useEffect, useState } from 'react';

export function usePlayerControls() {
    const [controls, setControls] = useState({
        p1: { up: false, down: false, left: false, right: false }, // WASD
        p2: { up: false, down: false, left: false, right: false }, // Arrows
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            setControls(prev => {
                const p1 = { ...prev.p1 };
                const p2 = { ...prev.p2 };

                switch (e.code) {
                    case 'KeyW': p1.up = true; break;
                    case 'KeyS': p1.down = true; break;
                    case 'KeyA': p1.left = true; break;
                    case 'KeyD': p1.right = true; break;
                    case 'ArrowUp': p2.up = true; break;
                    case 'ArrowDown': p2.down = true; break;
                    case 'ArrowLeft': p2.left = true; break;
                    case 'ArrowRight': p2.right = true; break;
                }
                return { p1, p2 };
            });
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            setControls(prev => {
                const p1 = { ...prev.p1 };
                const p2 = { ...prev.p2 };

                switch (e.code) {
                    case 'KeyW': p1.up = false; break;
                    case 'KeyS': p1.down = false; break;
                    case 'KeyA': p1.left = false; break;
                    case 'KeyD': p1.right = false; break;
                    case 'ArrowUp': p2.up = false; break;
                    case 'ArrowDown': p2.down = false; break;
                    case 'ArrowLeft': p2.left = false; break;
                    case 'ArrowRight': p2.right = false; break;
                }
                return { p1, p2 };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return controls;
}
