import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';
import { TableStore } from '../../classes/table-store';
import { SortDirection } from '../../interfaces/report-def';
import { SortMenuComponentStore, SortWithName } from './sort-menu.component-store'

@Component({
  selector: 'tb-sort-menu',
  templateUrl: './sort-menu.component.html',
  styleUrls: ['./sort-menu.component.scss'],
  providers:[SortMenuComponentStore]
})
export class SortMenuComponent implements OnInit{

  sorted$:Observable<SortWithName[]>;
  notSorted$:Observable<SortWithName[]>;
  SortDirection = SortDirection;
  dirty$ = new BehaviorSubject(false);
  constructor(private tableState: TableStore, public store: SortMenuComponentStore) {
    this.sorted$=this.store.sorted$.pipe(map(data=>[...data]));
    this.notSorted$=this.store.notSorted$.pipe(map(data=>[...data]));
  }

  reset(){
    this.dirty$.next(false);
    this.store.reset();
  }

  ngOnInit(){
    this.store.reset();
  }

  dropIntoSorted(event: CdkDragDrop<SortWithName[]>) {
    this.dirty$.next(true);
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
      this.dirty$.next(true);
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
      event.container.data[event.currentIndex] = {...event.container.data[event.currentIndex]};

      this.store.setNotSorted(event.container.data);
      this.store.setSorted(event.previousContainer.data);
    }
  }

  apply = this.store.effect((obs:Observable<null>)=>
    obs.pipe(tap(()=>{
      this.dirty$.next(false);
      this.tableState.setAllSort(this.store.sorted$.pipe(first()))
  })));

  setDirection(sort:SortWithName){
    this.dirty$.next(true);
    this.store.setDirection(sort);
  }

}


