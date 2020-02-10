import { FilterType } from '../enums/filterTypes';


function dateIsOnFunc(filterVal: Date, val: Date): boolean {
    const isOnVal = new Date( filterVal).getTime();
    return  val.getTime()  === isOnVal;
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

export const DateFilterFuncs = {
    [FilterType.DateIsOn]: dateIsOnFunc,
    [FilterType.DateOnOrAfter]: dateIsOnOrAfterFunc,
    [FilterType.DateOnOrBefore]: dateIsOnOrBeforeFunc,
    [FilterType.DateBetween]: dateBetweenFunc
};
