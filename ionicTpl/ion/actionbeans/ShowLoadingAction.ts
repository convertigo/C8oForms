    /**
     * Function ShowLoadingAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    ShowLoadingAction(page: C8oPageBase, props, vars) : Promise<any> {
		const showLoading = async () => {
			if (page.global["_c8o_loading"]) {
				return;
			}

			const loading = await page.getInstance(LoadingController).create({
				mode: props.IonMode ?? undefined,
				spinner: props.spinner ?? undefined,
				message: props.message ?? undefined,
				duration: props.duration ?? undefined,
				keyboardClose: props.keyboardClose,
				showBackdrop: props.showBackdrop,
				backdropDismiss: props.backdropDismiss,
				animated: props.animated,
				enterAnimation: props.enterAnimation ?? undefined,
				leaveAnimation: props.leaveAnimation ?? undefined,
				cssClass: props.cssClass ?? undefined,
				translucent: props.translucent
			});
			page.global["_c8o_loading"] = loading;
			loading.onDidDismiss().then(() => {
				if (page.global["_c8o_loading"] === loading) {
					delete page.global["_c8o_loading"];
				}
			});
			await loading.present();
		};

		return showLoading();
    }
