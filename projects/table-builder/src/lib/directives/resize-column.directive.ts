import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { fromEvent, Observable, of, pipe, Subject } from "rxjs";
import { first, map, mergeMap, switchMap, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]",
})
export class ResizeColumnDirective extends ComponentStore<ResizeColumnDirectiveState>  implements OnInit{
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;
  columnResized$ = new Subject();
  constructor(private renderer: Renderer2, private el: ElementRef, public store: TableStore,) {
    super({...new ResizeColumnDirectiveState()});
    this.columnHead = el.nativeElement;
  }

  columnHead:HTMLElement;
  table:HTMLElement;
  removeLitsenerArr = []
  SUB:Observable<{mouseDown:MouseEvent, mouseMove:MouseEvent}>;
  lob;
  ngOnInit(){
    if (this.resizable){
    const resizer = this.renderer.createElement("span");
    this.renderer.addClass(resizer, "resize-holder");
    this.renderer.appendChild(this.columnHead, resizer);
    const row = this.renderer.parentNode(this.columnHead);
    this.table = this.renderer.parentNode(row);
    // this.SUB = fromEvent<MouseEvent>(resizer, "mousedown").pipe(
    //   switchMap( mouseDown => fromEvent<MouseEvent>(this.table, "mousemove").pipe(
    //     map( mouseMove => ({mouseDown, mouseMove})),
    //     takeUntil(fromEvent<MouseEvent>(document, "mouseup").pipe(first()))
    //   ) ),

    // );
    this.lob = this.SUB.pipe(map(a => {
      const startX = a.mouseDown.pageX;
      const startWidth = this.columnHead.offsetWidth;
      const startTableWidth = this.table.offsetWidth;
      const offset = 13;
      if (a.mouseMove.buttons === 1) {
        // Calculate width of column
        const change = (a.mouseMove.pageX - startX)
        let width = (startWidth + change) - offset;
        if(width < 1){
          width= 1;
        }
        const columnChange = width - startWidth;
        let tableSize = (startTableWidth + columnChange);
  
        this.store.setUserDefinedWidth([{key:this.key, widthInPixel:width}]);
        this.store.setTableWidth(tableSize);
        return ({key:this.key,widthInPixel:width,tableSize})
      }
    }))
    // this.store.on(
    //   fromEvent<MouseEvent>(resizer, "mousedown").pipe(
    //     withLatestFrom(this.state$),map((([event,state])=> ({state,event})))),
    //   this.onMouseDown);
    // }
  }

  

  onMouseDown:({state:ResizeColumnDirectiveState,event:MouseEvent})=>void = ({state,event}) => {
    const a = this.renderer.listen(document, "mouseup", this.onMouseUp);
    const b = this.renderer.listen(this.table, "mousemove", this.onMouseMove as any);
    const mouseMove$ = fromEvent(this.table, "mousemove");
    const sub = mouseMove$.subscribe()
    this.removeLitsenerArr = [a,()=>sub.unsubscribe()];
    this.setState(state => ({...state,
      startX : event.pageX,
      startWidth : this.columnHead.offsetWidth,
      startTableWidth : this.table.offsetWidth,
    }));
  };

  onMouseMove = this.effect((mouseMove$: Observable<MouseEvent>) => 
      mouseMove$.pipe(withLatestFrom(this.state$),tap(([event,state]) => {
        {
          const offset = 13;
          if (event.buttons) {
            // Calculate width of column
            const change = (event.pageX - state.startX)
            let width = (state.startWidth + change) - offset;
            if(width < 1){
              width= 1;
            }
            const columnChange = width - state.startWidth;
            let tableSize = (state.startTableWidth + columnChange);
      
            this.store.setUserDefinedWidth([{key:this.key, widthInPixel:width}]);
            this.store.setTableWidth(tableSize);
          }
        }
      }))
  );

  // mapMouseMove = (event:MouseEvent) => {
  //   const offset = 13;
  //         if (event.buttons) {
  //           // Calculate width of column
  //           const change = (event.pageX - state.startX)
  //           let width = (state.startWidth + change) - offset;
  //           if(width < 1){
  //             width= 1;
  //           }
  //           const columnChange = width - state.startWidth;
  //           let tableSize = (state.startTableWidth + columnChange);
      
  //           // this.store.setUserDefinedWidth([{key:this.key, widthInPixel:width}]);
  //           // this.store.setTableWidth(tableSize);
  //         }
  // }
  

  onMouseUp = (event: MouseEvent) => {
    this.removeLitsenerArr.forEach(removeLitsener => removeLitsener());
    this.removeLitsenerArr = [];
  };
}

class ResizeColumnDirectiveState {
  startX: number;
  startWidth: number;
  startTableWidth:number;
}
