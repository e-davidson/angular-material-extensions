import {
  Component,
  ChangeDetectionStrategy,
  ViewChild,
  Input,
  ElementRef,
  AfterViewInit,
  OnInit,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { asyncScheduler, merge, Observable } from 'rxjs';
import { delay, distinct, distinctUntilKeyChanged, map } from 'rxjs/operators';
import { GenericTableDataSource } from '../../classes/GenericTableDataSource';
import { TableStore } from '../../classes/table-store';
@Component({
  selector: 'tb-paginator',
  template: `
  <div [ngClass]="{'hide' : !(collapseFooter$ | async), 'page-amounts':true}" *ngIf="currentPageData$ | async as pageData">
    {{pageData.currentStart}} - {{pageData.currentEnd}} of {{pageData.total}}
  </div>
  <mat-paginator [pageSizeOptions]="[5, 10, 20, 50, 100, 500]" showFirstLastButtons (page)="paginatorChange()"
    [ngClass]="{'hide' : (collapseFooter$ | async)}">
  </mat-paginator>
  `,
  styleUrls: ['./generic-table.component.scss','../../styles/collapser.styles.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent implements OnInit, AfterViewInit{
  @Input() dataSource : GenericTableDataSource<any>;
  @Input() tableElRef : ElementRef
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  currentPageData$: Observable<CurrentPageDetails>;
  collapseFooter$:Observable<boolean>;
  @Input() data$: Observable<any[]>;

  constructor(private state : TableStore){}
  ngOnInit(){
    this.dataSource.paginator = this.paginator;
    this.ourPageEvent = true;
    this.state.on(metaDataPageSizeChange(this.state), setPaginatorPageSize(this.paginator));
    this.state.setPageSize(onPagiantorPageSizeChange(this.paginator));
    this.collapseFooter$ = this.state.state$.pipe(map(state => state.persistedTableSettings.collapseFooter));

  }
  ngAfterViewInit(){
    this.currentPageData$ = merge(
      this.paginator.page.pipe(map(mapPaginationEventToCurrentPageDetails)),
      this.data$.pipe(
        distinctUntilKeyChanged("length"),
        delayToAllowForProperUpdate, 
        map(updateCurrentPageDetailsOnDataLengthChange(this.paginator)))
    );
  }

  paginatorChange() : void {
    if(!this.ourPageEvent){
      setTimeout(() => this.tableElRef?.nativeElement?.scrollIntoView(), 0);
    } else {
      this.ourPageEvent = false;
    }
  }
  ourPageEvent = false;
  
}

const mapPaginationEventToCurrentPageDetails = (pageData: PageEvent):CurrentPageDetails => ({
  currentStart : (pageData.pageIndex * pageData.pageSize) + 1,
  currentEnd : Math.min(pageData.length , ((pageData.pageIndex + 1) * pageData.pageSize)),
  total : pageData.length
});

const updateCurrentPageDetailsOnDataLengthChange = (paginator:MatPaginator) => () => ({currentStart:(paginator.pageIndex * paginator.pageSize) + 1,
  currentEnd: Math.min(paginator.length , ((paginator.pageIndex + 1) * paginator.pageSize)),
  total:paginator.length})

const delayToAllowForProperUpdate = delay<any[]>(0,asyncScheduler);

interface CurrentPageDetails {
  currentStart:number,
  currentEnd:number,
  total:number
}

const metaDataPageSizeChange = (state:TableStore) => state.state$.pipe(map(state => state.pageSize),distinct());

const setPaginatorPageSize = (paginator:MatPaginator) => (pageSize: number) =>
  paginator._changePageSize(pageSize);

const onPagiantorPageSizeChange = (paginator: MatPaginator) => paginator.page.pipe(map( e => e.pageSize ), distinct());