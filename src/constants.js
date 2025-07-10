export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 896;

export const TITLE_DELAY = 3000;

export const DELAY_CURTAIN_OPEN = 360;
export const DELAY_CURTAIN_SPEED = 360;
export const DELAY_INTRO_ROUND = 1760;
export const DELAY_INTRO_READY_START = 3320;
export const DELAY_INTRO_READY_END = 4320;

export const DELAY_OUTRO_CLEAR = 1080;
export const DELAY_OUTRO_BONUS = 1640;
export const DELAY_CURTAIN_CLOSE = 3720;
export const DELAY_OUTRO_SWITCH = 4240;

export const DELAY_LOST_CONTINUE = 5166;

export const BUBBLE_SIZE = { x: 64, y: 74 };
export const BUBBLE_HEXDIFF = (BUBBLE_SIZE.y - BUBBLE_SIZE.x) / 2;
export const BUBBLE_HEXSIDE = 37;

export const LAYER_POS = { x: BUBBLE_SIZE.x * 1.5 - BUBBLE_HEXDIFF, y: 4 };

export const SHOOTER_POS = { x: 320, y: 736 };
export const STOCK_POS = { x: 472, y: 760 };
export const NEEDLE_POS = { x: 56, y: GAME_HEIGHT - 106 };
export const SHOOT_DELAY = 500;
export const SPEED_MIN = 0.3;
export const SPEED_MAX = 1.5;

export const GEM_OFFSET_X = [0, 48, 0];
export const GEM_OFFSET_Y = [36.950, 26, 54];

export const TWEEN_GEM = 540;

export const INTRO = 'INTRO';
export const PLAYCALCULATEPATH = 'PLAYCALCULATEPATH';
export const PLAYSHOOT = 'PLAYSHOOT';
export const OUTRO_WIN = 'OUTRO_WIN';
export const OUTRO_LOST = 'OURO_LOST';
export const OUTRO_TIMEOUT = 'OUTRO_TIMEOUT';

export const END_WIN = 'END_WIN';
export const END_LOST = 'END_LOST';
export const END_TIMEOUT = 'END_TIMEOUT';