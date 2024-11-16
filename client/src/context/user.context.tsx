import { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const UserContext = createContext<any | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const { user: privyUser, authenticated } = usePrivy();

  console.log('userrrrrrrrr-------', user);

  useEffect(() => {
    if (authenticated && privyUser) {
      setUser({
        id: privyUser.id,
        name: privyUser.google?.name || '',
        email: privyUser.google?.email || '',
        wallet: privyUser.wallet?.address || '',
        createdAt: privyUser.createdAt,
        linkedAccounts: privyUser.linkedAccounts,
        google: privyUser.google,
        isGuest: privyUser.isGuest,
        hasAcceptedTerms: privyUser.hasAcceptedTerms,
      });
    }
  }, [authenticated, privyUser]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
