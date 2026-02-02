import Phaser from 'phaser';

export default class CribbageBoardScene extends Phaser.Scene {
  static key = 'CribbageBoardScene';

  constructor() {
    super(CribbageBoardScene.key);
    this.p1Peg = null;
    this.p2Peg = null;
    this.boardGraphics = null;
    this.currentPlayerId = null;
    this.pegStartPositions = {};
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor('#1a1a1a');

    // Draw the cribbage board
    this.drawBoard();

    // Create pegs
    this.p1Peg = this.add.circle(60, 300, 12, 0xf59e0b);
    this.p1Peg.setInteractive();
    this.p1Peg.setDepth(10);

    this.p2Peg = this.add.circle(70, 300, 12, 0xff6b6b);
    this.p2Peg.setInteractive();
    this.p2Peg.setDepth(10);

    // Make pegs draggable
    this.input.setDraggable([this.p1Peg, this.p2Peg]);

    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // Snap to nearest valid position
      this.snapPegToTrack(gameObject);
    });

    // Draw scoring track
    this.drawScoringTrack();
  }

  drawBoard() {
    this.boardGraphics = this.make.graphics({ x: 0, y: 0 });

    // Background
    this.boardGraphics.fillStyle(0x2a2a2a, 0.8);
    this.boardGraphics.fillRect(0, 0, 800, 600);

    // Border
    this.boardGraphics.lineStyle(2, 0xf59e0b);
    this.boardGraphics.strokeRect(20, 20, 760, 560);

    // Title
    this.add.text(400, 40, 'CRIBBAGE BOARD', {
      font: '20px Arial',
      fill: '#f59e0b',
      align: 'center',
    }).setOrigin(0.5);
  }

  drawScoringTrack() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    graphics.lineStyle(1, 0x666666);

    // Two parallel tracks for scoring
    const y1 = 150;
    const y2 = 400;
    const startX = 60;
    const endX = 750;

    // Draw track lines
    graphics.lineBetween(startX, y1, endX, y1);
    graphics.lineBetween(startX, y2, endX, y2);

    // Mark scoring positions (every 5 points)
    for (let i = 0; i <= 121; i += 5) {
      const x = startX + ((endX - startX) / 121) * i;
      graphics.lineStyle(1, i % 10 === 0 ? 0x999999 : 0x555555);
      graphics.lineBetween(x, y1 - 5, x, y1 + 5);
      graphics.lineBetween(x, y2 - 5, x, y2 + 5);

      // Label major marks
      if (i % 10 === 0 && i <= 100) {
        this.add.text(x, y1 - 20, i.toString(), {
          font: '10px Arial',
          fill: '#999999',
        }).setOrigin(0.5);
      }
    }

    // 121 mark (winning position)
    graphics.lineStyle(3, 0xff6b6b);
    const x121 = startX + ((endX - startX) / 121) * 121;
    graphics.lineBetween(x121, y1 - 10, x121, y1 + 10);
    graphics.lineBetween(x121, y2 - 10, x121, y2 + 10);

    this.add.text(x121, 560, '121', {
      font: 'bold 12px Arial',
      fill: '#ff6b6b',
    }).setOrigin(0.5);
  }

  snapPegToTrack(peg) {
    // Keep pegs on their tracks
    if (peg === this.p1Peg) {
      peg.y = 150;
    } else {
      peg.y = 400;
    }

    // Clamp x position between track start and end
    peg.x = Phaser.Math.Clamp(peg.x, 60, 750);
  }

  updateGameState(gameState, playerId) {
    this.currentPlayerId = playerId;

    // Update peg positions based on scores
    if (gameState.p1PegPosition !== undefined) {
      const x = 60 + (690 / 121) * gameState.p1PegPosition;
      this.p1Peg.x = x;
    }

    if (gameState.p2PegPosition !== undefined) {
      const x = 60 + (690 / 121) * gameState.p2PegPosition;
      this.p2Peg.x = x;
    }
  }
}
