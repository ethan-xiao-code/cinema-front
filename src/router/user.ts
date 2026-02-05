export const userRoutes = {
  path: '/user',
  name: 'user',
  component: () => import('@/views/user/MainView.vue'),
  redirect: '/user/home',
  children: [
    // ===== 游客可访问 =====
    {
      path: 'home',
      component: () => import('@/views/user/home/HomeView.vue')
    },
    {
      path: 'movies',
      name: 'movies',
      component: () => import('@/views/user/all_movie/MoviesView.vue')
    },
    {
      path: 'film-detail/:filmId',
      name: 'showDetail',
      component: () => import('@/views/user/film-detail/index.vue')
    },

    // ===== 登录后访问 =====
    {
      path: 'buy-ticket/:filmId',
      name: 'buy',
      component: () => import('@/views/user/buy-ticket/index.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: 'chooseSeat',
      name: 'chooseSeat',
      component: () => import('@/views/user/buy-ticket/ChooseSeatView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: 'me',
      component: () => import('@/views/user/me/MyView.vue'),
      meta: { requiresAuth: true },
      redirect: '/user/me/detail',
      children: [
        {
          path: 'cart',
          component: () => import('@/views/user/me/CartView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'order',
          component: () => import('@/views/user/me/OrderView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'detail',
          component: () => import('@/views/user/me/MyDetailView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
}
