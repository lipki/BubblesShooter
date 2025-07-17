import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    SHOOTER_POS,
    STOCK_POS
} from '../../constants.js';

export default class Bubble {

    constructor(scene, container, tile) {
        this.scene = scene;

        this.tile = null;
        this.spritesheet = 'bubbles';
        this.index = tile;
        this.tag = 'bubble';
        this.sprite = null;
        this.container = container;
    }

    createSprite( pixel ) {
        const scene = this.scene;

        if( this.sprite ) this.sprite.destroy();
        
        this.sprite = scene.add.sprite(pixel.x, pixel.y, this.spritesheet);
        this.container.add(this.sprite);

        if( this.anim ) this.sprite.play(this.anim);
        else this.sprite.setFrame(this.index);
    }
    
    explode() {
        const scene = this.scene;

        if (this.sprite) this.sprite.destroy();
        
        const emitter = scene.add.particles(this.tile.pixel.x, this.tile.pixel.y, 'particles', {
            frame: [this.index],
            lifespan: 2000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false
        });
        scene.particleContainer.add(emitter);

        emitter.explode(16);

        scene.time.delayedCall(2000, () => {
            emitter.destroy();
        });

        this.tile.empty();

        return true;

    }

    fall() {
        const scene = this.scene;

        if (this.sprite) 
            scene.tweens.add({
                targets: this.sprite,
                ease: 'Sine.easeIn',
                y: this.tile.pixel.y + 896,
                duration: 800 + Phaser.Math.Between(0, 100),
                onComplete: () => { if (this.sprite) this.sprite.destroy() }
            });

        this.tile.empty();

    }

    switch () {
        const scene = this.scene;

        scene.tweens.add({
            targets: this.sprite,
            ease: 'Sine.easeIn',
            x: SHOOTER_POS.x,
            y: SHOOTER_POS.y,
            duration: 200
        });
    }

    spawn() {
        const scene = this.scene;
        this.sprite.alpha = 0;

        const emitter = scene.add.particles(0, 0, 'particles', {
            x: { min: STOCK_POS.x - 32, max: STOCK_POS.x + 32 },
            y: { min: STOCK_POS.y - 32, max: STOCK_POS.y + 32 },
            moveToX: {
                onEmit: () => STOCK_POS.x,
                onUpdate: () => STOCK_POS.x
            },
            moveToY: {
                onEmit: () => STOCK_POS.y,
                onUpdate: () => STOCK_POS.y
            },
            lifespan: 1000,
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: .5, end: 0 },
            frame: this.index,
            quantity: { start: 5, end: 0 }
        })

        this.container.add(emitter);
        
        scene.time.delayedCall(200, () => emitter.stop() );

        scene.tweens.add({
            targets: this.sprite,
            ease: 'Sine.easeIn',
            duration: 800,
            alpha: 1
        });
    }

    applyEffect( levelManager ) {
        
        const visited = new Set();

        const group = this.findConnectedGroup(this, this.index, visited);
        
        if (group.length > 2) {
            group.forEach( bubble => bubble.explode() );

            levelManager.scorePop( this.tile, levelManager.getScore(group.length) );
        }

    }

    findConnectedGroup(bubble, color, visited = new Set()) {
        if (visited.has(bubble) || bubble.index !== color) return [];

        visited.add(bubble);
        let group = [bubble];

        bubble.tile.neighbors.forEach(neighbor => {
            if (neighbor && neighbor.bubble && neighbor.bubble.index === color && !visited.has(neighbor.bubble))
                group = group.concat(this.findConnectedGroup(neighbor.bubble, color, visited));
        });

        return group;
    }
}