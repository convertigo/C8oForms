import { NgModule } from '@angular/core';

import { PreloadAllModules, RouterModule, Routes, Router, UrlHandlingStrategy, UrlTree, UrlSegmentGroup, UrlSegment } from '@angular/router';

class urlHandlingStrategy implements UrlHandlingStrategy{
	shouldProcessUrl(url: UrlTree): boolean{
		return true;
	}
	extract(url: UrlTree): UrlTree{
		return url
	}
	merge(newUrlPart: UrlTree, rawUrl: UrlTree): UrlTree{
		try{
			if(newUrlPart.root.children.primary.segments[0].path == 'index.html'){
				let arrayUrlSegment = [];
				for(let elem of newUrlPart.fragment.split("/")){
					if(elem != ""){
						arrayUrlSegment.push(new UrlSegment(elem, {}))
					}
				}
				let urlSegmentGroup = new UrlSegmentGroup(arrayUrlSegment, {});
				newUrlPart.root.children.primary = urlSegmentGroup;
				return rawUrl;
			}
			else{
				return newUrlPart;
			}
		}
		catch(e){
			return newUrlPart;
		}
	}
}

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

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
  constructor(private _router: Router){
		//this._router.urlHandlingStrategy = new urlHandlingStrategy();
	}
 }
