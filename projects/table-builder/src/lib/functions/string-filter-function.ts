import { FilterType } from '../enums/filterTypes';
import { isNull } from './null-filter-function';


function stringEqualFunc(filterVal: string, val: any): boolean  {
    const equelsVal = prepareForStringCompare(filterVal);
    return prepareForStringCompare(val) === equelsVal ;
}

function stringContainsFunc(filterVal: string, val: any): boolean {
    const containsVal = prepareForStringCompare(filterVal);
    return prepareForStringCompare(val).includes(containsVal);
}

function stringDoesNotContainFunc(filterVal: string, val: any): boolean {
  const cleanfilterVal = prepareForStringCompare(filterVal);
  const cleanVal = prepareForStringCompare(val);
  return !cleanVal.includes(cleanfilterVal);
}

function stringStartsWithFunc(filterVal: string, val: any): boolean {
    const startsWith = prepareForStringCompare(filterVal);
    return prepareForStringCompare(val).startsWith(startsWith);
}

function stringEndsWithFunc(filterVal: string, val: any): boolean {
    const endsWith = prepareForStringCompare(filterVal);
    return prepareForStringCompare(val).endsWith(endsWith);
}

export function multipleStringValuesEqualsFunc(filterVal: any[], val: any): boolean {
  return filterVal.some(({value}) => prepareForStringCompare(val) === prepareForStringCompare(value));
}

export const StringFilterFuncs = {
    [FilterType.StringEquals]: stringEqualFunc,
    [FilterType.StringContains]: stringContainsFunc,
    [FilterType.StringDoesNotContain]: stringDoesNotContainFunc,
    [FilterType.StringStartWith]: stringStartsWithFunc,
    [FilterType.StringEndsWith]: stringEndsWithFunc,
    [FilterType.IsNull]: isNull,
    [FilterType.StringIn]: multipleStringValuesEqualsFunc,
};

export const prepareForStringCompare = (val : any) => val?.toString().trim().toLowerCase();