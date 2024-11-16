import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import AgoraRTC, { AgoraRTCProvider } from 'agora-rtc-react';
import './index.css';
import { PrivyProvider } from '@privy-io/react-auth';

import { UserProvider } from './context/user.context.tsx';
import Logo from '@/assets/duolingo-bird.gif';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <UserProvider>
      <PrivyProvider
        appId="cm2rscj8l04j74850x34xd7qz"
        config={{
          // Display email and wallet as login methods
          loginMethods: ['google', 'wallet'],
          // Customize Privy's appearance in your app
          appearance: {
            theme: 'light',
            accentColor: '#676FFF',
            logo: Logo,
          },
          // Create embedded wallets for users who don't have a wallet
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
        }}
      >
        <AgoraRTCProvider client={client}>
          <App />
        </AgoraRTCProvider>
      </PrivyProvider>
    </UserProvider>
  </React.StrictMode>
);
