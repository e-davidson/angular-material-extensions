import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';

const routes: Routes = [
  { path: 'table-builder-example', component: TableBuilderExampleComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
