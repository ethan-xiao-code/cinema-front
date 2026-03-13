import request from '@/utils/request'
import { ChartParamsType } from './type'

export function pageQueryOrdersApi(params: any): Promise<any> {
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

export function getOrdersListApi(): Promise<any> {
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

export function getFilmBoxOfficeApi(data: ChartParamsType): Promise<any> {
  return request({
    url: `/orders/filmBoxOffice`,
    method: 'post',
    data
  })
}

export function getMonthTicketApi(data: ChartParamsType): Promise<any> {
  return request({
    url: `/orders/trend/boxOffice`,
    method: 'post',
    data
  })
}

