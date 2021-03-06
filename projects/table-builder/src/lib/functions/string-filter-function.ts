import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';


const stringEqualFunc:FilterFunc<string> = (filterInfo:FilterInfo<string>) => {
  const equelsVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val) === equelsVal );
}

const stringContainsFunc:FilterFunc<string> = (filterInfo:FilterInfo<string>) => {
  const containsVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).includes(containsVal));
}

const stringDoesNotContainFunc:FilterFunc<string> = (filterInfo:FilterInfo<string>) => {
  const doesNotContainVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>!prepareForStringCompare(val)?.includes(doesNotContainVal));
}

const stringStartsWithFunc:FilterFunc<string> = (filterInfo:FilterInfo<string>) => {
  const startsWith = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).startsWith(startsWith));
}

const stringEndsWithFunc:FilterFunc<string> = (filterInfo:FilterInfo<string>) => {
  const startsWith = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).endsWith(startsWith));
}

const multipleStringValuesEqualsFunc:FilterFunc<string[],string> = (filterInfo:FilterInfo<string[]>) => {
  const filterVals = filterInfo.filterValue.map(v => prepareForStringCompare(v));
  return ((val)=> filterVals.some((s) => prepareForStringCompare(val) === s));
}

export const StringFilterFuncs = {
    [FilterType.StringEquals]: stringEqualFunc,
    [FilterType.StringContains]: stringContainsFunc,
    [FilterType.StringDoesNotContain]: stringDoesNotContainFunc,
    [FilterType.StringStartWith]: stringStartsWithFunc,
    [FilterType.StringEndsWith]: stringEndsWithFunc,
    [FilterType.IsNull]: isNull,
    [FilterType.In]: multipleStringValuesEqualsFunc,
};

export const EnumFilterFuncs = {
  [FilterType.IsNull]: isNull,
  [FilterType.In] : multipleStringValuesEqualsFunc,
};

export const prepareForStringCompare = (val : any):string => val?.toString().trim().toLowerCase();
