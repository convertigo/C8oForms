import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export const NAV_PARAMS_DATA = new InjectionToken<Record<string, any>>('NAV_PARAMS_DATA');

@Injectable({providedIn: 'root'})
export class NavParams {
  /** Public like Ionic 3 */
  public data: Record<string, any>;

  constructor(
    @Optional() private route?: ActivatedRoute,
    @Optional() @Inject(NAV_PARAMS_DATA) private initialData?: Record<string, any>
  ) {
	
    // Sync access for routed pages (constructor-safe)
    if (this.route) {
		this.getRouteParams();
		this.route.queryParams.subscribe(() => {
			this.getRouteParams();
		});
    }
  }

  private getRouteParams(): void {
    const params: Record<string, any> = {};
    Object.assign(params, this.route?.snapshot.params);
    Object.assign(params, this.route?.snapshot.queryParams);
    this.data = {...this.initialData, ...params}
  }
  
  /** Old Ionic API */
  get(key: string): any {
    return this.data?.[key];
  }

  /** Internal: used by overlay wrapper to seed synchronously */
  _prime(from: Record<string, any> | null | undefined): void {
    this.data = from ? { ...from } : {};
  }
}
