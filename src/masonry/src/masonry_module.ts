import { ModuleWithProviders, NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MdeMasonry, MdeMasonryItem, MdeMasonryRow } from './masonry/index';


@NgModule({
  imports: [CommonModule],
  exports: [MdeMasonry, MdeMasonryItem, MdeMasonryRow],
  declarations: [MdeMasonry, MdeMasonryItem, MdeMasonryRow],
})
export class MdeMasonryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdeMasonryModule,
      providers: []
    };
  }
}
