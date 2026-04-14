import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TCG Market Prototype</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="home-wrapper ion-padding">
          <IonCard>
            <IonCardContent>
              <p>
                Prototipo
              </p>
            </IonCardContent>
          </IonCard>

          <IonList inset>
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
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
