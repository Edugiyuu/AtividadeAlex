import {
  IonAlert,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonImg,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { auth } from '../services/firebase';
import type { Card } from '../types/card';
import { deleteCard, getCardById } from '../services/cardService';
import './cards.css';

interface RouteParams {
  id: string;
}

const CardDetailsPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const loadCard = async () => {
      setLoading(true);
      try {
        const data = await getCardById(id);
        setCard(data);
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : 'Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [id]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        history.replace('/login');
        return;
      }

      setCurrentUserId(user.uid);
    });

    return () => unsubscribe();
  }, [history]);

  const handleDelete = async () => {
    if (card?.ownerId && card.ownerId !== currentUserId) {
      setToastMessage('Voce nao pode excluir esta carta.');
      return;
    }

    setLoading(true);
    try {
      await deleteCard(id);
      setToastMessage('Carta excluida com sucesso!');
      history.replace('/cards');
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Erro ao excluir carta');
    } finally {
      setLoading(false);
      setShowDeleteAlert(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cards" />
          </IonButtons>
          <IonTitle>Detalhes da Carta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        {!loading && !card && <IonText color="medium">Carta nao encontrada.</IonText>}

        {card && (
          <div className="detail-layout">
            {card.imageUrl && <IonImg className="card-thumb" src={card.imageUrl} alt={card.name} />}

            <IonCard>
              <IonCardContent>
                <h2>{card.name}</h2>
                <p>{card.description || 'Sem descricao cadastrada.'}</p>
                <IonBadge color="tertiary">{card.game}</IonBadge>
                <IonBadge color="warning" style={{ marginLeft: 8 }}>
                  {card.rarity}
                </IonBadge>
                <IonBadge color="success" style={{ marginLeft: 8 }}>
                  R$ {card.price.toFixed(2)}
                </IonBadge>
              </IonCardContent>
            </IonCard>

            <IonItem>
              <IonLabel>
                <h3>Condicao</h3>
                <p>{card.condition}</p>
              </IonLabel>
            </IonItem>

            {(!card.ownerId || card.ownerId === currentUserId) && (
              <IonButton expand="block" onClick={() => history.push(`/cards/edit/${card.id}`)}>
                Editar carta
              </IonButton>
            )}
            {(!card.ownerId || card.ownerId === currentUserId) && (
              <IonButton
                expand="block"
                color="danger"
                fill="outline"
                onClick={() => setShowDeleteAlert(true)}
              >
                Excluir carta
              </IonButton>
            )}
            {card.ownerId && card.ownerId !== currentUserId && (
              <IonText color="medium">Somente o dono pode editar ou excluir.</IonText>
            )}
          </div>
        )}

        <IonAlert
          isOpen={showDeleteAlert}
          header="Confirmar exclusao"
          message="Tem certeza que deseja excluir esta carta?"
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
            },
            {
              text: 'Excluir',
              role: 'destructive',
              handler: handleDelete,
            },
          ]}
          onDidDismiss={() => setShowDeleteAlert(false)}
        />

        <IonLoading isOpen={loading} message="Processando..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2500}
          color="primary"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default CardDetailsPage;
