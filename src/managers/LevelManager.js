import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import Tile from '../components/Tile.js';
import BubbleFactory from '../components/BubbleFactory.js';
import Shooter from '../components/Shooter.js';
import {
    BUBBLE_SIZE,
    END_LOST,
    TILE_NEUTRE,
    TILE_EMPTY
} from '../constants.js';

export default class LevelManager {

    constructor(scene) {
        this.scene = scene;

        this.createMap();
        if (this.scene.registry.get('debugMode')) console.log(this.layerTiles);
        this.makeGroup();
        this.fallGroupSolo();
        this.findAvailableBubbles();
        this.createWalls();
    }

    listeners() {
        this.scene.events.on('shoot-end', this.onShootEnd, this);
    }

    createMap() {

        const scene = this.scene;
        const levelNB = String(scene.registry.get('level')).padStart(2, "0");
        const levelName = 'level' + levelNB;
        let data = scene.cache.text.get(levelName).trim().split('\n').map(row => row.split(',').map(Number));
        data.unshift(new Array(8).fill(TILE_NEUTRE));
        data = [...data, ...[new Array(8).fill(TILE_EMPTY)]];

        let row = 0;
        data.forEach(_ => { _.forEach((tile, col) => {
                const newTile = new Tile(col, row);
                newTile.addBubble(BubbleFactory.new(scene, tile, levelNB, scene.bubbleContainer));
                _[col] = newTile;
            });
            row++;
        });
        this.layerTiles = data;
        data.forEach(_ => _.forEach(tile => tile.constructor2(this)));

        this.scene.registry.set('rayonLength', this.scene.scale.height + this.scene.scale.width);
    }

    makeGroup() {
        const scene = this.scene;
        const groups = new Set();

        this.layerTiles.forEach(_ => _.forEach(tile => {
            if ( tile.isExist() ) {
                if ( tile.isOverflow() )
                        scene.events.emit('level-done', { end: END_LOST });

                let added = [];

                // dans combien de groupe ce trouve ce bubble ?
                groups.forEach(group => { if (group.has(tile)) added.push(group) });
                let newGroup = added[0];

                // deux groupes ! Alors, il faut les fusionner
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
                tile.neighbors.forEach(neighbor => {
                    if (neighbor && neighbor.index != -1)
                        newGroup.add(neighbor)
                });
            }
        }));

        this.groups = groups;

        if (this.scene.registry.get('debugMode')) console.log('Les groupes :', groups);
    }

    fallGroupSolo() {
        let i = 0;
        this.groups.forEach(group => {
            i++
            if (i > 1) group.forEach(tile => {
                if(tile.bubble)
                    tile.bubble.fall()
            } );
        });
    }

    findAvailableBubbles() {

        const availabubbles = [];

        this.layerTiles.forEach(_ => _.forEach(tile => {
            if ( tile.bubble && tile.bubble.tag == 'bubble' )
                availabubbles.push(tile.bubble.index);
            //availabubbles.push(TILE_AIMING);
            //availabubbles.push(TILE_STAR);
            //availabubbles.push(TILE_BOMBE);
        }));

        if (this.scene.registry.get('debugMode'))
            console.log('Les bubbles restantes :', availabubbles);
        Shooter.availabubbles = availabubbles;
    }

    createWalls() {
        const scene = this.scene;

        const wallLeft = new Phaser.Geom.Line(BUBBLE_SIZE.x * 1.5, 0, BUBBLE_SIZE.x * 1.5, this.scene.scale.height);
        const wallRight = new Phaser.Geom.Line(BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, 0, BUBBLE_SIZE.x * 8 + BUBBLE_SIZE.x / 2, this.scene.scale.height);
        wallLeft.type = wallRight.type = 'wall'
        const bubbleWall = [wallLeft, wallRight];

        this.layerTiles.forEach(_ => _.forEach(tile => {
            if( tile.isExist() )
                tile.neighbors.forEach((neighbor, k) => {
                    const line = tile.walls[k];
                    if ( line && !neighbor.isExist() ) {
                        line.on = true;
                        bubbleWall.push(line);
                    }
                });
        }));

        scene.registry.set('bubbleWall', bubbleWall);

        if (scene.registry.get('debugMode')) {
            if (!this.debug) this.debug = scene.add.graphics();
            this.debug.clear();
            this.debug.lineStyle(1, 0xff0000, 0.5);
            bubbleWall.forEach(wall => {
                this.debug.lineStyle(10, wall.color, 1);
                this.debug.strokeLineShape(wall);
            });
        }

    }

    onShootEnd(data) {
        if (this.scene.registry.get('debugMode')) console.log('LevelManager exec shoot-end');

        const tile = data.destination;
        const scorePop = tile.addBubble(BubbleFactory.new(this.scene, data.color, null, this.scene.bubbleContainer));
        if( scorePop ) this.scorePop( tile, scorePop );

        tile.bubble.applyEffect( this, data.touch.bubble.index );
        if (this.scene.registry.get('debugMode')) console.log(this.layerTiles);
        this.makeGroup();
        this.fallGroupSolo();
        this.createWalls();
        this.findAvailableBubbles();

        if (this.scene.registry.get('debugMode')) console.log('LevelManager emit level-update');
        this.scene.events.emit('level-update');
    }

    findSameColor(cible, color) {

        let group = [];

        this.layerTiles.forEach(_ => _.forEach(tile => {
            if( tile.bubble && tile.bubble.index == color ) group.push(tile.bubble);
        }));

        return group;
    }

    scorePop( tile, score ) {
        const scene = this.scene;

        if( score == 0 ) return;

        scene.registry.set('score', scene.registry.get('score') + score);

        scene.LevelUI.txtScorePop.visible = true;
        scene.LevelUI.txtScorePop.x = tile.pixel.x;
        scene.LevelUI.txtScorePop.y = tile.pixel.y;
        scene.LevelUI.txtScorePop.setText(score);

        scene.tweens.add({
            targets: scene.LevelUI.txtScorePop,
            ease: 'Sine.easeIn',
            y: scene.LevelUI.txtScorePop.y-50,
            duration: 400,
            onComplete: () => scene.LevelUI.txtScorePop.visible = false
        });
    }

    getScore(x) {
        if (x == 2) return 1000;
        if (x >= 3 && x <= 5) return (x - 2) * 3000;
        if (x >= 6 && x <= 11) return (x + 4) * 1000;
        if (x >= 12) return (x - 8) * 5000;
    }

    onBubbleExplode(tile) {
        this.layerTiles[tile.row][tile.col].index = -1;
        this.layerTiles[tile.row][tile.col].tag = null;
    }

    destroy() {
        this.scene.events.off('shoot-end');
    }
}