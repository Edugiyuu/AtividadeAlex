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
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { auth, githubProvider, googleProvider } from '../services/firebase';
import './Auth.css';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname || '/home';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        history.replace(redirectTo);
      }
    });

    return () => unsubscribe();
  }, [history, redirectTo]);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setToastMessage('Informe email e senha.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      history.replace(redirectTo);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'google' | 'github') => {
    const selectedProvider = provider === 'google' ? googleProvider : githubProvider;

    setLoading(true);
    try {
      await signInWithPopup(auth, selectedProvider);
      history.replace(redirectTo);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Entrar</IonTitle>
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

              <IonButton expand="block" onClick={handleLogin}>
                Entrar
              </IonButton>

              <div className="auth-provider">
                <IonText className="auth-subtle">Ou entre com</IonText>
                <IonButton expand="block" fill="outline" onClick={() => handleProviderLogin('google')}>
                  Google
                </IonButton>
                <IonButton expand="block" fill="outline" onClick={() => handleProviderLogin('github')}>
                  GitHub
                </IonButton>
              </div>

              <IonButton fill="clear" onClick={() => history.push('/register')}>
                Criar conta
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonLoading isOpen={loading} message="Autenticando..." />
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

export default LoginPage;
