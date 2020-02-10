import { Pipe, PipeTransform } from '@angular/core';
import { TableStateManager } from '../classes/table-state-manager';
import { SpaceCasePipe } from './space-case.pipes';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({name: 'keyDisplay'})
export class KeyDisplayPipe implements PipeTransform {
  constructor( public tableState: TableStateManager, private spaceCase: SpaceCasePipe) {
  }
  transform(key: string): Observable<string> {
    return this.tableState.metaData$(key).pipe(
      map( metaData => metaData.displayName || this.spaceCase.transform(key))
    );
  }
}
