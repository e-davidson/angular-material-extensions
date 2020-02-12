import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';


function stringEqualFunc(filterVal: string, val: any): boolean  {
    const equelsVal = filterVal.toString().trim().toLowerCase();
    return val.toString().trim().toLowerCase() === equelsVal ;
}

function stringContainsFunc(filterVal: string, val: any): boolean {
    const containsVal = filterVal.toString().trim().toLowerCase();
    return val.toString().trim().toLowerCase().includes(containsVal);
}

function stringDoesNotContainFunc(filterVal: string, val: any): boolean {
  const cleanfilterVal = filterVal.toString().trim().toLowerCase();
  const cleanVal = val.toString().trim().toLowerCase();
  return !cleanVal.includes(cleanfilterVal);
}

function stringStartsWithFunc(filterVal: string, val: any): boolean {
    const startsWith = filterVal.toString().trim().toLowerCase();
    return val.toString().trim().toLowerCase().startsWith(startsWith);
}

function stringEndsWithFunc(filterVal: string, val: any): boolean {
    const endsWith = filterVal.toString().trim().toLowerCase();
    return val.toString().trim().toLowerCase().endsWith(endsWith);
}

export const StringFilterFuncs = {
    [FilterType.StringEquals]: stringEqualFunc,
    [FilterType.StringContains]: stringContainsFunc,
    [FilterType.StringDoesNotContain]: stringDoesNotContainFunc,
    [FilterType.StringStartWith]: stringStartsWithFunc,
    [FilterType.StringEndsWith]: stringEndsWithFunc,
    [FilterType.IsNull]: isNull,
};
