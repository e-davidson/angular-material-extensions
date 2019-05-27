import { FilterType } from '../enums/filterTypes';

function numberEqalsFunc(filterVal: number, val: number): boolean {
    return  val === filterVal;
}

function numberGreaterThenFunc(filterVal: number, val: number): boolean {
    return val > filterVal;
}

function numberLessThenFunc(filterVal: number, val: number): boolean {
    return val < filterVal;
}

function numberBetweenFunc(filterVal: number[], val: number): boolean {
    const startVal = Number(filterVal[0]);
    const endVal = Number(filterVal[1]);
    return  (val > startVal) && (val < endVal);
}

export const NumberFilterFuncs = {
    [FilterType.NumberEquals]: numberEqalsFunc,
    [FilterType.NumberGreaterThen]: numberGreaterThenFunc,
    [FilterType.NumberLessThen]: numberLessThenFunc,
    [FilterType.NumberBetween]: numberBetweenFunc,
};
