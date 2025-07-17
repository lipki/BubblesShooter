import Bubble from '../components/bubbles/Bubble.js';
import CactusBubble from '../components/bubbles/CactusBubble.js';
import AimingBubble from '../components/bubbles/AimingBubble.js';
import StarBubble from '../components/bubbles/StarBubble.js';
import BombeBubble from '../components/bubbles/BombeBubble.js';
import GemBubble from '../components/bubbles/GemBubble.js';
import NeutreBubble from '../components/bubbles/NeutreBubble.js';
import {
    TILE_EMPTY,
    TILE_CACTUS,
    TILE_AIMING,
    TILE_STAR,
    TILE_BOMBE,
    TILE_GEM,
    TILE_NEUTRE
} from '../constants.js';

export default class BubbleFactory {

    static new(scene, tile, levelNB, container) {

        switch ( tile ) {
            case TILE_EMPTY  : return null;
            case TILE_CACTUS : return new CactusBubble(scene, container);
            case TILE_AIMING : return new AimingBubble(scene, container);
            case TILE_STAR   : return new StarBubble(scene, container);
            case TILE_BOMBE  : return new BombeBubble(scene, container);
            case TILE_GEM    : return scene.GEM = new GemBubble(scene, container, levelNB);
            case TILE_NEUTRE : return new NeutreBubble(scene);
            default : return new Bubble(scene, container, tile);
        }

    }
}