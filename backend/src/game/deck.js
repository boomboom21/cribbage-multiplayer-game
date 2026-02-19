// Card deck utilities
const SUITS = ['♠', '♣', '♥', '♦'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_VALUES = {
  'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 10, 'Q': 10, 'K': 10
};

export function createDeck() {
  const deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck) {
  const hand1 = [];
  const hand2 = [];
  for (let i = 0; i < 6; i++) {
    hand1.push(deck[i * 2]);
    hand2.push(deck[i * 2 + 1]);
  }
  const remaining = deck.slice(12);
  return { hand1, hand2, remaining };
}

export function cardToString(card) {
  return `${card.rank}${card.suit}`;
}

export function getCardValue(card) {
  return RANK_VALUES[card.rank];
}
