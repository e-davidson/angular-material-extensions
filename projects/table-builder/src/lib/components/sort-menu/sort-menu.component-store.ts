import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest } from 'rxjs';
import { distinctUntilChanged, map, mergeMap } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
import { notNull } from '../../functions/rxjs-operators';
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
      mergeMap(sort => this.tableState.metaData$.pipe(
        notNull(),
        map(
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
      sorted.pipe(distinctSortArray),notSorted.pipe(distinctSortArray)
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

const equalSortArray = (arr1:SortWithName[],arr2:SortWithName[]) =>
  arr1.length === arr2.length && arr2.every(s1 => arr1.some(s2 => s1.active === s2.active));
const distinctSortArray = distinctUntilChanged<SortWithName[]>(equalSortArray);
