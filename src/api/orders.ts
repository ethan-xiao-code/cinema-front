import request from '@/utils/request'

export function pageQueryOrders(params: any): Promise<any> {
  return request({
    url: '/orders/page',
    method: 'get',
    params
  })
}

export function saveOrdersApi(data: any): Promise<any> {
  return request({
    url: '/orders/save',
    method: 'post',
    data
  })
}

export function getOrdersList(): Promise<any> {
  return request({
    url: '/orders/list',
    method: 'get'
  })
}

export function cancelOrdersApi(id: number): Promise<any> {
  return request({
    url: `/orders/cancel/${id}`,
    method: 'put'
  })
}

export function getFilmBoxOfficeApi(): Promise<any> {
  return request({
    url: `/orders/film/box_office`,
    method: 'get'
  })
}

export function getMonthTicketApi(): Promise<any> {
  return request({
    url: `/orders/month/ticket`,
    method: 'get'
  })
}

export function getMonthAmountApi(): Promise<any> {
  return request({
    url: `/orders/month/amount`,
    method: 'get'
  })
}
