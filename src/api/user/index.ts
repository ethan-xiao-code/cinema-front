import request from '@/utils/request'



export function loginApi(data: any): Promise<any> {
  return request({
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getUserInfoApi(roleId: number): Promise<any> {
  return request({
    url: `/info`,
    method: 'get',
    params: {
      roleId: roleId
    }
  })
}

export function logoutApi(data: any): Promise<any> {
  return request({
    url: `/user/logout`,
    method: 'post',
    data
  })
}

export function registerApi(data: any): Promise<any> {
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

export function getUserByIdApi(id: number): Promise<any> {
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
export function getUserListApi(): Promise<any> {
  return request({
    url: '/user/list',
    method: 'get',
  })
}
