import { Injectable, Inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, combineLatest } from 'rxjs';
import { fullTableState, selectTableState, selectVisibleFields } from './reducer';
import { tap, mergeMap, first, map, filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import * as tableActions from './actions';
import { TableBuilderConfig, TableBuilderConfigToken } from '../classes/TableBuilderConfig';
import { downloadData } from '../functions/download-data';


@Injectable()
export class SaveTableEffects {

  saveTable$ = createEffect(
    () => this.actions$.pipe(
      ofType(tableActions.saveTableState),
      mergeMap( ({tableId}) =>  this.store$.pipe(
        first(),
        select(selectTableState(), {tableId} ),
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
          filter( d => !d.initialized ),
          map( u => {
            const table = localStorage.getItem(tableId);
            if (table) {
              return tableActions.updateTableState({ tableId, tableState: {...JSON.parse(table), initialized : true} });
            }
            return tableActions.updateTableState(
              { tableId, tableState: {...{ hiddenKeys: [], pageSize: 20, filters: {}, initialized : true }, ...this.config.defaultTableState } }
            );
          }),
        ))
    )
  );

  download$ = createEffect(() => this.actions$.pipe(
    ofType(tableActions.downloadTable),
    mergeMap( ({tableId, data$}) =>
      combineLatest([
        this.store$.pipe(
          select(selectVisibleFields, {tableId}),
        ),
        data$
      ]).pipe(first())
    ),
    map(([fields,data]) => this.csvData(data,fields)),
    tap(csv => downloadData(csv,'export.csv','text/csv')),
    mergeMap(_ => EMPTY)
  ));

  csvData(data:Array<any>, headers: string[]) {
    const res = data.map(row => headers.map(field => row[field] || '').join(','));
    res.unshift(headers.join(','));
    return res.join('\n');
  }

  constructor(
    private actions$: Actions,
    private store$: Store<{fullTableState: fullTableState}>,
    @Inject(TableBuilderConfigToken) private config: TableBuilderConfig
  ) {}
}
