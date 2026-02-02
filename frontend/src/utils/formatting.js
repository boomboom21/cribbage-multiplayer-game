export function cardToString(card) {
  return `${card.rank}${card.suit}`;
}

export function formatScore(score) {
  return score.toString().padStart(3, '0');
}

export function formatGameCode(code) {
  return code.toUpperCase();
}

export function getCardColor(suit) {
  if (suit === '♥' || suit === '♦') {
    return '#ff6b6b';
  }
  return '#000';
}

export function getSuitColor(suit) {
  switch (suit) {
    case '♠':
    case '♣':
      return '#000';
    case '♥':
    case '♦':
      return '#ff6b6b';
    default:
      return '#000';
  }
}

export function getRankDisplay(rank) {
  return rank === '10' ? 'T' : rank;
}
