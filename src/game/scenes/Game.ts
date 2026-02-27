import { Scene } from 'phaser';

export class Game extends Scene {
    private _platforms: Phaser.Physics.Arcade.StaticGroup | null = null;
    private _player: Phaser.Physics.Arcade.Sprite | null = null;
    private _cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
    private _stars: Phaser.Physics.Arcade.Group | null = null;
    private _score: number = 0;
    private _scoreText: Phaser.GameObjects.Text | null = null;
    private _bombs: Phaser.Physics.Arcade.Group | null = null;

    constructor() {
        super('Game');
    }

    create() {
        this.add.image(400, 300, 'sky');

        this._platforms = this.physics.add.staticGroup();

        this._platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        this._platforms.create(600, 400, 'ground');
        this._platforms.create(50, 250, 'ground');
        this._platforms.create(750, 220, 'ground');

        this._scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });

        this._player = this.physics.add.sprite(100, 450, 'dude');

        this._player.setBounce(0.2);
        this._player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'dude', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.physics.add.collider(this._player, this._platforms);
        this._cursors = this.input.keyboard?.createCursorKeys() || null;

        this._stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 },
            bounceY: Phaser.Math.FloatBetween(0.4, 0.8)
        });

        this.physics.add.collider(this._stars, this._platforms);

        this.physics.add.overlap(
            this._player,
            this._stars,
            (player, star) => {
                star.destroy();
                this._score += 10;
                this._scoreText?.setText('Score: ' + this._score);

                if (this._stars?.countActive() === 0) {
                    this.scene.start('GameWin');
                }
            },
            undefined,
            this
        );

        this._bombs = this.physics.add.group({
            key: 'bomb',
            repeat: 3,
            setXY: { x: 163, y: 200, stepX: 156 },
            bounceY: Phaser.Math.FloatBetween(0.1, 0.3)
        });

        this.physics.add.collider(this._bombs, this._platforms);

        this.physics.add.collider(
            this._player,
            this._bombs,
            () => {
                this.scene.start('GameOver');
            },
            undefined,
            this
        );

        this.input.once('pointerdown', () => {
            this.scene.start('GameOver');
        });
    }

    update() {
        if (!this._cursors) {
            this._cursors = this.input.keyboard?.createCursorKeys() || null;

            return;
        }

        if (this._cursors?.left?.isDown) {
            this._player?.setVelocityX(-160);
            this._player?.anims.play('left', true);
        } else if (this._cursors?.right?.isDown) {
            this._player?.setVelocityX(160);
            this._player?.anims.play('right', true);
        } else if (this._cursors?.up?.isDown && this._player?.body?.touching?.down) {
            this._player?.setVelocityY(-330);
        } else {
            this._player?.setVelocityX(0);
            this._player?.anims.play('turn');
        }
    }
}
