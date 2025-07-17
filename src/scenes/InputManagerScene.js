import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    PLAYCALCULATEPATH,
    PLAYSHOOT,
    LOST_SCREEN,
    SHOOT_DELAY
} from '../constants.js';

export default class InputManagerScene extends Phaser.Scene {
    constructor() {
        super('InputManagerScene');
        this.keys = {};

        this.lastActionFireTime = 0;
    }

    create() {// Définir les différentes touches possibles pour chaque action
        // Vous pouvez rendre cela configurable (par exemple, depuis un fichier de configuration, des préférences utilisateur)
        this.actionKeys = {
            'move-left': [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
            ],
            'move-right': [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
            ],
            'slow': [
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
                this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO)
            ]
        };

        this.keys = this.input.keyboard.addKeys({
            action: Phaser.Input.Keyboard.KeyCodes.SPACE,
            debug: Phaser.Input.Keyboard.KeyCodes.ZERO
        });

        // Écouteur pour les appuis ponctuels
        this.keys.debug.on('up', this.toggleDebugMode, this); // 'up' pour éviter la répétition si maintenu
    }

    update() {
        const registry = this.registry;
        const currentGameState = registry.get('state'); // Par exemple: INTRO, PLAYCALCULATEPATH, OUTRO_WIN, etc.

        // Fonction utilitaire pour vérifier si AU MOINS UNE des touches pour une action est enfoncée
        const isActionDown = (actionName) => {
            return this.actionKeys[actionName] && this.actionKeys[actionName].some(key => key.isDown);
        };

        // Gérer les inputs spécifiques au jeu principal (LevelEngine)
        if (   currentGameState === PLAYCALCULATEPATH
            || currentGameState === PLAYSHOOT) {
            
            if (isActionDown('slow'))
                this.events.emit('game-input-slow');
            
            if (isActionDown('move-left'))
                this.events.emit('game-input-move-left');
            
            if (isActionDown('move-right'))
                this.events.emit('game-input-move-right');

        }
        if ( currentGameState === PLAYCALCULATEPATH ) {
            if (this.keys.action.isDown && this.time.now > this.lastActionFireTime + SHOOT_DELAY ) {
                this.events.emit('game-input-action');
                this.lastActionFireTime = this.time.now;
            }
            if (this.keys.action.isUp)
                this.lastActionFireTime = 0;
        }
        // Ecran de continue
        else if (currentGameState === LOST_SCREEN) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.action)) {
                this.events.emit('curtain-input-confirm');
            }
        }

        this.events.emit('game-update-after');
    }

    // Exemple de fonction pour le basculement du debug mode
    toggleDebugMode() {
        const registry = this.registry;
        const currentDebugMode = registry.get('debugMode');
        registry.set('debugMode', !currentDebugMode);
        console.log('Debug Mode: ', registry.get('debugMode') ? 'ON' : 'OFF');
    }
}