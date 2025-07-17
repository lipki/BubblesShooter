import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import LevelManager from '../managers/LevelManager.js';
import LevelUI from '../managers/LevelUI.js';
import Shooter from '../components/Shooter.js';
import Timer from '../components/Timer.js';

import {
    INTRO,
    PLAYCALCULATEPATH,
    PLAYSHOOT,
    OUTRO_WIN,
    OUTRO_LOST,
    OUTRO_TIMEOUT,
    END_WIN,
    END_LOST,
    END_TIMEOUT
} from '../constants.js';

export default class LevelEngine extends Phaser.Scene {
    constructor() {
        super('LevelEngine');
    }

    create() {
        const registry = this.registry;

        registry.set('state', INTRO);

        this.aimingTime = 0;
        this.GEM = null;

        this.backgroundContainer = this.add.container(0, 0);
        this.bubbleContainer = this.add.container(0, 0);
        this.particleContainer = this.add.container(0, 0);
        this.shooterContainer = this.add.container(0, 0);
        this.targetContainer = this.add.container(0, 0);
        this.uxContainer = this.add.container(0, 0);

        Shooter.container = this.shooterContainer;

        this.levelManager = new LevelManager(this);
        this.shooter = new Shooter(this);
        this.timer = new Timer(this);
        this.LevelUI = new LevelUI(this);

        this.listeners();
        this.levelManager.listeners();
        this.shooter.listeners();

        this.LevelUI.animIntro();

    }

    listeners() {
        const events = this.events;
        events.on('level-start', this.onLevelStart, this);
        events.on('level-update', this.onLevelUpdate, this);
        events.on('shoot-end', this.onShootEnd, this);
        events.on('level-done', this.onLevelDone, this);
        events.on('shutdown', this.destroy, this);
    }

    onLevelStart() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-start');

        registry.set('state', PLAYCALCULATEPATH);
        registry.set('activeGameScene', 'LevelEngine');
    }

    onLevelUpdate() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-update');

        if (registry.get('state') == PLAYSHOOT)
            registry.set('state', PLAYCALCULATEPATH);
    }

    onShootEnd(data) {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec shoot-end');

        if (registry.get('state') == PLAYSHOOT)
            registry.set('state', PLAYCALCULATEPATH);
    }

    onLevelDone(data) {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-done');

        registry.set('activeGameScene', '');
        this.timer.stop();

        if (data.end == END_WIN) {
            registry.set('state', OUTRO_WIN);
            this.LevelUI.animOutro();
        }

        if (data.end == END_LOST) {
            registry.set('state', OUTRO_LOST);
            registry.set('attempt', registry.get('attempt')+1);
            this.LevelUI.animLost();
        }

        if (data.end == END_TIMEOUT) {
            registry.set('state', OUTRO_TIMEOUT);
            registry.set('attempt', registry.get('attempt')+1);
            this.LevelUI.animLost();
        }
    }

    levelNext() {
        const registry = this.registry;

        registry.set('level', registry.get('level') + 1);

        if( registry.get('level') % 3 == 1 )
            this.scene.launch('CurtainScene', { action: 'next', prevScene: 'LevelEngine', nextScene: 'ChapitreScene' });
        else
            this.scene.launch('CurtainScene', { action: 'next', prevScene: 'LevelEngine', nextScene: 'LevelEngine' });
    }

    levelRestart() {
        const registry = this.registry;

        this.scene.launch('CurtainScene', { action: 'lost', prevScene: 'LevelEngine', nextScene: 'LevelEngine' });
    }

    /*update() {
        this.shooter.update();
    }*/

    destroy() {
        const events = this.events;

        this.levelManager.destroy();
        this.timer.destroy();
        this.LevelUI.destroy();
        this.shooter.destroy();

        events.off('level-start', this.onLevelStart, this);
        events.off('level-update', this.onLevelUpdate, this);
        events.off('shoot-end', this.onShootEnd, this);
        events.off('level-done', this.onLevelDone, this);
        events.off('shutdown', this.destroy, this);

        this.anims.remove('target');
        this.anims.remove('idle');
    }

}