
export interface CinemaFormType {
  id?: number;
  name: string; // 影院名
  provinceName: string; // 所在省份
  cityName: string; // 所在城市
  areaName: string; // 所在区
  address: string; // 详细地址
  phone: string; // 电话号码
  description?: string; // 简介
  openingHours?: Date; // 营业时间
}

export interface CinemaResultType extends CinemaFormType {
  bussinessStatus: 1 | 0; // 1表示正常，0表示停业
  pcaName: string; // 省市区的名字
  createTime: Date; // 创建时间
  updateTime: Date; // 更新时间
}

export interface CinemaQueryPage {
  pageNo: number;
  pageSize: number;
  name?: string;
  provinceName?: string;
}

export interface CinemaType extends CinemaFormType {
  bussinessStatus: 1 | 0; // 1表示正常，0表示停业
  createTime: Date; // 创建时间
  updateTime: Date; // 更新时间
}
