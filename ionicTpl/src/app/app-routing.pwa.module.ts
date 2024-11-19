import { NgModule } from '@angular/core';

import { PreloadAllModules, RouterModule, Routes} from '@angular/router';



const routes: Routes = [
 { path: '', redirectTo: 'login', pathMatch: 'full' },
 { path: 'login', loadChildren: () => import('./pages/loginpage/loginpage.module').then( m => m.loginPageModule)},
 { path: 'login/:formId/:page/:edit/:published/:d/:e', loadChildren: () => import('./pages/loginpage/loginpage.module').then( m => m.loginPageModule)},
 { path: 'viewer/:formId/:edit/:i', loadChildren: () => import('./pages/viewerpage/viewerpage.module').then( m => m.viewerPageModule)},
 { path: 'path-to-dropfilepage', loadChildren: () => import('./pages/dropfilepage/dropfilepage.module').then( m => m.dropFilePageModule)},
 { path: 'path-to-progresspage', loadChildren: () => import('./pages/progresspage/progresspage.module').then( m => m.progressPageModule)},
 { path: 'path-to-resetpasswordpage', loadChildren: () => import('./pages/resetpasswordpage/resetpasswordpage.module').then( m => m.resetPasswordPageModule)},
 { path: 'path-to-gdrppage', loadChildren: () => import('./pages/gdrppage/gdrppage.module').then( m => m.GDRPpageModule)},
 { path: 'path-to-responsecompleted/:name', loadChildren: () => import('./pages/responsecompleted/responsecompleted.module').then( m => m.responseCompletedModule)},
 { path: 's/:u', loadChildren: () => import('./pages/sharingpage/sharingpage.module').then( m => m.sharingPageModule)},

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(){
	}
 }
