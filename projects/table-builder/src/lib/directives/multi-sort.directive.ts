import { Directive, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { MatSort, Sort, MatSortable } from '@angular/material/sort';
import { Subject, Subscription, Observable } from 'rxjs';
import { scan, filter, map } from 'rxjs/operators';

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

  @Input() rules$: Observable<Sort[]> = new Subject();

  @Input() set  reSort (rules: Sort[]){
    this.initRules();
  } 
  rules: Sort[] = [];
  preSortRules: Sort[] = [];
  private SubRef: Subscription;

  ngOnInit() {
    this.SubRef = this.rules$.pipe(
      scan((acc,curr)=>({prev: acc.curr, curr }),{prev: null, curr: null} as {prev: Sort[], curr: Sort[]}),
      filter(acc => !acc.prev || acc.curr.some(sort => !acc.prev.some(prevSort => sort.active === prevSort.active && sort.direction === prevSort.direction))),
      map(acc => acc.curr)
    ).subscribe( rules => {
      this.preSortRules = rules;
      this.initRules();
    });
    super.ngOnInit();
  }

  initRules(){
    if (this.preSortRules.length ) {
      this.active = null;
      const initRules = [...this.preSortRules];
      const firstRule = initRules.shift();
      this.rules = initRules;
      this.sort({id: firstRule.active, start: firstRule.direction || 'asc', disableClear: false});
    }
  }

  ngOnDestroy() {
    this.SubRef.unsubscribe();
    super.ngOnDestroy();
  }

  sort(sortable: MatSortable): void {

    this.rules = this.rules.filter(r => r.active !== sortable.id);

    if (this.active !== sortable.id) {
      this.rules.unshift({ active: sortable.id, direction: sortable.start ? sortable.start : this.start });
    } else {
      const newDirection = this.getNextSortDirection(sortable);
      if (newDirection) {
        this.rules.unshift({ active: this.active, direction: newDirection });
      }
    }
    super.sort(sortable);
    this.multiSortChange.emit(this.rules);
  }
}
