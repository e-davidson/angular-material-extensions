import { StringFilterMap, DateFilterMap, NumberFilterMap, BooleanFilterMap, FilterType } from '../enums/filterTypes';
import { StringFilterFuncs } from '../functions/string-filter-function';
import { NumberFilterFuncs } from '../functions/number-filter-function';
import { DateFilterFuncs } from '../functions/date-filter-function';
import { BooleanFilterFuncs } from '../functions/boolean-filter-function';
import { FieldType } from '../interfaces/report-def';


export const filterTypeMap: { [key: string]: { [key: string]: FilterType[]}  } = {
  [FieldType.String] : StringFilterMap,
  [FieldType.Array] : StringFilterMap,
  [FieldType.Currency] : NumberFilterMap,
  [FieldType.PhoneNumber] : StringFilterMap,
  [FieldType.Date] : DateFilterMap,
  [FieldType.Number] : NumberFilterMap,
  [FieldType.Boolean] : BooleanFilterMap,
  [FieldType.Unknown] : StringFilterMap,
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
export interface FilterInfo {
    filterId?: string;
    filterType?: FilterType;
    filterValue?: any;
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
  const func = filterTypeFuncMap[filter.fieldType][filter.filterType];
  return (obj) => {
    const prop = obj[filter.key];
    return ((prop === null || prop === undefined) && filter.filterType !== FilterType.IsNull) ? false : func(filter.filterValue, prop);
  };
}
