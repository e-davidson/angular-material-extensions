import { FieldType, MetaData } from '../interfaces/report-def';
import { v4 as uuid } from 'uuid';
import { Observable } from 'rxjs';
import { defaultTableState, PersistedTableState, TableState } from './TableState';
import { Injectable, Inject } from '@angular/core';
import { TableBuilderConfig, TableBuilderConfigToken } from './TableBuilderConfig';
import { FilterInfo } from './filter-info';
import { Sort, SortDirection }  from '@angular/material/sort' ;
import { ComponentStore } from '@ngrx/component-store'  ;
import update from 'immutability-helper';
import { Dictionary } from '../interfaces/dictionary';
import { map, tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root',
})
export class TableStore extends ComponentStore<TableState> {

  constructor(@Inject(TableBuilderConfigToken) config: TableBuilderConfig) {
   super( { ...defaultTableState, ...config.defaultTableState});
  }

  getSavableState() : Observable<PersistedTableState> {
    return  this.state$.pipe(
      map( s => {
        const savableState = {...s}
        delete savableState.metaData;
        return savableState;
      })
    );
  }

  on = <V>(srcObservable: Observable<V>, func: (obj: V) => void) => {
    this.effect((src: Observable<V>) => {
      return src.pipe(tap(func));
    })(srcObservable);
  }

  readonly filters$ = this.select(state => state.filters );

  getFilter$ = (filterId) : Observable<FilterInfo | undefined> => {
    return this.select( state => state.filters[filterId] );
  }

  readonly metaData$ = this.select( state => state.metaData);

  readonly metaDataArray$ = this.select(
    this.metaData$,
    md => Object.values(md)
      .sort( (a,b)=> a.order - b.order )
  );

  getMetaData$ = (key: string) : Observable<MetaData> => {
    return this.select( state => state.metaData[key]  )
  }

  getUserDefinedWidth$ = (key:string) => this.select(state => state.userDefinedWidth[key]);
  getUserDefinedWidths$ = this.select(state => state.userDefinedWidth);

  createPreSort = (metaDatas: Dictionary<MetaData>): Sort[] => {
    return Object.values(metaDatas).filter(( metaData ) => metaData.preSort)
    .sort(({  preSort: ps1  }, { preSort: ps2 } ) => (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE))
    .map(( {key, preSort} ) => ({ active: key, direction: preSort.direction }))
  }
  private displayedColumns =  (state:TableState) => Object.keys(state.metaData)
    .filter(key => !state.hiddenKeys.includes(key));
  private getVisibleRightSibling = (state:TableState, key:string) => {
    const cols = this.displayedColumns(state);
    const index = cols.findIndex(k => k === key);
    return cols[index+1];
  }
  readonly displayedColumns$ = this.select(this.displayedColumns);


  readonly hideColumn = this.updater((state, key: string) => ({
    ...state,
    hiddenKeys: [...state.hiddenKeys.filter( k => k !== key), key],
  }));

  readonly resetState = this.updater((state) => {
    const hiddenColumns = Object.values(state.metaData)
      .filter(md => md.fieldType === FieldType.Hidden)
      .map(md => md.key);
    const sorted = this.createPreSort(state.metaData);
    return update(state, {
       hiddenKeys: { $set: [...hiddenColumns] }, 
       filters: { $set: {} }, 
       sorted: {$set: sorted},
       userDifinedTableWidth: {$set: null},
       userDefinedWidth : {$set: {}}
      });
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


  setUserDefinedWidth = this.updater((state,colWidths:{key: string, widthInPixel:number, siblingWidthInPixel?:number}[]) => {
    const userDefinedWidth = {...state.userDefinedWidth};
    colWidths.forEach(cw => {
      const sibling = this.getVisibleRightSibling(state,cw.key);
      userDefinedWidth[cw.key] = cw.widthInPixel;
      if(sibling) userDefinedWidth[sibling] = cw.siblingWidthInPixel;
    });
    return {...state, userDefinedWidth};
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

  updateStateFunc = (state: TableState, incomingTableState: Partial<TableState>) : TableState => {
    const metaData = state.metaData;
    const sorted = incomingTableState.sorted?.length ? incomingTableState.sorted : this.createPreSort(metaData);
    return {...state, ...incomingTableState, metaData , sorted};
  }

  readonly setPageSize = this.updater( (state, pageSize: number)=> ({...state,pageSize}));

  readonly updateState = this.updater<TableState>(this.updateStateFunc);

  getUserDefinedTableSize$ = this.select(state => state.userDifinedTableWidth);
  setTableWidth = this.updater((state,widthInpixels:number) => ({...state,userDifinedTableWidth:widthInpixels})) ;

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
    const metaData = ( Array.isArray(md) ? [...md] : [md] ).sort((a,b)=> a.order - b.order)
      .reduce((prev: Dictionary<MetaData>,curr) => {
        if(prev[curr.key]) {
          prev[curr.key] = this.mergeMeta(prev[curr.key],curr);
        } else {
          prev[curr.key] = curr;
        }
        return prev;
      } ,{});
    let sorted = state.sorted;
    if(sorted.length === 0) {
      sorted = this.createPreSort(metaData);
    }
    return {...state, metaData, sorted};
  });

}
