import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableBuilderModule } from 'table-builder';
import { TableBuilderExampleComponent } from './table-builder-example/table-builder-example.component';

@NgModule({
  declarations: [
    AppComponent,
    TableBuilderExampleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TableBuilderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
