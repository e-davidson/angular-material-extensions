import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MetaData, FieldType } from '../../interfaces/report-def';

@Component({
    selector: 'tb-val-displayer',
    templateUrl: './gen-val-displayer.component.html',
    styleUrls: ['./gen-val-displayer.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenValDisplayerComponent {
    @Input() col: MetaData;
    @Input() element: Object;
    FieldType = FieldType;
    constructor() { }
}
