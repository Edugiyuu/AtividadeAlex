import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { auth } from '../services/firebase';
import type { CardGame, CardInput } from '../types/card';
import { createCard, getCardById, updateCard } from '../services/cardService';
import './cards.css';

interface RouteParams {
  id?: string;
}

const games: CardGame[] = ['Pokemon', 'Magic: The Gathering', 'Yu-Gi-Oh!', 'Other'];

const initialForm: CardInput = {
  name: '',
  game: 'Pokemon',
  rarity: 'Common',
  condition: 'Near Mint',
  price: 0,
  imageUrl: '',
  description: '',
};

const CardFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEditing = useMemo(() => !!id, [id]);

  const [formData, setFormData] = useState<CardInput>(initialForm);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const loadCard = async () => {
      if (!isEditing || !id) {
        return;
      }

      setLoading(true);
      try {
        const card = await getCardById(id);

        if (!card) {
          setToastMessage('Carta nao encontrada para edicao.');
          history.replace('/cards');
          return;
        }

        if (card.ownerId && card.ownerId !== currentUserId) {
          setToastMessage('Voce nao pode editar esta carta.');
          history.replace('/cards');
          return;
        }

        setFormData({
          name: card.name,
          game: card.game,
          rarity: card.rarity,
          condition: card.condition,
          price: card.price,
          imageUrl: card.imageUrl,
          description: card.description,
        });
      } catch (error) {
        setToastMessage(error instanceof Error ? error.message : 'Erro ao carregar carta');
      } finally {
        setLoading(false);
      }
    };

    loadCard();
  }, [history, id, isEditing]);

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

  const updateField = (field: keyof CardInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Informe o nome da carta.';
    if (!formData.game) return 'Escolha uma categoria.';
    if (Number(formData.price) <= 0) return 'Informe um preco maior que zero.';
    return '';
  };

  const handleSubmit = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setToastMessage(validationMessage);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && id) {
        await updateCard(id, { ...formData, price: Number(formData.price) });
        setToastMessage('Carta atualizada com sucesso!');
      } else {
        if (!currentUserId) {
          setToastMessage('Usuario nao autenticado.');
          return;
        }

        await createCard({ ...formData, price: Number(formData.price), ownerId: currentUserId });
        setToastMessage('Carta criada com sucesso!');
      }

      history.replace('/cards');
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Erro ao salvar carta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/cards" />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar Carta' : 'Cadastrar Carta'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Nome</IonLabel>
          <IonInput
            value={formData.name}
            onIonInput={event => updateField('name', event.detail.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Jogo/Categoria</IonLabel>
          <IonSelect
            value={formData.game}
            onIonChange={event => updateField('game', event.detail.value as CardGame)}
          >
            {games.map(game => (
              <IonSelectOption key={game} value={game}>
                {game}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Raridade</IonLabel>
          <IonInput
            value={formData.rarity}
            onIonInput={event => updateField('rarity', event.detail.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Condicao</IonLabel>
          <IonInput
            value={formData.condition}
            onIonInput={event => updateField('condition', event.detail.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Preco (R$)</IonLabel>
          <IonInput
            type="number"
            value={String(formData.price)}
            onIonInput={event => updateField('price', Number(event.detail.value ?? 0))}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">URL da imagem (opcional)</IonLabel>
          <IonInput
            value={formData.imageUrl}
            onIonInput={event => updateField('imageUrl', event.detail.value ?? '')}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Descricao</IonLabel>
          <IonTextarea
            autoGrow
            value={formData.description}
            onIonInput={event => updateField('description', event.detail.value ?? '')}
          />
        </IonItem>

        <IonButton expand="block" className="ion-margin-top" onClick={handleSubmit}>
          {isEditing ? 'Salvar alteracoes' : 'Criar carta'}
        </IonButton>

        <IonLoading isOpen={loading} message="Salvando..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2400}
          color="primary"
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default CardFormPage;
