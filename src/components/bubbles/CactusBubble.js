import Bubble from './Bubble.js';
import { TILE_CACTUS } from '../../constants.js';

export default class CactusBubble extends Bubble {

    constructor(scene, container) {
        super(scene, container, TILE_CACTUS);
        
        this.spritesheet = 'cactus';
        this.tag = 'cactus';
        this.anim = 'cactus';

    }

    createSprite( pixel ) { super.createSprite( pixel ) }

    switch () { return }

    applyEffect() { return }

}