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
import { last, map, tap } from 'rxjs/operators'
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { notNull } from '../functions/rxjs-operators';
import { GeneralTableSettings, NotPersisitedTableSettings, PesrsistedTableSettings } from './table-builder-general-settings';

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
        delete savableState.notPersisitedTableSettings;
        return savableState;
      })
    );
  }

  on = <V>(srcObservable: Observable<V>, func: (obj: V) => void) => {
    this.effect(() => srcObservable.pipe(
      tap(func)
    ))
  }

  onLast(callback: (state: TableState) => void ) {
    this.on(this.state$.pipe(last()),callback);
  }

  readonly metaData$ = this.select( state => state.metaData);

  readonly metaDataArray$ = this.select(
    this.state$,
    orderMetaData
  );

  getMetaData$ = (key: string) : Observable<MetaData> => {
    return this.select( state => state.metaData[key]  ).pipe(
      tap(meta => {if(!meta)console.warn(`Meta data with key ${key} not found`)}),
      notNull())
  }

  getUserDefinedWidth$ = (key:string) => this.select(state => state.userDefined.widths[key]);
  getUserDefinedWidths$ = this.select(state => state.userDefined.widths);
  
  private displayedColumns =  (state:TableState) => orderMetaData(state).map(md => md.key)
    .filter(key => !state.hiddenKeys.includes(key) && state.metaData[key].fieldType !== FieldType.Hidden);
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
       userDefined : {$set: {widths:{},order:{},table:{}}},
      });
  });

  readonly showColumn = this.updater((state, key: string) => ({
    ...state,
    hiddenKeys: state.hiddenKeys.filter( k => k !== key),
  }));

  readonly setHiddenColumns = this.updater((state, displayCols: {key: string, visible: boolean}[]) => {
    
    var hiddenKeysSet= new Set<string>(
      [
        ...displayCols.filter(col => !col.visible).map(col => col.key),
        ...Object.values(state.metaData).filter(md => md.fieldType === FieldType.Hidden).map(md => md.key)
      ]
    );
    
    return update( state , { hiddenKeys: {$set: [...hiddenKeysSet]}});
  });


  setUserDefinedWidth = this.updater((state,colWidths:{key: string, widthInPixel:number}[]) => {
    const userDefinedWidths = {...state.userDefined.widths};
    colWidths.forEach(cw => {
      userDefinedWidths[cw.key] = cw.widthInPixel;
    });
    return {...state, userDefined: {...state.userDefined,widths:userDefinedWidths}};
  });

  setUserDefinedOrder = this.updater((state,moved:{newOrder:number,oldOrder:number})=>{
    const {newOrder ,oldOrder} = moved;
    const mdsArr = orderViewableMetaData(state);
    moveItemInArray(mdsArr,oldOrder,newOrder);

    const userDefinedOrder = mdsArr.reduce((aggregate,current,index) => {
      aggregate[current.key] = index;
      return aggregate
    },{});
    return({...state, userDefined:{...state.userDefined,order:userDefinedOrder}})
  })


  readonly filters$ = this.select(state => state.filters );

  readonly getFilter$ = (filterId) : Observable<FilterInfo | undefined> => {
    return this.select( state => state.filters[filterId] );
  }
  readonly addFilter = this.updater( (state, filter: FilterInfo) => {
    return this.addFiltersToState(state, [filter]);
  });

  readonly addFilters = this.updater((state,filters:FilterInfo[])=>{
    return this.addFiltersToState(state, filters);
  })

  private addFiltersToState = (state:TableState,filters:FilterInfo[]) : TableState => {
    const filtersObj = filters
      .filter(fltr => Object.keys(state.metaData).some(key => key === fltr.key) || console.warn(`Meta data with key ${fltr.key} not found`))
      .reduce((filtersObj,filter)=>{
        if (!filter.filterId) {
          filter.filterId = uuid();
        }
        filtersObj[filter.filterId] = filter;
        return filtersObj;
      },{});
    return {
      ...state,
      filters : {...state.filters, ...filtersObj }
    };
  }

  readonly removeFilter = this.updater( (state, filterId: string) =>
    update(state, {filters: {$unset : [filterId ]}})
  );

  readonly removeFilters = this.updater( (state, filterIds: string[]) =>
    update(state, {filters: {$unset : [...filterIds ]}})
  );

  readonly clearFilters = this.updater((state)=>
    ({...state,filters:{}}))


  readonly sorted$ = this.select(state => state.sorted);

  createPreSort = (metaDatas: Dictionary<MetaData>): Sort[] => {
    return Object.values(metaDatas).filter(( metaData ) => metaData.preSort)
    .sort(({  preSort: ps1  }, { preSort: ps2 } ) => (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE))
    .map(( {key, preSort} ) => ({ active: key, direction: preSort.direction }))
  }
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

  readonly setAllSort = this.updater((state,sortArray:Sort[])=>{
    return {
      ...state,
      sorted: sortArray,
    };
  })

  updateStateFunc = (state: TableState, incomingTableState: Partial<TableState>) : TableState => {
    const metaData = state.metaData;
    const sorted = incomingTableState.sorted?.length ? incomingTableState.sorted : this.createPreSort(metaData);
    return {...state, ...incomingTableState, metaData , sorted};
  }

  readonly setPageSize = this.updater( (state, pageSize: number)=> ({...state,pageSize}));

  readonly updateState = this.updater<Partial<TableState>>(this.updateStateFunc);

  getUserDefinedTableSize$ = this.select(state => state.userDefined.table.width);
  setTableWidth = this.updater((state,widthInpixels:number) => ({...state,userDefined: {...state.userDefined,table:{width:widthInpixels}}})) ;

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
    const metaData = ( Array.isArray(md) ? [...md] : [md] )
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
    const order = this.initializeOrder(state, metaData);
    return {...state, metaData, sorted, userDefined:{...state.userDefined,order:order}};
  });

  private initializeOrder = (state:TableState,mds: Dictionary<MetaData>) : Dictionary<number> => {
    const viewableMetaDataArr = Object.values(mds).filter(a => a.fieldType !== FieldType.Hidden);
    let userDefinedOrder = state.userDefined.order;
    if(viewableMetaDataArr.some(meta => userDefinedOrder[meta.key] == null)){
      return {}
    }
    return userDefinedOrder;
  }

  toggleCollapseHeader = this.updater((state)=>{
    const tableSettings = {...state.persistedTableSettings};
    tableSettings.collapseHeader = !tableSettings.collapseHeader;
    return ({...state,persistedTableSettings : new PesrsistedTableSettings(tableSettings)});
  })

  toggleCollapseFooter = this.updater((state)=>{
    const tableSettings = {...state.persistedTableSettings};
    tableSettings.collapseFooter = !tableSettings.collapseFooter;
    return ({...state,persistedTableSettings : new PesrsistedTableSettings(tableSettings)});
  })


  setTableSettings = this.updater((state,settings:GeneralTableSettings)=>{
    const s:TableState = {
      ...state,
      persistedTableSettings : new PesrsistedTableSettings(settings),
      notPersisitedTableSettings : new NotPersisitedTableSettings(settings)
      };
    return s;
  });

  tableSettings$ = this.select(state => {
    const ts : PesrsistedTableSettings & NotPersisitedTableSettings =
      {...state.persistedTableSettings,...state.notPersisitedTableSettings};
    return ts;
  })
}
export const orderViewableMetaData = (state:TableState) => orderMetaData(state).filter(a => a.fieldType !== FieldType.Hidden);

export const orderMetaData = (state:TableState) => {
  const userOrderArr = Object.entries(state.userDefined.order);
  return userOrderArr.length ?
   Object.values(state.metaData).sort((a,b)=> state.userDefined.order[a.key] - state.userDefined.order[b.key])
   :
   Object.values(state.metaData).sort((a,b)=> a.order - b.order)
}
