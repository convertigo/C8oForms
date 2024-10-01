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
//  { path: '', redirectTo: 'home', pathMatch: 'full' },
//  { path: 'home', loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)},
 /*=c8o_AppRoutes*/
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
