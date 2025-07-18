import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import BubbleFactory from './BubbleFactory.js';
import {
    SHOOTER_POS,
    STOCK_POS,
    SPEED_MIN,
    SPEED_MAX,
    PLAYSHOOT
} from '../constants.js';

export default class Shooter {

    static container = null;
    static availabubbles = [];

    constructor(scene) {
        this.scene = scene;

        this.keys = null;
        this.cursors = null;
        this.shootTime = 0;
        this.shootTween = null;
        this.speed = SPEED_MAX;
        this.angle = 0;

        this.bubbleInStock = null;
        this.bubbleForShoot = null;
        this.shootDestination = null;

        this.tinyBubbleList = new Array(20);

        for (let i = 0; i < 20; i++) {
            this.tinyBubbleList[i] = this.scene.add.sprite(-100, -100, 'tinyBubbles');
            Shooter.container.add(this.tinyBubbleList[i]);
        }
        this.scene.anims.staggerPlay('tinyBubbles', this.tinyBubbleList, 1000/4);

        this.sprite = scene.add.image(SHOOTER_POS.x, SHOOTER_POS.y, 'shooter');
        scene.shooterContainer.add(this.sprite);

        if (scene.registry.get('debugMode')) this.graphics = scene.add.graphics();

        if( !this.bubbleInStock ) this.nextBubble();
        this.nextBubble();
    }

    listeners() {
        this.inputManagerEvents = this.scene.scene.get('InputManagerScene').events;
        this.inputManagerEvents.on('game-update-after', this.onUpdateAfter, this);
        this.inputManagerEvents.on('game-input-move-left', this.onMoveLeft, this);
        this.inputManagerEvents.on('game-input-move-right', this.onMoveRight, this);
        this.inputManagerEvents.on('game-input-action', this.onAction, this);
        this.inputManagerEvents.on('game-input-slow', this.onSlow, this);
    }

    nextBubble() {
        const newBubble = Shooter.availabubbles[Phaser.Math.Between(0, Shooter.availabubbles.length -1)];
        
        if( this.bubbleInStock ) {
            this.bubbleForShoot = this.bubbleInStock;
            this.bubbleForShoot.switch();
        }

        this.bubbleInStock = BubbleFactory.new(this.scene, newBubble, -1, Shooter.container);
        this.bubbleInStock.createSprite({x: STOCK_POS.x, y: STOCK_POS.y});
        this.bubbleInStock.spawn();
    }

    onSlow() {
        this.speed = SPEED_MIN;
    }

    onMoveLeft() {
        this.sprite.angle = this.angle -= this.speed;
        if (this.angle < -89) this.angle = -89;
    }

    onMoveRight() {
        this.sprite.angle = this.angle += this.speed;
        if (this.angle > 89) this.angle = 89;
    }

    onAction() {
        const scene = this.scene;

        if ( this.pathMove ) {

            scene.registry.set('state', PLAYSHOOT);

            const sprite = scene.add.follower(this.pathMove, SHOOTER_POS.x, SHOOTER_POS.y, 'bubbles').setFrame(this.bubbleForShoot.index);
            sprite.index = this.bubbleForShoot.index;
            Shooter.container.add(sprite);
            this.bubbleForShoot.sprite.destroy();
        const duration = this.pathMove.getLength(); // 1 pixel/ms ?
            const destination = this.shootDestination;
            const touch = this.shootTouch;

        sprite.startFollow({
            duration: duration,
            ease: 'Sine.easeIn',
            repeat: 0,
            onComplete: () => {
                if (scene.registry.get('debugMode')) console.log('Shooter emit shoot-end');
                scene.events.emit('shoot-end', {
                        destination: destination,
                        color: sprite.index,
                        touch: touch
                    });
                    if (sprite) sprite.destroy();
                    this.scene.aimingTime --;
                }
            });

            this.nextBubble();
            }
    }

