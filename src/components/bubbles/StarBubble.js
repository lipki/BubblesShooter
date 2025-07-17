import Bubble from './Bubble.js';
import {
    TILE_STAR,
    TILE_BUBBLES
} from '../../constants.js';

export default class StarBubble extends Bubble {

    constructor(scene, container) {
        super(scene, container, TILE_STAR);
        
        this.spritesheet = 'star';
        this.tag = 'star';
        this.anim = 'star';

    }

    createSprite( pixel ) { super.createSprite( pixel ) }

    fall() { this.explode() }

    applyEffect( levelManager, touch ) {

        let score = 0;

        if( touch < TILE_BUBBLES[0] || touch > TILE_BUBBLES[1] ) {
            this.explode();
            return;
        }

        const group = levelManager.findSameColor(this, touch);
        group.push(this);
        group.forEach( bubble => {
            if(bubble)
                bubble.explode() ? score++ : 0;
        });

        levelManager.scorePop( this.tile, levelManager.getScore(score) );

    }
}