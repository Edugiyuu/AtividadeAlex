import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonText,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { auth } from '../services/firebase';
import './Auth.css';

const RegisterPage: React.FC = () => {
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        history.replace('/home');
      }
    });

    return () => unsubscribe();
  }, [history]);

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setToastMessage('Informe email e senha.');
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage('As senhas nao conferem.');
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      history.replace('/home');
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Falha ao cadastrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Criar conta</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <div className="auth-wrapper">
          <IonCard className="auth-card">
            <IonCardContent className="auth-actions">
              <IonItem>
                <IonLabel position="stacked">Email</IonLabel>
                <IonInput
                  type="email"
                  value={email}
                  onIonInput={event => setEmail(event.detail.value ?? '')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Senha</IonLabel>
                <IonInput
                  type="password"
                  value={password}
                  onIonInput={event => setPassword(event.detail.value ?? '')}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Confirmar senha</IonLabel>
                <IonInput
                  type="password"
                  value={confirmPassword}
                  onIonInput={event => setConfirmPassword(event.detail.value ?? '')}
                />
              </IonItem>

              <IonButton expand="block" onClick={handleRegister}>
                Cadastrar
              </IonButton>

              <IonText className="auth-subtle">Ja tem conta?</IonText>
              <IonButton fill="clear" onClick={() => history.push('/login')}>
                Voltar para login
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Criando conta..." />
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

export default RegisterPage;
