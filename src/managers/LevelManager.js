import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import Bubble from '../components/Bubble.js';
import {
    BUBBLE_SIZE,
    BUBBLE_HEXSIDE,
    BUBBLE_HEXDIFF,
    END_WIN,
    END_LOST,
} from '../constants.js';

export default class LevelManager {

    constructor(scene) {
        this.scene = scene;

        this.tileset = [];
        scene.cache.json.entries.entries['bubbles_sprites'].meta.frameTags.forEach(tag => this.tileset[tag.from] = tag.name);

        Bubble.container = scene.bubbleContainer;

        this.createMap();
        if (this.scene.registry.get('debugMode')) console.log(this.layerTiles);
        this.makeGroup();
        this.deleteGroupSolo();
        this.findAvailableBubbles();
        this.createWalls();
    }

    listeners() {
        this.scene.events.on('shoot-end', this.onShootEnd, this);
    }

    evenRowOffsetToPixel(col, row, size) {
        // hex to cartesian
        let x = Math.sqrt(3) * (col - 0.5 * (row & 1));
        let y = 3. / 2 * row;
        // scale cartesian coordinates
        x = x * size;
        y = y * size;
        return new Phaser.Geom.Point(x, y);
    }

    createMap() {

        const scene = this.scene;
        const levelNB = String(scene.registry.get('level')).padStart(2, "0");
        const levelName = 'level' + levelNB;
        const offset = new Phaser.Geom.Point(BUBBLE_SIZE.x * 2, BUBBLE_SIZE.y / 2 + BUBBLE_HEXDIFF);
        const data = scene.cache.text.get(levelName).trim().split('\n').map(row => row.split(',').map(Number));

        scene.anims.createFromAseprite('gem' + levelNB);
        scene.anims.anims.entries.idle.repeat = -1;

        let row = 0;
        data.forEach(_ => {
            _.forEach((tile, col) => {

                const bubble = new Bubble(scene, levelNB);

                const point = this.evenRowOffsetToPixel(col, row, BUBBLE_SIZE.y / 2);

                bubble.col = col;
                bubble.row = row;
                bubble.index = tile;
                bubble.pixel = {x: point.x + offset.x, y: point.y + offset.y};
                bubble.tag = this.tileset[tile];

                bubble.createSprite();

                if ( Bubble.GEM == bubble ) {
                    bubble.sprite.x = bubble.pixel.x = point.x + offset.x + bubble.sprite.width / 2 - 160;
                    bubble.sprite.y = bubble.pixel.y = point.y + offset.y + bubble.sprite.height / 2 - 196.950;
                }

                _[col] = bubble;

            });
            row++;
        });

        this.layerTiles = data;

        row = 0;
        this.layerTiles.forEach(_ => {
            _.forEach(bubble => {
                bubble.neighbors = this.getNeighbors(bubble);
                bubble.createWalls();
            });
            row++;
        });

        this.scene.registry.set('rayonLength', this.scene.scale.height + this.scene.scale.width);
    }

    makeGroup() {
        const scene = this.scene;
        const groups = new Set();

        this.layerTiles.forEach(_ => {
            _.forEach(bubble => {
                if ( bubble.exist() ) {
                    if ( bubble.overflow() )
                        scene.events.emit('level-done', { end: END_LOST });

                    let added = [];

                    // dans combien de groupe ce trouve ce bubble ?
                    groups.forEach(group => { if (group.has(bubble)) added.push(group) });
                    let newGroup = added[0];

                    // deux groupes ! Alors il faut les fusioner
                    if (added.length == 2) {
                        const [min, max] = added[0].size > added[1].size ? [added[1], added[0]] : [added[0], added[1]];
                        min.forEach(bubble => max.add(bubble));
                        groups.delete(min);
                        newGroup = max;
                    };

                    // Aucun groupe ! Alors il faut en créer un
                    if (added.length == 0) {
                        newGroup = new Set([bubble]);
                        groups.add(newGroup);
                    };

                    // finalment on ajout tout les voisins de ce bubble dans sont groupe
                    bubble.neighbors.forEach(neighbor => {
                        if (neighbor && neighbor.index != -1)
                            newGroup.add(neighbor)
                    });
                }
            })
        });

        this.groups = groups;

        if (this.scene.registry.get('debugMode')) console.log('Les groupes :', groups);
    }

