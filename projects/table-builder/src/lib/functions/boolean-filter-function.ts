import { FilterType } from '../enums/filterTypes';

function booleanEqualsFunc(filterVal: string, val: any): boolean {
    return filterVal === val;
}

export const BooleanFilterFuncs = {
     [FilterType.BooleanEquals]: booleanEqualsFunc,
};
