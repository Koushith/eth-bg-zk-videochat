import { RouterProvider } from 'react-router-dom';
import { routerConfig } from './routes';
import { CallHandler } from '@/components/call/CallHandler';
import { useUser } from '@/context/user.context';

export const App = () => {
  const { user } = useUser();

  return (
    <>
      {user && <CallHandler userId={user._id} />}
      <RouterProvider router={routerConfig} />
    </>
  );
};
