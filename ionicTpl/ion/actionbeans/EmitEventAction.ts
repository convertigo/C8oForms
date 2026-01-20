    /**
     * Function EmitEventAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    async EmitEventAction(page: C8oPageBase, props, vars) : Promise<any> {
        let q:string = props.event; // qname of event
        let p:string = q.substring(q.lastIndexOf('.')+1);
        let version:string = props.tplVersion ? props.tplVersion : '';
        
		if (page[p]) {
            let finished: any;
            if(props.async !== true) {
                let done!: () => void;
                finished = new Promise<void>((res) => (done = res));

                const prev = props.data.__c8oHandleFinished;
                props.data.__c8oHandleSynchronousFinished = async (...args: any[]) => {
                try {
                    if (typeof prev === "function") {
                    await prev(...args); // on attend aussi si l'ancien handler est async
                    }
                } finally {
                    done(); // signal "finished" (même si erreur)
                }
                };
            }
			let evt = C8oCafUtils.merge({"object": page, "target": page["elRef"].nativeElement}, props.data)
        	page[p].emit(evt);
            if(props.async !== true) {
                await finished;
            }
		}
        return Promise.resolve();
    }