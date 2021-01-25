import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CountryComponent } from './country/country.component';
import { WorldComponent } from './world/world.component';

const routes: Routes = [
  { path: "worldwide", component: WorldComponent},
  { path: "country", component: CountryComponent},
  { path: ":slug", component: CountryComponent},
  { path: "", pathMatch: "full", redirectTo: "worldwide"},
  { path: "**", redirectTo: "worldwide"}
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
