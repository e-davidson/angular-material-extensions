import { FieldType, InternalMetaData, MetaData } from '../interfaces/report-def';
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
import { moveItemInArray } from '@angular/cdk/drag-drop';

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

  orderMetaData = (metaData:Dictionary<InternalMetaData>) => Object.values(metaData).sort( (a,b)=> a._internalOrder - b._internalOrder );
  readonly metaDataArray$ = this.select(
    this.metaData$,
    this.orderMetaData
  );

  getMetaData$ = (key: string) : Observable<MetaData> => {
    return this.select( state => state.metaData[key]  )
  }

  getUserDefinedWidth$ = (key:string) => this.select(state => state.userDefined.widths[key]);
  getUserDefinedWidths$ = this.select(state => state.userDefined.widths);

  createPreSort = (metaDatas: Dictionary<MetaData>): Sort[] => {
    return Object.values(metaDatas).filter(( metaData ) => metaData.preSort)
    .sort(({  preSort: ps1  }, { preSort: ps2 } ) => (ps1.precedence || Number.MAX_VALUE) - ( ps2.precedence || Number.MAX_VALUE))
    .map(( {key, preSort} ) => ({ active: key, direction: preSort.direction }))
  }
  private displayedColumns =  (state:TableState) => this.orderMetaData(state.metaData).map(md => md.key)
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
    const cloneMeta = {...state.metaData}
    Object.values(state.metaData).sort((a,b)=>a.order - b.order).forEach((md,index)=>{
      cloneMeta[md.key] = {...cloneMeta[md.key],_internalOrder:index}
    })
    return update(state, {
       hiddenKeys: { $set: [...hiddenColumns] }, 
       filters: { $set: {} }, 
       sorted: {$set: sorted},
       userDefined : {$set: {widths:{},order:{},table:{}}},
       metaData : {$set:cloneMeta}
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


  setUserDefinedWidth = this.updater((state,colWidths:{key: string, widthInPixel:number}[]) => {
    const userDefinedWidths = {...state.userDefined.widths};
    colWidths.forEach(cw => {
      userDefinedWidths[cw.key] = cw.widthInPixel;
    });
    return {...state, userDefined: {...state.userDefined,widths:userDefinedWidths}};
  });

  setUserDefinedOrder = this.updater((state,moved:{key:string,newOrder:number})=>{
    const userDefinedOrder = {...state.userDefined.order};

    const newOrder = moved.newOrder;
    const oldOrder = state.metaData[moved.key]._internalOrder;
    const mdsArr = this.orderMetaData(state.metaData);
    
    moveItemInArray(mdsArr,oldOrder,newOrder);

    const mds = {...state.metaData};
    mdsArr.forEach((md,index) => {
      mds[md.key]._internalOrder = index;

      if(userDefinedOrder[md.key] != undefined){
        userDefinedOrder[md.key] = index;
      }
    });
    userDefinedOrder[moved.key] = moved.newOrder;
    return({...state, metaData:mds,userDefined:{...state.userDefined,order:userDefinedOrder}})
  })

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
    const {order,mds} = this.initializeOrder(state, metaData)
    return {...state, metaData:mds, sorted, userDefined:{...state.userDefined,order:order}};
  });

  private initializeOrder = (state:TableState,mds: Dictionary<MetaData>) : {order:Dictionary<number>,mds:Dictionary<InternalMetaData>}=> {
    const metaDataArr = Object.values(mds).sort((a,b)=> a.order - b.order);
    const userDefinedOrder = state.userDefined.order;
    const mdsClone:Dictionary<InternalMetaData> = {...mds} as Dictionary<InternalMetaData> ;
    const userDefinedOrderArr = Object.values(userDefinedOrder);
    if(userDefinedOrderArr.length){
      const spots:number[] = new Array(metaDataArr.length).fill(0).map((_,index)=>index);
      userDefinedOrderArr.forEach((udo)=>{spots[udo] = -1;});

      metaDataArr.forEach((md)=>{
        const orderFromState = userDefinedOrder[md.key];
        let internalOrder: number;
        if(orderFromState != undefined){
          internalOrder = orderFromState;
        } else {
          let availIndex = spots.find(index => index > -1) ?? (spots.push()) -1;
          internalOrder = availIndex;
          spots[availIndex] = -1;
        }
        mdsClone[md.key] = {...md, _internalOrder:internalOrder}
      })

      const {orderClone,mdsClone:mdsClone2} = this.consolidateOrder(userDefinedOrder,mdsClone);
      return ({order:orderClone,mds:mdsClone2});
    } else {
      metaDataArr.forEach((md,index)=>{mdsClone[md.key]={...md, _internalOrder:index}});
      return ({order:userDefinedOrder,mds:mdsClone});
    }
    
  }

  
  private consolidateOrder(order:Dictionary<number>,mds:Dictionary<InternalMetaData>){
    //in case there are spaces between _internalOrder (if some colums werer programaticly removed since last save)
    const orderClone = {...order};
    const mdsClone = {...mds};
    this.orderMetaData(mdsClone).forEach((md,index) => mdsClone[md.key]._internalOrder = index);
    Object.keys(orderClone).forEach((key)=>{
      if(!mds[key]){delete orderClone[key]}else{orderClone[key] = mds[key]._internalOrder}
    });

    return ({orderClone,mdsClone})
  }

}
