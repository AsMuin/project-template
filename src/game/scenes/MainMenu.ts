import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
    background: GameObjects.Image | null = null;
    logo: GameObjects.Image | null = null;
    title: GameObjects.Text | null = null;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(400, 300, 'sky');

        this.logo = this.add.image(400, 300, 'logo');

        this.title = this.add
            .text(400, 460, 'Main Menu', {
                fontFamily: 'Arial Black',
                fontSize: 38,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            })
            .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
