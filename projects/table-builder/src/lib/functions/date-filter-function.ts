import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';


function dateIsOnFunc(filterVal: Date, val: Date): boolean {
    const isOnVal = new Date( filterVal).getTime();
    return  val.getTime()  === isOnVal;
}

function dateIsNotOnFunc(filterVal: Date, val: Date): boolean {
  const isNotOnVal = new Date( filterVal).getTime();
  return  val.getTime()  !== isNotOnVal;
}

function dateIsOnOrAfterFunc(filterVal: Date, val: Date): boolean {
    const afterVal = new Date( filterVal);
    return  val >= afterVal;
}

function dateIsOnOrBeforeFunc(filterVal: Date, val: Date): boolean {
    const beforeVal = new Date( filterVal);
    return val <= beforeVal;
}

function dateBetweenFunc(filterVal: any, val: Date): boolean {
    return  val >= new Date(filterVal.Start ) &&    val <= new Date( filterVal.End);
}

export const DateFilterFuncs : Partial<{[key in FilterType]: (filterVal:Date | boolean, val: Date)=> boolean}> = {
    [FilterType.DateIsOn]: dateIsOnFunc,
    [FilterType.DateIsNotOn]: dateIsNotOnFunc,
    [FilterType.DateOnOrAfter]: dateIsOnOrAfterFunc,
    [FilterType.DateOnOrBefore]: dateIsOnOrBeforeFunc,
    [FilterType.DateBetween]: dateBetweenFunc,
    [FilterType.IsNull]: isNull,
};
