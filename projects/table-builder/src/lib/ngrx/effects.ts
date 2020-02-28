import { Injectable, Inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { fullTableState, selectTableState  } from './reducer';
import { tap, mergeMap, first, map, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as tableActions from './actions';
import { TableBuilderConfig, TableBuilderConfigToken } from '../classes/TableBuilderConfig';


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
      mergeMap( ({tableId}) =>
        this.store$.pipe(
          map(s => s.fullTableState[tableId]),
          first(),
          filter( d => d.notInitialized ),
          map( u => {
            const table = localStorage.getItem(tableId);
            if (table) {
              return tableActions.updateTableState({ tableId, tableState: {...JSON.parse(table), notInitialized : false} });
            }
            return tableActions.updateTableState(
              { tableId, tableState: {...{ hiddenKeys: [], pageSize: 20, filters: {}, notInitialized : false }, ...this.config.defaultTableState } }
            );
          }),
        ))
    )
  );

  constructor(
    private actions$: Actions,
    private store$: Store<{fullTableState: fullTableState}>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
  ) {}
}
