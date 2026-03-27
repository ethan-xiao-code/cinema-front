export const userRoutes = {
  path: '/user',
  name: 'user',
  component: () => import('@/views/user/index.vue'),
  redirect: '/user/home',
  children: [
    // ===== 游客可访问 =====
    {
      path: 'home',
      component: () => import('@/views/user/home/index.vue')
    },
    {
      path: 'movies',
      name: 'movies',
      component: () => import('@/views/user/more-movies/index.vue')
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
      component: () => import('@/views/user/buy-ticket/ChooseSeat.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: 'my-center',
      component: () => import('@/views/user/my-center/index.vue'),
      meta: { requiresAuth: true },
      redirect: '/user/my-center/my-cart',
      children: [
        {
          path: 'my-cart',
          component: () => import('@/views/user/my-center/components/MyCart.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'my-order',
          component: () => import('@/views/user/my-center/components/MyOrder.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'my-detail',
          component: () => import('@/views/user/my-center/components/MyDetail.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
}
