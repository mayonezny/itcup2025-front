import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';

import { setupStore } from '../redux-rtk';
import './index.css'; // если используешь scss
import { router } from './router';

import { CustomProvider } from 'rsuite';

const { worker } = await import('@/shared/utils/mocks/browser');
await worker.start({ onUnhandledRequest: 'bypass' });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CustomProvider theme="light">
      <Provider store={setupStore()}>
        <RouterProvider router={router} />
      </Provider>
    </CustomProvider>
  </StrictMode>,
);
