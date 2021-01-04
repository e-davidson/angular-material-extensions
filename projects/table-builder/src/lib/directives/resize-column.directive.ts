import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { fromEvent, Observable, of, pipe } from "rxjs";
import { first, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]",
})
export class ResizeColumnDirective extends ComponentStore<ResizeColumnDirectiveState>  implements OnInit{
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;

  constructor(private renderer: Renderer2, private el: ElementRef, public state: TableStore,) {
    super({...new ResizeColumnDirectiveState(), columnHead: el.nativeElement})
  }
  ngOnInit(){
    this.setup();
  }
  setup = this.effect((nothing: Observable<never>) => {
    return nothing.pipe(
    switchMap(() => this.selectColumnHeadOnce.pipe(
      tap((ch) => {
        if (this.resizable) {
          this.setState(state => {
            const row = this.renderer.parentNode(state.columnHead);
            const table = this.renderer.parentNode(row);
            this.state.on(fromEvent(table, "mousemove"), this.onMouseMove)
            return ({ ...state, table });
          })
          const resizer = this.renderer.createElement("span");
          this.renderer.addClass(resizer, "resize-holder");
          this.renderer.appendChild(ch, resizer);
          this.state.on(fromEvent<MouseEvent>(resizer, "mousedown").pipe(
            switchMap((event)=> this.selectColumnHeadOnce.pipe(map(((columnHead)=> ({columnHead,event})))))), this.onMouseDown);
          this.state.on(fromEvent(document, "mouseup"), this.onMouseUp)
        }

      }))))}
      )

  onMouseDown = (ev:{event: MouseEvent,columnHead:HTMLElement}) => {
    this.setState(state => ({...state,
      pressed:true,
      startX : ev.event.pageX,
      startWidth : ev.columnHead.offsetWidth,
      startTableWidth : state.table.offsetWidth,
    }));
  };

  onMouseMove = this.effect((mouseMove$: Observable<MouseEvent>) => 
    mouseMove$.pipe(mergeMap(event => this.selectStateOnce.pipe(tap(state => {
      {
        const offset = 13;
        if (state.pressed && event.buttons) {
          // Calculate width of column
          const change = (event.pageX - state.startX)
          let width = (state.startWidth + change) - offset;
          if(width < 1){
            width= 1;
          }
          const columnChange = width - state.startWidth;
          let tableSize = (state.startTableWidth + columnChange);
    
          this.state.setUserDefinedWidth([{key:this.key, widthInPixel:width}]);
          this.state.setTableWidth(tableSize);
        }
      }
    }))))
  );

  onMouseUp = (event: MouseEvent) => {
    
    this.setState(state => ({...state,pressed : false}));
  };
  selectStateOnce = this.select(state => state).pipe(first());
  selectColumnHeadOnce = this.selectStateOnce.pipe(map(state => state.columnHead));
}

class ResizeColumnDirectiveState {
  startX: number;

  startWidth: number;
  startTableWidth:number;

  columnHead: HTMLElement;
  table: HTMLElement;

  pressed: boolean;
}
