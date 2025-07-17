import Bubble from './Bubble.js';
import { TILE_BOMBE } from '../../constants.js';

export default class BombeBubble extends Bubble {

    constructor(scene, container) {
        super(scene, container, TILE_BOMBE);
        
        this.spritesheet = 'bombe';
        this.tag = 'bombe';
        this.anim = 'bombe';

    }

    createSprite( pixel ) { super.createSprite( pixel ) }

    fall() { this.explode(); }

    applyEffect( levelManager ) {

        let score = 0;
        const group = [...this.tile.neighbors];
        group.push(this.tile);
        group.forEach( tile => {
            if(tile && tile.bubble)
                tile.bubble.explode() ? score++ : 0;
        });

        levelManager.scorePop( this.tile, levelManager.getScore(score) );

    }

}