import { createDeck, dealCards } from './deck.js';
import { scoreHand, scorePlay } from './scoring.js';

export class CribbageGame {
  constructor(player1Id, player2Id) {
    this.player1Id = player1Id;
    this.player2Id = player2Id;
    
    this.p1Score = 0;
    this.p2Score = 0;
    
    this.phase = 'deal'; // deal, discard, play, counting, crib, finished
    this.dealerIsPlayer1 = true;
    this.currentTurn = player1Id; // Who's turn to play
    
    this.deck = createDeck();
    const dealt = dealCards(this.deck);
    
    this.p1Hand = dealt.hand1;
    this.p2Hand = dealt.hand2;
    this.cutCard = null;
    this.crib = [];
    this.discards = { [player1Id]: [], [player2Id]: [] };
    
    this.playedCards = [];
    this.playPass = { [player1Id]: false, [player2Id]: false };
    
    // Track pegs for validation
    this.p1PegPosition = 0;
    this.p2PegPosition = 0;
  }
  
  getGameState() {
    return {
      phase: this.phase,
      dealerIsPlayer1: this.dealerIsPlayer1,
      currentTurn: this.currentTurn,
      p1Score: this.p1Score,
      p2Score: this.p2Score,
      p1PegPosition: this.p1PegPosition,
      p2PegPosition: this.p2PegPosition,
      playedCards: this.playedCards,
      playPass: this.playPass,
      cutCard: this.cutCard,
    };
  }
  
  getPublicGameState(forPlayerId) {
    const state = this.getGameState();
    
    // Only show own hand
    if (forPlayerId === this.player1Id) {
      state.hand = this.p1Hand;
      state.opponentScore = this.p2Score;
    } else {
      state.hand = this.p2Hand;
      state.opponentScore = this.p1Score;
    }
    
    return state;
  }
  
  discardCard(playerId, cardIndex, cribDestination = 0) {
    const hand = playerId === this.player1Id ? this.p1Hand : this.p2Hand;
    if (cardIndex < 0 || cardIndex >= hand.length) {
      throw new Error('Invalid card index');
    }
    
    const card = hand.splice(cardIndex, 1)[0];
    this.discards[playerId].push(card);
    
    // Add to crib
    this.crib.push(card);
    
    return card;
  }
  
  canPlayCard(playerId, cardIndex) {
    const hand = playerId === this.player1Id ? this.p1Hand : this.p2Hand;
    if (cardIndex < 0 || cardIndex >= hand.length) return false;
    
    const card = hand[cardIndex];
    const value = this.getCardValue(card);
    const currentSum = this.playedCards.reduce((sum, c) => sum + this.getCardValue(c), 0);
    
    return currentSum + value <= 31;
  }
  
  playCard(playerId, cardIndex) {
    if (this.currentTurn !== playerId) {
      throw new Error('Not your turn');
    }
    
    const hand = playerId === this.player1Id ? this.p1Hand : this.p2Hand;
    if (!this.canPlayCard(playerId, cardIndex)) {
      throw new Error('Cannot play that card (would exceed 31)');
    }
    
    const card = hand.splice(cardIndex, 1)[0];
    this.playedCards.push({ playerId, card });
    this.playPass[playerId] = false;
    
    // Check if this player scored
    const score = scorePlay(this.playedCards.map(pc => pc.card));
    
    if (score > 0) {
      if (playerId === this.player1Id) {
        this.p1Score += score;
      } else {
        this.p2Score += score;
      }
      return { played: true, score, totalInPlay: this.getCurrentPlayTotal() };
    }
    
    return { played: true, score: 0, totalInPlay: this.getCurrentPlayTotal() };
  }
  
  pass(playerId) {
    this.playPass[playerId] = true;
    
    // If both passed, reset play
    if (this.playPass[this.player1Id] && this.playPass[this.player2Id]) {
      const lastPlayerId = this.playedCards[this.playedCards.length - 1]?.playerId;
      this.playedCards = [];
      this.playPass = { [this.player1Id]: false, [this.player2Id]: false };
      
      // Turn goes to other player if they still have cards
      if (lastPlayerId === this.player1Id && this.p2Hand.length > 0) {
        this.currentTurn = this.player2Id;
      } else if (lastPlayerId === this.player2Id && this.p1Hand.length > 0) {
        this.currentTurn = this.player1Id;
      }
    } else {
      // Other player's turn
      this.currentTurn = this.currentTurn === this.player1Id ? this.player2Id : this.player1Id;
    }
  }
  
  getCurrentPlayTotal() {
    return this.playedCards.reduce((sum, pc) => sum + this.getCardValue(pc.card), 0);
  }
  
  getCardValue(card) {
    const values = {
      'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
      'J': 10, 'Q': 10, 'K': 10
    };
    return values[card.rank];
  }
  
  // Manual peg validation
  validatePegMove(playerId, fromPosition, toPosition, pointsAwarded) {
    const expectedPosition = fromPosition + pointsAwarded;
    if (toPosition !== expectedPosition) {
      return {
        valid: false,
        message: `Invalid peg move. Expected ${expectedPosition}, got ${toPosition}`,
        expectedPosition
      };
    }
    return { valid: true };
  }
  
  movePeg(playerId, newPosition) {
    if (playerId === this.player1Id) {
      this.p1PegPosition = newPosition;
    } else {
      this.p2PegPosition = newPosition;
    }
    
    // Check for winner
    if (this.p1PegPosition >= 121) {
      this.phase = 'finished';
      return { winner: this.player1Id };
    }
    if (this.p2PegPosition >= 121) {
      this.phase = 'finished';
      return { winner: this.player2Id };
    }
    
    return { winner: null };
  }
  
  toJSON() {
    return {
      player1Id: this.player1Id,
      player2Id: this.player2Id,
      p1Score: this.p1Score,
      p2Score: this.p2Score,
      phase: this.phase,
      dealerIsPlayer1: this.dealerIsPlayer1,
      currentTurn: this.currentTurn,
      p1PegPosition: this.p1PegPosition,
      p2PegPosition: this.p2PegPosition,
    };
  }
}
