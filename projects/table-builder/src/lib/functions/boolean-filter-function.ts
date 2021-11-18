import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';

const  booleanEqualsFunc : FilterFunc<boolean> = (filterInfo:FilterInfo) => (val): boolean  => {
    return filterInfo.filterValue === val;
}

export const BooleanFilterFuncs: Dictionary<FilterFunc<any,any>> = {
     [FilterType.BooleanEquals]: booleanEqualsFunc,
     [FilterType.IsNull]: isNull,
};
