    /**
     * Function CloseLoadingAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    CloseLoadingAction(page: C8oPageBase, props, vars) : Promise<any> {
        
		page.global.c8oLoadingOptions.isOpen.set(false);
		        
        return new Promise((resolve, reject) => {
            resolve()
        });
    }