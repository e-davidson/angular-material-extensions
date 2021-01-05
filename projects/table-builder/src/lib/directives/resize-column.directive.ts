import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { fromEvent, of } from "rxjs";
import { filter, first, map, switchMap, takeUntil, tap } from "rxjs/operators";
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
      const columnHead = this.el.nativeElement;
      const resizer = this.renderer.createElement("span");
      this.renderer.addClass(resizer, "resize-holder");
      this.renderer.appendChild(columnHead, resizer);
      const row = this.renderer.parentNode(columnHead);
      const table = this.renderer.parentNode(row);

      const onMouseDown = fromEvent<MouseEvent>(resizer, "mousedown").pipe(
        map(event => ({
          startX: event.pageX,
          startWidth: columnHead.offsetWidth,
          startTableWidth: table.offsetWidth
        }))
      );

      const aggregateMouseEvents$ = onMouseDown.pipe(
        switchMap( startData => fromEvent<MouseEvent>(table, "mousemove").pipe(
          map( mouseMove => ({startData, mouseMove})),
          takeUntil(fromEvent<MouseEvent>(document, "mouseup").pipe(first()))
        ) ),

      );

      const resizeColsData$ = aggregateMouseEvents$.pipe(
        map( ({startData,mouseMove}) => {
          const offset = 13;
          if (mouseMove.buttons) {
            // Calculate width of column
            const change = (mouseMove.pageX - startData.startX ) - offset;
            let width = (startData.startWidth + change);
            if(width < 1){
              width= 1;
            }
            const columnChange = width - startData.startWidth;
            let tableSize = (startData.startTableWidth + columnChange)+offset;
            return ({key:this.key,widthInPixel:width,tableSize})
          }
          return null}),
        filter( d => d !== null )
      );

      this.store.setUserDefinedWidth(resizeColsData$.pipe(
        // tap(resizeData => this.renderer.setStyle(columnHead, "flex", `0, 0, ${resizeData.widthInPixel}px`)),
        map(resizeData => ([{key: this.key, widthInPixel: resizeData.widthInPixel }]))
      ));

      this.store.setTableWidth(resizeColsData$.pipe(
        tap(resizeData => this.renderer.setStyle(table, "flex", `0, 0, ${resizeData.tableSize}px`)),
        map(resizeData => resizeData.tableSize )));
    }
  }
}
