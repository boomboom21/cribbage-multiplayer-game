/**
 * CardSprite - Renders beautiful playing cards in Phaser
 */
export class CardSprite extends Phaser.GameObjects.Container {
  constructor(scene, x, y, card, faceUp = true) {
    super(scene, x, y);
    scene.add.existing(this);
    
    this.card = card; // { suit: 'hearts', rank: 'A', value: 1 }
    this.faceUp = faceUp;
    
    this.createCard();
  }
  
  createCard() {
    const width = 80;
    const height = 112;
    const cornerRadius = 6;
    
    // Card background
    const bg = this.scene.add.graphics();
    
    if (this.faceUp) {
      // White card back
      bg.fillStyle(0xffffff, 1);
      bg.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
      
      // Card border
      bg.lineStyle(2, 0xcccccc, 1);
      bg.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);
      
      // Suit color
      const isRed = this.card.suit === 'hearts' || this.card.suit === 'diamonds';
      const color = isRed ? 0xcc0000 : 0x1a1a1a;
      
      // Corner rank
      const rankText = this.getRankSymbol(this.card.rank);
      const suitSymbol = this.getSuitSymbol(this.card.suit);
      
      // Top-left corner
      this.add(this.scene.add.text(-width/2 + 6, -height/2 + 4, rankText, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: this.rgbToHex(color),
        fontStyle: 'bold'
      }));
      
      this.add(this.scene.add.text(-width/2 + 6, -height/2 + 22, suitSymbol, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: this.rgbToHex(color)
      }));
      
      // Bottom-right (inverted)
      const bottomText = this.scene.add.text(width/2 - 6, height/2 - 4, rankText, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: this.rgbToHex(color),
        fontStyle: 'bold'
      });
      bottomText.setRotation(Math.PI);
      this.add(bottomText);
      
      const bottomSuit = this.scene.add.text(width/2 - 6, height/2 - 22, suitSymbol, {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: this.rgbToHex(color)
      });
      bottomSuit.setRotation(Math.PI);
      this.add(bottomSuit);
      
      // Center suit symbol (large)
      this.add(this.scene.add.text(0, 0, suitSymbol, {
        fontSize: '48px',
        fontFamily: 'Arial',
        color: this.rgbToHex(color)
      }).setOrigin(0.5));
      
    } else {
      // Card back - decorative pattern
      bg.fillStyle(0x1a365d, 1);
      bg.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
      
      // Decorative pattern
      bg.lineStyle(2, 0x2d4a7c, 1);
      bg.strokeRoundedRect(-width/2 + 4, -height/2 + 4, width - 8, height - 8, cornerRadius - 2);
    }
  }
  
  getRankSymbol(rank) {
    const symbols = {
      'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5',
      '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
      'J': 'J', 'Q': 'Q', 'K': 'K'
    };
    return symbols[rank] || rank;
  }
  
  getSuitSymbol(suit) {
    const symbols = {
      'hearts': '♥',
      'diamonds': '♦',
      'clubs': '♣',
      'spades': '♠'
    };
    return symbols[suit] || '?';
  }
  
  rgbToHex(rgb) {
    return '#' + rgb.toString(16).padStart(6, '0');
  }
}
