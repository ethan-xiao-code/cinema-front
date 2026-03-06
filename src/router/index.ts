
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores'
import { routes } from './routes';
import { RoleEnum } from '@/utils/constant';
import { ElMessage } from 'element-plus';

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const whiteList = ['/login', '/404', '/register', '/test']

// router.beforeEach(async (to, from, next) => {
//   const userStore = useUserStore()
//   // 支持后端返回 role 字符串或数字 roleId（0 表示管理员）
//   const roleId = userStore.userInfo?.roleId

//   // if (to.path === '/404') {
//   //   next()
//   //   return
//   // }
//   // next()
//   // 路由守卫：拦截后台页面访问

// })
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token
  const role = userStore.userInfo?.roleId
  // 需要登录
  if (to.matched.some(r => r.meta.requiresAuth)) {
    if (!token) {
      ElMessage.warning("请先完成登录才可以执行相应操作")
      setTimeout(() => {
        next({
          path: "/login",
          query: {
            redirect: to.fullPath
          }
        })
      }, 1000)
      return;
    }
  }

  // 需要管理员
  if (to.matched.some(r => r.meta.requiresAdmin)) {
    if (role !== RoleEnum.Admin) return next('/404')
  }

  next()
})


export default router
