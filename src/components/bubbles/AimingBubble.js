import Bubble from './Bubble.js';
import { TILE_AIMING } from '../../constants.js';

export default class AimingBubble extends Bubble {

    constructor(scene, container) {
        super(scene, container, TILE_AIMING);
        
        this.spritesheet = 'aiming';
        this.tag = 'aiming';
        this.anim = 'aiming';

    }

    createSprite( pixel ) { super.createSprite( pixel ) }

    fall() { this.explode() }

    applyEffect( levelManager ) {

        this.scene.aimingTime = 11;
        this.explode();

        levelManager.scorePop( this.tile, 1 );

    }

}