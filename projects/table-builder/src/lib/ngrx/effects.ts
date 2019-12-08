import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, of } from 'rxjs';
import { fullTableState, selectTableState  } from './reducer';
import { tap, mergeMap, first, map } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as tableActions from './actions';


@Injectable()
export class SaveTableEffects {

  saveTable$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.saveTableState),
      mergeMap( ({tableId}) =>  this.store$.pipe(
        first(),
        select(selectTableState, {tableId} ),
        map( table => ({tableId, table}))) ),
        tap( ({tableId, table}) => {
        localStorage.setItem(tableId, JSON.stringify(table));
      }),
      mergeMap( _ => EMPTY )
    )
  );

  initTable$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.initTable),
      mergeMap( ({tableId}) => {
        const table = localStorage.getItem(tableId);
        if (table) {
          return of(  tableActions.updateTableState({tableId, tableState: JSON.parse(table) }) );
        }
        return EMPTY;
      })
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<{fullTableState: fullTableState}>
  ) {}
}
