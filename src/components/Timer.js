import TextFormatting from '../utils/TextFormatting.js';
import {
    NEEDLE_POS,
    GAME_WIDTH,
    GAME_HEIGHT,
    END_TIMEOUT
} from '../constants.js';

export default class Timer {

    constructor(scene) {
        this.scene = scene;

        this.background();
        this.listeners();
    }

    background() {
        const scene = this.scene;

        this.cadran = scene.add.sprite(0, GAME_HEIGHT, 'cadran');
        this.cadran.x = this.cadran.width / 2;
        this.cadran.y = this.cadran.y - this.cadran.height / 2;
        this.cadran.stop();
        scene.uxContainer.add(this.cadran);

        this.needle = scene.add.image(0, GAME_HEIGHT, 'needle');
        this.needle.x = NEEDLE_POS.x;
        this.needle.y = NEEDLE_POS.y;
        scene.uxContainer.add(this.needle);

        this.txtTime = new TextFormatting(scene, {
            text: '',
            hOffset: NEEDLE_POS.x - GAME_WIDTH / 2,
            vOffset: NEEDLE_POS.y - GAME_HEIGHT / 2,
            fontSize: 70,
            styleColor: ['#58a2f3', '#021094'],
            styleStroke: { color: '#ffffff', tickness: 4 }
        });
        scene.uxContainer.add(this.txtTime);

    }

    listeners() {
        const events = this.scene.events;
        events.on('level-start', this.onLevelStart, this);
    }

    onLevelStart() {
        const registry = this.scene.registry;
        if (registry.get('debugMode')) console.log('Timer exec level-start');

        this.scene.tweens.add({
            targets: this.needle,
            angle: 360,
            duration: 120000,
            onComplete: () => {
                this.scene.events.emit('level-done', { end: END_TIMEOUT });
            },
            onUpdate: (a, b, c, angle) => {
                const time = Math.round(120 - 120 * a.totalProgress);
                if (angle > 270) {
                    this.cadran.play('blink', true);
                    this.txtTime.setText(time);
                    registry.set('scoreTimeout', 0);
                } else {
                    registry.set('scoreTimeout', (Math.round(((360 - angle) * 100 / 360) / 5) * 5 - 5) * 1000);
                }
                if (time < 10) {
                    const gradient = this.txtTime.context.createLinearGradient(0, 0, 0, this.txtTime.height);
                    gradient.addColorStop(0, '#ffb07f');
                    gradient.addColorStop(1, '#ff2609');
                    this.txtTime.setFill(gradient);
                }
            }
        });
    }

    destroy() {
        const events = this.scene.events;

        events.off('level-start', this.onLevelStart, this);
        events.off('level-done', this.onLevelDone, this);
    }
}