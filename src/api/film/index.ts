import request from '@/utils/request'
import { FilmFormType, FilmResultType, FilmSearchParamsType } from './type'
export function getFilmListByScoreApi(num: number): Promise<any> {
  return request({
    url: '/film/score',
    params: { num }
  })
}

export function getFilmByIdApi(id: number): Promise<FilmResultType> {
  return request({
    url: `/film/single/${id}`,
    method: 'get'
  })
}

export function pageQueryFilmApi(params: any): Promise<FilmResultType[]> {
  return request({
    url: '/film/page',
    method: 'get',
    params
  })
}

export function addFilmApi(data: FilmFormType): Promise<any> {
  return request({
    url: '/film/save',
    method: 'post',
    data
  })
}

export function updateFilmApi(data: FilmFormType): Promise<any> {
  return request({
    url: '/film/edit',
    method: 'put',
    data
  })
}

export function deleteFilmByIdApi(id: number): Promise<any> {
  return request({
    url: `/film/${id}`,
    method: 'delete'
  })
}


export function getFilmListApi(params: FilmSearchParamsType): Promise<any> {
  return request({
    url: `/film/list`,
    method: 'get',
    params
  })
}

export function getValidFilmListApi(): Promise<any> {
  return request({
    url: `/film/valid/list`,
    method: 'get',
  })
}


