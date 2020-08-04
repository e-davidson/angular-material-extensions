import { Directive, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { MatSort, Sort, MatSortable } from '@angular/material/sort';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { TableStateManager } from '../classes/table-state-manager';

@Directive({
  selector: '[multiSort]',
  exportAs: 'multiSort',
  inputs: ['disabled: matSortDisabled'],
  providers: [
    { provide: MatSort, useExisting: MultiSortDirective }
  ]
})
export class MultiSortDirective extends MatSort implements OnInit, OnDestroy {
  @Output() readonly multiSortChange: EventEmitter<Sort[]> = new EventEmitter<Sort[]>();
  rules: Sort[] = [];
  private SubRef: Subscription;

  constructor(private state: TableStateManager) {
    super();
  }

  ngOnInit() {
    this.SubRef = this.state.state$.pipe(
      map( state => state.sorted ),
      distinctUntilChanged(),
    ).subscribe( rules => {
      this.rules = rules;
      this.multiSortChange.emit(this.rules);
    });
    super.ngOnInit();
  }


  ngOnDestroy() {
    this.SubRef.unsubscribe();
    super.ngOnDestroy();
  }

  sort(sortable: MatSortable): void {
    const direction = this.active !== sortable.id ?  sortable.start ?? this.start : this.getNextSortDirection(sortable);
    this.state.setSort(sortable.id,direction);
    super.sort(sortable);
  }
}
