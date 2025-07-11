import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import LevelManager from '../managers/LevelManager.js';
import Shooter from '../components/Shooter.js';
import Timer from '../components/Timer.js';
import Bubble from '../components/Bubble.js';
import TextFormatting from '../utils/TextFormatting.js';

import {
    GAME_WIDTH,
    GAME_HEIGHT,
    INTRO,
    PLAYCALCULATEPATH,
    PLAYSHOOT,
    OUTRO_WIN,
    OUTRO_LOST,
    OUTRO_TIMEOUT,
    BUBBLE_SIZE,
    DELAY_CURTAIN_OPEN,
    DELAY_CURTAIN_SPEED,
    DELAY_INTRO_ROUND,
    DELAY_INTRO_READY_START,
    DELAY_INTRO_READY_END,
    DELAY_OUTRO_CLEAR,
    DELAY_OUTRO_BONUS,
    DELAY_CURTAIN_CLOSE,
    DELAY_OUTRO_SWITCH,
    DELAY_LOST_CONTINUE,
    END_WIN,
    END_LOST,
    END_TIMEOUT,
    STOCK_POS,
    SHOOTER_POS
} from '../constants.js';

export default class BubbleShooterEngine extends Phaser.Scene {
    constructor() {
        super('BubbleShooterEngine');
    }

    create() {
        const registry = this.registry;

        const debugMode = new URLSearchParams(window.location.search).get('debugMode');
        registry.set('debugMode', false);

        if (debugMode != null) {
            console.log('debugMode : on');
            registry.set('debugMode', true);
        }

        registry.set('state', INTRO);

        this.backgroundContainer = this.add.container(0, 0);
        this.bubbleContainer = this.add.container(0, 0);
        this.targetContainer = this.add.container(0, 0);
        this.uxContainer = this.add.container(0, 0);
        this.curtainContainer = this.add.container(0, 0);

        this.levelManager = new LevelManager(this);
        this.shooter = new Shooter(this);
        this.timer = new Timer(this);

        this.listeners();
        this.levelManager.listeners();

        const availabubbles = registry.get('availabubbles');

        registry.set('bubbleInStock', availabubbles[Phaser.Math.Between(0, availabubbles.length - 1)]);
        this.nextBubble();

        this.ux();
        this.background();

        this.animIntro();

    }

    background() {

        const bg = this.add.graphics();

        this.backgroundContainer.add(bg);
        bg.fillStyle(0x21295a, 1);  // couleur hex + alpha
        bg.fillRect(0, 0, this.sys.game.config.width, this.sys.game.config.height);

        // map
        const map = this.make.tilemap({ key: 'border' });
        const layer = map.createLayer('layer', map.addTilesetImage('borders', 'borders'), 0, 0);
        this.backgroundContainer.add(layer);
    }

