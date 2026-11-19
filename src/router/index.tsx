import {
  createBrowserRouter,
  Navigate,
  type RouteObject,
} from 'react-router-dom';

import AuthLayout from '../components/layouts/AuthLayout';
import type { RouteHandle } from '../components/layouts/Header';
import MainLayout from '../components/layouts/MainLayout';
import ChatPage from '../pages/ChatPage';
import GoalsPage from '../pages/GoalsPage';
import LoginPage from '../pages/LoginPage';
import MemoryPage from '../pages/MemoryPage';
import TodayPage from '../pages/TodayPage';

// Auth guards live in the layouts (via useCurrentUser), so a 401 at any
// moment sends the user to /login, not only on navigation.
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, element: <Navigate to="/chat" replace /> },
      {
        path: 'chat',
        Component: ChatPage,
        handle: { title: 'chat' } satisfies RouteHandle,
      },
      {
        path: 'chat/:conversationId',
        Component: ChatPage,
        handle: { title: 'chat' } satisfies RouteHandle,
      },
      {
        path: 'today',
        Component: TodayPage,
        handle: { title: 'today' } satisfies RouteHandle,
      },
      {
        path: 'goals',
        Component: GoalsPage,
        handle: { title: 'goals' } satisfies RouteHandle,
      },
      {
        path: 'memory',
        Component: MemoryPage,
        handle: { title: 'memory' } satisfies RouteHandle,
      },
    ],
  },
  {
    Component: AuthLayout,
    children: [{ path: 'login', Component: LoginPage }],
  },
  { path: '*', element: <Navigate to="/" replace /> },
];

export const router = createBrowserRouter(routes);
