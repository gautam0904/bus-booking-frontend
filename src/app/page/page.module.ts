import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PageRoutingModule } from './page-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddBusComponent } from './add-bus/add-bus.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BookBusComponent } from './book-bus/book-bus.component';
import { BookBusFormComponent } from './book-bus-form/book-bus-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table'; 
import {MatGridListModule} from '@angular/material/grid-list';
import { SearchBusComponent } from './search-bus/search-bus.component';
import { UsersComponent } from './users/users.component';
import { RouteComponent } from './route/route.component';
import { StationsComponent } from './stations/stations.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AddBusComponent,
    BookBusComponent,
    BookBusFormComponent,
    SearchBusComponent,
    UsersComponent,
    RouteComponent,
    StationsComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatGridListModule
  ]
})
export class PageModule { }
