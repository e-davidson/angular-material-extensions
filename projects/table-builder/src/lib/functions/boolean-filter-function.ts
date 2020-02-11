import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';

function booleanEqualsFunc(filterVal: string, val: any): boolean {
    return filterVal === val;
}

export const BooleanFilterFuncs = {
     [FilterType.BooleanEquals]: booleanEqualsFunc,
     [FilterType.IsNull]: isNull,
};
