import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';

function numberEqalsFunc(filterVal: number, val: number): boolean {
    return  val === filterVal;
}

function numberGreaterThenFunc(filterVal: number, val: number): boolean {
    return val > filterVal;
}

function numberLessThenFunc(filterVal: number, val: number): boolean {
    return val < filterVal;
}

function numberBetweenFunc(filterVal: any, val: number): boolean {
    const startVal = Number(filterVal.Start);
    const endVal = Number(filterVal.End);
    return  (val > startVal) && (val < endVal);
}

export const NumberFilterFuncs = {
    [FilterType.NumberEquals]: numberEqalsFunc,
    [FilterType.NumberGreaterThen]: numberGreaterThenFunc,
    [FilterType.NumberLessThen]: numberLessThenFunc,
    [FilterType.NumberBetween]: numberBetweenFunc,
    [FilterType.IsNull]: isNull,
};
