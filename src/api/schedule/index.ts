import request from '@/utils/request'

export function addScheduleApi(data: any): Promise<any> {
  return request({
    url: '/schedule/save',
    method: 'post',
    data
  })
}

export function updateScheduleApi(data: any): Promise<any> {
  return request({
    url: '/schedule/edit',
    method: 'put',
    data
  })
}

export function updateScheduleStatusApi(data: any): Promise<any> {
  return request({
    url: '/schedule/edit/status',
    method: 'put',
    data
  })
}

export function pageQueryScheduleApi(params: any): Promise<any> {
  return request({
    url: '/schedule/page',
    method: 'get',
    params
  })
}

export function getScheduleDateListApi(id: number): Promise<any> {
  return request({
    url: '/schedule/screeningDateList',
    method: 'get',
    params: { filmId: id }
  })
}

export function getScheduleListByDateApi(screeningDate: string, filmId: number): Promise<any> {
  return request({
    url: '/schedule/screeningDate/scheduleList',
    method: 'get',
    params: { screeningDate , filmId }
  })
}

export function getFilmAndScheduleByIdApi(params: any): Promise<any> {
  return request({
    url: '/schedule/detail',
    method: 'get',
    params
  })
}
