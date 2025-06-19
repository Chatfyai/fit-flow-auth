
import { useState } from 'react';
import ModernLogin from '@/components/ui/modern-login';
import ModernSignup from '@/components/ui/signup';

const Index = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <>
      {isLoginView ? (
        <ModernLogin onSwitchToRegister={() => setIsLoginView(false)} />
      ) : (
        <ModernSignup onSwitchToLogin={() => setIsLoginView(true)} />
      )}
    </>
  );
};

export default Index;
