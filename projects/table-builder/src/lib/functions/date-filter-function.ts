import { FilterType } from '../enums/filterTypes';


function dateIsOnFunc(filterVal: Date, val: Date): boolean {
    const isOnVal = filterVal.getTime();
    return  val.getTime() === isOnVal;
}

function dateIsOnOrAfterFunc(filterVal: Date, val: Date): boolean {
    const afterVal = filterVal.getTime();
    return  val.getTime() >= afterVal;
}

function dateIsOnOrBeforeFunc(filterVal: Date, val: Date): boolean {
    const beforeVal = filterVal.getTime();
    return val.getTime() <= beforeVal;
}

function dateBetweenFunc(filterVal: any, val: Date): boolean {
    return  val >= filterVal.From  &&    val <= filterVal.To;
}

export const DateFilterFuncs = {
    [FilterType.DateIsOn]: dateIsOnFunc,
    [FilterType.DateOnOrAfter]: dateIsOnOrAfterFunc,
    [FilterType.DateOnOrBefore]: dateIsOnOrBeforeFunc,
    [FilterType.DateBetween]: dateBetweenFunc
};
