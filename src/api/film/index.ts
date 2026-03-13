import request from '@/utils/request'
import { FilmFormType, FilmResultType, FilmSearchParamsType } from './type'

export function getFilmesApi(params: FilmSearchParamsType): Promise<any> {
  return request({
    url: `/film/list`,
    method: 'get',
    params
  })
}


export function getFilmListByScore(num: number): Promise<any> {
  return request({
    url: '/film/score',
    params: { num }
  })
}

export function getFilmById(id: number): Promise<FilmResultType> {
  return request({
    url: `/film/single/${id}`,
    method: 'get'
  })
}

export function pageQueryFilm(params: any): Promise<FilmResultType[]> {
  return request({
    url: '/film/page',
    method: 'get',
    params
  })
}

export function addFilm(data: FilmFormType): Promise<any> {
  return request({
    url: '/film/save',
    method: 'post',
    data
  })
}

export function updateFilm(data: FilmFormType): Promise<any> {
  return request({
    url: '/film/edit',
    method: 'put',
    data
  })
}

export function deleteFilmById(id: number): Promise<any> {
  return request({
    url: `/film/${id}`,
    method: 'delete'
  })
}


export function getFilmListApi(): Promise<any> {
  return request({
    url: `/film/list`,
    method: 'get'
  })
}


