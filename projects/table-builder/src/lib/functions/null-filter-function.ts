import { FilterFunc, FilterInfo } from '../classes/filter-info';

export const isNull:FilterFunc<boolean,any> = (filterInfo:FilterInfo) => {
  const func = filterInfo.filterValue ?
    (val: any) => val == null || val === ''
    :
    (val: any) => val != null && val !== '';
    return func;
}
