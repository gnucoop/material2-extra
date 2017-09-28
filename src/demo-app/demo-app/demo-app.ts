import { Component, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'home',
  template: `
    <p>Dewco Core</p>
  `
})
export class Home {}

@Component({
  // moduleId: module.id,
  selector: 'demo-app',
  providers: [],
  template: `
    <md-sidenav-container class="demo-root" fullscreen>
      <md-sidenav #start>
        <md-nav-list>
          <a md-list-item [routerLink]="['calendar']">Calendar</a>
          <a md-list-item [routerLink]="['masonry']">Masonry</a>
        </md-nav-list>
        <button md-button (click)="start.close()">CLOSE</button>
      </md-sidenav>
      <div>
        <md-toolbar color="primary">
          <button md-icon-button (click)="start.open()">
            <md-icon class="md-24" >menu</md-icon>
          </button>
          <div class="demo-toolbar">
            <h1>Dewco Core Demos</h1>
          </div>
        </md-toolbar>

        <div #root="$implicit" dir="ltr" class="demo-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </md-sidenav-container>
  `,
  styleUrls: ['demo-app.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoApp { }
