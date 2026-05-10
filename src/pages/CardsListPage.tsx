import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { onAuthStateChanged } from 'firebase/auth';
import { add } from 'ionicons/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { auth } from '../services/firebase';
import type { Card, CardGame } from '../types/card';
import { filterCardsByGame, listAllCards, searchCardsByName } from '../services/cardService';
import './cards.css';

type SortMode = 'newest' | 'price_asc' | 'price_desc' | 'name_asc';

const gameOptions: Array<'all' | CardGame> = ['all', 'Pokemon', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Other'];

function sortCards(cards: Card[], mode: SortMode): Card[] {
  const copy = [...cards];

  if (mode === 'price_asc') {
    return copy.sort((a, b) => a.price - b.price);
  }

  if (mode === 'price_desc') {
    return copy.sort((a, b) => b.price - a.price);
  }

  if (mode === 'name_asc') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }

  return copy.sort((a, b) => {
    const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return right - left;
  });
}

const CardsListPage: React.FC = () => {
  const history = useHistory();
  const [cards, setCards] = useState<Card[]>([]);
  const [searchText, setSearchText] = useState('');
  const [gameFilter, setGameFilter] = useState<'all' | CardGame>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const loadCards = useCallback(async () => {
    setLoading(true);

    try {
      let data: Card[] = [];

      if (searchText.trim()) {
        data = await searchCardsByName(searchText);
      } else if (gameFilter !== 'all') {
        data = await filterCardsByGame(gameFilter);
      } else {
        data = await listAllCards();
      }

      if (searchText.trim() && gameFilter !== 'all') {
        data = data.filter(item => item.game === gameFilter);
      }

      setCards(sortCards(data, sortMode));
    } catch (error) {
      setToastMessage('Erro ao carregar cards');
    } finally {
      setLoading(false);
    }
  }, [gameFilter, searchText, sortMode]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        history.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [history]);

  const readMode = useMemo(() => {
    if (searchText.trim()) {
      return 'READ: busca por nome';
    }

    if (gameFilter !== 'all') {
      return 'READ: filtro por categoria';
    }

    return 'READ: listagem geral';
  }, [gameFilter, searchText]);

  const onRefresh = async (event: any) => {
    await loadCards();
    event.detail.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cartas TCG</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="cards-toolbar">
          <IonSearchbar
            value={searchText}
            placeholder="Buscar por nome da carta"
            onIonInput={event => setSearchText(event.detail.value ?? '')}
          />

          <IonItem>
            <IonLabel>Categoria</IonLabel>
            <IonSelect
              value={gameFilter}
              interface="action-sheet"
              onIonChange={event => setGameFilter(event.detail.value)}
            >
              {gameOptions.map(option => (
                <IonSelectOption key={option} value={option}>
                  {option === 'all' ? 'Todas' : option}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Ordenacao</IonLabel>
            <IonSelect
              value={sortMode}
              interface="popover"
              onIonChange={event => setSortMode(event.detail.value as SortMode)}
            >
              <IonSelectOption value="newest">Mais novas</IonSelectOption>
              <IonSelectOption value="price_asc">Preco crescente</IonSelectOption>
              <IonSelectOption value="price_desc">Preco decrescente</IonSelectOption>
              <IonSelectOption value="name_asc">Nome A-Z</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonChip color="primary">
            <IonLabel className="read-mode">{readMode}</IonLabel>
          </IonChip>
        </div>

        <div className="cards-list">
          {cards.length === 0 && !loading && (
            <IonCard>
              <IonCardContent>
                <IonText color="medium">Nenhuma carta encontrada.</IonText>
              </IonCardContent>
            </IonCard>
          )}

          {cards.map(card => (
            <IonCard key={card.id} button onClick={() => history.push(`/cards/details/${card.id}`)}>
              <IonCardContent>
                <div className="card-row">
                  <h2>{card.name}</h2>
                  <p>{card.game}</p>
                </div>
                <IonBadge color="warning">{card.rarity}</IonBadge>
                <IonBadge color="success" style={{ marginLeft: 8 }}>
                  R$ {card.price.toFixed(2)}
                </IonBadge>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/cards/new')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <IonLoading isOpen={loading} message="Carregando cartas..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2500}
          color="danger"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default CardsListPage;
