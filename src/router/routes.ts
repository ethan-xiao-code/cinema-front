import { adminRoutes } from './adminRouter';
import { userRoutes } from './userRouter';

export const routes = [
  {
    path: '/',
    redirect: '/user/home',
    hidden: true
  },
  // {
  //   path: '/demo',
  //   hidden: true,
  //   component: () => import('@/test/VirtualScrollerDemo.vue'),
  // },
  {
    path: '/404',
    name: '404',
    hidden: true,
    component: () => import('@/views/404-page/index.vue')
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