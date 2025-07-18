import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const load = this.load;
        load.image('levelBackground', 'assets/images/levelBackground.png');
        load.image('chapitreBackground', 'assets/images/chapitreBackground.png');
        load.spritesheet('curtains', 'assets/images/curtains.png', { frameWidth: GAME_WIDTH / 2, frameHeight: GAME_HEIGHT });

        load.spritesheet('bubbles', 'assets/images/bubbles.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('particles', 'assets/images/particles.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('aiming', 'assets/images/aiming.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('star', 'assets/images/star.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('bombe', 'assets/images/bombe.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('cactus', 'assets/images/cactus.png', { frameWidth: 74, frameHeight: 74 });
        load.spritesheet('tinyBubbles', 'assets/images/tinyBubbles.png', { frameWidth: 16, frameHeight: 16 });
        load.spritesheet('cadran', 'assets/images/cadran.png', { frameWidth: 192, frameHeight: 256 });

        load.image('shooter', 'assets/images/shooter.png');

        load.image('needle', 'assets/images/needle.png');

        load.aseprite('gem01', 'assets/images/gem01.png', 'assets/images/gem01.json');
        load.image('target01', 'assets/images/target01.png');
        load.text('level01', 'assets/maps/lvl_01.csv');
        load.image('chap_01', 'assets/images/chap_01.png');

        load.on('complete', () => this.events.emit('ready'));
    }

    create() {
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'titleScene'); // Centre de l'écran
    }
}