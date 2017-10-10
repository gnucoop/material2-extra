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
    <mat-sidenav-container class="demo-root" fullscreen>
      <mat-sidenav #start>
        <mat-nav-list>
          <a mat-list-item [routerLink]="['calendar']">Calendar</a>
          <a mat-list-item [routerLink]="['masonry']">Masonry</a>
        </mat-nav-list>
        <button mat-button (click)="start.close()">CLOSE</button>
      </mat-sidenav>
      <div>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="start.open()">
            <mat-icon class="mat-24" >menu</mat-icon>
          </button>
          <div class="demo-toolbar">
            <h1>Dewco Core Demos</h1>
          </div>
        </mat-toolbar>

        <div #root="dir" dir="ltr" class="demo-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </mat-sidenav-container>
  `,
  styleUrls: ['demo-app.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DemoApp { }
