export const adminRoutes = {
  path: '/admin',
  name: 'admin',
  meta: {
    requiresAdmin: true
  },
  component: () => import('@/views/admin/index.vue'),
  redirect: '/admin/data-board',
  children: [

    {
      path: 'user-list',
      name: 'adminUsers',
      component: () => import('@/views/admin/user-list/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'UserFilled'
      }
    },
    // {
    //   path: 'cinema',
    //   name: 'adminCinema',
    //   component: () => import('@/views/admin/cinema/index.vue'),
    //   meta: {
    //     title: '影院管理',
    //     icon: 'Camera'
    //   }
    // },
    {
      path: 'screen-list',
      name: 'adminScreen',
      component: () => import('@/views/admin/screen-list/index.vue'),
      meta: {
        title: '放映厅管理',
        icon: 'Box'
      }
    },
    {
      path: 'film-list',
      name: 'adminFilm',
      component: () => import('@/views/admin/film-list/index.vue'),
      meta: {
        title: '影片管理',
        icon: 'Film'
      }
    },
    {
      path: 'schedule-list',
      name: 'adminSchedule',
      component: () => import('@/views/admin/schedule-list/index.vue'),
      meta: {
        title: '排片管理',
        icon: 'Aim'
      }
    },
    {
      path: 'cinema-carousel-list',
      name: 'adminCarousel',
      component: () => import('@/views/admin/cinema-carousel-list/index.vue'),
      meta: {
        title: '影片轮播图管理',
        icon: 'Menu'
      }
    },
    {
      path: 'orders-list',
      name: 'adminOrders',
      component: () => import('@/views/admin/orders-list/index.vue'),
      meta: {
        title: '订单管理',
        icon: 'List'
      }
    },
    {
      path: 'data-board',
      name: 'adminDataBoard', // 配置name，用于缓存组件（注意：一定要与该组件的name一直，否则keep-alive无效）
      component: () => import('@/views/admin/data-board/index.vue'),
      meta: {
        title: '票房统计可视化',
        icon: 'DataBoard'
      }
    },
  ]
}
