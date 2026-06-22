    /**
     * Function ShowLoadingAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    ShowLoadingAction(page: C8oPageBase, props, vars) : Promise<any> {
		
		page.global.c8oLoadingOptions.mode.set(props.IonMode ? props.IonMode : undefined);
		page.global.c8oLoadingOptions.spinner.set(props.spinner);
		page.global.c8oLoadingOptions.message.set(props.message);
		page.global.c8oLoadingOptions.duration.set(props.duration);
		page.global.c8oLoadingOptions.keyboardClose.set(props.keyboardClose);
		page.global.c8oLoadingOptions.showBackdrop.set(props.showBackdrop);
		page.global.c8oLoadingOptions.backdropDismiss.set(props.backdropDismiss);
		page.global.c8oLoadingOptions.animated.set(props.animated);
		page.global.c8oLoadingOptions.enterAnimation.set(props.enterAnimation ?? undefined);
		page.global.c8oLoadingOptions.leaveAnimation.set(props.leaveAnimation ?? undefined);
		page.global.c8oLoadingOptions.cssClass.set(props.cssClass ?? undefined);
		page.global.c8oLoadingOptions.translucent.set(props.translucent);
		page.global.c8oLoadingOptions.isOpen.set(true);
        if(!isNaN(page?.global?.c8oLoadingOptions?.duration()) && page?.global?.c8oLoadingOptions?.duration() > 0){
			setTimeout(() => {
				page.global.c8oLoadingOptions.isOpen.set(false);
			}, page?.global?.c8oLoadingOptions?.duration());
		}
        return new Promise((resolve, reject) => {
            resolve()
        });
    }
