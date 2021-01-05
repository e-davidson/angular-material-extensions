import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { fromEvent, Observable, of, pipe } from "rxjs";
import { first, map, mergeMap, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]",
})
export class ResizeColumnDirective extends ComponentStore<ResizeColumnDirectiveState>  implements OnInit{
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;

  constructor(private renderer: Renderer2, private el: ElementRef, public store: TableStore,) {
    super({...new ResizeColumnDirectiveState()});
    this.columnHead = el.nativeElement;
  }

  columnHead:HTMLElement;
  table:HTMLElement;
  removeLitsenerArr = []
  ngOnInit(){
    if (this.resizable){
    const resizer = this.renderer.createElement("span");
    this.renderer.addClass(resizer, "resize-holder");
    this.renderer.appendChild(this.columnHead, resizer);
    const row = this.renderer.parentNode(this.columnHead);
    this.table = this.renderer.parentNode(row);
    this.store.on(
      fromEvent<MouseEvent>(resizer, "mousedown").pipe(
        withLatestFrom(this.state$),map((([event,state])=> ({state,event})))),
      this.onMouseDown);
    }
  }

  onMouseDown:({state:ResizeColumnDirectiveState,event:MouseEvent})=>void = ({state,event}) => {
    const a = this.renderer.listen(document, "mouseup", this.onMouseUp);
    const b = this.renderer.listen(this.table, "mousemove", this.onMouseMove as any);
    this.removeLitsenerArr = [a,b];
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
