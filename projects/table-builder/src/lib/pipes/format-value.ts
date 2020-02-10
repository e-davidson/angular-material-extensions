import { Pipe, PipeTransform } from '@angular/core';
import { TableStateManager } from '../classes/table-state-manager';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldType } from '../interfaces/report-def';
import { DatePipe } from '@angular/common';
import { FilterType } from '../enums/filterTypes';

@Pipe({name: 'formatValue'})
export class FormatValuePipe implements PipeTransform {
  constructor( public tableState: TableStateManager, private datePipe: DatePipe) {
  }
  transform(value: any, key: string, filterType: FilterType): Observable<string> {
    return this.tableState.metaData$(key).pipe(
      map( md => {
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
