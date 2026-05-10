import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonButtons,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { auth } from '../services/firebase';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        history.replace('/login');
        return;
      }

      setUserEmail(user.email ?? '');
    });

    return () => unsubscribe();
  }, [history]);

  const handleLogout = async () => {
    await signOut(auth);
    history.replace('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TCG Market Prototipo </IonTitle>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleLogout}>
              Sair
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="home-wrapper ion-padding">
          <IonCard>
            <IonCardContent>
              <p>
                Prototipo
              </p>
              {userEmail && <p>Logado como: {userEmail}</p>}
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
