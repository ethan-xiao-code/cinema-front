import request from '@/utils/request'



export function login(data: any): Promise<any> {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getUserInfo(roleId: number): Promise<any> {
  return request({
    url: `/info`,
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}

export function logout(data: any): Promise<any> {
  return request({
    url: `/user/logout`,
    method: 'post',
    data
  })
}

export function register(data: any): Promise<any> {
  return request({
    url: '/user/register',
    method: 'post',
    data
  })
}

export function pageQueryUserApi(params: any): Promise<any> {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

export function getUserById(id: number): Promise<any> {
  return request({
    url: '/user/single',
    params: { id }
  })
}

export function updateUserApi( data: any): Promise<any> {
  return request({
    url: `/user/edit`,
    method: 'put',
    data
  })
}

export function recharge(data: any): Promise<any> {
  return request({
    url: `/user/recharge`,
    method: 'put',
    data
  })
}
