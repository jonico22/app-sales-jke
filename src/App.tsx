import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './features/auth/AuthLayout';
import LoginPage from './features/auth/LoginPage';
import { Toaster } from '@/components/ui';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <LoginPage />
      }
    ]
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: (
          <div className="space-y-6">
            <h1 className="font-headings text-4xl font-bold text-primary">Welcome Back</h1>
             {/* ... existing dashboard placeholder content ... */}
             <p>Dashboard Content will go here</p>
          </div>
        )
      }
    ]
  },
  // Catch-all
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
