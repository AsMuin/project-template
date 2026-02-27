import { Scene } from 'phaser';

export class GameWin extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera | null = null;
    background: Phaser.GameObjects.Image | null = null;
    gamewin_text: Phaser.GameObjects.Text | null = null;

    constructor() {
        super('GameWin');
    }

    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('green');

        this.background = this.add.image(400, 300, 'sky');
        this.background.setAlpha(0.5);

        this.gamewin_text = this.add.text(400, 400, 'Game Win', {
            fontFamily: 'Arial Black',
            fontSize: 64,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        });
        this.gamewin_text.setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('MainMenu');
        });
    }
}
