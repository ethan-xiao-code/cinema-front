import request from '@/utils/request'

export function pageQueryScreenApi(params: any): Promise<any> {
  return request({
    url: '/screenRoom/page',
    method: 'get',
    params
  })
}

export function addScreenApi(data: any): Promise<any> {
  return request({
    url: '/screenRoom/save',
    method: 'post',
    data
  })
}

export function getScreenByIdApi(id: number): Promise<any> {
  return request({
    url: `/screenRoom/single/${id}`,
    method: 'get'
  })
}

export function updateScreenApi(data: any): Promise<any> {
  return request({
    url: '/screenRoom/edit',
    method: 'put',
    data
  })
}

export function deleteScreenApi(id: number): Promise<any> {
  return request({
    url: `/screenRoom/${id}`,
    method: 'delete'
  })
}

export function getScreenRoomListApi(): Promise<any> {
  return request({
    url: '/screenRoom/list',
    method: 'get'
  })
}

export function getScreensByCinemaIdApi(cinemaId: number): Promise<any> {
  return request({
    url: `/screenRoom/cinemaId/${cinemaId}`,
    method: 'get',
  })
}
