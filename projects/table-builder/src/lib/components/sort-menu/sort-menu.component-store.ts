import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, Observable } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
@Injectable()
export class SortMenuComponentStore extends ComponentStore<ComponenStoreState> {
  constructor(private tableState: TableStore){
    super({notSorted:[],sorted:[]})
  }
  private set = this.updater((state,data:ComponenStoreState)=> ({...data}));

  setSorted = this.updater((state,sorted:SortWithName[])=>({...state,sorted}));

  setNotSorted = this.updater((state,notSorted:SortWithName[])=>({...state,notSorted}));
  sorted$ = this.select(state=>state.sorted);
  notSorted$ = this.select(state=>state.notSorted);
  setDirection = this.updater((state,sort:SortWithName)=>{
    const index = state.sorted.findIndex(s => s.active === sort.active);
    const sorted = [...state.sorted];
    sorted.splice(index,1,sort);
    return ({...state,sorted});
  })
  reset = () => {
    const sorted = this.tableState.sorted$.pipe(
      mergeMap(sort => this.tableState.metaData$.pipe(map(
        meta => sort.map(s => {
          return ({...s,displayName:meta[s.active]?.displayName} as SortWithName)})
      )))
    );
    const notSorted = this.tableState.metaDataArray$.pipe(mergeMap(
      metas => this.tableState.sorted$.pipe(
        map(s => metas.filter(meta=> !s.some(s=>s.active=== meta.key))
          .map(meta=>({active:meta.key,direction:null,displayName : meta.displayName} as SortWithName)))
      )
    ));
    this.set(combineLatest([
      sorted,notSorted
    ]).pipe(map(([sorted,notSorted])=>({sorted,notSorted}))));
  }
}

export interface ComponenStoreState {
  sorted : SortWithName[];
  notSorted: SortWithName[];
}

export interface SortWithName extends Sort{
  displayName : string;
}

