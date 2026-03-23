import { levels } from './levels';
import { mapBase } from './map_data';

const MAP_WIDTH = 100;
const MAP_HEIGHT = 100;

const lcg = (seed) => () => {
    seed = Math.imul(741103597, seed) + 1 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

export const generateWorld = () => {
    const random = lcg(12345);
    const grid = JSON.parse(JSON.stringify(mapBase));
    const pathNodes = [];
    let cx = 5, cy = 5;
    pathNodes.push({ x: cx, y: cy });

    const distPerNode = 15;
    let dir = 0;

    for (let i = 0; i <= 30; i++) {
        for (let s = 0; s < distPerNode; s++) {
            if (dir === 0) cx++;
            else if (dir === 1) cy++;
            else if (dir === 2) cx--;
            else if (dir === 3) cy--;

            cx = Math.max(2, Math.min(MAP_WIDTH - 3, cx));
            cy = Math.max(2, Math.min(MAP_HEIGHT - 3, cy));
            grid[cy][cx] = 'weg';

            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (Math.abs(dx) + Math.abs(dy) <= 1 && grid[cy + dy][cx + dx] !== 'weg') {
                        grid[cy + dy][cx + dx] = 'grass';
                    }
                }
            }
        }

        pathNodes.push({ x: cx, y: cy });

        if (i % 6 === 5) {
            dir = 1;
        } else if (Math.floor(i / 6) % 2 === 0) {
            dir = 0;
        } else {
            dir = 2;
        }
    }

    const enemyPositions = [];
    for (let i = 0; i < 30; i++) {
        const start = pathNodes[i];
        const end = pathNodes[i + 1];
        const midX = Math.floor((start.x + end.x) / 2);
        const midY = Math.floor((start.y + end.y) / 2);

        grid[midY - 1][midX] = 'fluss';
        grid[midY + 1][midX] = 'fluss';
        grid[midY][midX - 1] = 'fluss';
        grid[midY][midX + 1] = 'fluss';
        if (start.x !== end.x) { grid[midY][midX - 1] = 'weg'; grid[midY][midX + 1] = 'weg'; }
        if (start.y !== end.y) { grid[midY - 1][midX] = 'weg'; grid[midY + 1][midX] = 'weg'; }

        grid[midY][midX] = 'weg';

        enemyPositions.push({ x: midX, y: midY });
    }

    levels.forEach((lvl, idx) => {
        lvl.mapProps = { x: enemyPositions[idx].x, y: enemyPositions[idx].y };
    });
    for (let yy = -2; yy <= 2; yy++) {
        for (let xx = -2; xx <= 2; xx++) {
            grid[5 + yy][5 + xx] = 'grass';
        }
    }

    return { grid, pathNodes, enemyPositions };
};
