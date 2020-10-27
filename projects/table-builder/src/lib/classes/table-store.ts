import { FieldType, MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { defaultTableState, TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { FilterInfo } from './filter-info';
import { mapVisibleFields, selectStorageStateItem, StateStorage,  } from '../ngrx/reducer';
import { Sort, SortDirection }  from '@angular/material/sort' ;
import { ComponentStore } from '@ngrx/component-store'  ;
import update from 'immutability-helper';
import { Dictionary } from '../interfaces/dictionary';
import { select, Store } from '@ngrx/store';
import { first, mergeMap } from 'rxjs/operators';
import { loadState, saveState } from '../ngrx/actions';


@Injectable()
export class TableStore extends ComponentStore<TableState> {

  constructor(@Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
  private store: Store<{storageState: StateStorage}>) {
    super( { ...defaultTableState, ...config.defaultTableState});
  }
  readonly filters$ = this.select(state => state.filters );

  getFilter$(filterId) : Observable<FilterInfo | undefined> {
    return this.select( this.filters$, filters => filters[filterId]);
  }

  setFromSavedState(id:string) {
    this.store.dispatch(loadState({id}));
    this.updateState( this.store.pipe(
      select(selectStorageStateItem(id)),
      mergeMap( (state: TableState ) => (state ? [state] : [] )),
      first()
    ));
  }

  async saveToState(id:string) {
    const state = await this.state$.pipe(first()).toPromise();
    const metaData = Object.values(state.metaData).map( md => ({...md, transform: undefined }))
      .reduce((prev: Dictionary<MetaData>, current)=> ({...prev, [current.key]: current}), {})
    this.store.dispatch(saveState({id,state: {...state,metaData},persist: true}));
  }

  readonly metaData$ = this.select(
    state => Object.values(state.metaData)
      .sort( (a,b)=> a.order - b.order )
  );

  getMetaData$(key: string) : Observable<MetaData> {
    return this.select(this.metaData$, md => md.find(m => m.key === key ))
  }

  readonly rules$  : Observable<Sort[]> = this.select( this.metaData$,  (md) => {
    return  md
    .filter(( metaData ) => metaData.preSort)
    .sort(
      ({  preSort: ps1  }, { preSort: ps2 } ) =>  (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE)
    )
    .map(( {key, preSort} ) =>
      ({ active: key, direction: preSort.direction }))
  } );


  readonly displayedColumns$ = this.select(
    state => Object.keys(state.metaData)
      .filter(key => !state.hiddenKeys.includes(key))
      .map( key => key )
    );

  readonly visibleFields$ = this.select( state => mapVisibleFields(state));

  readonly hideColumn = this.updater((state, key: string) => ({
    ...state,
    hiddenKeys: [...state.hiddenKeys.filter( k => k !== key), key],
  }));

  readonly resetState = this.updater((state) => {
    const hiddenColumns = Object.values(state.metaData)
      .filter(md => md.fieldType === FieldType.Hidden)
      .map(md => md.key);
    const sort = state.sorted
    return update(state, { hiddenKeys: { $set: [...hiddenColumns] }, filters: { $set: {} } });
  });

  readonly showColumn = this.updater((state, key: string) => ({
    ...state,
    hiddenKeys: state.hiddenKeys.filter( k => k !== key),
  }));

  readonly setHiddenColumns = this.updater((state, displayCols: {key: string, visible: boolean}[]) => {
    let hiddenKeys = [...state.hiddenKeys];
    displayCols.forEach(column => {
      if (column.visible) {
        hiddenKeys = hiddenKeys.filter( k => k !== column.key);
      } else {
        hiddenKeys.push(column.key);
      }
    });
    return update( state , { hiddenKeys: {$set: hiddenKeys}});
  });


  readonly addFilter = this.updater( (state, filter: FilterInfo) => {
    if (!filter.filterId) {
      filter.filterId = uuid();
    }
    return {
      ...state,
      filters : {...state.filters, [filter.filterId] : filter }
    };
  });

  readonly removeFilter = this.updater( (state, filterId: string) =>
    update(state, {filters: {$unset : [filterId ]}})
  );


  readonly setSort = this.updater<{key: string, direction?: SortDirection}>((state, {key, direction} ) => {
    const sortArray = state.sorted.filter( s => s.active !== key );
    if(direction) {
      sortArray.unshift({active: key, direction});
    }
    return {
      ...state,
      sorted: sortArray,
    };
  });

  updateStateFunc(state: TableState, tableState: Partial<TableState>) : TableState {
    return update( state ,  { $merge: tableState});
  }

  readonly setPageSize = this.updater( (state, pageSize: number)=> ({...state,pageSize}));

  readonly updateState = this.updater<TableState>(this.updateStateFunc);

  readonly setMetaData = this.updater((state, metaData: MetaData[] | MetaData ) => {
    const newMetaData: Dictionary<MetaData> = {};
    const metaDatas = Array.isArray(metaData) ? metaData : [metaData];
    metaDatas.forEach( md => {
        const existing = state.metaData[md.key];
        if(!existing) {
          newMetaData[md.key] = { ...md, noExport: md.customCell }
        } else {
          newMetaData[md.key] = { ...existing, ...md, noExport: existing.noExport ? md.customCell : false  };
        }
    });

    return {...state, metaData: {...state.metaData, ...newMetaData}};
  });
}
