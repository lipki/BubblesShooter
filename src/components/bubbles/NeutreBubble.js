import Bubble from './Bubble.js';
import { TILE_NEUTRE } from '../../constants.js';

export default class NeutreBubble extends Bubble {

    constructor(scene) {
        super(scene, null, TILE_NEUTRE);
        
        this.spritesheet = null;
        this.tag = 'neutre';
    }

    createSprite( pixel ) { return }

    explode () { return }

    fall() { return }

    switch () { return }

    spawn() { return }

    applyEffect() { return }

}