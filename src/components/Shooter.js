import * as Phaser from 'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.esm.js';
import {
    SHOOTER_POS,
    SHOOT_DELAY,
    SPEED_MIN,
    SPEED_MAX,
    PLAYCALCULATEPATH,
    PLAYSHOOT,
    OUTRO_WIN,
    OUTRO_LOST,
    OUTRO_TIMEOUT
} from '../constants.js';

export default class Shooter {

    constructor(scene) {
        this.scene = scene;

        this.keys = null;
        this.cursors = null;
        this.shootTime = 0;
        this.shootTween = null;
        this.speed = SPEED_MIN;
        this.angle = 0;

        this.shootDestination = null;

        this.keys = scene.input.keyboard.addKeys({ left: "Q", right: "D", slow: "S", zero: Phaser.Input.Keyboard.KeyCodes.NUMPAD_ZERO });
        this.cursors = scene.input.keyboard.createCursorKeys();

        this.sprite = scene.add.image(SHOOTER_POS.x, SHOOTER_POS.y, 'shooter');
        scene.bubbleContainer.add(this.sprite);

        if (scene.registry.get('debugMode')) this.graphics = scene.add.graphics();

    }

    update() {
        const scene = this.scene;

        if (scene.registry.get('state') != OUTRO_WIN
            && scene.registry.get('state') != OUTRO_LOST
            && scene.registry.get('state') != OUTRO_TIMEOUT) {

            this.handleInput();

            if (scene.registry.get('state') == PLAYCALCULATEPATH) {
                this.calculatePath();

                if (scene.registry.get('debugMode')) this.drawRayon();
            }
        }
    }

    handleInput() {

        // rotation

        const scene = this.scene;
        let angle = this.angle;
        const oldangle = angle;
        let speed = SPEED_MAX;
        const keys = this.keys;
        const cursors = this.cursors;

        if (keys.slow.isDown || cursors.shift.isDown || cursors.down.isDown || keys.zero.isDown) speed = SPEED_MIN;

        if (keys.left.isDown || cursors.left.isDown)
            angle -= speed;
        else if (keys.right.isDown || cursors.right.isDown)
            angle += speed;

        if (angle < -89) angle = -89;
        if (angle > 89) angle = 89;

        if (oldangle != angle)
            this.sprite.angle = angle;

        // shoot

        if (cursors.space.isDown
            && scene.time.now > this.shootTime + SHOOT_DELAY
            && scene.registry.get('state') == PLAYCALCULATEPATH
            && this.pathMove
        ) {
            scene.registry.set('state', PLAYSHOOT);
            this.shootTime = scene.time.now;

            if (scene.registry.get('debugMode')) console.log('Shooter emit bubble-shoot');
            scene.events.emit('bubble-shoot');

            this.onBubbleShoot();
        }

        this.angle = angle;

    }
    
    onBubbleShoot() {
        const scene = this.scene;

        const sprite = scene.add.follower(this.pathMove, SHOOTER_POS.x, SHOOTER_POS.y, 'bubbles_sprites', scene.registry.get('bubbleForShoot'));
        scene.bubbleContainer.add(sprite);
        const duration = this.pathMove.getLength(); // 1 pixel/ms ?

        sprite.startFollow({
            duration: duration,
            ease: 'Sine.easeIn',
            repeat: 0,
            onComplete: () => {
                if (sprite) sprite.destroy();

                if (scene.registry.get('debugMode')) console.log('Shooter emit shoot-end');
                scene.events.emit('shoot-end', {
                    destination: this.shootDestination,
                    color: scene.registry.get('bubbleForShoot')
                });
            }
        });
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
                intersectionList.push(intersection);
            });

            if( intersectionList.length == 0 ) break;

            let closestIntersection = { x: 0, y: 0 };
            intersectionList.forEach(intersection => {
                if (intersection.y < closestIntersection.y) return;
                closestIntersection = intersection;
            });
            currentIntersection = closestIntersection;

            if( currentIntersection.cible ) 
                this.shootDestination = currentIntersection.cible;

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
        this.graphics.lineStyle(2, 0xffffff, 0.3);
        this.pathView.draw(this.graphics);

        if (this.scene.registry.get('debugMode')) {
            this.graphics.lineStyle(5, 0xff0000, 0.3);
            this.pathMove.draw(this.graphics);
        }
    }
}