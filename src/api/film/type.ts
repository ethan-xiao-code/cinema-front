
export interface FilmFormType {
  id: number;
  title: string;
  poster: string;
  director: string;
  actors: string;
  releaseDate: string; // 若使用Date类型可替换为Date
  endDate: string;     // 若使用Date类型可替换为Date
  types: string;
  regions: string;
  duration: number;
  plot: string;
  dateList: any[];
}
type StatusType = 1 | 2 | 3; // 1-即将上映，2-上映中，3-下线（新增的影片默认是1）
export interface FilmType {
  id: number;
  poster: string;
  title: string;
  director: string;
  actors: string;
  types: string;
  regions: string;
  duration: number;
  releaseDate: string;
  status: StatusType;
  plot: string;
  averageScore: number;
}

export interface FilmResultType extends FilmFormType {
  status: StatusType
}

export interface FilmTopType {
  id: number;
  title: string;
  poster: string;
  averageScore: number;
}

export interface FilmCardType {
  id: number;
  poster: string;
}

export enum ShopEnum {
  Buy = 0, // 购票页
  Detail = 1 // 详情页
}