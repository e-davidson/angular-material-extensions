import { FilterFunc, FilterInfo } from '../classes/filter-info';
import { FilterType } from '../enums/filterTypes';
import { Dictionary } from '../interfaces/dictionary';
import { isNull } from './null-filter-function';


const stringEqualFunc:FilterFunc<string> = (filterInfo:FilterInfo) => {
  const equelsVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val) === equelsVal );
}

const stringContainsFunc:FilterFunc<string> = (filterInfo:FilterInfo) => {
  const containsVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).includes(containsVal));
}

const stringDoesNotContainFunc:FilterFunc<string> = (filterInfo:FilterInfo) => {
  const doesNotContainVal = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>!prepareForStringCompare(val)?.includes(doesNotContainVal));
}

const stringStartsWithFunc:FilterFunc<string> = (filterInfo:FilterInfo) => {
  const startsWith = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).startsWith(startsWith));
}

const stringEndsWithFunc:FilterFunc<string> = (filterInfo:FilterInfo) => {
  const startsWith = prepareForStringCompare(filterInfo.filterValue);
  return ((val)=>prepareForStringCompare(val).endsWith(startsWith));
}

const multipleStringValuesEqualsFunc:FilterFunc<string[],string> = (filterInfo:FilterInfo) => {
  const filterVals = filterInfo.filterValue.map( (v: string) => prepareForStringCompare(v));
  return ((val)=> filterVals.some((s:string) => prepareForStringCompare(val) === s));
}

export const StringFilterFuncs: {[k:string]: FilterFunc<any,any>} = {
    [FilterType.StringEquals]: stringEqualFunc,
    [FilterType.StringContains]: stringContainsFunc,
    [FilterType.StringDoesNotContain]: stringDoesNotContainFunc,
    [FilterType.StringStartWith]: stringStartsWithFunc,
    [FilterType.StringEndsWith]: stringEndsWithFunc,
    [FilterType.IsNull]: isNull,
    [FilterType.In]: multipleStringValuesEqualsFunc,
};

export const EnumFilterFuncs: Dictionary<FilterFunc<any,any>> = {
  [FilterType.IsNull]: isNull,
  [FilterType.In] : multipleStringValuesEqualsFunc,
};

export const prepareForStringCompare = (val : any):string => val?.toString().trim().toLowerCase();
