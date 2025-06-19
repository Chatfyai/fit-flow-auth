
import { useState } from 'react';
import Login from '@/components/Login';
import Register from '@/components/Register';

const Index = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <>
      {isLoginView ? (
        <Login onSwitchToRegister={() => setIsLoginView(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </>
  );
};

export default Index;
