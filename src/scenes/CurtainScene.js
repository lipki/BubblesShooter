import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import TextFormatting from '../utils/TextFormatting.js';

import {
    GAME_WIDTH,
    GAME_HEIGHT,
    DELAY_CURTAIN_SPEED,
    LOST_SCREEN
} from '../constants.js';

export default class CurtainScene extends Phaser.Scene {
    constructor() {
        super('CurtainScene');
    }

    create(data) {

        this.uuid = Phaser.Math.Between(0, 100000);

        this.curtainL = this.add.sprite(0, GAME_HEIGHT / 2, 'curtains', 0);
        this.curtainR = this.add.sprite(GAME_WIDTH, GAME_HEIGHT / 2, 'curtains', 1);
        this.curtainL.scaleX = 0.2;
        this.curtainR.scaleX = 0.2;

        this.prevSceneToLaunch = data.prevScene;
        this.nextSceneToLaunch = data.nextScene;

        this.inputManagerEvents = this.scene.get('InputManagerScene').events;
        this.inputManagerEvents.on('curtain-input-confirm', this.continueGame, this);
        this.events.on('shutdown', this.destroy, this);

        this.islost = data.action == 'lost';

        this.registry.set('activeGameScene', 'CurtainScene');
        
        this.close();
    }
    
    continueGame() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('CurtainScene exec curtain-input-confirm');

        if( this.islost ) this.next();
    }

    close() {
        this.tweens.add({
            targets: this.curtainL,
            x: GAME_WIDTH / 4,
            scaleX: 1,
            ease: 'Sine.easeIn',
            duration: DELAY_CURTAIN_SPEED
        });
        this.tweens.add({
            targets: this.curtainR,
            x: GAME_WIDTH / 4 * 3,
            scaleX: 1,
            ease: 'Sine.easeIn',
            duration: DELAY_CURTAIN_SPEED,
            onComplete: () => this.wait()
        });
    }

    wait() {
        
        this.scene.stop(this.prevSceneToLaunch);
        
        this.registry.set('state', LOST_SCREEN);

        // Continue ?
        if( this.islost )
            this.txtContinue = new TextFormatting(this, {
                text: 'CONTINUE ?',
                vOffset: -180,
                fontSize: 100,
                styleColor: ['#66da2f', '#106110', '#84ff39', '#106110', '#84ff39'],
                styleStroke: { color: '#ffffff', tickness: 8 }
            });
        else
            this.time.delayedCall(520, () => this.next(), [], this);
    }

    next() {
        this.scene.launch(this.nextSceneToLaunch);
        this.scene.sendToBack(this.nextSceneToLaunch);
        this.open();
    }

    open() {
        this.tweens.add({
            targets: this.curtainL,
            x: 0,
            scaleX: 0.2,
            ease: 'Sine.easeIn',
            duration: DELAY_CURTAIN_SPEED
        });
        this.tweens.add({
            targets: this.curtainR,
            x: GAME_WIDTH,
            scaleX: 0.2,
            ease: 'Sine.easeIn',
            duration: DELAY_CURTAIN_SPEED,
            onComplete: () => {
                this.scene.stop('CurtainScene');
            }
        });
    }

    destroy() {
        this.events.off('shutdown', this.destroy, this);

        this.inputManagerEvents = this.scene.get('InputManagerScene').events;
        this.inputManagerEvents.off('curtain-input-confirm', this.continueGame, this);
    }
}