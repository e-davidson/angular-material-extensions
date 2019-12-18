import { Pipe, PipeTransform } from '@angular/core';
import { TableStateManager } from '../classes/table-state-manager';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FieldType } from '../interfaces/report-def';
import { DatePipe } from '@angular/common';

@Pipe({name: 'formatValue'})
export class FormatValuePipe implements PipeTransform {
  constructor( public tableState: TableStateManager, private datePipe: DatePipe) {
  }
  transform(value: any, key: string): Observable<string> {
    return this.tableState.metaData$(key).pipe(
      map( md => md.fieldType === FieldType.Date ? this.datePipe.transform(value, 'MM/dd/yy') : value)
    );
  }
}
