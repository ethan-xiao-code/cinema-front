
export type ChartParamsType = {
  filmName: string;
  startTime: string | undefined;
  endTime: string | undefined;
}


export interface FilmBoxOfficeType {
  id: number;
  filmName: string;
  boxOffice: number;
  type: string | number;
}
export interface BoxOfficeTrendType {
  date: string;
  dayBoxOffice: number;
}
export interface ChartItemType {
  name: string;
  value: number;
}


export type StatisticsBoxOfficeType = {
  totalBoxOffice: number;
  totalTickets: number;
  dailyAverageBoxOffice: number;
  dailyAverageTickets: number;
}
