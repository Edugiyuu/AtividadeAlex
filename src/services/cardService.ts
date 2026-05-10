import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  startAt,
  endAt,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db, isFirebaseConfigured } from './firebase';
import type { Card, CardGame, CardInput } from '../types/card';

const CARDS_COLLECTION = 'cards';

function ensureFirebaseConfigured() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase nao configurado. Preencha o arquivo .env com VITE_FIREBASE_*');
  }
}

function mapCard(docId: string, data: Record<string, any>): Card {
  return {
    id: docId,
    name: data.name || '',
    nameLower: data.nameLower || '',
    game: data.game || 'Other',
    rarity: data.rarity || 'Unknown',
    condition: data.condition || 'N/A',
    price: Number(data.price || 0),
    imageUrl: data.imageUrl || '',
    description: data.description || '',
    ownerId: data.ownerId || '',
    createdAt: data.createdAt?.toDate?.()?.toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString(),
  };
}

export async function listAllCards(): Promise<Card[]> {
  ensureFirebaseConfigured();

  const cardsRef = collection(db, CARDS_COLLECTION);
  const cardsQuery = query(cardsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(cardsQuery);

  return snapshot.docs.map(item => mapCard(item.id, item.data()));
}

export async function searchCardsByName(searchText: string): Promise<Card[]> {
  ensureFirebaseConfigured();

  const normalized = searchText.trim().toLowerCase();
  if (!normalized) {
    return listAllCards();
  }

  const cardsRef = collection(db, CARDS_COLLECTION);
  const cardsQuery = query(
    cardsRef,
    orderBy('nameLower'),
    startAt(normalized),
    endAt(`${normalized}\uf8ff`)
  );

  const snapshot = await getDocs(cardsQuery);

  return snapshot.docs.map(item => mapCard(item.id, item.data()));
}

export async function filterCardsByGame(game: CardGame): Promise<Card[]> {
  ensureFirebaseConfigured();

  const cardsRef = collection(db, CARDS_COLLECTION);
  const cardsQuery = query(cardsRef, where('game', '==', game));
  const snapshot = await getDocs(cardsQuery);

  return snapshot.docs.map(item => mapCard(item.id, item.data()));
}

export async function getCardById(cardId: string): Promise<Card | null> {
  ensureFirebaseConfigured();

  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  const snapshot = await getDoc(cardRef);

  if (!snapshot.exists()) {
    return null;
  }

  return mapCard(snapshot.id, snapshot.data() as Record<string, any>);
}

export async function createCard(payload: CardInput): Promise<void> {
  ensureFirebaseConfigured();

  const cardsRef = collection(db, CARDS_COLLECTION);

  await addDoc(cardsRef, {
    ...payload,
    ownerId: payload.ownerId || '',
    nameLower: payload.name.trim().toLowerCase(),
    price: Number(payload.price),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateCard(cardId: string, payload: CardInput): Promise<void> {
  ensureFirebaseConfigured();

  const cardRef = doc(db, CARDS_COLLECTION, cardId);

  await updateDoc(cardRef, {
    ...payload,
    nameLower: payload.name.trim().toLowerCase(),
    price: Number(payload.price),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCard(cardId: string): Promise<void> {
  ensureFirebaseConfigured();

  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await deleteDoc(cardRef);
}
