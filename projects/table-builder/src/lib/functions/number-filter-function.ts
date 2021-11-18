import { Range, FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';

type NumberFilterFunc = FilterFunc<number>

const numberEqalsFunc:NumberFilterFunc = (filterInfo : FilterInfo<number>) => (val: number): boolean  =>{
    return  val === filterInfo.filterValue;
}

const numberNotEqualFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  =>{
  return val !== filterInfo.filterValue;
}

const  numberGreaterThanFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  => {
    return val > filterInfo.filterValue;
}

const numberLessThanFunc:NumberFilterFunc= (filterInfo : FilterInfo<number>) => (val: number): boolean  => {
    return val < filterInfo.filterValue;
}

const  numberBetweenFunc:FilterFunc<Range<number>,number> = (filterInfo : FilterInfo) => {
  const startVal = Number(filterInfo.filterValue.Start);
  const endVal = Number(filterInfo.filterValue.End);
  return ((val)=>(val > startVal) && (val < endVal));
}

export const multipleNumberValuesEqualsFunc:FilterFunc<number[],number> = (filterInfo:FilterInfo) => {
  return ((val)=>filterInfo.filterValue.some((value: any) => val === value));
}

export const NumberFilterFuncs: Dictionary<FilterFunc<any,any>> = {
    [FilterType.NumberEquals]: numberEqalsFunc,
    [FilterType.NumberNotEqual]: numberNotEqualFunc,
    [FilterType.NumberGreaterThan]: numberGreaterThanFunc,
    [FilterType.NumberLessThan]: numberLessThanFunc,
    [FilterType.NumberBetween]: numberBetweenFunc,
    [FilterType.IsNull]: isNull,
    [FilterType.In]: multipleNumberValuesEqualsFunc,
};
