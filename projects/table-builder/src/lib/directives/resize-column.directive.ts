import { Directive, OnInit, Renderer2, Input, ElementRef } from "@angular/core";

@Directive({
  selector: "[resizeColumn]"
})
export class ResizeColumnDirective implements OnInit {
  @Input("resizeColumn") resizable: boolean;

  @Input() key: string;

  private startX: number;

  private startWidth: number;
  private startSiblingWidth: number;

  private column: HTMLElement;
  private cells:any[];
  private siblingCells;
  private sibling: HTMLElement
  private table: HTMLElement;

  private pressed: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    
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
      this.cells = Array.from(this.table.querySelectorAll(".mat-row"))
        .map((row: any) => row.querySelector(`.mat-column-${this.key}`));
      this.sibling = this.column.nextElementSibling as HTMLElement;
      this.siblingCells = this.cells.map(elem => elem.nextElementSibling);
    },0);
    

  }

  onMouseDown = (event: MouseEvent) => {
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
    this.startSiblingWidth = this.sibling.offsetWidth;

  };

  onMouseMove = (event: MouseEvent) => {
    const offset = 13;
    if (this.pressed && event.buttons) {
      this.renderer.addClass(this.table, "resizing");

      // Calculate width of column
      const change = (event.pageX - this.startX)
      let width = (this.startWidth + change) - offset;
      let siblingWidth = (this.startSiblingWidth - change) - offset;
      console.log({change,siblingWidth,width})

      // Set table header width
      this.renderer.setStyle(this.column, "flex", 'none');
      this.renderer.setStyle(this.sibling, "flex", 'none');
      this.renderer.setStyle(this.column, "width", `${width}px`);
      this.renderer.setStyle(this.sibling, "width", `${siblingWidth}px`);
      

      // Set table cells width
      this.cells.forEach(cell => {
        this.renderer.setStyle(cell, "flex", 'none');
        this.renderer.setStyle(cell, "width", `${width}px`);

      })
      this.siblingCells.forEach(cell => {
        this.renderer.setStyle(cell, "flex", 'none');
        this.renderer.setStyle(cell, "width", `${siblingWidth}px`);

      })
    }
  };

  onMouseUp = (event: MouseEvent) => {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, "resizing");
    }
  };
}
