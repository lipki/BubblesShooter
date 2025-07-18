import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import CurtainScene from './scenes/CurtainScene.js'
import ChapitreScene from './scenes/ChapitreScene.js'
import LevelEngine from './scenes/LevelEngine.js';
import InputManagerScene from './scenes/InputManagerScene.js';

const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
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
    scene: [BootScene, InputManagerScene, PreloadScene, CurtainScene, LevelEngine, ChapitreScene],
});