// src/constants.js

// --- Dimensions Globales du Jeu ---
// Définissent la largeur et la hauteur de la zone de jeu principale.
export const GAME_WIDTH = 640;
export const GAME_HEIGHT = 896;

// --- Délais et Durées (en millisecondes) ---
// Ces constantes définissent les durées des animations, des transitions et des événements temporels.

// Durée pour l'apparition du titre initial.
export const TITLE_DELAY = 3000;

// Délais liés aux animations de rideaux (transitions entre scènes ou écrans).
export const DELAY_CURTAIN_OPEN = 360;    // Délais avant l'animation d'ouverture des rideaux.
export const DELAY_CURTAIN_SPEED = 360;   // Vitesse générale des animations de rideaux.
export const DELAY_CURTAIN_CLOSE = 3720;  // Délais avant l'animation de fermeture des rideaux.

// Délais spécifiques à l'introduction d'un round ou d'un niveau.
export const DELAY_INTRO_ROUND = 1760;        // Délai avant l'affichage du numéro de round/niveau.
export const DELAY_INTRO_READY_START = 3320;  // Délai avant l'affichage du texte "READY ?".
export const DELAY_INTRO_READY_END = 4320;    // Délai avant la fin du texte "READY ?" et le début du jeu.

// Délais spécifiques à la fin d'un round ou d'une séquence de jeu.
export const DELAY_OUTRO_CLEAR = 1080;      // Délai avant l'affichage du texte "CLEAR !".
export const DELAY_OUTRO_BONUS = 1640;      // Délai avant l'affichage du texte "BONUS !".
export const DELAY_OUTRO_SWITCH = 4240;     // Délai avant le changement effectif de niveau.

// Délai avant l'affichage à l'écran de "continuer" après une défaite ou un timeout.
export const DELAY_LOST_CONTINUE = 5166;

// Durée totale du minuteur de jeu pour un round/niveau.
export const TIMER_DURATION = 120000; // 120 000 ms = 2 minutes.

// --- Propriétés des Bubbles de Jeu ---
// Dimensions et caractéristiques spécifiques aux bulles dans le jeu de puzzle.
export const BUBBLE_SIZE = { x: 64, y: 74 };      // Largeur (x) et hauteur (y) d'une case hexagonal.
export const BUBBLE_HEXDIFF = (BUBBLE_SIZE.y - BUBBLE_SIZE.x) / 2; // Différence pour le positionnement hexagonal.
export const BUBBLE_HEXSIDE = 37;                 // Longueur d'un côté de l'hexagone de la bulle (pour les calculs).

// --- Positions et Propriétés du Tireur (Shooter) ---
// Coordonnées et comportements liés au mécanisme de tir des bulles.
export const SHOOTER_POS = { x: 320, y: 736 };     // Position (X, Y) du tireur de bulles.
export const STOCK_POS = { x: 472, y: 760 };      // Position (X, Y) de la bulle suivante en stock.
export const SHOOT_DELAY = 500;                  // Délai entre deux tirs successifs.
export const SPEED_MIN = 0.3;                    // Vitesse minimale de rotation ou de déplacement du tireur.
export const SPEED_MAX = 1.5;                    // Vitesse maximale de rotation ou de déplacement du tireur.

// --- Positions du Timer ---
export const NEEDLE_POS = { x: 56, y: GAME_HEIGHT - 106 }; // Position (X, Y) de l'aiguille/indicateur de tir.

// --- Gemmes / Block ---
// Durée des animations (tweens) spécifiques aux gemmes.
export const TWEEN_GEM = 540;

// --- États du Jeu (Screen States) ---
// Ces constantes définissent les différents états du jeu, permettant de contrôler la logique
// et les affichages en fonction de la progression ou des événements.
export const INTRO = 'INTRO';                           // Phase d'introduction du jeu/niveau.
export const PLAYCALCULATEPATH = 'PLAYCALCULATEPATH';   // État où le joueur vise (calcul du chemin de la bulle).
export const PLAYSHOOT = 'PLAYSHOOT';                   // État où la bulle est en train de se déplacer après le tir.
export const OUTRO_WIN = 'OUTRO_WIN';                   // Fin de niveau réussie (victoire).
export const OUTRO_LOST = 'OUTRO_LOST';                 // Fin de niveau perdue (échec).
export const OUTRO_TIMEOUT = 'OUTRO_TIMEOUT';           // Fin de niveau perdue (temps écoulé).
export const LOST_SCREEN = 'LOST_SCREEN';               // État spécifique de l'écran "perdu".

// --- États de Fin de Partie (Game End States) ---
export const END_WIN = 'END_WIN';         // La partie est terminée sur une victoire.
export const END_LOST = 'END_LOST';       // La partie est terminée sur une défaite.
export const END_TIMEOUT = 'END_TIMEOUT'; // La partie est terminée à cause d'un timeout.

// --- correspondance tilemap csv > bubble type ---
export const TILE_EMPTY = -1;
export const TILE_BUBBLES = [0,11];
export const TILE_CACTUS = 12;
export const TILE_AIMING = 13;
export const TILE_STAR = 14;
export const TILE_BOMBE = 15;
export const TILE_GEM = 16;
export const TILE_NEUTRE = 17;
export const TILE_BONUSPOINT = 18;

// --- Liste des niveaux ---
/*export const LEVEL_DATA = [
    {
        chapitre: 'belier',
        level: [
            {number: 1},
            {number: 2},
            {number: 3}
        ],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
]*/