import request from '@/utils/request'



export function updatePasswordApi(data: any): Promise<any> {
  return request({
    url: `/password`,
    method: 'put',
    data
  })
}

export function upload(data: any): Promise<any> {
  return request({
    url: `/upload`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