    onUpdateAfter() {
        this.speed = SPEED_MAX;

        for (let i = 0; i < this.tinyBubbleList.length; i++) {
            this.tinyBubbleList[i].x = -100;
            this.tinyBubbleList[i].y = -100;
        }

        this.calculatePath();
        if( this.scene.aimingTime > 0 ) this.drawRayon();

        if (this.scene.registry.get('debugMode')) {
            this.graphics.lineStyle(2, 0xffffff, 0.3);
            this.pathView.draw(this.graphics);
            this.graphics.lineStyle(5, 0xff0000, 0.3);
            this.pathMove.draw(this.graphics);
        }
    }

    calculatePath() {

        let rayonAngle = Phaser.Math.DegToRad(Math.round(this.angle - 90));
        let currentIntersection = { x: SHOOTER_POS.x, y: SHOOTER_POS.y };
        const rayonLength = this.scene.registry.get('rayonLength');

        this.pathView = new Phaser.Curves.Path(currentIntersection.x, currentIntersection.y);
        this.pathMove = new Phaser.Curves.Path(currentIntersection.x, currentIntersection.y);

        for (let i = 0; i < 80; i++) {

            const start = new Phaser.Math.Vector2().setToPolar(rayonAngle, 5).add(currentIntersection);
            const end = new Phaser.Math.Vector2().setToPolar(rayonAngle, rayonLength).add(currentIntersection);
            const line = new Phaser.Geom.Line(start.x, start.y, end.x, end.y);

            let intersectionList = [];
            const bubbleWall = this.scene.registry.get('bubbleWall');

            bubbleWall.forEach(wall => {
                const intersection = Phaser.Geom.Intersects.GetLineToLine(wall, line);
                if (intersection == null) return;
                if (intersection.x == currentIntersection.x && intersection.y == currentIntersection.y) return;
                intersection.type = wall.type;
                intersection.cible = wall.cible;
                intersection.touch = wall.touch;
                intersectionList.push(intersection);
            });

            if( intersectionList.length == 0 ) break;

            let closestIntersection = { x: 0, y: 0 };
            intersectionList.forEach(intersection => {
                if (intersection.y < closestIntersection.y) return;
                closestIntersection = intersection;
            });
            currentIntersection = closestIntersection;

            if( currentIntersection.cible ) {
                this.shootDestination = currentIntersection.cible;
                this.shootTouch = currentIntersection.touch;
            }

            this.pathView.lineTo(currentIntersection.x, currentIntersection.y);
            if (currentIntersection.cible)
                this.pathMove.lineTo(currentIntersection.cible.pixel.x, currentIntersection.cible.pixel.y);
            else
                this.pathMove.lineTo(currentIntersection.x, currentIntersection.y);

            if (currentIntersection.type == 'wall') {
                rayonAngle = Math.PI - rayonAngle;
            } else break;

        };
        
        if (this.scene.registry.get('debugMode')) {
            this.graphics.clear();
            this.graphics.fillStyle(0x000000, 0.1);
            this.graphics.fillCircle(this.shootDestination.pixel.x, this.shootDestination.pixel.y, 32);
        }
    }

    drawRayon() {

        const numberOfTinyBubbles = Math.round(this.pathView.getLength() / 50);
        const tinyBubbleSpacing = 50 / this.pathView.getLength();
        let t = tinyBubbleSpacing*1.5;

        for (let i = 0; i < numberOfTinyBubbles; i++) {

            t += tinyBubbleSpacing;
            const point = this.pathView.getPoint(t);

            if( point && this.tinyBubbleList[i] ) {
                this.tinyBubbleList[i].x = point.x;
                this.tinyBubbleList[i].y = point.y;
            }
        }
    }

    destroy() {
        this.inputManagerEvents = this.scene.scene.get('InputManagerScene').events;
        this.inputManagerEvents.off('game-input-move-left', this.onMoveLeft, this);
        this.inputManagerEvents.off('game-input-move-right', this.onMoveRight, this);
        this.inputManagerEvents.off('game-input-action', this.onAction, this);
        this.inputManagerEvents.off('game-input-slow', this.onSlow, this);

        for (let i = 0; i < this.tinyBubbleList.length; i++) {
            if( this.tinyBubbleList[i] )
                this.tinyBubbleList[i].destroy();
        }
    }
}