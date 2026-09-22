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

                var normalizePermission = function(value: any): string {
                    if (value == null) {
                        return "";
                    }
                    return ("" + value).trim().toLowerCase();
                };

                var parsePermissionList = function(value: any): string[] {
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
                            if (entry.permissions != null) {
                                append(entry.permissions);
                                return;
                            }
                            if (entry.permission != null) {
                                append(entry.permission);
                                return;
                            }
                            if (entry.name != null) {
                                append(entry.name);
                                return;
                            }
                            if (entry.code != null) {
                                append(entry.code);
                                return;
                            }
                            if (entry.id != null) {
                                append(entry.id);
                                return;
                            }
                            for (var key in entry) {
                                if (Object.prototype.hasOwnProperty.call(entry, key) && entry[key] === true) {
                                    append(key);
                                }
                            }
                            return;
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
                            var permission = normalizePermission(parts[p]);
                            if (permission != "") {
                                out.push(permission);
                            }
                        }
                    };

                    append(value);
                    var unique: string[] = [];
                    for (var i = 0; i < out.length; i++) {
                        if (unique.indexOf(out[i]) == -1) {
                            unique.push(out[i]);
                        }
                    }
                    return unique;
                };

                var normalizePermissionMatch = function(value: any, defaultValue: string): string {
                    var match = normalizePermission(value);
                    return match == "all" ? "all" : (match == "any" ? "any" : defaultValue);
                };

                var parsePermissionRules = function(value: any, defaultMatch: string): any[] {
                    var out: any[] = [];

                    var addRule = function(pagesValue: any, permissionsValue: any, matchValue: any): void {
                        var pages = uniquePages(parsePageList(pagesValue));
                        var permissions = parsePermissionList(permissionsValue);
                        if (pages.length == 0 || permissions.length == 0) {
                            return;
                        }
                        out.push({
                            pages: pages,
                            permissions: permissions,
                            match: normalizePermissionMatch(matchValue, defaultMatch)
                        });
                    };

                    var append = function(entry: any, mappedPage: any): void {
                        if (entry == null) {
                            return;
                        }

                        if (Array.isArray(entry)) {
                            if (mappedPage != null) {
                                addRule(mappedPage, entry, null);
                            } else {
                                for (var i = 0; i < entry.length; i++) {
                                    append(entry[i], null);
                                }
                            }
                            return;
                        }

                        if (typeof entry === "object") {
                            var hasRuleProperties = entry.page != null || entry.pages != null || entry.name != null || entry.qname != null || entry.permissions != null || entry.requiredPermissions != null;
                            if (hasRuleProperties) {
                                var pagesValue = entry.pages != null ? entry.pages : (entry.page != null ? entry.page : (entry.qname != null ? entry.qname : (entry.name != null ? entry.name : mappedPage)));
                                var permissionsValue = entry.permissions != null ? entry.permissions : entry.requiredPermissions;
                                addRule(pagesValue, permissionsValue, entry.match);
                            } else if (entry.rules != null) {
                                append(entry.rules, null);
                            } else {
                                for (var key in entry) {
                                    if (Object.prototype.hasOwnProperty.call(entry, key)) {
                                        append(entry[key], key);
                                    }
                                }
                            }
                            return;
                        }

                        if (mappedPage != null) {
                            addRule(mappedPage, entry, null);
                        }
                    };

                    if (typeof value === "string") {
                        var text = value.trim();
                        if (text.indexOf("script:") === 0 || text.indexOf("plain:") === 0 || text.indexOf("source:") === 0) {
                            text = text.substring(text.indexOf(":") + 1).trim();
                        }
                        if (text.charAt(0) == "[" || text.charAt(0) == "{") {
                            try {
                                value = JSON.parse(text);
                            } catch (e) {
                            }
                        }
                    }
                    append(value, null);
                    return out;
                };

                var pageVariants = function(value: any): string[] {
                    var base = normalizePage(value);
                    if (base == "") {
                        return [];
                    }
                    var variants: string[] = [];
                    var pushVariant = function(v: string): void {
                        var normalized = normalizePage(v);
                        if (normalized != "" && variants.indexOf(normalized) == -1) {
                            variants.push(normalized);
                        }
                        var compact = normalized.replace(/[^a-z0-9]/g, "");
                        if (compact != "" && variants.indexOf(compact) == -1) {
                            variants.push(compact);
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
                var globalUserProfile = props.globalUserProfileProperty;

                var redirectOnDenied = toBoolean(props.redirectOnDenied, true);
                var allowByDefault = toBoolean(props.allowByDefault, true);
                var setUserOnAuth = toBoolean(props.setUserOnAuth, true);
                var returnDetails = toBoolean(props.returnDetails, false);
                var globalResultProperty = (props.globalResultProperty != null && ("" + props.globalResultProperty).trim() != "") ? ("" + props.globalResultProperty).trim() : "authorization";
                var requiredPermissionsMatch = normalizePermissionMatch(props.requiredPermissionsMatch, "any");
                var permissionDeniedMessage = (props.permissionDeniedMessage != null && ("" + props.permissionDeniedMessage).trim() != "") ? ("" + props.permissionDeniedMessage).trim() : "Accès refusé : permissions insuffisantes.";
                var redirectPermissionDeniedTo = props.redirectPermissionDeniedTo;

                var protectedPages = uniquePages(parsePageList(props.protectedPages));
                var guestOnlyPages = uniquePages(parsePageList(props.guestOnlyPages));
                var pagePermissionRules = parsePermissionRules(props.pagePermissionRules, requiredPermissionsMatch);

                var displayPermissionDeniedMessage = async function(): Promise<void> {
                    if (permissionDeniedMessage == "") {
                        return;
                    }
                    try {
                        var toastHost: any = (paramCtx && typeof paramCtx["getInstance"] === "function") ? paramCtx : ((ctx && typeof ctx["getInstance"] === "function") ? ctx : null);
                        var toastController: any = toastHost ? toastHost.getInstance(ToastController) : null;
                        if (!toastController || typeof toastController.create !== "function") {
                            return;
                        }
                        var toast = await toastController.create({
                            color: "warning",
                            duration: 3000,
                            icon: "alert-circle-outline",
                            message: permissionDeniedMessage,
                            position: "top"
                        });
                        await toast.present();
                    } catch (e) {
                    }
                };

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

                var userServiceResponse: any = null;
                if (!authResolved && c8oInstance && c8oInstance.httpInterface && typeof c8oInstance.httpInterface.getUserServiceStatus === "function") {
                    try {
                        var res: any = await c8oInstance.httpInterface.getUserServiceStatus();
                        userServiceResponse = res;
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

                var userPermissions = parsePermissionList(globalUserProfile);
                var userPermissionsSource = userPermissions.length > 0 ? "global_profile" : "none";

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
                var matchedPermissionRules: any[] = [];
                var requiredPermissions: string[] = [];
                var permissionAuthorized = true;

                for (var i = 0; i < pagePermissionRules.length; i++) {
                    var permissionRule = pagePermissionRules[i];
                    if (!listContains(permissionRule.pages, currentPage)) {
                        continue;
                    }
                    var hasRequiredPermissions = permissionRule.match == "all";
                    for (var j = 0; j < permissionRule.permissions.length; j++) {
                        var requiredPermission = permissionRule.permissions[j];
                        if (requiredPermissions.indexOf(requiredPermission) == -1) {
                            requiredPermissions.push(requiredPermission);
                        }
                        var hasPermission = userPermissions.indexOf(requiredPermission) != -1;
                        if (permissionRule.match == "all") {
                            hasRequiredPermissions = hasRequiredPermissions && hasPermission;
                        } else {
                            hasRequiredPermissions = hasRequiredPermissions || hasPermission;
                        }
                    }
                    matchedPermissionRules.push({
                        pages: permissionRule.pages,
                        permissions: permissionRule.permissions,
                        match: permissionRule.match,
                        allowed: hasRequiredPermissions
                    });
                    if (!hasRequiredPermissions) {
                        permissionAuthorized = false;
                    }
                }

                if (protectedPages.length > 0 || guestOnlyPages.length > 0 || pagePermissionRules.length > 0) {
                    allowed = true;
                    reason = "allowed";

                    if (!authenticated && (listContains(protectedPages, currentPage) || matchedPermissionRules.length > 0)) {
                        allowed = false;
                        reason = "auth_required";
                        redirectTo = normalizePage(props.redirectUnauthenticatedTo);
                    } else if (authenticated && listContains(guestOnlyPages, currentPage)) {
                        allowed = false;
                        reason = "guest_only";
                        redirectTo = normalizePage(props.redirectAuthenticatedTo);
                    } else if (authenticated && matchedPermissionRules.length > 0 && !permissionAuthorized) {
                        allowed = false;
                        reason = "permission_required";
                        redirectTo = normalizePage(redirectPermissionDeniedTo);
                    }
                }

                var redirected = false;
                if (!allowed && reason == "permission_required") {
                    await displayPermissionDeniedMessage();
                }
                if (!allowed && redirectOnDenied && redirectTo != "" && !isSameRoute(redirectTo, currentPage)) {
                    redirected = await navigateToPage(redirectTo);
                }

                var result = {
                    authenticated: authenticated,
                    allowed: allowed,
                    source: authSource,
                    user: username,
                    userPermissions: userPermissions,
                    userPermissionsSource: userPermissionsSource,
                    currentPage: currentPage,
                    protectedPages: protectedPages,
                    guestOnlyPages: guestOnlyPages,
                    pagePermissionRules: pagePermissionRules,
                    matchedPermissionRules: matchedPermissionRules,
                    requiredPermissions: requiredPermissions,
                    permissionAuthorized: permissionAuthorized,
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