    deleteGroupSolo() {
        let i = 0;
        this.groups.forEach(group => {
            i++;
            if (i > 1) group.forEach(bubble => bubble.fall());
        });
    }

    findAvailableBubbles() {

        const availabubbles = [];

        this.layerTiles.forEach(_ => {
            _.forEach(tile => {
                if ( tile.tag == 'bubble' )
                    availabubbles.push(tile.index);
            })
        });

        if (this.scene.registry.get('debugMode')) console.log('Les bubbles restantes :', availabubbles);
        this.scene.registry.set('availabubbles', availabubbles);
    }

    createWalls() {
        const scene = this.scene;

        const wallLeft = new Phaser.Geom.Line(BUBBLE_SIZE.x * 1.5, 0, BUBBLE_SIZE.x * 1.5, this.scene.scale.height);
        const wallRight = new Phaser.Geom.Line(BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, 0, BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, this.scene.scale.height);
        wallLeft.type = wallRight.type = 'wall'
        const bubbleWall = [wallLeft, wallRight];

        this.layerTiles.forEach(_ => {
            _.forEach(bubble => {
                if( bubble.exist() )
                    bubble.neighbors.forEach((neighbor, k) => {
                        const line = bubble.walls[k];
                        if ( line && !neighbor.exist() ) {
                            line.on = true;
                            bubbleWall.push(line);
                        }
                    });
            })
        });

        scene.registry.set('bubbleWall', bubbleWall);

        if (scene.registry.get('debugMode')) {
            if (!this.debug) this.debug = scene.add.graphics();
            this.debug.clear();
            this.debug.lineStyle(1, 0xff0000, 0.5);
            bubbleWall.forEach(wall => {
                this.debug.strokeLineShape(wall);
            });
        }

    }

    getNeighbors(tile) {

        const evenr_direction_differences = [
            [[+1, 0], [+1, +1], [0, +1],
            [-1, 0], [0, -1], [+1, -1]],// even rows
            [[+1, 0], [0, +1], [-1, +1],
            [-1, 0], [-1, -1], [0, -1]],// odd rows 
        ]

        const neighbors = [];
        const tiles = this.layerTiles, col = tile.col, row = tile.row;

        [...Array(6).keys()].forEach(d => {
            const diff = evenr_direction_differences[row % 2][d];
            if (tiles[row + diff[1]]
                && tiles[row + diff[1]][col + diff[0]])
                neighbors.push(tiles[row + diff[1]][col + diff[0]]);
            else
                neighbors.push(null);
        })

        return neighbors;
    }

    onShootEnd(data) {
        if (this.scene.registry.get('debugMode')) console.log('LevelManager exec shoot-end');

        const bubble = data.destination;
        bubble.index = data.color;
        bubble.tag = this.tileset[data.color];
        bubble.createSprite();

        this.explode(bubble);
        if (this.scene.registry.get('debugMode')) console.log(this.layerTiles);
        this.makeGroup();
        this.deleteGroupSolo();
        this.createWalls();
        this.findAvailableBubbles();

        if (this.scene.registry.get('debugMode')) console.log('LevelManager emit level-update');
        this.scene.events.emit('level-update');
    }

    explode(bubble) {
        const scene = this.scene;

        const visited = new Set();
        const group = this.findConnectedGroup(bubble, bubble.index, visited);

        if (group.length > 2) {
            scene.registry.set('score', scene.registry.get('score') + this.getScore(group.length));
            group.forEach( bubble => bubble.explode() );
        }

    }

    getScore(x) {
        if (x >= 3 && x <= 5) return (x - 2) * 3000;
        if (x >= 6 && x <= 11) return (x + 4) * 1000;
        if (x >= 12) return (x - 8) * 5000;
    }

    findConnectedGroup(bubble, color, visited = new Set()) {
        if (bubble.index === -1 || visited.has(bubble) || bubble.index !== color) return [];

        visited.add(bubble);
        let group = [bubble];

        bubble.neighbors.forEach(neighbor => {
            if (neighbor && neighbor.index === color && !visited.has(neighbor)) {
                group = group.concat(this.findConnectedGroup(neighbor, color, visited));
            }
        });

        return group;
    }

    onBubbleExplode(tile) {
        this.layerTiles[tile.row][tile.col].index = -1;
        this.layerTiles[tile.row][tile.col].tag = null;
    }

    destroy() {
        this.scene.events.off('shoot-end');
    }
}