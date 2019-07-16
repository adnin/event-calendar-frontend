import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthenticationGuard } from './core';

const routes: Routes = [
  { path: '', redirectTo: 'event', pathMatch: 'full' },
  {
    path: '',
    component: AppComponent,
    children: [
          {
            path: 'event',
            loadChildren: './event/event.module#EventModule',
            canActivate: [AuthenticationGuard]
          },
          {
            path: 'login',
            loadChildren: './login/login.module#LoginModule'
          },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
