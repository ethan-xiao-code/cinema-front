import { defineStore } from 'pinia'
import { getUserInfoApi,  logoutApi, loginApi } from '@/api/user'
import { UserType } from '@/api/user/type'


interface UserState {
  token: string | null;
  userInfo: UserType | null;
}

export const useUserStore = defineStore('user_info', {
  state: (): UserState => ({
    token: null,
    userInfo: null
  }),
  getters: {
    tokenState: (state) => state.token,
    username: (state) => state.userInfo?.username || '',
    userInfoState: (state) => state.userInfo,
    userId: (state) => state.userInfo?.id || -1,
    roleId: (state) => state.userInfo?.roleId || -1,
  },
  actions: {
    setToken(token: string | null) {
      // 直接操作 state，无需 this 或类型断言
      this.token = token
    },
    setUserInfo(userInfo: UserType) {
      this.userInfo = userInfo
    },
    clearData() {
      this.token = null
      this.userInfo = null
    },
    async loginAction(data: any) {
      const res: any = await loginApi(data)
      const { user, token } = res
      this.setToken(token)
      this.setUserInfo(user)
      return res
    },
    async getUserInfoByRoleId(roleId: number) {
      const info: UserType = await getUserInfoApi(roleId)
      this.setUserInfo(info)
      return info
    },
    async logoutAction(data: any) {
      await logoutApi(data)
      this.clearData()
    }
  },
  // 启用 Pinia 持久化插件，直接关联配置
  persist: true,
})
