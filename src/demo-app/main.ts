import { bootstrap } from '@angular/platform-browser-dynamic';
import { HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { Renderer } from '@angular/core';

import { MdGestureConfig } from '@angular2-material/core/gestures/MdGestureConfig';

import { DemoApp } from './demo-app/demo-app';

bootstrap(DemoApp, [
  Renderer,
  {provide: HAMMER_GESTURE_CONFIG, useClass: MdGestureConfig}
]);
