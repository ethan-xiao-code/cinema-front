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

export function deleteCartByIdApi(id: number): Promise<any> {
  return request({
    url: `/cart/${id}`,
    method: 'delete'
  })
}
