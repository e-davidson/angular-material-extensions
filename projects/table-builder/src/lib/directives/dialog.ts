import { Directive, TemplateRef, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';

@Directive({
  selector: '[appDialog]',
  providers: [{ provide: MatDialogRef, useValue: null }]
})
export class DialogDirective implements OnDestroy {
  dialogRef: MatDialogRef<any, any>;
  subscription: Subscription;

  constructor(
    private templateRef: TemplateRef<any>,
    private dialog: MatDialog
  ) { }

  @Input() appDialogConfig: MatDialogConfig;
  @Input('appDialog') set state(open_close: Observable<boolean>) {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
      this.subscription = open_close.subscribe(v => this.setDialogState(v));
  }

  setDialogState(open: boolean) {
    if (open && !this.dialogRef) {
      this.dialogRef = this.dialog.open(this.templateRef, this.appDialogConfig);
      const sub = this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
        sub.unsubscribe();
      });
    } else if (!open && this.dialogRef) {
      this.dialogRef.close();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
