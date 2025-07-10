import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TextFormatting from '../utils/TextFormatting.js';

import {
    GAME_WIDTH,
    GAME_HEIGHT,
    TITLE_DELAY,
    BUBBLE_SIZE
} from '../constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');

        this.isTime = false;
        this.isPreload = false;

        TextFormatting.width = GAME_WIDTH;
        TextFormatting.height = GAME_HEIGHT;
        TextFormatting.staticOptions = { padding: { x: BUBBLE_SIZE.x, y: BUBBLE_SIZE.y } };
    }

    preload() {
        this.load.image('titleScene', 'assets/images/titleScene.png'); // Image de fond
    }

    create() {
        const scene = this.scene;

        // preload
        scene.launch('PreloadScene');

        this.time.delayedCall(TITLE_DELAY, () => {
            this.isTime = true;
            if (this.isTime && this.isPreload)
                this.gameStart();
        });

        scene.get('PreloadScene').events.on('ready', () => {
            this.isPreload = true;
            scene.stop('PreloadScene');
            if (this.isTime && this.isPreload)
                this.gameStart();
        });

        // variables init
        const registry = this.registry;
        registry.set('level', 1);
        registry.set('score', 0);
        registry.set('attempt', 0);
        registry.set('scoreTimeout', 0);


        this.longLoad();

        this.ux();
    }

    ux() {
        const scene = this.scene;

        // background
        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'titleScene'); // Centre de l'écran

        // texte crédit
        new TextFormatting(this, {
            vAlign: 'bottom',
            text: '®1995 VISCO CORPORATION\nALL RIGHTS RESERVED\nLISENCED FROM TAITO CORPORATION\n\n🄯illegal remake 2025',
            fontSize: 20,
            styleColor: '#1828c6',
            styleStroke: { color: '#ffffff', tickness: 3 }
        });

        new TextFormatting(this, {
            vAlign: 'top',
            text: 'loading',
            fontSize: 40,
            styleColor: '#1828c6',
            styleStroke: { color: '#ffffff', tickness: 3 }
        });

    }

    longLoad() {
        const load = this.load;

        load.aseprite('gem02', 'assets/images/gem02.png', 'assets/images/gem02.json');
        load.image('target02', 'assets/images/target02.png');
        load.text('level02', 'assets/maps/lvl02.csv');

        load.aseprite('gem03', 'assets/images/gem03.png', 'assets/images/gem03.json');
        load.image('target03', 'assets/images/target03.png');
        load.text('level03', 'assets/maps/lvl03.csv');

        load.start();
    }

    gameStart() {
        const scene = this.scene;
        this.anims.createFromAseprite('bubbles_sprites');
        this.anims.createFromAseprite('cadran');
        this.anims.anims.entries.und.repeat = -1;
        this.anims.anims.entries.blink.repeat = -1;



        scene.start('BubbleShooterEngine');
    }
}