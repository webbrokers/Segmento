import Phaser from 'phaser';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  canvas: document.getElementById('game'),
  scene: {
    preload,
    create
  }
};

function preload() {}

function create() {
  this.add.text(10, 10, 'Phaser working!', { color: '#fff' });
}

new Phaser.Game(config);
