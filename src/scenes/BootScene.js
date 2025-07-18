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
        TextFormatting.staticOptions = { padding: { x: BUBBLE_SIZE.x, y: BUBBLE_SIZE.x } };
    }

    preload() {
        this.load.image('titleScene', 'assets/images/titleScene.png'); // Image de fond
    }

    create() {
        const registry = this.registry;

        const debugMode = new URLSearchParams(window.location.search).get('debugMode');
        registry.set('debugMode', false);

        if (debugMode != null) {
            console.log('debugMode : on');
            registry.set('debugMode', true);
        }

        const debugLevel = Number(new URLSearchParams(window.location.search).get('debugLevel'));

        // preload
        this.scene.launch('PreloadScene');

        this.time.delayedCall(TITLE_DELAY, () => {
            this.isTime = true;
            if (this.isTime && this.isPreload)
                this.gameStart();
        });

        this.scene.get('PreloadScene').events.on('ready', () => {
            this.isPreload = true;
            this.scene.stop('PreloadScene');
            if (this.isTime && this.isPreload)
                this.gameStart();
        });

        // variables init
        registry.set('level', 1);
        registry.set('score', 0);
        registry.set('attempt', 0);
        registry.set('scoreTimeout', 0);

        if (debugLevel != null && debugLevel > 1) {
            console.log('debugLevel : ', debugLevel);
            registry.set('level', debugLevel);
        }


        this.longLoad();
        this.ux();
    }

    ux() {
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

        for( let i = 2 ; i <= 39 ; i++ ) {
            const levelNB = String(i).padStart(2, "0");
            load.aseprite('gem'+levelNB, 'assets/images/gem'+levelNB+'.png', 'assets/images/gem'+levelNB+'.json');
            load.image('target'+levelNB, 'assets/images/target'+levelNB+'.png');
            load.text('level'+levelNB, 'assets/maps/lvl_'+levelNB+'.csv');

            if( i % 3 == 0 && i/3 < 13 ) {
                const chapNB = String(i/3+1).padStart(2, "0");
                load.image('chap_'+chapNB, 'assets/images/chap_'+chapNB+'.png');
            }
        }

        load.start();
    }

    gameStart() {
        this.anims.create({ key: 'aiming', frames: 'aiming', frameRate: 15, repeat: -1 });
        this.anims.create({ key: 'bombe', frames: 'bombe', frameRate: 15, repeat: -1 });
        this.anims.create({ key: 'star', frames: 'star', frameRate: 15, repeat: -1 });
        this.anims.create({ key: 'cactus', frames: 'cactus', frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'tinyBubbles', frames: 'tinyBubbles', frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'blink', frames: 'cadran', frameRate: .5, repeat: -1 });

        this.scene.launch('InputManagerScene');

        // plus tard il y aura un bouton pour lancer le premier niveau.
        this.scene.launch('CurtainScene', { action: 'start', prevScene: 'BootScene', nextScene: 'LevelEngine' });
    }
}