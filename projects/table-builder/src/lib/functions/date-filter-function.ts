import { FilterFunc, FilterInfo, Range } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';


const dateIsOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isOnVal = new Date( filterInfo.filterValue).getTime();
  return ((val)=>val.getTime()  === isOnVal);
}

const dateIsNotOnFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const isNotOnVal = new Date( filterInfo.filterValue).getTime();
  return ((val)=>val?.getTime()  !== isNotOnVal);
}

const dateIsOnOrAfterFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const afterVal = new Date( filterInfo.filterValue).getTime();
  return ((val)=>val.getTime()  >= afterVal);
}

const dateIsOnOrBeforeFunc:FilterFunc<Date> = (filterInfo:FilterInfo) => {
  const beforeVal = new Date( filterInfo.filterValue).getTime();
  return ((val)=>val.getTime()  <= beforeVal);
}

const dateBetweenFunc:FilterFunc<Range<Date>,Date> = (filterInfo:FilterInfo) => {
  const startVal = new Date(filterInfo.filterValue.Start);
  const endVal = new Date(filterInfo.filterValue.End);
  return ((val)=>val>=startVal && val <= endVal);
}

export const DateFilterFuncs: Dictionary<FilterFunc<any,any>> = {
    [FilterType.DateIsOn]: dateIsOnFunc,
    [FilterType.DateIsNotOn]: dateIsNotOnFunc,
    [FilterType.DateOnOrAfter]: dateIsOnOrAfterFunc,
    [FilterType.DateOnOrBefore]: dateIsOnOrBeforeFunc,
    [FilterType.DateBetween]: dateBetweenFunc,
    [FilterType.IsNull]: isNull,
};
