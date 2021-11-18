import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { map } from "rxjs/operators";
import { FilterInfo, PartialFilter } from "../../classes/filter-info";
@Injectable()
export class WrapperFilterStore  extends ComponentStore<{filterInfo:PartialFilter[]}>{
  constructor(){
    super({filterInfo:[]});
  }

  clearAll = this.updater(()=>({filterInfo:[]}));
  deleteByIndex = this.updater((state,index:number)=>{
    const arr = [...state.filterInfo];
    arr.splice(index, 1);
    return {filterInfo:arr};
  });

  currentFilters$ = this.state$.pipe(map(state => state.filterInfo));

  addFilter = this.updater((state,filter:PartialFilter)=>{
    return ({...state,filterInfo:[...state.filterInfo,filter]});
  })
}
