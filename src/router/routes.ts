import { adminRoutes } from './admin';
import { userRoutes } from './user';

export const routes = [
  {
    path: '/',
    redirect: '/user/home',
    hidden: true
  },
  {
    path: '/login',
    name: 'login',
    hidden: true,
    component: () => import('@/views/login/index.vue'),
  },
  {
    path: '/register',
    name: 'register',
    hidden: true,
    component: () => import('@/views/user/register/index.vue')
  },
  {
    path: '/demo',
    hidden: true,
    component: () => import('@/test/VirtualScrollerDemo.vue'),
  },
  {
    path: '/404',
    name: '404',
    hidden: true,
    component: () => import('@/views/404/404View.vue')
  },
  adminRoutes,
  userRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/404',
    hidden: true
  }
]