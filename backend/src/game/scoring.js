import { getCardValue, cardToString } from './deck.js';

// Score for combinations that total 15
export function scoreFifteens(cards) {
  let score = 0;
  const n = cards.length;
  
  // Check all combinations
  for (let i = 1; i < Math.pow(2, n); i++) {
    let sum = 0;
    for (let j = 0; j < n; j++) {
      if (i & (1 << j)) {
        sum += getCardValue(cards[j]);
      }
    }
    if (sum === 15) {
      score += 2;
    }
  }
  return score;
}

// Score pairs, three-of-a-kind, etc.
export function scorePairs(cards) {
  let score = 0;
  const ranks = cards.map(c => c.rank);
  
  for (let i = 0; i < ranks.length; i++) {
    for (let j = i + 1; j < ranks.length; j++) {
      if (ranks[i] === ranks[j]) {
        score += 2;
      }
    }
  }
  
  return score;
}

// Score runs (sequences)
export function scoreRuns(cards) {
  const RANK_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let maxScore = 0;
  
  // Try runs of length 5, 4, 3
  for (let runLength = 5; runLength >= 3; runLength--) {
    // Generate all combinations of given length
    const combinations = getCombinations(cards, runLength);
    
    for (let combo of combinations) {
      if (isRun(combo, RANK_ORDER)) {
        // Count how many of this run can be made with remaining cards
        const runCount = countRuns(cards, combo, RANK_ORDER);
        maxScore = Math.max(maxScore, runCount * runLength);
      }
    }
  }
  
  return maxScore;
}

function isRun(cards, rankOrder) {
  const indices = cards.map(c => rankOrder.indexOf(c.rank)).sort((a, b) => a - b);
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      return false;
    }
  }
  return true;
}

function countRuns(allCards, runPattern, rankOrder) {
  // Count how many ways we can make this run
  const runRanks = runPattern.map(c => c.rank);
  let count = 1;
  
  for (let rank of runRanks) {
    const cardsWithRank = allCards.filter(c => c.rank === rank).length;
    count *= cardsWithRank;
  }
  
  return count;
}

function getCombinations(cards, size) {
  if (size === 1) return cards.map(c => [c]);
  
  const combos = [];
  for (let i = 0; i < cards.length; i++) {
    const head = cards[i];
    const tail = cards.slice(i + 1);
    const tailCombos = getCombinations(tail, size - 1);
    for (let combo of tailCombos) {
      combos.push([head, ...combo]);
    }
  }
  return combos;
}

// Score flush
export function scoreFlush(hand, cutCard = null) {
  let score = 0;
  if (!hand || hand.length === 0) return score;
  
  const suit = hand[0].suit;
  const allSameSuit = hand.every(c => c.suit === suit);
  
  if (allSameSuit) {
    score = 4;
    // Check if cut card is also same suit
    if (cutCard && cutCard.suit === suit) {
      score = 5;
    }
  }
  
  return score;
}

// Score nibs (Jack in hand same suit as cut card)
export function scoreNibs(hand, cutCard) {
  let score = 0;
  if (!cutCard) return score;
  
  const jack = hand.find(c => c.rank === 'J' && c.suit === cutCard.suit);
  if (jack) {
    score = 1;
  }
  
  return score;
}

// Total hand score
export function scoreHand(hand, cutCard = null) {
  const cardsToScore = cutCard ? [...hand, cutCard] : hand;
  
  let score = 0;
  score += scoreFifteens(cardsToScore);
  score += scorePairs(cardsToScore);
  score += scoreRuns(cardsToScore);
  score += scoreFlush(hand, cutCard);
  score += scoreNibs(hand, cutCard);
  
  return score;
}

// Score play phase (cards being played)
export function scorePlay(playedCards) {
  let score = 0;
  
  // Check for 15s in play
  const sum = playedCards.reduce((acc, card) => acc + getCardValue(card), 0);
  if (sum === 15) {
    score += 2;
  }
  
  // Check for pairs in last few cards
  if (playedCards.length >= 2) {
    const lastTwo = playedCards.slice(-2);
    if (lastTwo[0].rank === lastTwo[1].rank) {
      score += 2;
      // Check for three of a kind
      if (playedCards.length >= 3) {
        const lastThree = playedCards.slice(-3);
        if (lastThree[0].rank === lastThree[1].rank && lastThree[1].rank === lastThree[2].rank) {
          score += 2; // Three of a kind = 6 total
          // Check for four of a kind
          if (playedCards.length >= 4) {
            const lastFour = playedCards.slice(-4);
            if (lastFour.every(c => c.rank === lastFour[0].rank)) {
              score += 2; // Four of a kind = 12 total
            }
          }
        }
      }
    }
  }
  
  // Check for runs in play
  const runScore = scoreRuns(playedCards);
  if (runScore > 0) {
    score += runScore;
  }
  
  return score;
}
