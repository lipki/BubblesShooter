import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        const load = this.load;
        load.image('borders', 'assets/images/borders.png');
        load.image('bubbles', 'assets/images/bubbles.png');
        load.image('shooter', 'assets/images/shooter.png');
        load.spritesheet('curtains', 'assets/images/curtains.png', { frameWidth: GAME_WIDTH / 2, frameHeight: GAME_HEIGHT });
        load.image('needle', 'assets/images/needle.png');

        load.aseprite('bubbles_sprites', 'assets/images/bubbles.png', 'assets/images/bubbles.json');
        load.aseprite('cadran', 'assets/images/cadran.png', 'assets/images/cadran.json');

        load.tilemapTiledJSON('border', 'assets/tilemaps/border.json');

        load.aseprite('gem01', 'assets/images/gem01.png', 'assets/images/gem01.json');
        load.image('target01', 'assets/images/target01.png');
        load.text('level01', 'assets/maps/lvl01.csv');

        load.on('complete', () => this.events.emit('ready'));
    }

    create() {

        this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'titleScene'); // Centre de l'écran
    }
}