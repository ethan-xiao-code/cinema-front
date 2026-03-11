import request from '@/utils/request'
import axios from 'axios'

export function getFilmesByStatus(status: number): Promise<any> {
  return request({
    url: `/film/list/${status}`
  })
}

export function getRecentFilmImage(num: number): Promise<any> {
  return axios.get(`/film/recent/${num}`)
}

export function getFilmListByScore(num: number): Promise<any> {
  return request({
    url: '/film/score',
    params: { num }
  })
}

export function getFilmById(id: number): Promise<any> {
  return request({
    url: `/film/single/${id}`,
    method: 'get'
  })
}

export function pageQueryFilm(params: any,signal?:AbortController): Promise<any> {
  return request({
    url: '/film/page',
    method: 'get',
    params,
  })
}

export function addFilm(data: any): Promise<any> {
  return request({
    url: '/film/save',
    method: 'post',
    data
  })
}

export function updateFilm(data: any): Promise<any> {
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

export function getBoxOfficeByTypeApi(): Promise<any> {
  return request({
    url: `/film/type/box_office`,
    method: 'get'
  })
}

export default {
  getFilmesByStatus,
  getRecentFilmImage,
  getFilmListByScore
}
