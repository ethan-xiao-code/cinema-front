import { ScheduleStatus } from "@/api/schedule/type";
export const userSystemTitle = "影片购票中心"
export const adminSystemTitle = "影片管理后台"
export const filmTypeList = ["动作", "动画", "喜剧", "犯罪", "爱情", "科幻", "其他"];
export const filmRegionList = ["内地", "香港", "台湾", "日本", "美国", "其他"];
export const languageList = ['国语', '英语', '粤语', '其他']

export const screenTypeOptions = [
  { label: "2D", value: 1, },
  { label: "3D", value: 2, },
  { label: "IMAX", value: 3, }, // 巨幕电影
  { label: "IMAX_3D", value: 4, },// IMAX三维电影
]

export const filmStatusOptions = [
  { label: '即将上映', value: 1 },
  { label: '已上映', value: 2, type: 'success' },
  { label: '已下线', value: 3, type: 'danger' }
]

export const shceduleStatusOptions = [
  {label: '已取消',value: ScheduleStatus.Canceled,type:'warning'},
  {label: '未发布',value: ScheduleStatus.Unpubilshed,},
  {label: '已发布',value: ScheduleStatus.Published,type: 'success'},
  {label: '已结束',value: ScheduleStatus.Expired,type: 'danger'}
]

export const host = 'localhost'
// const host = '47.96.128.212'

export enum RoleEnum {
  Admin = 1,
  User = 0
}

export const userRoleOptions = [
  {label: '普通用户',value: RoleEnum.User},
  {label: '管理员',value: RoleEnum.Admin}
]
export const accountStatusOptions = [
      {
        label: "启用",
        value: 1,
      },
      {
        label: "禁用",
        value: 0,
      },
    ]
export const rolePathList = ['/user', '/admin']
export const payStatus = ['已取消', '已支付', '已完成']

export const getLabelByValue = (options: {label: string,value: any}[],value: any) => {
  const item = options.find(item => item.value === value)
  return item?.label
}



