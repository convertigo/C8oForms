    /**
     * Function CloseLoadingAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    CloseLoadingAction(page: C8oPageBase, props, vars) : Promise<any> {
		const loading = page.global["_c8o_loading"];
		return loading ? loading.dismiss().catch(() => undefined) : Promise.resolve();
    }
