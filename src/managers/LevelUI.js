import TextFormatting from '../utils/TextFormatting.js';
import {
    GAME_WIDTH,
    GAME_HEIGHT,
    BUBBLE_SIZE,
    DELAY_INTRO_ROUND,
    DELAY_INTRO_READY_START,
    DELAY_INTRO_READY_END,
    DELAY_OUTRO_CLEAR,
    DELAY_OUTRO_BONUS,
    DELAY_CURTAIN_CLOSE,
    DELAY_OUTRO_SWITCH,
    OUTRO_LOST,
    OUTRO_TIMEOUT
} from '../constants.js';

export default class LevelUI {

    constructor(scene) {
        this.scene = scene;
        const registry = scene.registry;

        const backgroundContainer = scene.backgroundContainer;
        const targetContainer = scene.targetContainer;
        const uxContainer = scene.uxContainer;
        
        const level = registry.get('level');
        const score = registry.get('score');
        const attempt = registry.get('attempt');

        //background
        backgroundContainer.add(this.scene.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'levelBackground'));
        
        // target
        const targetsprite = scene.add.sprite(scene.GEM.sprite.x, scene.GEM.sprite.y, 'target' + String(level).padStart(2, "0"));
        targetContainer.add(targetsprite);

        const txtTarget = new TextFormatting(scene, {
            text: 'TARGET!',
            vAlign: 'top',
            padding: { x: 0, y: 0 },
            hOffset: -GAME_WIDTH / 2 + scene.GEM.sprite.x,
            vOffset: targetsprite.height,
            fontSize: 35,
            styleColor: '#ffffff',
            styleStroke: { color: '#3159ff', tickness: 4 }
        });
        targetContainer.add(txtTarget);
        targetContainer.setAlpha(0);

        // score
        this.txtScore = new TextFormatting(scene, {
            hAlign: 'left',
            vAlign: 'top',
            padding: { x: BUBBLE_SIZE.x, y: BUBBLE_SIZE.y / 4 },
            text: score,
            padTxt: { size: 8, pad: '0' },
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        });
        uxContainer.add(this.txtScore);

        registry.events.on('changedata', this.onUpdateScore, this);

        // score
        this.txtScorePop = new TextFormatting(scene, {
            text: 0,
            fontSize: BUBBLE_SIZE.y / 2,
            styleColor: ['#f3b5da', '#f22085'],
            styleStroke: { color: '#ffffff', tickness: 3 }
        });
        uxContainer.add(this.txtScorePop);
        this.txtScorePop.visible = false;

        // level
        uxContainer.add(new TextFormatting(scene, {
            vAlign: 'bottom',
            padding: { y: BUBBLE_SIZE.y / 4 },
            text: 'level ' + level,
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        }));

        // attempt
        uxContainer.add(new TextFormatting(scene, {
            hAlign: 'right',
            vAlign: 'bottom',
            padding: { y: BUBBLE_SIZE.y / 4 },
            text: 'attempt ' + attempt,
            fontSize: BUBBLE_SIZE.y / 3,
            styleColor: '#3159ff',
            styleStroke: { color: '#ffffff', tickness: 3 }
        }));

        // round
        this.txtsRound = new TextFormatting(scene, [{
            text: 'ROUND',
            styleColor: ['#143068', '#4195ef']
        }, {
            text: level,
            styleColor: ['#da1047', '#ef9ab6']
        }], {
            vOffset: -180,
            fontSize: 130,
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        uxContainer.add(this.txtsRound);
        this.txtsRound.forEach(txt => uxContainer.add(txt));

        // Ready Go !
        this.txtReady = new TextFormatting(scene, {
            text: 'READY GO!',
            styleColor: ['#da1047', '#ef9ab6'],
            vOffset: -180,
            fontSize: 110,
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        uxContainer.add(this.txtReady);
        this.txtReady.visible = false;

        // Round Clear
        this.txtsClear = new TextFormatting(scene, [{
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
        uxContainer.add(this.txtsClear);
        this.txtsClear.forEach(txt => {
            uxContainer.add(txt)
            txt.visible = false;
        });

        // TIME OVER
        this.txtLost = new TextFormatting(scene, {
            text: 'TIME OVER',
            vOffset: -180,
            fontSize: 100,
            styleColor: ['#222137', '#9494a8'],
            styleStroke: { color: '#ffffff', tickness: 8 }
        });
        uxContainer.add(this.txtLost);
        this.txtLost.visible = false;
    }

    onUpdateScore(...attr) {
        this.txtScore.setText(String(this.scene.registry.get('score')).padStart(8, "0"));
    }


    animIntro() {
        const scene = this.scene;
        const backgroundContainer = scene.backgroundContainer;
        const bubbleContainer = scene.bubbleContainer;
        const targetContainer = scene.targetContainer;

        // 1. Blur simultané
        const fxList = [
            backgroundContainer.postFX.addBlur(200),
            bubbleContainer.postFX.addBlur(200)
        ];

        // 3. Création timeline
        const timeline = scene.add.timeline([
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
            }, {  // clignotement de target
                at: DELAY_INTRO_ROUND,
                run: () => {
                    this.txtsRound.forEach(txt => txt.destroy());
                },
                tween: {
                    targets: targetContainer,
                    ease: 'Linear',
                    alpha: { from: 0, to: 1 },
                    yoyo: true,
                    repeat: 2,
                    duration: (DELAY_INTRO_READY_START - DELAY_INTRO_ROUND) / 6,
                    onComplete: () => targetContainer
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
                    scene.events.emit('level-start');
                }
            }
        ]);

        timeline.play();

    }

    animOutro() {
        const scene = this.scene;
        const registry = scene.registry;

        // 3. Création timeline
        const timeline = scene.add.timeline([
            { // Affichage du message de fin
                at: DELAY_OUTRO_CLEAR,
                run: () => {
                    this.txtsClear[0].visible = true;
                    this.txtsClear[1].visible = true;
                }
            }, { // Affichage de Bonus
                at: DELAY_OUTRO_BONUS,
                run: () => {
                    const scoretimeout = registry.get('scoreTimeout');
                    this.txtsClear[3].setText(scoretimeout);

                    const score = registry.get('score') + scoretimeout;
                    registry.set('score', score);

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
                }
            }, { // Switch de scène
                at: DELAY_OUTRO_SWITCH,
                run: () => {
                    scene.levelNext();
                }
            }
        ]);

        timeline.play();

    }

    animLost() {
        const scene = this.scene;
        const registry = scene.registry;

        // 3. Création timeline
        const timeline = scene.add.timeline([
            { // Affichage du message de fin
                at: 0,
                run: () => {
                    this.txtLost.visible = true;

                    if (registry.get('state') == OUTRO_LOST)
                        this.txtLost.setText('LINE OUT');

                    if (registry.get('state') == OUTRO_TIMEOUT)
                        this.txtLost.setText('TIME OUT');
                }
            }, { // Switch de scène
                at: DELAY_OUTRO_SWITCH,
                run: () => {
                    scene.levelRestart();
                }
            }
        ]);

        timeline.play();

    }

    destroy() {
        this.scene.registry.events.off('changedata', this.updateScore, this);
    }
}