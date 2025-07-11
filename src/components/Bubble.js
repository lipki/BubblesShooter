import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    BUBBLE_HEXSIDE,
    TWEEN_GEM,
    END_WIN
} from '../constants.js';

export default class Bubble {

    static container = null;
    static GEM = null;

    constructor(scene, levelNB) {
        this.scene = scene;
        this.levelNB = levelNB;

        this.spritesheet = 'bubbles_sprites';

        this.col = null;
        this.row = null;
        this.index = -1;
        this.pixel = {x: null, y: null};
        this.tag = null;
        this.sprite = null;
        this.anim = null
    }

    createSprite() {
        const scene = this.scene;

        this.anim = this.tag;

        if (this.index == -1) return;
        if (this.tag == 'gemcorps') return;
        if (this.tag == 'anchor') return;

        console.log(this.tag)

        if (this.tag == 'gemcenter') {
            Bubble.GEM = this;
            this.spritesheet = 'gem' + this.levelNB;
            this.anim = 'idle';
        } else if ( this.tag != 'und' )
            this.tag = 'bubble';
        
        this.sprite = scene.add.sprite(this.pixel.x, this.pixel.y, this.spritesheet).play(this.anim);
        Bubble.container.add(this.sprite);

    }

    exist() {
        return this.index != -1;
    }

    empty() {
        this.index = -1;
        this.tag = null;
        if (this.sprite) this.sprite.destroy()
    }

    overflow() {
        return this.row >= 12;
    }

    createWalls() {

        // [R, BR, BL, L, TL, TR]
        this.walls = [];

        const center = new Phaser.Math.Vector2(this.pixel.x, this.pixel.y);
        const end1 = new Phaser.Math.Vector2().setToPolar(0, BUBBLE_HEXSIDE).add(center);
        Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(-90));

        this.neighbors.forEach((collisionNeighbors, k) => {
            if ( collisionNeighbors ) {
                Phaser.Math.RotateAround(end1, center.x, center.y, Phaser.Math.DegToRad(60));
                const end2 = new Phaser.Math.Vector2().setToPolar(Phaser.Math.DegToRad(90 + k * 60), BUBBLE_HEXSIDE).add(end1);
                const line = new Phaser.Geom.Line(end1.x, end1.y, end2.x, end2.y);
                line.cible = collisionNeighbors;
                line.on = false;

                this.walls.push(line);
            } else
                this.walls.push(null);
        });

    }
    
    explode() {
        const scene = this.scene;

        if (this.sprite) this.sprite.destroy();

        const emitter = scene.add.particles(this.pixel.x, this.pixel.y, this.spritesheet, {
            frame: [this.index - 12],
            lifespan: 2000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false
        });

        emitter.explode(16);

        scene.time.delayedCall(2000, () => {
            emitter.destroy();
        });

        this.empty();

    }

    fall() {
        const scene = this.scene;
    
        if (this == Bubble.GEM) {

            scene.tweens.add({
                targets: this.sprite,
                y: this.sprite.y + 300,
                ease: 'sine.inout',
                duration: TWEEN_GEM,
                repeat: -1,
                yoyo: true
            });

            if (scene.registry.get('debugMode')) console.log('Bubble emit level-done');
            scene.events.emit('level-done', { end: END_WIN });

        } else {

            if (this.sprite) 
                scene.tweens.add({
                    targets: this.sprite,
                    ease: 'Sine.easeIn',
                    y: this.pixel.y + 896,
                    duration: 800 + Phaser.Math.Between(0, 100),
                    onComplete: () => { if (this.sprite) this.sprite.destroy() }
                });

        }

        this.empty();

    }
}