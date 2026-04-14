import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { seedSampleCards } from '../services/cardService';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSeed = async () => {
    setLoading(true);
    try {
      const inserted = await seedSampleCards();
      if (inserted === 0) {
        setToastMessage('O banco ja possui cartas cadastradas.');
        return;
      }

      setToastMessage(`${inserted} cartas de exemplo adicionadas.`);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Erro ao popular dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TCG Ionic Prototype</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="home-wrapper ion-padding">
          <IonCard>
            <IonCardContent>
              <IonText color="dark">
                <h1>Atividade Pratica - Ionic + Firebase</h1>
              </IonText>
              <p>
                Prototipo funcional com telas conectadas, CRUD completo e leituras de dados por
                lista geral, busca e filtro.
              </p>
            </IonCardContent>
          </IonCard>

          <IonList inset>
            <IonItem lines="full">
              <IonLabel>
                <h2>Requisitos cobertos</h2>
                <p>3+ telas conectadas, CRUD com Firestore e UI responsiva com feedback visual.</p>
              </IonLabel>
            </IonItem>
            <IonItem lines="none">
              <IonLabel>
                <h2>Entidade do CRUD</h2>
                <p>Cartas TCG (Pokemon, Magic, Yu-Gi-Oh)</p>
              </IonLabel>
            </IonItem>
          </IonList>

          <div className="home-actions">
            <IonButton expand="block" onClick={() => history.push('/cards')}>
              Ir para listagem de cartas
            </IonButton>
            <IonButton expand="block" fill="outline" onClick={() => history.push('/cards/new')}>
              Cadastrar nova carta
            </IonButton>
            <IonButton expand="block" color="tertiary" fill="clear" onClick={handleSeed}>
              Popular banco com cartas de exemplo
            </IonButton>
          </div>
        </div>

        <IonLoading isOpen={loading} message="Enviando dados..." />
        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2200}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
