import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HorizontalComponent } from './layout/horizontal/horizontal.component';
import { authGuard } from './core/guards/auth.guard';

const routes: Routes = [
  {
    path : '',
    component : HorizontalComponent,
    loadChildren: () => import('./page/page.module').then(m => m.PageModule),
    canActivate : [authGuard]
  },
  {
    path : 'auth',
    loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
