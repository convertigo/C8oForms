import { Routes } from '@angular/router';

export const routes: Routes = [
{ path: '', redirectTo: 'login', pathMatch: 'full' },
 { path: 'login', loadChildren: () => import('./pages/loginpage/loginpage.routes').then( m => m.loginPageRoute)},
 { path: 'login/:formId/:page/:edit/:published/:d/:e', loadChildren: () => import('./pages/loginpage/loginpage.routes').then( m => m.loginPageRoute)},
 { path: 'viewer/:formId/:edit/:i', loadChildren: () => import('./pages/viewerpage/viewerpage.routes').then( m => m.viewerPageRoute)},
 { path: 'path-to-dropfilepage', loadChildren: () => import('./pages/dropfilepage/dropfilepage.routes').then( m => m.dropFilePageRoute)},
 { path: 'path-to-progresspage', loadChildren: () => import('./pages/progresspage/progresspage.routes').then( m => m.progressPageRoute)},
 { path: 'path-to-resetpasswordpage', loadChildren: () => import('./pages/resetpasswordpage/resetpasswordpage.routes').then( m => m.resetPasswordPageRoute)},
 { path: 'path-to-gdrppage', loadChildren: () => import('./pages/gdrppage/gdrppage.routes').then( m => m.GDRPpageRoute)},
 { path: 'path-to-responsecompleted/:name', loadChildren: () => import('./pages/responsecompleted/responsecompleted.routes').then( m => m.responseCompletedRoute)},
 { path: 's/:u', loadChildren: () => import('./pages/sharingpage/sharingpage.routes').then( m => m.sharingPageRoute)}
];