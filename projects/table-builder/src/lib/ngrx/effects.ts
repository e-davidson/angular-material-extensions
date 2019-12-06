import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { saveTableState, fullTableState, selectTableState, initTable, updateTableState } from './reducer';
import { tap, mergeMap, first, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';


@Injectable()
export class SaveTableEffects {

  saveTable$ = createEffect(
    () => this.actions$.pipe(
      ofType(saveTableState),
      tap( d => console.log(d)),
      mergeMap( ({tableId}) =>  this.store$.pipe(
        first(),
        select(selectTableState, {tableId} ),
        map( table => ({tableId, table}))) ),
        tap( ({tableId, table}) => {
        console.log(table);
        localStorage.setItem(tableId, JSON.stringify(table));
      }),
      mergeMap( _ => EMPTY )
    )
  );

  initTable$ = createEffect(
    () => this.actions$.pipe(
      ofType(initTable),
      tap( d => console.log(d)),
      mergeMap( ({tableId}) => {
        const table = localStorage.getItem(tableId);
        if (table) {
          return of(  updateTableState({tableId, tableState: JSON.parse(table) }) );
        }
        return EMPTY;
      }),
      tap( d => console.log(d)),
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<{fullTableState: fullTableState}>
  ) {}
}
