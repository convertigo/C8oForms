    /**
     * Function AuthorizePagesAction
     *
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    AuthorizePagesAction(page: C8oPageBase, props, vars) : Promise<any> {
        return new Promise((resolve, reject) => {
            (async () => {
                props = props || {};
                var ctx: any = this;
                var paramCtx: any = page;
                if (!(ctx && (ctx.c8o || ctx.global || ctx.local || ctx["angularRouter"] || ctx.route))) {
                    ctx = paramCtx;
                }
                var c8oInstance: any = (ctx && ctx["c8o"]) ? ctx["c8o"] : (paramCtx && paramCtx["c8o"] ? paramCtx["c8o"] : null);
                var routeHost: any = (ctx && ctx["route"]) ? ctx : (paramCtx && paramCtx["route"] ? paramCtx : ctx);
                var routerHost: any = (ctx && ctx["angularRouter"]) ? ctx : (paramCtx && paramCtx["angularRouter"] ? paramCtx : ctx);
                var globalHost: any = (ctx && ctx["global"]) ? ctx : (paramCtx && paramCtx["global"] ? paramCtx : null);
                var localHost: any = (ctx && ctx["local"]) ? ctx : (paramCtx && paramCtx["local"] ? paramCtx : null);

                var toBoolean = function(value: any, defaultValue: boolean): boolean {
                    if (value === true || value === false) {
                        return value;
                    }
                    if (value == null) {
                        return defaultValue;
                    }
                    var text = ("" + value).trim().toLowerCase();
                    if (text == "") {
                        return defaultValue;
                    }
                    if (text == "1" || text == "true" || text == "yes") {
                        return true;
                    }
                    if (text == "0" || text == "false" || text == "no") {
                        return false;
                    }
                    return defaultValue;
                };

                var normalizePage = function(value: any): string {
                    if (value == null) {
                        return "";
                    }
                    var pageName = ("" + value).trim().toLowerCase();
                    if (pageName == "") {
                        return "";
                    }
                    var q = pageName.indexOf("?");
                    if (q >= 0) {
                        pageName = pageName.substring(0, q);
                    }
                    var h = pageName.indexOf("#");
                    if (h >= 0) {
                        pageName = pageName.substring(0, h);
                    }
                    pageName = pageName.replace(/^https?:\/\/[^/]+/i, "");
                    pageName = pageName.replace(/^\/+/, "").replace(/\/+$/, "");
                    while (pageName.indexOf("//") != -1) {
                        pageName = pageName.replace("//", "/");
                    }
                    return pageName;
                };

                var parsePageList = function(value: any): string[] {
                    var out: string[] = [];

                    var append = function(entry: any): void {
                        if (entry == null) {
                            return;
                        }

                        if (Array.isArray(entry)) {
                            for (var i = 0; i < entry.length; i++) {
                                append(entry[i]);
                            }
                            return;
                        }

                        if (typeof entry === "object") {
                            if (entry.page != null) {
                                append(entry.page);
                                return;
                            }
                            if (entry.name != null) {
                                append(entry.name);
                                return;
                            }
                            if (entry.qname != null) {
                                append(entry.qname);
                                return;
                            }
                        }

                        var text = ("" + entry).trim();
                        if (text == "") {
                            return;
                        }

                        if (text.indexOf("script:") === 0 || text.indexOf("plain:") === 0 || text.indexOf("source:") === 0) {
                            text = text.substring(text.indexOf(":") + 1).trim();
                        }

                        var firstChar = text.charAt(0);
                        if (firstChar == "[" || firstChar == "{") {
                            try {
                                append(JSON.parse(text));
                                return;
                            } catch (e) {
                            }
                        }

                        var parts = text.split(/[,;\n|]/);
                        for (var p = 0; p < parts.length; p++) {
                            var normalized = normalizePage(parts[p]);
                            if (normalized != "") {
                                out.push(normalized);
                            }
                        }
                    };

                    append(value);
                    return out;
                };

                var uniquePages = function(values: string[]): string[] {
                    var out: string[] = [];
                    var seen: {[key: string]: boolean} = {};
                    for (var i = 0; i < values.length; i++) {
                        var pageName = normalizePage(values[i]);
                        if (pageName != "" && !seen[pageName]) {
                            seen[pageName] = true;
                            out.push(pageName);
                        }
                    }
                    return out;
                };

                var pageVariants = function(value: any): string[] {
                    var base = normalizePage(value);
                    if (base == "") {
                        return [];
                    }
                    var variants: string[] = [];
                    var pushVariant = function(v: string): void {
                        if (v != "" && variants.indexOf(v) == -1) {
                            variants.push(v);
                        }
                    };
                    pushVariant(base);
                    if (base.indexOf("/") != -1) {
                        pushVariant(base.substring(base.lastIndexOf("/") + 1));
                    }
                    if (base.indexOf(".") != -1) {
                        pushVariant(base.substring(base.lastIndexOf(".") + 1));
                    }
                    return variants;
                };

                var listContains = function(values: string[], currentPage: string): boolean {
                    var current = normalizePage(currentPage);
                    var currentVariants = pageVariants(current);
                    for (var i = 0; i < values.length; i++) {
                        var itemVariants = pageVariants(values[i]);
                        for (var j = 0; j < itemVariants.length; j++) {
                            var item = itemVariants[j];
                            if (item == "*" || item == "all") {
                                return true;
                            }
                            if (item == current || currentVariants.indexOf(item) != -1) {
                                return true;
                            }
                            if (current != "" && current.indexOf(item + "/") === 0) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                var detectCurrentPage = function(): string {
                    var fromProps = normalizePage(props.currentPage);
                    if (fromProps != "") {
                        return fromProps;
                    }

                    try {
                        if (routeHost && routeHost.route && routeHost.route.snapshot) {
                            if (routeHost.route.snapshot.routeConfig && routeHost.route.snapshot.routeConfig.path) {
                                var routePath = normalizePage(routeHost.route.snapshot.routeConfig.path);
                                if (routePath != "") {
                                    return routePath;
                                }
                            }
                            if (Array.isArray(routeHost.route.snapshot.url) && routeHost.route.snapshot.url.length > 0) {
                                var segments = routeHost.route.snapshot.url.map(function(segment) {
                                    return segment.path;
                                }).join("/");
                                var fromSegments = normalizePage(segments);
                                if (fromSegments != "") {
                                    return fromSegments;
                                }
                            }
                        }
                    } catch (e) {
                    }

                    try {
                        if (routerHost && routerHost["angularRouter"] && routerHost["angularRouter"].url) {
                            var fromRouter = normalizePage(routerHost["angularRouter"].url);
                            if (fromRouter != "") {
                                return fromRouter;
                            }
                        }
                    } catch (e) {
                    }

                    return "";
                };

                var sanitizeRouteInput = function(value: any): string {
                    if (value == null) {
                        return "";
                    }
                    var text = ("" + value).trim();
                    if (text == "") {
                        return "";
                    }
                    if (text.indexOf("script:") === 0 || text.indexOf("plain:") === 0 || text.indexOf("source:") === 0) {
                        text = text.substring(text.indexOf(":") + 1).trim();
                    }
                    if ((text.charAt(0) == "'" && text.charAt(text.length - 1) == "'") || (text.charAt(0) == "\"" && text.charAt(text.length - 1) == "\"")) {
                        text = text.substring(1, text.length - 1).trim();
                    }
                    var q = text.indexOf("?");
                    if (q >= 0) {
                        text = text.substring(0, q);
                    }
                    var h = text.indexOf("#");
                    if (h >= 0) {
                        text = text.substring(0, h);
                    }
                    text = text.replace(/^https?:\/\/[^/]+/i, "");
                    text = text.replace(/^\/+/, "").replace(/\/+$/, "");
                    while (text.indexOf("//") != -1) {
                        text = text.replace("//", "/");
                    }
                    return text;
                };

                var resolveRouteFromPageRef = function(targetPage: any): string {
                    var input = sanitizeRouteInput(targetPage);
                    if (input == "") {
                        return "";
                    }

                    var pageName = input;
                    if (pageName.indexOf(".") != -1) {
                        pageName = pageName.substring(pageName.lastIndexOf(".") + 1);
                    }
                    pageName = sanitizeRouteInput(pageName);
                    var pageNameNormalized = normalizePage(pageName);
                    var inputNormalized = normalizePage(input);

                    var appPages: any[] = [];
                    try {
                        if (ctx && ctx["routerProvider"] && Array.isArray(ctx["routerProvider"]["pagesArray"])) {
                            appPages = ctx["routerProvider"]["pagesArray"];
                        } else if (paramCtx && paramCtx["routerProvider"] && Array.isArray(paramCtx["routerProvider"]["pagesArray"])) {
                            appPages = paramCtx["routerProvider"]["pagesArray"];
                        }
                    } catch (e) {
                    }

                    for (var i = 0; i < appPages.length; i++) {
                        var ap: any = appPages[i] || {};
                        var apName = ap["name"] != null ? ("" + ap["name"]).trim() : "";
                        var apUrl = ap["url"] != null ? ("" + ap["url"]).trim() : "";
                        var apNameNormalized = normalizePage(apName);
                        var apUrlNormalized = normalizePage(apUrl);

                        if (pageNameNormalized != "" && apNameNormalized == pageNameNormalized) {
                            return apUrl != "" ? apUrl : pageName;
                        }
                        if (inputNormalized != "" && apNameNormalized == inputNormalized) {
                            return apUrl != "" ? apUrl : input;
                        }
                        if (pageNameNormalized != "" && apUrlNormalized == pageNameNormalized) {
                            return apUrl != "" ? apUrl : pageName;
                        }
                        if (inputNormalized != "" && apUrlNormalized == inputNormalized) {
                            return apUrl != "" ? apUrl : input;
                        }
                    }

                    return input;
                };

                var navigateToPage = async function(targetPage: string): Promise<boolean> {
                    var route = resolveRouteFromPageRef(targetPage);
                    route = sanitizeRouteInput(route);
                    if (route == "") {
                        return false;
                    }
                    var url = route.charAt(0) == "/" ? route : ("/" + route);
                    try {
                        if (routerHost && routerHost["angularRouter"] && typeof routerHost["angularRouter"]["navigateByUrl"] === "function") {
                            await routerHost["angularRouter"]["navigateByUrl"](url);
                            return true;
                        }
                        if (routerHost && routerHost["angularRouter"] && typeof routerHost["angularRouter"]["navigate"] === "function") {
                            await routerHost["angularRouter"]["navigate"]([url]);
                            return true;
                        }
                    } catch (e) {
                    }
                    return false;
                };

                var isSameRoute = function(targetPage: string, currentPageValue: string): boolean {
                    var targetRoute = sanitizeRouteInput(resolveRouteFromPageRef(targetPage));
                    if (targetRoute == "") {
                        return false;
                    }
                    var targetNormalized = normalizePage(targetRoute);
                    var currentFromPage = normalizePage(currentPageValue);
                    if (currentFromPage != "" && (targetNormalized == currentFromPage || currentFromPage == targetNormalized)) {
                        return true;
                    }
                    try {
                        var currentUrl = "";
                        if (routerHost && routerHost["angularRouter"] && routerHost["angularRouter"].url) {
                            currentUrl = sanitizeRouteInput(routerHost["angularRouter"].url);
                        }
                        var currentRoute = normalizePage(currentUrl);
                        if (currentRoute != "" && currentRoute == targetNormalized) {
                            return true;
                        }
                    } catch (e) {
                    }
                    return false;
                };

                var globalAuthProperty = (props.globalAuthProperty != null && ("" + props.globalAuthProperty).trim() != "") ? ("" + props.globalAuthProperty).trim() : "authenticated";
                var globalUserProperty = (props.globalUserProperty != null && ("" + props.globalUserProperty).trim() != "") ? ("" + props.globalUserProperty).trim() : "user";
                var localUserProperty = (props.localUserProperty != null && ("" + props.localUserProperty).trim() != "") ? ("" + props.localUserProperty).trim() : "user";

                var redirectOnDenied = toBoolean(props.redirectOnDenied, true);
                var allowByDefault = toBoolean(props.allowByDefault, true);
                var setUserOnAuth = toBoolean(props.setUserOnAuth, true);
                var returnDetails = toBoolean(props.returnDetails, false);
                var globalResultProperty = (props.globalResultProperty != null && ("" + props.globalResultProperty).trim() != "") ? ("" + props.globalResultProperty).trim() : "authorization";

                var protectedPages = uniquePages(parsePageList(props.protectedPages));
                var guestOnlyPages = uniquePages(parsePageList(props.guestOnlyPages));

                var authenticated = false;
                var authSource = "none";
                var username = "";
                var authResolved = false;

                var normalizeStatus = function(status: any): string {
                    if (status == null) {
                        return "";
                    }
                    return ("" + status).trim().toLowerCase();
                };

                var extractUserServiceAuthenticated = function(res: any): boolean | null {
                    if (res == null) {
                        return null;
                    }
                    if (res.user && typeof res.user.authenticated !== "undefined") {
                        return toBoolean(res.user.authenticated, false);
                    }
                    if (typeof res.authenticated !== "undefined") {
                        return toBoolean(res.authenticated, false);
                    }
                    if (res.response && res.response.user && typeof res.response.user.authenticated !== "undefined") {
                        return toBoolean(res.response.user.authenticated, false);
                    }
                    return null;
                };

                var extractUserServiceName = function(res: any): string {
                    if (res && res.user && res.user.name != null && ("" + res.user.name).trim() != "") {
                        return "" + res.user.name;
                    }
                    if (res && res.response && res.response.user && res.response.user.name != null && ("" + res.response.user.name).trim() != "") {
                        return "" + res.response.user.name;
                    }
                    return "";
                };

                if (c8oInstance && c8oInstance.promiseFinInit) {
                    await c8oInstance.promiseFinInit;
                }

                var session = c8oInstance ? c8oInstance.session : null;
                var sessionStatus = session ? session.status : null;
                var sessionStatusText = normalizeStatus(sessionStatus);
                var sessionStatusCompact = sessionStatusText.replace(/[^a-z]/g, "");
                var fromSession = (
                    sessionStatus === 1 ||
                    sessionStatus === 2 ||
                    sessionStatus === 5 ||
                    sessionStatus === "Connected" ||
                    sessionStatus === "HasBeenConnected" ||
                    sessionStatus === "HasBeenConnectedToAnother" ||
                    sessionStatusCompact === "connected" ||
                    sessionStatusCompact === "hasbeenconnected" ||
                    sessionStatusCompact === "hasbeenconnectedtoanother"
                );

                if (fromSession) {
                    authenticated = true;
                    authSource = "session";
                    authResolved = true;
                }
                if (session && session.user && session.user.name) {
                    username = "" + session.user.name;
                }

                if (!authResolved && c8oInstance && c8oInstance.httpInterface && typeof c8oInstance.httpInterface.getUserServiceStatus === "function") {
                    try {
                        var res: any = await c8oInstance.httpInterface.getUserServiceStatus();
                        var authFromService = extractUserServiceAuthenticated(res);
                        if (authFromService != null) {
                            authenticated = !!authFromService;
                            authSource = "userservice";
                            authResolved = true;
                        }
                        var userFromService = extractUserServiceName(res);
                        if (userFromService != "") {
                            username = userFromService;
                        }
                    } catch (e) {
                        authSource = "error";
                    }
                }

                if (!authResolved && globalHost && globalHost.global && globalAuthProperty != "") {
                    var fallbackAuth = globalHost.global[globalAuthProperty];
                    if (typeof fallbackAuth === "boolean") {
                        authenticated = fallbackAuth;
                        authSource = "global";
                        authResolved = true;
                    } else if (fallbackAuth != null) {
                        authenticated = toBoolean(fallbackAuth, false);
                        authSource = "global";
                        authResolved = true;
                    }
                }

                if (!authResolved) {
                    authenticated = false;
                    if (authSource == "none") {
                        authSource = "default_false";
                    }
                }

                if (globalHost && globalHost.global && globalAuthProperty != "") {
                    globalHost.global[globalAuthProperty] = authenticated;
                }

                if (setUserOnAuth) {
                    var userValue = authenticated ? (username || null) : null;
                    if (globalHost && globalHost.global && globalUserProperty != "") {
                        globalHost.global[globalUserProperty] = userValue;
                    }
                    if (localHost && localHost.local && localUserProperty != "") {
                        localHost.local[localUserProperty] = userValue;
                    }
                }

                var currentPage = detectCurrentPage();
                var allowed = allowByDefault;
                var reason = allowByDefault ? "default_allow" : "default_deny";
                var redirectTo = "";

                if (protectedPages.length > 0 || guestOnlyPages.length > 0) {
                    allowed = true;
                    reason = "allowed";

                    if (!authenticated && listContains(protectedPages, currentPage)) {
                        allowed = false;
                        reason = "auth_required";
                        redirectTo = normalizePage(props.redirectUnauthenticatedTo);
                    } else if (authenticated && listContains(guestOnlyPages, currentPage)) {
                        allowed = false;
                        reason = "guest_only";
                        redirectTo = normalizePage(props.redirectAuthenticatedTo);
                    }
                }

                var redirected = false;
                if (!allowed && redirectOnDenied && redirectTo != "" && !isSameRoute(redirectTo, currentPage)) {
                    redirected = await navigateToPage(redirectTo);
                }

                var result = {
                    authenticated: authenticated,
                    allowed: allowed,
                    source: authSource,
                    user: username,
                    currentPage: currentPage,
                    protectedPages: protectedPages,
                    guestOnlyPages: guestOnlyPages,
                    reason: reason,
                    redirectTo: redirectTo,
                    redirected: redirected
                };

                if (globalHost && globalHost.global && globalResultProperty != "") {
                    globalHost.global[globalResultProperty] = result;
                }

                if (returnDetails) {
                    resolve(result);
                } else {
                    resolve(!!result.allowed);
                }
            })().catch(function(e) {
                reject(e);
            });
        });
    }
