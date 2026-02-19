import Phaser from 'phaser';
import { CardSprite } from './CardSprite';
import { PegSprite } from './PegSprite';

export class CribbageBoardScene extends Phaser.Scene {
  constructor() {
    super('CribbageBoard');
    this.gameWidth = 1200;
    this.gameHeight = 800;
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor('#0d2818');
    
    this.createBoard();
    this.createPegs();
    this.createHandAreas();
    this.createCribArea();
    this.createUI();
    
    // Enable drag for pegs
    this.input.on('drag', this.handleDrag, this);
    this.input.on('dragend', this.handleDragEnd, this);
  }
  
  createBoard() {
    // Main board background - dark felt texture
    const board = this.add.graphics();
    
    // Felt background
    board.fillGradientStyle(0x1a472a, 0x1a472a, 0x0d2818, 0x0d2818, 1);
    board.fillRoundedRect(20, 20, 600, 760, 20);
    
    // Board border - mahogany wood look
    board.lineStyle(8, 0x4a2810, 1);
    board.strokeRoundedRect(15, 15, 610, 770, 25);
    
    // Inner border
    board.lineStyle(3, 0xc9a227, 0.6); // Gold trim
    board.strokeRoundedRect(30, 30, 580, 740, 15);
    
    // Draw peg tracks
    this.createPegTracks(board);
    
    // Start/Finish circle
    const startCircle = this.add.circle(335, 400, 35, 0xc9a227);
    const startText = this.add.text(335, 400, 'START', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#2d1810',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
  
  createPegTracks(board) {
    const trackX = 80;
    const trackSpacing = 50;
    const holeRadius = 10;
    
    // Draw track lines
    for (let i = 0; i < 10; i++) {
      const x = trackX + (i * trackSpacing);
      board.lineStyle(2, 0xc9a227, 0.3);
      board.lineBetween(x, 60, x, 740);
    }
    
    // Draw hole positions (standard cribbage board - 60 holes)
    // Player 1 track (left side, going up)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 10; col++) {
        const x = trackX + (col * trackSpacing);
        const y = 120 + (row * 260);
        
        // Hole shadow
        this.add.circle(x + 1, y + 2, holeRadius + 2, 0x000000, 0.3);
        // Hole
        this.add.circle(x, y, holeRadius, 0x1a0a00);
      }
    }
    
    // Player 2 track (right side, going down) 
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 10; col++) {
        const x = trackX + (col * trackSpacing) + 250;
        const y = 380 - (row * 260);
        
        // Hole shadow
        this.add.circle(x + 1, y + 2, holeRadius + 2, 0x000000, 0.3);
        // Hole
        this.add.circle(x, y, holeRadius, 0x1a0a00);
      }
    }
    
    // Store hole positions for peg snapping
    this.holePositions = [];
    // Player 1 holes (left side, bottom to top)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 10; col++) {
        this.holePositions.push({
          x: trackX + (col * trackSpacing),
          y: 120 + (row * 260),
          player: 0
        });
      }
    }
    // Player 2 holes (right side, top to bottom)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 10; col++) {
        this.holePositions.push({
          x: trackX + (col * trackSpacing) + 250,
          y: 380 - (row * 260),
          player: 1
        });
      }
    }
  }
  
  createPegs() {
    // Create pegs for both players
    this.player1Peg = new PegSprite(this, 335, 400, 0);
    this.player1SkippingPeg = new PegSprite(this, 335, 450, 0);
    
    this.player2Peg = new PegSprite(this, 335, 400, 1);
    this.player2SkippingPeg = new PegSprite(this, 335, 350, 1);
  }
  
  createHandAreas() {
    // Player hand area (bottom)
    const handBg = this.add.graphics();
    handBg.fillStyle(0x0d2818, 0.8);
    handBg.fillRoundedRect(650, 500, 530, 280, 15);
    handBg.lineStyle(2, 0xc9a227, 0.5);
    handBg.strokeRoundedRect(650, 500, 530, 280, 15);
    
    const handLabel = this.add.text(680, 520, 'YOUR HAND', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#c9a227',
      fontStyle: 'bold'
    });
    
    // Opponent hand area (top)  
    const oppBg = this.add.graphics();
    oppBg.fillStyle(0x0d2818, 0.8);
    oppBg.fillRoundedRect(650, 20, 530, 200, 15);
    oppBg.lineStyle(2, 0xc9a227, 0.5);
    oppBg.strokeRoundedRect(650, 20, 530, 200, 15);
    
    const oppLabel = this.add.text(680, 40, 'OPPONENT', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#c9a227',
      fontStyle: 'bold'
    });
    
    // Show face-down cards for opponent
    this.opponentCards = [];
    for (let i = 0; i < 4; i++) {
      const card = new CardSprite(this, 750 + (i * 100), 120, { suit: 'unknown', rank: '?' }, false);
      this.opponentCards.push(card);
    }
  }
  
  createCribArea() {
    // Crib area (middle)
    const cribBg = this.add.graphics();
    cribBg.fillStyle(0x1a3a2a, 0.9);
    cribBg.fillRoundedRect(650, 240, 530, 240, 15);
    cribBg.lineStyle(3, 0xc9a227, 0.7);
    cribBg.strokeRoundedRect(650, 240, 530, 240, 15);
    
    const cribLabel = this.add.text(680, 260, 'THE CRIBBAGE', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#c9a227',
      fontStyle: 'bold'
    });
    
    this.cribCards = [];
  }
  
  createUI() {
    // Score display
    const scoreBox = this.add.graphics();
    scoreBox.fillStyle(0x1a1a2e, 0.95);
    scoreBox.fillRoundedRect(20, 20, 200, 60, 10);
    scoreBox.lineStyle(2, 0x4a90d9, 1);
    scoreBox.strokeRoundedRect(20, 20, 200, 60, 10);
    
    this.add.text(35, 30, 'YOUR SCORE', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#888'
    });
    
    this.yourScoreText = this.add.text(35, 50, '0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4a90d9',
      fontStyle: 'bold'
    });
    
    // Opponent score
    const oppScoreBox = this.add.graphics();
    oppScoreBox.fillStyle(0x1a1a2e, 0.95);
    oppScoreBox.fillRoundedRect(230, 20, 200, 60, 10);
    oppScoreBox.lineStyle(2, 0xd94a4a, 1);
    oppScoreBox.strokeRoundedRect(230, 20, 200, 60, 10);
    
    this.add.text(245, 30, 'OPPONENT', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#888'
    });
    
    this.oppScoreText = this.add.text(245, 50, '0', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#d94a4a',
      fontStyle: 'bold'
    });
    
    // Game info
    this.add.text(450, 30, 'Game Code: ABC123', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#c9a227'
    });
    
    // Message area
    this.messageText = this.add.text(600, 230, 'Your turn - Select a card to play', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
  
  handleDrag(pointer, gameObject, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
  }
  
  handleDragEnd(pointer, gameObject) {
    // Snap to nearest hole
    if (this.holePositions) {
      let nearestHole = null;
      let nearestDist = 30; // Snap distance
      
      for (const hole of this.holePositions) {
        const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, hole.x, hole.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestHole = hole;
        }
      }
      
      if (nearestHole) {
        // Animate snap
        this.tweens.add({
          targets: gameObject,
          x: nearestHole.x,
          y: nearestHole.y,
          duration: 150,
          ease: 'Power2'
        });
      }
    }
  }
  
  // Public methods for game state updates
  setHand(cards) {
    // Clear existing
    if (this.handCards) {
      this.handCards.forEach(c => c.destroy());
    }
    
    this.handCards = [];
    const startX = 700;
    const spacing = 100;
    
    cards.forEach((card, i) => {
      const cardSprite = new CardSprite(this, startX + (i * spacing), 640, card, true);
      cardSprite.setInteractive();
      cardSprite.on('pointerdown', () => this.selectCard(card));
      this.handCards.push(cardSprite);
    });
  }
  
  selectCard(card) {
    // Visual feedback
    this.messageText.setText(`Selected: ${card.rank} of ${card.suit}`);
  }
  
  updateScore(player, score) {
    if (player === 0) {
      this.yourScoreText.setText(score.toString());
    } else {
      this.oppScoreText.setText(score.toString());
    }
  }
  
  setMessage(msg) {
    this.messageText.setText(msg);
  }
}
