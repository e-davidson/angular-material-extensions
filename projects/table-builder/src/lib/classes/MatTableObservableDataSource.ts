import { MatTableDataSource } from '@angular/material';
import { Observable, Subscription } from 'rxjs';

export class MatTableObservableDataSource<T> extends  MatTableDataSource<T> {
  subscription: Subscription;
  constructor(private dataSrc: Observable<T[]>) {
    super([]);
  }

  connect() {
    if (!this.subscription) {
      this.subscription = this.dataSrc.subscribe( data => this.data = data );
    }
    return super.connect();
  }
  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    super.disconnect();
  }
}
