    /**
     * Function EmitEventAction
     *   
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    EmitEventAction(page: C8oPageBase, props, vars) : Promise<any> {
        let q:string = props.event; // qname of event
        let p:string = q.substring(q.lastIndexOf('.')+1);
        let version:string = props.tplVersion ? props.tplVersion : '';
        
		if (page[p]) {
			let evt = C8oCafUtils.merge({"object": page, "target": page["elRef"].nativeElement}, props.data)
        	page[p].emit(evt);
		}
        return Promise.resolve();
    }