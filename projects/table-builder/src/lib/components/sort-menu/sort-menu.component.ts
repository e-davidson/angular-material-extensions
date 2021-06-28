import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { combineLatest, Observable } from 'rxjs';
import { first, map, mergeMap, tap } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
import { SortDirection } from '../../interfaces/report-def';
import { SortMenuComponentStore, SortWithName } from './sort-menu.component-store'

@Component({
  selector: 'tb-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.css'],
  providers:[SortMenuComponentStore]
})
export class SortMenuComponent implements OnInit {

  sorted$:Observable<SortWithName[]>;
  notSorted$:Observable<SortWithName[]>;
  SortDirection = SortDirection;
  applicable$ = new BehaviorSubject(false);
  constructor(private tableState: TableStore, private store: SortMenuComponentStore) {
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
    this.store.init(combineLatest([
      sorted,notSorted
    ]).pipe(map(([sorted,notSorted])=>({sorted,notSorted}))));
    this.sorted$=this.store.sorted$;
    this.notSorted$=this.store.notSorted$;
  }

  ngOnInit(): void {
  }

  dropIntoSorted(event: CdkDragDrop<SortWithName[]>) {
    this.applicable$.next(true);
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      event.container.data[event.currentIndex] = {...event.container.data[event.currentIndex],direction:SortDirection.asc};
      this.store.setSorted(event.container.data);
      this.store.setNotSorted(event.previousContainer.data);
    }
  }

  dropIntoNotSorted(event: CdkDragDrop<SortWithName[]>){
    if (event.previousContainer === event.container) {
      return;
    } else {
      this.applicable$.next(true);
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      event.container.data[event.currentIndex] = {...event.container.data[event.currentIndex],direction:null};

      this.store.setNotSorted(event.container.data);
      this.store.setSorted(event.previousContainer.data);
    }
  }

  apply$ = this.store.effect((tableStore$:Observable<TableStore>)=>
    tableStore$.pipe(tap<TableStore>(store => {
      this.applicable$.next(false);
      store.setAllSort(this.store.sorted$.pipe(first()))
    })));

  apply= () => this.apply$(this.tableState);

  setDirection(sort:SortWithName){
    this.applicable$.next(true);
    this.store.setDirection(sort);
  }

}


