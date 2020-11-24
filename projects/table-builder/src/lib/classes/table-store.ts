import { FieldType, MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { defaultTableState, TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { FilterInfo } from './filter-info';
import { selectStorageStateItem, StateStorage } from '../ngrx/reducer';
import { Sort, SortDirection }  from '@angular/material/sort' ;
import { ComponentStore } from '@ngrx/component-store'  ;
import update from 'immutability-helper';
import { Dictionary } from '../interfaces/dictionary';
import { select, Store } from '@ngrx/store';
import { first, mergeMap, tap } from 'rxjs/operators';
import { loadState, saveState } from '../ngrx/actions';


@Injectable()
export class TableStore extends ComponentStore<TableState> {

  constructor(@Inject(TableBuilderConfigToken) private config: TableBuilderConfig,
  private store: Store<{storageState: StateStorage}>) {
    super( { ...defaultTableState, ...config.defaultTableState});
  }
  readonly filters$ = this.select(state => state.filters );

  getFilter$ = (filterId) : Observable<FilterInfo | undefined> => {
    return this.select( this.filters$, filters => filters[filterId]);
  }


  setFromSavedState = (id:string) => {
    this.store.dispatch(loadState({id}));
    this.updateState( this.store.pipe(
      select(selectStorageStateItem(id)),
      mergeMap( (state: TableState ) => (state ? [state] : [] )),
      first(),
    ));
  }

  on = <T>( srcObservable: Observable<T>, func: (obj:T)=> void) => {
    this.effect((src: Observable<T>) => {
      return src.pipe(tap(func));
    })(srcObservable);
  }

  saveToState = async (id:string) => {
    const state = await this.state$.pipe(first()).toPromise();
    const metaData = Object.values(state.metaData).map( md => ({...md, transform: undefined }))
      .reduce((prev: Dictionary<MetaData>, current)=> ({...prev, [current.key]: current}), {})
    this.store.dispatch(saveState({id,state: {...state,metaData},persist: true}));
  }

  readonly metaData$ = this.select(
    state => Object.values(state.metaData)
      .sort( (a,b)=> a.order - b.order )
  );

  getMetaData$ = (key: string) : Observable<MetaData> => {
    return this.select(this.metaData$, md => md.find(m => m.key === key ))
  }

  createPreSort = (metaDatas: Dictionary<MetaData>): Sort[] => {
    return Object.values(metaDatas).filter(( metaData ) => metaData.preSort)
    .sort(({  preSort: ps1  }, { preSort: ps2 } ) => (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE))
    .map(( {key, preSort} ) => ({ active: key, direction: preSort.direction }))
  }


  readonly displayedColumns$ = this.select(
    state => Object.keys(state.metaData)
      .filter(key => !state.hiddenKeys.includes(key))
    );

  readonly hideColumn = this.updater((state, key: string) => ({
    ...state,
    hiddenKeys: [...state.hiddenKeys.filter( k => k !== key), key],
  }));

  readonly resetState = this.updater((state) => {
    const hiddenColumns = Object.values(state.metaData)
      .filter(md => md.fieldType === FieldType.Hidden)
      .map(md => md.key);
    const sorted = this.createPreSort(state.metaData);
    return update(state, { hiddenKeys: { $set: [...hiddenColumns] }, filters: { $set: {} }, sorted: {$set: sorted} });
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

  mergeMetaDatas = (existingMetaData: Dictionary<MetaData>, newMetaDatas: Dictionary<MetaData>) => {
    const metaData: Dictionary<MetaData> = {};
    const metaDatas = Object.values(existingMetaData);
    metaDatas.forEach( md => {
        const existing = metaData[md.key] ?? existingMetaData[md.key];
        if(!existing) {
          metaData[md.key] = { ...md, noExport: md.customCell }
        } else {
          metaData[md.key] = this.mergeMeta(existing,md);
        }
    });
    return {...metaData, ...newMetaDatas};
  }

  updateStateFunc = (state: TableState, tableState: Partial<TableState>) : TableState => {
    const metaData = this.mergeMetaDatas(state.metaData,tableState.metaData);
    const sorted = this.createPreSort(metaData);
    return {...state, ...tableState, metaData , sorted};
  }

  readonly setPageSize = this.updater( (state, pageSize: number)=> ({...state,pageSize}));

  readonly updateState = this.updater<TableState>(this.updateStateFunc);

  mergeMeta = (orig: MetaData, merge: MetaData): MetaData => {
    return {
        key: orig.key,
        displayName: merge.displayName ?? orig.displayName,
        fieldType: merge.fieldType || orig.fieldType,
        additional: {...orig.additional, ...merge.additional},
        order: merge.order ?? orig.order,
        preSort: merge.preSort ?? orig.preSort,
        _internalNotUserDefined: merge._internalNotUserDefined || orig._internalNotUserDefined,
        width: merge.width ?? orig.width,
        noExport: merge.noExport || orig.noExport,
        noFilter: merge.noFilter || orig.noFilter,
        customCell: merge.customCell ?? orig.customCell,
        transform: merge.transform ?? orig.transform,
        click: merge.click ?? orig.click,
    };
  }

  readonly setMetaData = this.updater((state, md: MetaData[] | MetaData ) => {
    const metaDatas = ( Array.isArray(md) ? md : [md] )
      .reduce((prev: Dictionary<MetaData>,curr) => {
        if(prev[curr.key]) {
          prev[curr.key] = this.mergeMeta(prev[curr.key],curr);
        } else {
          prev[curr.key] = curr;
        }
        return prev;
      } ,{});
    const metaData = this.mergeMetaDatas(state.metaData,metaDatas);
    let sorted = state.sorted;
    if(sorted.length === 0) {
      sorted = this.createPreSort(metaData);
    }
    return {...state, metaData, sorted};
  });

}
