import { FilterFunc, FilterInfo } from '../classes/filter-info';

export const isNull:FilterFunc<boolean,any> = (filterInfo:FilterInfo<boolean>) => {
  const func = filterInfo.filterValue ? 
    (val) => val == null || val === ''
    :
    (val) => val != null && val !== '';
    return func;
}