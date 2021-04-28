import { Pipe, PipeTransform } from '@angular/core';
import { TableStore } from '../classes/table-store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldType } from '../interfaces/report-def';
import { DatePipe } from '@angular/common';
import { FilterType } from '../enums/filterTypes';
import { FilterInfo } from '../classes/filter-info';


@Pipe({name: 'formatFilterValue'})
export class FormatFilterValuePipe implements PipeTransform {
  constructor( public tableState: TableStore , private datePipe: DatePipe) {
  }
  transform(value: any, key: string, filterType: FilterType): Observable<string> {
    return this.tableState.getMetaData$(key).pipe(
      map( md => {
        if(filterType === FilterType.Or) {
          const filters = value as FilterInfo [];
          if(md.fieldType === FieldType.Enum) {
            const res =  filters.reduce( (prev,curr) => prev + md.additional.enumMap[curr.filterValue] + ' or ' ,'');
            return res.substr(0, res.length - 4);
          }
          const res =  filters.reduce( (prev,curr) => prev  + curr.filterValue + ' or ' ,'');
          return res.substr(0, res.length - 4);
        }
        if(filterType === FilterType.IsNull){
          return '';
        }
        if(value && (filterType === FilterType.In )){
          return (value as {value:any}[]).map(v => v.value).join(', ') ?? value;
        }
        if(filterType === FilterType.NumberBetween){
          if(md.fieldType === FieldType.Date){
            value = this.datePipe.transform(value.Start, 'MM/dd/yy')+ ' - ' + this.datePipe.transform(value.End, 'MM/dd/yy');
          }else{
            value = value.Start + ' - ' + value.End;
          }
        } else if(md.fieldType === FieldType.Date){
          value = this.datePipe.transform(value, 'MM/dd/yy');
        }
        return value
      })
    );
  }
}
