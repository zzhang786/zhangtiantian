import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LandingComponent} from "./landing/landing.component";
import {MainComponent} from "./main/main.component";
import {ProfileComponent} from "./profile/profile.component";


const routes: Routes = [
  {path:'', component: LandingComponent},
  {path:'main', component: MainComponent},
  {path:'profile', component: ProfileComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
