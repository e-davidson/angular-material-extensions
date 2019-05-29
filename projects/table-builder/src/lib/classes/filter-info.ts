import { MetaData, FieldType } from '../interfaces/report-def';
import { StringFilterMap, DateFilterMap, NumberFilterMap, BooleanFilterMap, FilterType } from '../enums/filterTypes';
import { StringFilterFuncs } from '../functions/string-filter-function';
import { NumberFilterFuncs } from '../functions/number-filter-function';
import { DateFilterFuncs } from '../functions/date-filter-function';
import { BooleanFilterFuncs } from '../functions/boolean-filter-function';



const filterTypeMap = {
  [FieldType.String] : StringFilterMap,
  [FieldType.Array] : StringFilterMap,
  [FieldType.Currency] : NumberFilterMap,
  [FieldType.Date] : DateFilterMap,
  [FieldType.Number] : NumberFilterMap,
  [FieldType.Boolean] : BooleanFilterMap,
  [FieldType.Unknown] : StringFilterMap,
};

const filterTypeFuncMap = {
  [FieldType.String] : StringFilterFuncs,
  [FieldType.Array] : StringFilterFuncs,
  [FieldType.Currency] : NumberFilterFuncs,
  [FieldType.Date] : DateFilterFuncs,
  [FieldType.Number] : NumberFilterFuncs,
  [FieldType.Boolean] : BooleanFilterFuncs,
  [FieldType.Unknown] : StringFilterFuncs,
};
export class FilterInfo {
    filterType?: FilterType;
    filterValue?: any;
    types: any;

    constructor(public field: MetaData) {
      this.types = filterTypeMap[field.fieldType];
    }

    getFunc(): (val: any) => boolean {
      if ( this.filterValue === undefined ) {
         return () => true;
      }
      const func = filterTypeFuncMap[this.field.fieldType][this.filterType];
      return (val) => {
          const obj = val[this.field.key];
          return (obj === null || obj === undefined) ?  false : func(this.filterValue, obj);
      };
    }
}
