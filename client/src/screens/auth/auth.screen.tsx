import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import QRCode from 'react-qr-code';
import DuoBird from '@/assets/duolingo-bird.gif';
import { ReclaimModal } from './reclaim-modal.component';
import { Reclaim } from '@reclaimprotocol/js-sdk';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createUser, updateUser, getUser } from './auth.service';
import { useUser } from '@/context/user.context';
import { usePrivy } from '@privy-io/react-auth';

export function AuthScreen() {
  const navigate = useNavigate();
  const [requestUrl, setRequestUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [proofReceived, setProofReceived] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const { toast } = useToast();
  const { setUser } = useUser();
  const { login, authenticated, ready, user: privyUser } = usePrivy();

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

      checkUserDataAndNavigate();
    }
  }, [authenticated, privyUser]);

  const checkUserDataAndNavigate = async () => {
    try {
      const email = privyUser?.google?.email || '';
      const response = await getUser(email);
      const userData = response.data.data;

      if (userData?.achievements?.length > 0 && userData?.preferences?.length > 0) {
        navigate('/home');
      } else {
        await saveUserToBackend();
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      await saveUserToBackend();
    }
  };

  const saveUserToBackend = async () => {
    try {
      const userData = {
        userName: privyUser?.google?.name || '',
        email: privyUser?.google?.email || '',
      };

      const response = await createUser(userData.userName, userData.email, []);
      console.log('User saved to backend:', response);
    } catch (error) {
      console.error('Error saving user to backend:', error);
      toast({
        title: 'Error',
        description: 'Failed to save user data',
        variant: 'destructive',
      });
    }
  };

  const getVerificationReq = async () => {
    try {
      setIsLoading(true);
      const APP_ID = '0xa3ec56fF644A54f06A2A35ff7f62F4464d7b71e1';
      const reclaimClient = new Reclaim.ProofRequest(APP_ID);
      const providerIds = [
        'c7003b77-4e57-4c62-a9fc-39d8bb680e84', // Duolingo Achievements - Koushith - Eth-SG
      ];
      await reclaimClient.buildProofRequest(providerIds[0], false, 'V2Linking');
      const APP_SECRET = '0xf296c5c9ad8e908bf5ca9d843caf9bcc370633e120965d1defdcac22476d50b4'; // your app secret key.
      reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET));
      const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest();
      console.log('requestUrl', requestUrl);
      setIsLoading(false);
      setRequestUrl(requestUrl);
      await reclaimClient.startSession({
        onSuccessCallback: (proof) => {
          setIsVerifying(false);
          setProofReceived(true);
          toast({
            title: 'Proof Received',
            description: 'Your Duolingo account has been verified successfully.',
          });
          console.log('Verification success', proof);
          // Parse the proof object to extract Duolingo achievements
          const proofObj = proof[0];
          const parameters = JSON.parse(proofObj.claimData.parameters);
          const achievementsString = parameters.paramValues.achievements;

          // Parse the achievements string to extract individual achievements
          const achievements = achievementsString.split('},{').map((achievement: string) => {
            const nameMatch = achievement.match(/"name":"([^"]+)"/); // devils language
            const countMatch = achievement.match(/"count":(\d+)/);
            return {
              name: nameMatch ? nameMatch[1] : '',
              count: countMatch ? parseInt(countMatch[1]) : 0,
            };
          });

          console.log('Parsed Duolingo achievements:', achievements);
          if (achievements.length > 0) {
            setAchievements(achievements);
          } else {
            toast({
              title: 'No Achievements Found',
              description: "You don't have any achievements on Duolingo. Please check back later.",
            });
          }

          // You can now use the 'achievements' array for further processing or display
          // For example, you might want to update the state with these achievements
          // setDuolingoAchievements(achievements);
          // Your business logic here
        },
        onFailureCallback: (error) => {
          setIsVerifying(false);
          console.error('Verification failed', error);
          // Your business logic here to handle the error
        },
      });
    } catch (error) {
      setIsLoading(false);
      console.error('Error fetching verification request', error);
    }
  };

  const handleSave = async () => {
    if (achievements.length > 0) {
      const { user } = await updateUser(achievements, privyUser?.google?.email || '', privyUser?.google?.name || '');

      setUser(user);
      if (user) {
        toast({
          title: 'User Saved',
          description: 'Your Duolingo data has been saved successfully.',
        });
        setIsOpen(false);
        navigate('/preference');
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <CardContent className="pt-6 flex flex-col items-center">
          <img src={DuoBird} alt="Duolingo Bird" className="w-24 h-24 mb-6" />

          {!authenticated ? (
            <Button onClick={login} disabled={!ready}>
              Login with Wallet
            </Button>
          ) : (
            <>
              <ReclaimModal isOpen={isOpen} onOpenChange={setIsOpen}>
                <div className="flex flex-col items-center space-y-6 p-6">
                  {!proofReceived ? (
                    <>
                      <h2 className="text-2xl font-bold mb-4">Verify Your Duolingo Account</h2>
                      {isLoading ? (
                        <>
                          <img src={DuoBird} alt="Duolingo Bird" className="w-24 h-24 animate-bounce" />
                          <p className="mt-4 text-center text-lg">Loading Reclaim Verification Link...</p>
                        </>
                      ) : requestUrl ? (
                        <>
                          <QRCode value={requestUrl as string} size={200} />
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <p className="text-center text-md mt-4">
                            Scan this QR code with your mobile device to verify your Duolingo account
                          </p>
                          {isVerifying && (
                            <div className="mt-4 flex flex-col items-center">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <p className="mt-2 text-center text-sm">Verifying your Duolingo account...</p>
                            </div>
                          )}

                          <Button
                            onClick={() => {
                              window.open(requestUrl, '_blank');
                            }}
                          >
                            Open on Mobile
                          </Button>
                        </>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-4">Verification Complete</h2>
                      <Button onClick={handleSave} className="w-full">
                        Save and Continue
                      </Button>
                    </>
                  )}
                </div>
              </ReclaimModal>
              <Button
                onClick={() => {
                  getVerificationReq();
                  setIsOpen(true);
                }}
              >
                Import Duolingo Data
              </Button>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Powered by Reclaim Protocol
        </CardFooter>
      </Card>
    </div>
  );
}
