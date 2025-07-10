import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
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

        this.UUID = Phaser.Math.Between(0, 11111111);

        this.tileset = [];
        scene.cache.json.entries.entries['bubbles_sprites'].meta.frameTags.forEach(tag => this.tileset[tag.from] = tag.name);

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

    evenr_offset_to_pixel(col, row, size) {
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

                const point = this.evenr_offset_to_pixel(col, row, BUBBLE_SIZE.y / 2);
                let spritesheet = 'bubbles_sprites';
                let anim = this.tileset[tile];
                _[col] = {
                    index: tile,
                    col: col, row: row,
                    pixelX: point.x + offset.x,
                    pixelY: point.y + offset.y
                };

                if (tile == -1) return;
                if (anim == 'gemcorps') return;
                if (anim == 'anchor') return;

                _[col].tag = anim;

                if (anim == 'gemcenter') {
                    spritesheet = 'gem' + levelNB;
                    anim = 'idle';
                    _[col].tag = 'gem';
                    this.scene.registry.set('gem', _[col]);
                }

                _[col].sprite = scene.add.sprite(_[col].pixelX, _[col].pixelY, spritesheet).play(anim);
                scene.bubbleContainer.add(_[col].sprite);

                if (anim == 'idle') {
                    _[col].pixelX = point.x + offset.x + _[col].sprite.width / 2 - 160;
                    _[col].pixelY = point.y + offset.y + _[col].sprite.height / 2 - 196.950;
                    _[col].sprite.x = _[col].pixelX;
                    _[col].sprite.y = _[col].pixelY;
                }

            });
            row++;
        });

        this.layerTiles = data;

        this.scene.registry.set('rayonLength', this.scene.scale.height + this.scene.scale.width);
    }

    makeGroup() {
        const groups = new Set();

        this.layerTiles.forEach(_ => {
            _.forEach(tile => {
                if (tile.index != -1) {
                    if (tile.row == 12)
                        this.scene.events.emit('level-done', { end: END_LOST });

                    let added = [];

                    // dans combien de groupe ce trouve ce bubble ?
                    groups.forEach(group => { if (group.has(tile)) added.push(group) });
                    let newGroup = added[0];

                    // deux groupe ! Alors il faut les fusioner
                    if (added.length == 2) {
                        const [min, max] = added[0].size > added[1].size ? [added[1], added[0]] : [added[0], added[1]];
                        min.forEach(tile => max.add(tile));
                        groups.delete(min);
                        newGroup = max;
                    };

                    // Aucun groupe ! Alors il faut en créer un
                    if (added.length == 0) {
                        newGroup = new Set([tile]);
                        groups.add(newGroup);
                    };

                    // finalment on ajout tout les voisins de ce bubble dans sont groupe
                    const neighbors = this.getNeighbors(tile);
                    neighbors.forEach(n => { if (n && n.tile && n.tile.index != -1) newGroup.add(n.tile) });
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
            if (i > 1) {
                group.forEach(tile => {
                    this.scene.VFXManager.onBubbleDead(tile);
                    this.onBubbleDead(tile);
                });
            }
        });
    }

    findAvailableBubbles() {

        const availabubbles = [];

        this.layerTiles.forEach(_ => {
            _.forEach(tile => {
                if (tile.tag && tile.tag != 'gem' && tile.tag != 'und')
                    availabubbles.push(tile.index);
            })
        });

        if (this.scene.registry.get('debugMode')) console.log('Les bubbles restantes :', availabubbles);

        this.scene.registry.set('availabubbles', availabubbles);
    }

    createWalls() {

        const wallLeft = new Phaser.Geom.Line(BUBBLE_SIZE.x * 1.5, 0, BUBBLE_SIZE.x * 1.5, this.scene.scale.height);
        const wallRight = new Phaser.Geom.Line(BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, 0, BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, this.scene.scale.height);
        wallLeft.type = wallRight.type = 'wall'
        const bubbleWall = [wallLeft, wallRight];

        this.layerTiles.forEach(_ => {
            _.forEach(tile => {

                const offset = new Phaser.Geom.Point(BUBBLE_SIZE.x * 2, BUBBLE_SIZE.y / 2 + BUBBLE_HEXDIFF);
                const point = this.evenr_offset_to_pixel(tile.col, tile.row, BUBBLE_SIZE.y / 2);
                point.x += offset.x;
                point.y += offset.y;
                const center = new Phaser.Math.Vector2(point.x, point.y);
                const end1 = new Phaser.Math.Vector2().setToPolar(0, BUBBLE_HEXSIDE).add(center);
                Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(-90));

                if (tile.index != -1) {

                    // [R, BR, BL, L, TL, TR]
                    const neighbors = this.getNeighbors(tile);
                    neighbors.forEach((collisionNeighbors, k) => {
                        Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(60));
                        if (!collisionNeighbors.tile) {
                            const end2 = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(90 + k * 60), BUBBLE_HEXSIDE).add(end1);
                            const line2 = new Phaser.Geom.Line(end1.x, end1.y, end2.x, end2.y);
                            const end3 = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(90 + (k - 1) * 60), BUBBLE_HEXSIDE).add(end1);
                            collisionNeighbors.end = end3;
                            line2.collisionNeighbors = collisionNeighbors;
                            bubbleWall.push(line2);
                        }
                    });

                }

            })
        });

        this.scene.registry.set('bubbleWall', bubbleWall);

        if (this.scene.registry.get('debugMode')) {
            if (!this.debug) this.debug = this.scene.add.graphics();
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
                && tiles[row + diff[1]][col + diff[0]]
                && tiles[row + diff[1]][col + diff[0]].index != -1)
                neighbors.push({ tile: tiles[row + diff[1]][col + diff[0]], point: { x: col + diff[0], y: row + diff[1] } });
            else neighbors.push({ point: { x: col + diff[0], y: row + diff[1] } });
        })

        return neighbors;
    }

    onShootEnd(data) {
        if (this.scene.registry.get('debugMode')) console.log('LevelManager exec shoot-end');

        const tile = this.layerTiles[data.destination.y][data.destination.x];
        tile.index = data.color;
        tile.tag = this.tileset[data.color];
        tile.sprite = this.scene.add.sprite(tile.pixelX, tile.pixelY, 'bubbles_sprites').play(tile.tag);
        tile.sprite.tag = tile.tag;
        this.scene.bubbleContainer.add(tile.sprite);

        this.explode(tile);
        if (this.scene.registry.get('debugMode')) console.log(this.layerTiles);
        this.makeGroup();
        this.deleteGroupSolo();
        this.createWalls();
        this.findAvailableBubbles();

        if (this.scene.registry.get('debugMode')) console.log('LevelManager emit level-update');
        this.scene.events.emit('level-update');
    }

    explode(tile) {

        const visited = new Set();
        const group = this.findConnectedGroup(tile, tile.index, visited);

        if (group.length > 2) {

            const score = this.scene.registry.get('score') + this.getScore(group.length);
            this.scene.registry.set('score', score);

            group.forEach(tile => {
                this.scene.VFXManager.onBubbleExplode(tile);
                this.onBubbleExplode(tile);
            });
        }

    }

    getScore(x) {
        if (x >= 3 && x <= 5) return (x - 2) * 3000;
        if (x >= 6 && x <= 11) return (x + 4) * 1000;
        if (x >= 12) return (x - 8) * 5000;
    }

    findConnectedGroup(tile, color, visited = new Set()) {
        if (!tile || tile.index === -1 || visited.has(tile) || tile.index !== color) return [];

        visited.add(tile);
        let group = [tile];

        const neighbors = this.getNeighbors(tile);

        neighbors.forEach(n => {
            if (n && n.tile && n.tile.index === color && !visited.has(n.tile)) {
                group = group.concat(this.findConnectedGroup(n.tile, color, visited));
            }
        });

        return group;
    }

    onBubbleDead(tile) {
        if (this.scene.registry.get('debugMode')) console.log('LevelManager exec bubble-dead');

        if (tile.tag == 'gem') {
            if (this.scene.registry.get('debugMode')) console.log('Shooter emit bubble-done');
            this.scene.events.emit('level-done', { end: END_WIN });
        }

        this.layerTiles[tile.row][tile.col].index = -1;
        this.layerTiles[tile.row][tile.col].tag = null;
    }

    onBubbleExplode(tile) {
        this.layerTiles[tile.row][tile.col].index = -1;
        this.layerTiles[tile.row][tile.col].tag = null;
    }

    destroy() {
        this.scene.events.off('shoot-end');
    }
}