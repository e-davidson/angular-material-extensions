import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";
import { TableStore } from "../classes/table-store";

@Directive({
  selector: "[resizeColumn]"
})
export class ResizeColumnDirective implements OnInit {
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;

  private startX: number;

  private startWidth: number;
  private startSiblingWidth: number;
  private startTableWidth:number;

  private column: HTMLElement;
  private sibling: HTMLElement
  private table: HTMLElement;

  private pressed: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef, public state: TableStore,) {
    
  }
 
  ngOnInit() {
    this.column = this.el.nativeElement;
    if (this.resizable) {
      const row = this.renderer.parentNode(this.column);
      this.table = this.renderer.parentNode(row);
      const resizer = this.renderer.createElement("span");
      this.renderer.addClass(resizer, "resize-holder");
      this.renderer.appendChild(this.column, resizer);
      this.renderer.listen(resizer, "mousedown", this.onMouseDown);
      this.renderer.listen(this.table, "mousemove", this.onMouseMove);
      this.renderer.listen("document", "mouseup", this.onMouseUp);
    }
    
  }

  ngAfterViewInit(){
    setTimeout(()=>{
      this.sibling = this.column.nextElementSibling as HTMLElement;
    },0);
  }

  onMouseDown = (event: MouseEvent) => {
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
    this.startSiblingWidth = this.sibling.offsetWidth;
    this.startTableWidth = this.table.offsetWidth;
  };

  onMouseMove = (event: MouseEvent) => {
    const offset = 13;
    if (this.pressed && event.buttons) {
      this.renderer.addClass(this.table, "resizing");

      // Calculate width of column
      const change = (event.pageX - this.startX)
      let width = (this.startWidth + change) - offset;
      let siblingWidth = (this.startSiblingWidth - change) - offset;
      let tableSize = (this.startTableWidth + change) - offset;

      this.state.setUserDefinedWidth([{key:this.key,widthInPixel:width}]);
      this.state.setTableWidth(tableSize);
    }
  };

  onMouseUp = (event: MouseEvent) => {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, "resizing");
    }
  };
}
