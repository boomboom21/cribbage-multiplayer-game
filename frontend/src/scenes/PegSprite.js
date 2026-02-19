/**
 * PegSprite - Beautiful scoring pegs
 */
export class PegSprite extends Phaser.GameObjects.Container {
  constructor(scene, x, y, player) {
    super(scene, x, y);
    scene.add.existing(this);
    
    this.player = player; // 0 for player 1, 1 for player 2
    
    this.createPeg();
  }
  
  createPeg() {
    const radius = 14;
    
    // Player colors - warm wood tones
    const colors = [0xe8b87d, 0xc9493d]; // Warm beige for P1, rich red for P2
    
    const peg = this.scene.add.graphics();
    
    // Peg shadow
    peg.fillStyle(0x000000, 0.3);
    peg.fillCircle(2, 2, radius);
    
    // Main peg body
    peg.fillStyle(colors[this.player], 1);
    peg.fillCircle(0, 0, radius);
    
    // Highlight (shine effect)
    peg.fillStyle(0xffffff, 0.4);
    peg.fillCircle(-4, -4, 6);
    
    // Inner ring
    peg.lineStyle(2, 0x8b5a2b, 1);
    peg.strokeCircle(0, 0, radius - 2);
    
    this.add(peg);
    
    // Make draggable
    this.setSize(radius * 2, radius * 2);
    this.setInteractive({ draggable: true });
  }
  
  // Animate peg movement to a position
  async moveTo(x, y, duration = 300) {
    return new Promise(resolve => {
      this.scene.tweens.add({
        targets: this,
        x: x,
        y: y,
        duration: duration,
        ease: 'Power2',
        onComplete: resolve
      });
    });
  }
}
