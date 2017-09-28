import {
  Component,
  ModuleWithProviders,
  NgModule,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  moduleId: module.id,
  selector: 'mde-masonry',
  host: {'role': 'list'},
  template: '<ng-content></ng-content>',
  styleUrls: ['masonry.css'],
  encapsulation: ViewEncapsulation.None
})
export class MdeMasonry { }

@Component({
  moduleId: module.id,
  selector: 'mde-masonry-row',
  template: '<ng-content></ng-content>'
})
export class MdeMasonryRow { }

@Component({
  moduleId: module.id,
  selector: 'mde-masonry-item',
  host: { 'role': 'listitem' },
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.None
})
export class MdeMasonryItem {
}
