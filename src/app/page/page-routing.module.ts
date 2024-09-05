import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddBusComponent } from './add-bus/add-bus.component';
import { BookBusComponent } from './book-bus/book-bus.component';
import { BookBusFormComponent } from './book-bus-form/book-bus-form.component';
import { SearchBusComponent } from './search-bus/search-bus.component';
import { RouteComponent } from './route/route.component';
import { UsersComponent } from './users/users.component';
import { StationsComponent } from './stations/stations.component';
import { BookingsComponent } from './bookings/bookings.component';

const routes: Routes = [
  {
    path : '',
    component : DashboardComponent
  },
  {
    path : 'add-bus',
    component : AddBusComponent
  },
  {
    path : 'bus-book',
    component : BookBusComponent
  },
  {
    path : 'booked-bus-form',
    component : BookBusFormComponent
  },
  {
    path : 'search-bus',
    component : SearchBusComponent
  },
  {
    path : 'routes',
    component : RouteComponent
  },
  {
    path : 'users',
    component : UsersComponent
  },
  {
    path : 'stations',
    component : StationsComponent
  },
  {
    path : 'bookings',
    component : BookingsComponent
  },
  {
    path : '**',
    redirectTo : 'dashboard',
    pathMatch : 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PageRoutingModule { }
