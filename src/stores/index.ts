import { defineStore } from 'pinia'
import { login, getUserInfo, logout } from '@/api/user'
import { PersistenceOptions } from 'pinia-plugin-persistedstate' // 需确保安装了该插件
import { UserType } from '@/api/user/type'


interface UserState {
  token: string | null;
  userInfo: UserType | null;
}

export const useUserStore = defineStore('local_user_info', {
  state: (): UserState => ({
    token: null,
    userInfo: null
  }),
  getters: {
    tokenState: (state) => state.token,
    username: (state) => state.userInfo?.username || '',
    userInfoState: (state) => state.userInfo,
    userId: (state) => state.userInfo?.id || -1
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
      const res: any = await login(data)
      const { user, token } = res
      this.setToken(token)
      this.setUserInfo(user)
      return res
    },
    async getUserInfoByRoleId(roleId: number) {
      const info: UserType = await getUserInfo(roleId)
      this.setUserInfo(info)
      return info
    },
    async logoutAction(data: any) {
      await logout(data)
      this.clearData()
    }
  },
  // 启用 Pinia 持久化插件，直接关联配置
  persist: true,
})
