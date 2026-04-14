export type CardGame = 'Pokemon' | 'Magic: The Gathering' | 'Yu-Gi-Oh!' | 'Other';

export interface Card {
  id: string;
  name: string;
  nameLower: string;
  game: CardGame;
  rarity: string;
  condition: string;
  price: number;
  imageUrl?: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CardInput = Omit<Card, 'id' | 'nameLower' | 'createdAt' | 'updatedAt'>;
