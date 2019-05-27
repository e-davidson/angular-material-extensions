import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MetaData } from '../interfaces/report-def';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Pipe({ name: 'columnTotal' })
export class ColumnTotalPipe implements PipeTransform {
  transform(data$: Observable<any>, metaData: MetaData ) {
      switch (metaData.additional.footer.type) {
        case 'sum':
        return data$.pipe(
            map( data => _.sumBy(data, metaData.key ) )
          );
      }
      return of(null);
  }
}
