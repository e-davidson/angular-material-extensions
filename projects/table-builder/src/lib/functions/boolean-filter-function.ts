import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';

const  booleanEqualsFunc : FilterFunc<boolean> = (filterInfo:FilterInfo<boolean>) => (val): boolean  => {
    return filterInfo.filterValue === (val || false);
}

export const BooleanFilterFuncs = {
     [FilterType.BooleanEquals]: booleanEqualsFunc,
     [FilterType.IsNull]: isNull,
};
