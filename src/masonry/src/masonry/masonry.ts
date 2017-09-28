import {
  Component,
  ModuleWithProviders,
  NgModule,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'md-masonry',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['masonry.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdMasonry { }

@Component({
  moduleId: module.id,
  selector: 'md-masonry-row',
  template: '<ng-content></ng-content>'
})
export class MdMasonryRow { }

@Component({
  moduleId: module.id,
  selector: 'md-masonry-item',
  host: { 'role': 'listitem' },
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None
})
export class MdMasonryItem {
}
