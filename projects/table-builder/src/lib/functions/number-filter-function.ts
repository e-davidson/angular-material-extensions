import { Range, FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterInput } from '../components/in-filter/in-filter.component';
import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';

type NumberFilterFunc = FilterFunc<number>

const numberEqalsFunc:NumberFilterFunc = (filterInfo : FilterInfo<number>) => (val: number): boolean  =>{
    return  val === filterInfo.filterValue;
}

const numberNotEqualFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  =>{
  return val !== filterInfo.filterValue;
}

const  numberGreaterThenFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  => {
    return val > filterInfo.filterValue;
}

const numberLessThenFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  => {
    return val < filterInfo.filterValue;
}

const  numberBetweenFunc:FilterFunc<Range<number>,number> = (filterInfo : FilterInfo<Range<number>>) => {
  const startVal = Number(filterInfo.filterValue.Start);
  const endVal = Number(filterInfo.filterValue.End);
  return ((val)=>(val > startVal) && (val < endVal));
}

const multipleNumberValuesEqualsFunc:FilterFunc<FilterInput[],number> = (filterInfo:FilterInfo<FilterInput[]>) => {
  return ((val)=>filterInfo.filterValue.some(({value}) => val === value));
}

export const NumberFilterFuncs = {
    [FilterType.NumberEquals]: numberEqalsFunc,
    [FilterType.NumberNotEqual]: numberNotEqualFunc,
    [FilterType.NumberGreaterThen]: numberGreaterThenFunc,
    [FilterType.NumberLessThen]: numberLessThenFunc,
    [FilterType.NumberBetween]: numberBetweenFunc,
    [FilterType.IsNull]: isNull,
    [FilterType.NumberIn]: multipleNumberValuesEqualsFunc,
};
