# Material Extensions - Table Builder

## Example usage

Installation `npm i -s mx-table-builder`

Add to the imports section of NgModule

```ts
@NgModule({
  declarations: [
    ...
  ],
  imports: [
    ...
    TableBuilderModule.forRoot({
      defaultTableState: { pageSize: 20},
    })
  ],
  providers: [...]
})
export class AppModule { }
```

Simple Usage

```ts
@Component({
  selector: 'app-table-builder-example',
  template: `<tb-table-container [tableBuilder]='tableBuilder'></tb-table-container>`,
  styleUrls: ['./table-builder-example.component.css']
})
export class TableBuilderExampleComponent {
  public tableBuilder: TableBuilder;
  data$ = new BehaviorSubject<any[]>([
    {id: 17, name: 'Bob'},
    {id: 30, name: 'Charles'},
    {id: 55, name: 'Joan'},
  ]);
  metaData$ = new BehaviorSubject<MetaData[]>([
    {key: 'id', fieldType: FieldType.Number}, 
    {key: 'name', fieldType: FieldType.String },
  ]);
  constructor(private store: Store<any>) {
    this.tableBuilder = new TableBuilder(this.data$, this.metaData$);
  }
}
```
