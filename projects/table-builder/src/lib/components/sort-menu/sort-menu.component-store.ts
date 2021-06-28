import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ComponentStore } from '@ngrx/component-store';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
@Injectable()
export class SortMenuComponentStore extends ComponentStore<ComponenStoreState> {
  init = this.effect((data:Observable<ComponenStoreState>)=>data.pipe(
    tap<ComponenStoreState>(data => this.setState(data))
  ));
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
}

export interface ComponenStoreState {
  sorted : SortWithName[];
  notSorted: SortWithName[];
}

export interface SortWithName extends Sort{
  displayName : string;
}

