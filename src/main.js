import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import BubbleShooterEngine from './scenes/BubbleShooterEngine.js';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    //render: { pixelArt: true },
    transparent: true,
    max: {
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    parent: "body",
    scene: [BootScene, PreloadScene, BubbleShooterEngine],
});