    ux() {

        // target
        const targetsprite = this.add.sprite(Bubble.GEM.pixel.x, Bubble.GEM.pixel.y, 'target' + String(this.registry.get('level')).padStart(2, "0"));
        this.targetContainer.add(targetsprite);

        const txtTarget = new TextFormatting(this, {
            text: 'TARGET!',
            vAlign: 'top',
            padding: { x: 0, y: 0 },
            hOffset: -GAME_WIDTH / 2 + Bubble.GEM.sprite.x,
            vOffset: Bubble.GEM.sprite.y - Bubble.GEM.sprite.height / 2 + Bubble.GEM.sprite.height,
            fontSize: 35,
            styleColor: '#ffffff',
            styleStroke: { color: '#3159ff', tickness: 4 }
        });
        this.targetContainer.add(txtTarget);
        this.targetContainer.setAlpha(0);

        // score
        this.txtScore = new TextFormatting(this, {
            hAlign: 'left',
            vAlign: 'top',
            padding: { x: BUBBLE_SIZE.x, y: BUBBLE_SIZE.y / 4 },
            text: this.registry.get('score'),
            padTxt: { size: 8, pad: '0' },
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        });
        this.uxContainer.add(this.txtScore);

        this.registry.events.on('changedata', this.updateScore, this);

        // level
        this.uxContainer.add(new TextFormatting(this, {
            vAlign: 'bottom',
            padding: { y: BUBBLE_SIZE.y / 4 },
            text: 'level ' + this.registry.get('level'),
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        }));

        // attempt
        this.uxContainer.add(new TextFormatting(this, {
            hAlign: 'right',
            vAlign: 'bottom',
            padding: { y: BUBBLE_SIZE.y / 4 },
            text: 'attempt ' + this.registry.get('attempt'),
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        }));

        // round
        this.txtsRound = new TextFormatting(this, [{
            text: 'ROUND',
            styleColor: ['#143068', '#4195ef']
        }, {
            text: this.registry.get('level'),
            styleColor: ['#da1047', '#ef9ab6']
        }], {
            vOffset: -180,
            fontSize: 130,
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        this.uxContainer.add(this.txtsRound);
        this.txtsRound.forEach(txt => this.uxContainer.add(txt));

        // Ready Go !
        this.txtReady = new TextFormatting(this, {
            text: 'READY GO!',
            styleColor: ['#da1047', '#ef9ab6'],
            vOffset: -180,
            fontSize: 110,
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        this.uxContainer.add(this.txtReady);
        this.txtReady.visible = false;

        // Round Clear
        this.txtsClear = new TextFormatting(this, [{
            text: 'ROUND',
            hAlign: 'left'
        }, {
            text: 'CLEAR',
            hAlign: 'right'
        }, {
            text: 'BONUS POINT',
            styleColor: ['#155d11', '#7beb3c']
        }, {
            text: '90 000',
            fontSize: 150,
            hAlign: 'center',
            vOffset: 50
        }, {
            text: 'NO BONUS',
            fontSize: 100,
            hAlign: 'center',
            vOffset: 50,
            styleColor: ['#222137', '#9494a8'],
        }], {
            vOffset: -250,
            fontSize: 93,
            styleColor: ['#fb3b0b', '#ffd781'],
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        this.uxContainer.add(this.txtsClear);
        this.txtsClear.forEach(txt => {
            this.uxContainer.add(txt)
            txt.visible = false;
        });

        // Création des rideaux
        this.curtainL = this.add.sprite(GAME_WIDTH / 4, GAME_HEIGHT / 2, 'curtains', 0);
        this.curtainR = this.add.sprite(GAME_WIDTH / 4 * 3, GAME_HEIGHT / 2, 'curtains', 1);
        this.curtainContainer.add(this.curtainL);
        this.curtainContainer.add(this.curtainR);

        // TIME OVER
        this.txtLost = new TextFormatting(this, {
            text: 'TIME OVER',
            vOffset: -180,
            fontSize: 100,
            styleColor: ['#222137', '#9494a8'],
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        this.uxContainer.add(this.txtLost);
        this.txtLost.visible = false;

        // Continue ?
        this.txtContinue = new TextFormatting(this, {
            text: 'CONTINUE ?',
            vOffset: -180,
            fontSize: 100,
            styleColor: ['#66da2f', '#106110', '#84ff39', '#106110', '#84ff39'],
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        this.curtainContainer.add(this.txtContinue);
        this.txtContinue.visible = false;

    }

    updateScore(...attr) {
        this.txtScore.setText(String(this.registry.get('score')).padStart(8, "0"));
    }

    listeners() {
        const events = this.events;
        events.on('level-start', this.onLevelStart, this);
        events.on('level-update', this.onLevelUpdate, this);
        events.on('bubble-shoot', this.onBubbleShoot, this);
        events.on('shoot-end', this.onShootEnd, this);
        events.on('level-done', this.onLevelDone, this);
        events.on('shutdown', this.destroy, this);
    }

    onLevelStart() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-start');

        registry.set('state', PLAYCALCULATEPATH);
    }

    onLevelUpdate() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-update');

        if (registry.get('state') == PLAYSHOOT) {
            registry.set('state', PLAYCALCULATEPATH);
            console.log(registry.get('state'));
        };
    }

    onBubbleShoot() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec bubble-shoot');

        this.nextBubble();
    }

    nextBubble() {
        const registry = this.registry;
        const events = this.events;

        const availabubbles = registry.get('availabubbles');

        registry.set('bubbleForShoot', registry.get('bubbleInStock'));
        registry.set('bubbleInStock', availabubbles[Phaser.Math.Between(0, availabubbles.length -1)]);

        this.onBubbleSwitch();

    }

    onBubbleSwitch() {
        if (this.registry.get('debugMode')) console.log('VFX exec bubble-switch');

        const bubbleForShootID = this.registry.get('bubbleForShoot');

        if (this.bubbleForShoot) this.bubbleForShoot.destroy();

        this.bubbleForShoot = this.add.sprite(STOCK_POS.x, STOCK_POS.y, 'bubbles_sprites', bubbleForShootID);
        this.bubbleContainer.add(this.bubbleForShoot);

        this.tweens.add({
            targets: this.bubbleForShoot,
            ease: 'Sine.easeIn',
            x: SHOOTER_POS.x,
            y: SHOOTER_POS.y,
            duration: 200
        });

        const bubbleInStockID = this.registry.get('bubbleInStock');

        if (this.bubbleInStock) this.bubbleInStock.destroy();

        const emitter = this.add.particles(0, 0, 'bubbles_sprites', {
            x: { min: STOCK_POS.x - 32, max: STOCK_POS.x + 32 },
            y: { min: STOCK_POS.y - 32, max: STOCK_POS.y + 32 },
            moveToX: {
                onEmit: () => STOCK_POS.x,
                onUpdate: () => STOCK_POS.x
            },
            moveToY: {
                onEmit: () => STOCK_POS.y,
                onUpdate: () => STOCK_POS.y
            },
            lifespan: 1000,
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: .5, end: 0 },
            frame: bubbleInStockID - 12,
            quantity: { start: 5, end: 0 }
        });
        this.bubbleContainer.add(emitter);

        this.bubbleInStock = this.add.sprite(STOCK_POS.x, STOCK_POS.y, 'bubbles_sprites', bubbleInStockID);
        this.bubbleContainer.add(this.bubbleInStock);
        this.bubbleInStock.alpha = 0;

        this.time.delayedCall(200, () => {
            emitter.stop();
        });

        this.tweens.add({
            targets: this.bubbleInStock,
            ease: 'Sine.easeIn',
            duration: 800,
            alpha: 1
        });
    }

    onShootEnd() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec shoot-end');

        if (registry.get('state') == PLAYSHOOT) {
            registry.set('state', PLAYCALCULATEPATH);
        };
    }

    onLevelDone(data) {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-done');

        if (data.end == END_WIN) {
            registry.set('state', OUTRO_WIN);
            this.animOutro();
        }

        if (data.end == END_LOST) {
            registry.set('state', OUTRO_LOST);
            this.animLost();
        }

        if (data.end == END_TIMEOUT) {
            registry.set('state', OUTRO_TIMEOUT);
            this.animLost();
        }
    }

    onLevelNext() {
        const registry = this.registry;
        if (registry.get('debugMode')) console.log('Engine exec level-next');

        registry.set('level', registry.get('level') + 1);
        this.scene.restart('BubbleShooterEngine');
    }

    update() {
        this.shooter.update();
    }

    destroy() {
        const events = this.events;

        this.levelManager.destroy();
        this.timer.destroy();

        events.off('level-start', this.onLevelStart, this);
        events.off('level-update', this.onLevelUpdate, this);
        events.off('bubble-shoot', this.onBubbleShoot, this);
        events.off('shoot-end', this.onShootEnd, this);
        events.off('level-done', this.onLevelDone, this);
        events.off('shutdown', this.destroy, this);

        this.anims.remove('target');
        this.anims.remove('idle');
    }













    animIntro() {

        // 1. Blur simultané
        const fxList = [
            this.backgroundContainer.postFX.addBlur(200),
            this.bubbleContainer.postFX.addBlur(200)
        ];

        // 3. Création timeline
        const timeline = this.add.timeline([
            { // défloutage des Bubbles
                at: 0,
                tween: {
                    targets: fxList,
                    strength: 0,
                    duration: 1000,
                    onComplete: () => {
                        fxList.forEach(fx => fx.destroy());
                    }
                }
            }, {  // ouverture des rideaux
                at: DELAY_CURTAIN_OPEN,
                tween: {
                    targets: this.curtainL,
                    x: 0,
                    scaleX: 0.2,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, {  // ouverture des rideaux
                at: DELAY_CURTAIN_OPEN,
                tween: {
                    targets: this.curtainR,
                    x: GAME_WIDTH,
                    scaleX: 0.2,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, {  // clignotement de target
                at: DELAY_INTRO_ROUND,
                run: () => {
                    this.txtsRound.forEach(txt => txt.destroy());
                },
                tween: {
                    targets: this.targetContainer,
                    ease: 'Linear',
                    alpha: { from: 0, to: 1 },
                    yoyo: true,
                    repeat: 2,
                    duration: (DELAY_INTRO_READY_START - DELAY_INTRO_ROUND) / 6,
                    onComplete: () => this.targetContainer
                }
            }, { // apparition de ready go
                at: DELAY_INTRO_READY_START,
                run: () => {
                    this.txtReady.visible = true;
                }
            }, { // prise de contrôle par le joueur
                at: DELAY_INTRO_READY_END,
                run: () => {
                    this.txtReady.destroy();
                    this.events.emit('level-start');
                }
            }
        ]);

        timeline.play();

    }

    animOutro() {

        // 3. Création timeline
        const timeline = this.add.timeline([
            { // Affichage du message de fin
                at: DELAY_OUTRO_CLEAR,
                run: () => {
                    this.txtsClear[0].visible = true;
                    this.txtsClear[1].visible = true;
                }
            }, { // Affichage de Bonus
                at: DELAY_OUTRO_BONUS,
                run: () => {
                    const scoretimeout = this.registry.get('scoreTimeout');
                    this.txtsClear[3].setText(scoretimeout);

                    const score = this.registry.get('score') + scoretimeout;
                    this.registry.set('score', score);

                    this.txtsClear[2].visible = true;

                    if (scoretimeout == 0)
                        this.txtsClear[4].visible = true;
                    else this.txtsClear[3].visible = true;
                }
            }, { // Texte disparait sauf bonus point
                at: DELAY_CURTAIN_CLOSE,
                run: () => {
                    this.txtsClear[0].destroy();
                    this.txtsClear[1].destroy();
                    this.txtsClear[2].destroy();
                },
                tween: {
                    targets: this.curtainL,
                    x: GAME_WIDTH / 4,
                    scaleX: 1,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, { // Texte disparait sauf bonus point
                at: DELAY_CURTAIN_CLOSE,
                tween: {
                    targets: this.curtainR,
                    x: GAME_WIDTH / 4 * 3,
                    scaleX: 1,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, { // Switch de scène
                at: DELAY_OUTRO_SWITCH,
                run: () => {
                    this.onLevelNext();
                }
            }
        ]);

        timeline.play();

    }

    animLost() {
        const registry = this.registry;

        // 3. Création timeline
        const timeline = this.add.timeline([
            { // Affichage du message de fin
                at: 0,
                run: () => {
                    this.txtLost.visible = true;

                    if (registry.get('state') == OUTRO_LOST)
                        this.txtLost.setText('LINE OUT');

                    if (registry.set('state') == OUTRO_TIMEOUT)
                        this.txtLost.setText('TIME OUT');
                }
            }, { // Rideau
                at: DELAY_CURTAIN_CLOSE,
                tween: {
                    targets: this.curtainL,
                    x: GAME_WIDTH / 4,
                    scaleX: 1,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, { // Rideau
                at: DELAY_CURTAIN_CLOSE,
                tween: {
                    targets: this.curtainR,
                    x: GAME_WIDTH / 4 * 3,
                    scaleX: 1,
                    ease: 'Sine.easeIn',
                    duration: DELAY_CURTAIN_SPEED
                }
            }, { // Affichage du message du message continue
                at: DELAY_LOST_CONTINUE,
                run: () => {
                    console.log('txtContinue')
                    this.txtContinue.visible = true;
                }
            }
        ]);

        timeline.play();

    }
}