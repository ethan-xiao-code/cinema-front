import request from '@/utils/request'
import { CommentReactionType, ReplyCommentType } from './type';

export function addCommentApi(data: any): Promise<any> {
  return request({
    url: `/comment/save`,
    method: 'post',
    data
  })
}


// /single/user-film
export function getCommentByFilmIdApi(id: number): Promise<any> {
  return request({
    url: '/comment/info/list',
    method: 'get',
    params: { filmId: id }
  })
}

export function getCommentByFilmAndUserIdApi(data: {filmId: number;userId: number}): Promise<any> {
  return request({
    url: '/comment/single/user-film',
    method: 'get',
    params: { ...data}
  })
}


export function deleteCommentApi(id: number | string): Promise<any> {
  return request({
    url: '/comment/delete',
    method: 'post',
    data: { id }
  })
}

export function likeCommentApi(commentId: number | string, userId?: number | string): Promise<any> {
  return request({
    url: '/comment/like',
    method: 'post',
    data: { commentId, userId }
  })
}

export function handleCommentReactionApi(data: CommentReactionType): Promise<any> {
  return request({
    url: '/comment-reactions/likeOrUnLike',
    method: 'post',
    data
  })
}

