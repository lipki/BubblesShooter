import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    SHOOTER_POS,
    STOCK_POS,
    TWEEN_GEM
} from '../constants.js';

export default class VFX {

    constructor(scene) {
        this.scene = scene;

        this.shooter = scene.add.image(SHOOTER_POS.x, SHOOTER_POS.y, 'shooter');
        scene.bubbleContainer.add(this.shooter);

    }

    listeners() {
        const events = this.scene.events;
        events.on('shooter-rotate', this.onShooterRotate, this);
        events.on('bubble-shoot', this.onBubbleShoot, this);
        events.on('bubble-switch', this.onBubbleSwitch, this);
    }

    onShooterRotate(data) {
        const scene = this.scene;
        if (scene.registry.get('debugMode')) console.log('VFX exec shooter-rotate : ', data.angle);

        this.shooter.angle = data.angle;
    }

    onBubbleShoot(data) {
        if (this.scene.registry.get('debugMode')) console.log('VFX exec bubble-shoot');

        const sprite = this.scene.add.follower(data.path, SHOOTER_POS.x, SHOOTER_POS.y, 'bubbles_sprites', data.tile.index);
        this.scene.bubbleContainer.add(sprite);
        const duration = data.path.getLength(); // 1 pixel/ms ?

        sprite.startFollow({
            duration: duration,
            ease: 'Sine.easeIn',
            repeat: 0,
            onComplete: () => {
                sprite.destroy();
                data.callBack();
            }
        });
    }

    onBubbleDead(tile) {
        if (this.scene.registry.get('debugMode')) console.log('VFX exec bubble-dead');

        if (tile.tag === null) return;

        if (tile.tag == 'gem') {

            this.scene.tweens.add({
                targets: tile.sprite,
                y: tile.sprite.y + 300,
                ease: 'sine.inout',
                duration: TWEEN_GEM,
                repeat: -1,
                yoyo: true
            });

            return;
        }

        this.scene.tweens.add({
            targets: tile.sprite,
            ease: 'Sine.easeIn',
            x: tile.pixelX,
            y: tile.pixelY + 896,
            duration: 800 + Phaser.Math.Between(0, 100),
            onComplete: () => {
                if (tile.sprite) tile.sprite.destroy()
            }
        });
    }

    onBubbleExplode(tile) {
        const emitter = this.scene.add.particles(tile.pixelX, tile.pixelY, 'bubbles_sprites', {
            frame: [tile.index - 12],
            lifespan: 2000,
            speed: { min: 150, max: 250 },
            scale: { start: 0.8, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false
        });

        emitter.explode(16);

        this.scene.time.delayedCall(2000, () => {
            emitter.destroy();
        });

        tile.sprite.destroy();
    }

    onBubbleSwitch(data) {
        if (this.scene.registry.get('debugMode')) console.log('VFX exec bubble-switch');

        const bubbleForShootID = this.scene.registry.get('bubbleForShoot');

        if (this.bubbleForShoot) this.bubbleForShoot.destroy();

        this.bubbleForShoot = this.scene.add.sprite(STOCK_POS.x, STOCK_POS.y, 'bubbles_sprites', bubbleForShootID);
        this.scene.bubbleContainer.add(this.bubbleForShoot);

        this.scene.tweens.add({
            targets: this.bubbleForShoot,
            ease: 'Sine.easeIn',
            x: SHOOTER_POS.x,
            y: SHOOTER_POS.y,
            duration: 200
        });

        const bubbleInStockID = this.scene.registry.get('bubbleInStock');

        if (this.bubbleInStock) this.bubbleInStock.destroy();

        const emitter = this.scene.add.particles(0, 0, 'bubbles_sprites', {
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
            frame: bubbleInStockID - 12,
            quantity: { start: 5, end: 0 }
        });
        this.scene.bubbleContainer.add(emitter);

        this.bubbleInStock = this.scene.add.sprite(STOCK_POS.x, STOCK_POS.y, 'bubbles_sprites', bubbleInStockID);
        this.scene.bubbleContainer.add(this.bubbleInStock);
        this.bubbleInStock.alpha = 0;

        this.scene.time.delayedCall(200, () => {
            emitter.stop();
        });

        this.scene.tweens.add({
            targets: this.bubbleInStock,
            ease: 'Sine.easeIn',
            duration: 800,
            alpha: 1
        });
    }

    destroy() {
        this.scene.events.off('shooter-rotate', this.onShooterRotate, this);
        this.scene.events.off('bubble-shoot', this.onBubbleShoot, this);
        this.scene.events.off('bubble-switch', this.onBubbleSwitch, this);
    }
}