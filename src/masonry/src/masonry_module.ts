import { ModuleWithProviders, NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MdMasonry, MdMasonryItem, MdMasonryRow } from './masonry/index';


@NgModule({
  imports: [CommonModule],
  exports: [MdMasonry, MdMasonryItem, MdMasonryRow],
  declarations: [MdMasonry, MdMasonryItem, MdMasonryRow],
})
export class MdMasonryModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdMasonryModule,
      providers: []
    };
  }
}
