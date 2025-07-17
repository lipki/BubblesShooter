import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    BUBBLE_HEXSIDE,
    BUBBLE_SIZE,
    BUBBLE_HEXDIFF,
    TILE_BONUSPOINT
} from '../constants.js';

export default class Tile {

    constructor(col, row) {

        this.offset = new Phaser.Geom.Point(BUBBLE_SIZE.x * 2, BUBBLE_SIZE.y / 2 + BUBBLE_HEXDIFF);
        const point = this.evenRowOffsetToPixel(col, row, BUBBLE_SIZE.y / 2);

        this.col = col;
        this.row = row;
        this.pixel = {x: point.x + this.offset.x, y: point.y + this.offset.y};
        this.bubble = null;

    }

    addBubble(bubble) {
        if( !bubble ) return;

        this.bubble = bubble;
        this.bubble.tile = this;
        this.bubble.createSprite( this.pixel );
        this.specialScore = (bubble.index == TILE_BONUSPOINT) ? 1000000 : 0;
        return this.specialScore > 0 ? this.specialScore : null;
    }

    isExist() {
        return this.bubble != null;
    }

    isOverflow() {
        return this.row >= 12;
    }

    empty() {
        this.bubble = null;
    }

    constructor2( levelManager ) {
        this.neighbors = this.getNeighbors( levelManager );
        this.createWalls();
    }

    createWalls() {

        // [R, BR, BL, L, TL, TR]
        this.walls = [];

        const center = new Phaser.Math.Vector2(this.pixel.x, this.pixel.y);
        const end1 = new Phaser.Math.Vector2().setToPolar(0, BUBBLE_HEXSIDE).add(center);
        Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(-90));

        this.neighbors.forEach((collisionNeighbors, k) => {
            Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(60));
            if ( collisionNeighbors ) {
                const end2 = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(90 + k * 60), BUBBLE_HEXSIDE).add(end1);
                const line = new Phaser.Geom.Line(end1.x, end1.y, end2.x, end2.y);
                line.cible = collisionNeighbors;
                line.touch = this;
                line.on = false;

                // pour le debug
                const color = [0xff0000, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0xff00ff];
                line.color = color[k];

                this.walls.push(line);
            } else
                this.walls.push(null);
        });

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

    getNeighbors( levelManager ) {

        const evenr_direction_differences = [
            [[+1, 0], [+1, +1], [ 0, +1],
                [-1, 0], [ 0, -1], [+1, -1]],// even rows
            [[+1, 0], [ 0, +1], [-1, +1],
                [-1, 0], [-1, -1], [ 0, -1]],// odd rows 
        ]

        const neighbors = [];
        const tiles = levelManager.layerTiles, col = this.col, row = this.row;

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

}