import { StringFilterMap, DateFilterMap, NumberFilterMap, BooleanFilterMap, FilterType, FilterMap } from '../enums/filterTypes';
import { StringFilterFuncs } from '../functions/string-filter-function';
import { NumberFilterFuncs } from '../functions/number-filter-function';
import { DateFilterFuncs } from '../functions/date-filter-function';
import { BooleanFilterFuncs } from '../functions/boolean-filter-function';
import { FieldType } from '../interfaces/report-def';

type FilterTypeMapType = { [key in FieldType]: FilterMap};
type UnmappedTypes = FieldType.Expression | FieldType.Hidden | FieldType.ImageUrl | FieldType.Link;
export const filterTypeMap: Omit<FilterTypeMapType, UnmappedTypes> = {
  [FieldType.Unknown] : StringFilterMap,
  [FieldType.Date] : DateFilterMap,
  [FieldType.Currency] : NumberFilterMap,
  [FieldType.Array] : StringFilterMap,
  [FieldType.Number] : NumberFilterMap,
  [FieldType.String] : StringFilterMap,
  [FieldType.Boolean] : BooleanFilterMap,
  [FieldType.PhoneNumber] : StringFilterMap,
};



const filterFactoryMap = {
  [FilterType.Or] : (filter: FilterInfo ): (obj: any) => boolean =>  {
    const filters = (filter.filterValue as FilterInfo[]).map(createFilterFunc);
    return (obj: any) : boolean => filters.some( f => f(obj));
  },
  [FilterType.And] : (filter: FilterInfo ): (obj: any) => boolean =>  {
    const filters = (filter.filterValue as FilterInfo[]).map(createFilterFunc);
    return (obj: any) : boolean => filters.every( f => f(obj));
  }
};

const filterTypeFuncMap = {
  [FieldType.String] : StringFilterFuncs,
  [FieldType.Array] : StringFilterFuncs,
  [FieldType.Currency] : NumberFilterFuncs,
  [FieldType.PhoneNumber] : StringFilterFuncs,
  [FieldType.Date] : DateFilterFuncs,
  [FieldType.Number] : NumberFilterFuncs,
  [FieldType.Boolean] : BooleanFilterFuncs,
  [FieldType.Unknown] : StringFilterFuncs,
};
export interface FilterInfo<T = any> {
    filterId?: string;
    filterType?: FilterType;
    filterValue?: T;
    key: string;
    fieldType: FieldType;
}

export function createFilterFunc(filter: FilterInfo): (val: any) => boolean  {
  if (filter.filterValue === undefined) {
    return () => true;
  }
  if(filterFactoryMap[filter.filterType]){
    return filterFactoryMap[filter.filterType](filter);
  }
  const func = filterTypeFuncMap[filter.fieldType][filter.filterType](filter);
  return (obj) => {
    const prop = obj[filter.key];
    return ((prop === null || prop === undefined) && filter.filterType !== FilterType.IsNull) ? false : func( prop);
  };
}

export type FilterFunc<T,V = T> = (filterInfo:FilterInfo<T>) => (val:V) => boolean;
export type BetweenInfo<T> = {Start:T,End:T};
