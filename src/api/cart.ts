import request from '@/utils/request'

export function addCart(data: any): Promise<any> {
  return request({
    url: `/cart/save`,
    method: 'post',
    data
  })
}

export function getCartes(): Promise<any> {
  return request({
    url: `/cart/list`,
    method: 'get'
  })
}

export function deleteCartByIdApi(ids: number[]): Promise<any> {
  return request({
    url: '/cart',
    method: 'delete',
    data: ids, // DELETE 传 body 要用 data
  })
}

