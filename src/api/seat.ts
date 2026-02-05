import request from '@/utils/request'

export function getSeatsByScheduleId(params: any): Promise<any> {
  return request({
    url: '/seat/list',
    method: 'get',
    params
  })
}
