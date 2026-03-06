export const adminRoutes = {
  path: '/admin',
  name: 'admin',
  meta: {
    requiresAdmin: true
  },
  component: () => import('@/views/admin/index.vue'),
  redirect: '/admin/home',
  children: [
    {
      path: 'home',
      name: 'adminHome', // 配置name，用于缓存组件（注意：一定要与该组件的name一直，否则keep-alive无效）
      component: () => import('@/views/admin/home/index.vue'),
      meta: {
        title: '个人中心',
        icon: 'HomeFilled'
      }
    },
    {
      path: 'users',
      name: 'adminUsers',
      component: () => import('@/views/admin/users/index.vue'),
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
      path: 'screen',
      name: 'adminScreen',
      component: () => import('@/views/admin/screen/index.vue'),
      meta: {
        title: '放映厅管理',
        icon: 'Box'
      }
    },
    {
      path: 'film',
      name: 'adminFilm',
      component: () => import('@/views/admin/film/index.vue'),
      meta: {
        title: '影片管理',
        icon: 'Film'
      }
    },
    {
      path: 'schedule',
      name: 'adminSchedule',
      component: () => import('@/views/admin/schedule/index.vue'),
      meta: {
        title: '排片管理',
        icon: 'Aim'
      }
    },
    {
      path: 'cinema-carousel',
      name: 'adminCarousel',
      component: () => import('@/views/admin/cinema-carousel/index.vue'),
      meta: {
        title: '影片轮播图管理',
        icon: 'Menu'
      }
    },
    {
      path: 'orders',
      name: 'adminOrders',
      component: () => import('@/views/admin/orders/OrdersView.vue'),
      meta: {
        title: '查看所有订单',
        icon: 'List'
      }
    }
  ]
}
