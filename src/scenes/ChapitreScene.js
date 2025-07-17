import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';

import {
    GAME_WIDTH,
    GAME_HEIGHT
} from '../constants.js';

export default class ChapitreScene extends Phaser.Scene {
    constructor() {
        super('ChapitreScene');
    }

    create() {
        
        const chapNB = String((this.registry.get('level')-1)/3).padStart(2, "0");

        //background
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'chapitreBackground');
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'chap_'+chapNB);


        this.time.delayedCall(3000, () => {

            this.scene.launch('CurtainScene', { action: 'next', prevScene: 'ChapitreScene', nextScene: 'LevelEngine' });

        }, [], this);

    }
}