import { Pipe, PipeTransform } from '@angular/core';
import { TableStore } from '../classes/table-store';
import { spaceCase } from './space-case.pipes';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({name: 'keyDisplay'})
export class KeyDisplayPipe implements PipeTransform {
  constructor( public tableState: TableStore) {
  }
  transform(key: string): Observable<string> {
    return this.tableState.getMetaData$(key).pipe(
      map( metaData => metaData.displayName || spaceCase(key))
    );
  }
}
