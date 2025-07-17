import Bubble from './Bubble.js';
import {
    TILE_GEM,
    TWEEN_GEM,
    END_WIN
} from '../../constants.js';

export default class GemBubble extends Bubble {

    constructor(scene, container, levelNB) {

        scene.anims.createFromAseprite('gem'+levelNB);
        scene.anims.anims.entries.idle.repeat = -1;

        super(scene, container, TILE_GEM);
        
        this.levelNB = levelNB;
        this.spritesheet = 'gem' + this.levelNB;
        this.tag = 'gemcenter';
        this.anim = 'idle';

    }

    createSprite( pixel ) {
        super.createSprite( pixel );
        this.sprite.x = this.tile.pixel.x + this.sprite.width / 2 - 160;
        this.sprite.y = this.tile.pixel.y + this.sprite.height / 2 - 196.950;
    }

    explode () { return }

    fall() {
        const scene = this.scene;

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

        this.tile.empty();
    }

    switch () { return }

    spawn() { return }

    applyEffect() { return }

}