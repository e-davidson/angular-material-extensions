import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { fromEvent, Observable } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]"
})
export class ResizeColumnDirective extends ComponentStore<ResizeColumnDirectiveState>  implements OnInit{
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;
  // private startX: number;

  // private startWidth: number;
  // private startTableWidth:number;

  // private columnHead: HTMLElement;
  // private table: HTMLElement;

  // private pressed: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef, public state: TableStore,) {
    super({...new ResizeColumnDirectiveState(), columnHead: el.nativeElement})
  }
 
  ngOnInit = this.effect((nothing: Observable<never>) => nothing.pipe(
    switchMap(() => this.selectColumnHead.pipe(
      tap((ch) => {
        if (this.resizable) {
          this.setState(state => {
            const row = this.renderer.parentNode(state.columnHead);
            const table = this.renderer.parentNode(row);
            this.state.on(fromEvent(table, "mousemove"), this.onMouseMove)
            return ({ ...state, table });
          })
          // const row = this.renderer.parentNode(this.columnHead);
          // this.table = this.renderer.parentNode(row);
          const resizer = this.renderer.createElement("span");
          this.renderer.addClass(resizer, "resize-holder");
          this.renderer.appendChild(ch, resizer);
          this.state.on(fromEvent<MouseEvent>(resizer, "mousedown").pipe(
            switchMap((event)=> this.selectColumnHead.pipe(map(((columnHead)=> ({columnHead,event})))))), this.onMouseDown);
          this.state.on(fromEvent(document, "mouseup"), this.onMouseUp)
        }

      })))))

  onMouseDown = (ev:{event: MouseEvent,columnHead:HTMLElement}) => {
    this.pressed = true;
    this.startX = ev.event.pageX;
    this.startWidth = ev.columnHead.offsetWidth;
    this.startTableWidth = this.table.offsetWidth;
  };

  onMouseMove = (event: MouseEvent) => {
    const offset = 13;
    if (this.pressed && event.buttons) {

      // Calculate width of column
      const change = (event.pageX - this.startX)
      let width = (this.startWidth + change) - offset;
      let tableSize = (this.startTableWidth + change) - offset;

      this.state.setUserDefinedWidth([{key:this.key,widthInPixel:width}]);
      this.state.setTableWidth(tableSize);
    }
  };

  onMouseUp = (event: MouseEvent) => {
    if (this.pressed) {
      this.pressed = false;
    }
  };

  selectColumnHead = this.select(state => state.columnHead);
}

class ResizeColumnDirectiveState {
  startX: number;

  startWidth: number;
  startTableWidth:number;

  columnHead: HTMLElement;
  table: HTMLElement;

  pressed: boolean;
}
