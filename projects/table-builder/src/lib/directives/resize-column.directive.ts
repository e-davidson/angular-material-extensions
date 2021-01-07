import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { fromEvent, of } from "rxjs";
import { filter, first, map, shareReplay, switchMap, takeUntil, tap } from "rxjs/operators";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]",
})
export class ResizeColumnDirective implements OnInit{
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;
  constructor(private renderer: Renderer2, private el: ElementRef, public store: TableStore,) { }

  ngOnInit(){
    if (this.resizable){
      const {table, columnHead} = this.getTableAndColumnHeadHtmlElements();

      const resizer = this.createResizerSpanInColumnHead(columnHead);

      const aggregateMouseEventsMapped$ = this.mouseDownThroghMouseUpEventMapper(resizer,columnHead,table)

      const resizeColsData$ = aggregateMouseEventsMapped$.pipe(
        filter(({mouseMove})=>!!mouseMove.buttons),
        map( ({mouseDownData,mouseMove}) => {
            const {newTableWidth,newColumnWidth}  = this.calculateNewWidths(mouseDownData,mouseMove)
            return ({
              key:this.key,
              widthInPixel:newColumnWidth,
              tableSize:newTableWidth,
            })
          }),
        shareReplay({bufferSize:1,refCount:true})
      );

      this.store.setUserDefinedWidth(resizeColsData$.pipe(
        map(resizeData => ([{key: this.key, widthInPixel: resizeData.widthInPixel }]))
      ));

      this.store.setTableWidth(resizeColsData$.pipe(
        map(resizeData => resizeData.tableSize )));
    }

  }

  createResizerSpanInColumnHead(columnHead:HTMLElement){
    const resizer = this.renderer.createElement("span");
    this.renderer.addClass(resizer, "resize-holder");
    this.renderer.appendChild(columnHead, resizer);
    return resizer;
  }

  getTableAndColumnHeadHtmlElements():{table:HTMLElement,columnHead:HTMLElement}{
    const columnHead: HTMLElement = this.el.nativeElement;
    const row = this.renderer.parentNode(columnHead);
    const table = this.renderer.parentNode(row);
    return ({table,columnHead})
  }

  mouseDownThroghMouseUpEventMapper(resizer:HTMLElement, columnHead:HTMLElement, table:HTMLElement){
    return this.resizerMouseDownEventMapper(resizer,columnHead,table)
    .pipe(
      switchMap( mouseDownData => fromEvent<MouseEvent>(table, "mousemove").pipe(
        map( mouseMove => ({mouseDownData, mouseMove})),
        takeUntil(fromEvent<MouseEvent>(document, "mouseup"))
      ) ),
    )
  }
  resizerMouseDownEventMapper(resizer:HTMLElement, columnHead:HTMLElement, table:HTMLElement){
    return fromEvent<MouseEvent>(resizer, "mousedown").pipe(
      map(event => ({
        startPageX: event.pageX,
        startColumnWidth: this.getElementWidth(columnHead),
        startTableWidth: this.getElementWidth(table),
      }))
    );
  }

  calculateNewWidths(mouseDownData:MouseDowmData,mouseMove:MouseEvent):{newTableWidth:number,newColumnWidth:number}{
    const change = (mouseMove.pageX - mouseDownData.startPageX );
    let newColumnWidth = mouseDownData.startColumnWidth + change;
    if(newColumnWidth < 1){
      newColumnWidth = 1;
    }
    const columnChange = newColumnWidth - mouseDownData.startColumnWidth;
    const newTableWidth = (mouseDownData.startTableWidth + columnChange);
    return ({newTableWidth,newColumnWidth})
  }
  getElementWidth = (elem:HTMLElement) => (+(globalThis.getComputedStyle(elem).getPropertyValue('width').replace('px','')))
  
}
interface MouseDowmData{
  startPageX:number,
  startColumnWidth:number,
  startTableWidth:number,
}