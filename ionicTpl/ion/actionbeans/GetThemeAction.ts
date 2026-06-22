    /**
     * Function GetThemeAction
     *
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    GetThemeAction(page: C8oPageBase, props, vars) : Promise<any> {
        return new Promise((resolve, reject) => {
            props = props || {};

            try {
                var parseBoolean = function(value: any): any {
                    if (value === true || value === false) {
                        return value;
                    }
                    if (value == null) {
                        return null;
                    }
                    var text = ("" + value).trim().toLowerCase();
                    if (text == "") {
                        return null;
                    }
                    if (text == "1" || text == "true" || text == "dark") {
                        return true;
                    }
                    if (text == "0" || text == "false" || text == "light") {
                        return false;
                    }
                    return null;
                };

                var storageKey = (props.storageKey != null && ("" + props.storageKey).trim() != "") ? ("" + props.storageKey).trim() : "c8o-theme-dark";
                var globalProperty = (props.globalProperty != null && ("" + props.globalProperty).trim() != "") ? ("" + props.globalProperty).trim() : "themeDark";
                var darkClass = (props.darkClass != null && ("" + props.darkClass).trim() != "") ? ("" + props.darkClass).trim() : "force-dark";
                var lightClass = (props.lightClass != null && ("" + props.lightClass).trim() != "") ? ("" + props.lightClass).trim() : "force-light";
                var ensureThemeGlobals = function(): void {
                    if (!(page && page.global)) {
                        return;
                    }
                    page.global.themeStorageKey = storageKey;
                    page.global.getThemeMode = function() {
                        var current = parseBoolean(page.global[globalProperty]);
                        if (current != null) {
                            return current ? "dark" : "light";
                        }
                        var rootEl = (typeof window !== "undefined" && window.document && window.document.documentElement) ? window.document.documentElement : null;
                        if (rootEl) {
                            if (rootEl.classList.contains(darkClass)) {
                                return "dark";
                            }
                            if (rootEl.classList.contains(lightClass)) {
                                return "light";
                            }
                        }
                        return (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
                    };
                    page.global.getCssVar = function(varName, fallbackValue) {
                        try {
                            var rootEl = (typeof window !== "undefined" && window.document && window.document.documentElement) ? window.document.documentElement : null;
                            if (rootEl && window.getComputedStyle) {
                                var value = window.getComputedStyle(rootEl).getPropertyValue(varName);
                                if (value != null) {
                                    value = ("" + value).trim();
                                    if (value.length > 0) {
                                        return value;
                                    }
                                }
                            }
                        } catch (e) {
                        }
                        return fallbackValue;
                    };
                };

                var useRootClasses = props.useRootClasses !== false;
                var useGlobal = props.useGlobal !== false;
                var useStorage = props.useStorage !== false;
                var useSystem = props.useSystem !== false;
                var applyTheme = props.applyTheme === true;
                var persistWhenApply = props.persistWhenApply === true;
                var emitResizeWhenApply = props.emitResizeWhenApply === true;

                var fallbackDark = parseBoolean(props.fallbackDark);
                if (fallbackDark == null) {
                    fallbackDark = false;
                }

                ensureThemeGlobals();

                var dark = null;
                var source = "";

                var root = (typeof window !== "undefined" && window.document && window.document.documentElement) ? window.document.documentElement : null;

                if (dark == null && useRootClasses && root) {
                    if (root.classList.contains(darkClass)) {
                        dark = true;
                        source = "root";
                    } else if (root.classList.contains(lightClass)) {
                        dark = false;
                        source = "root";
                    }
                }

                if (dark == null && useGlobal && page && page.global && globalProperty != "") {
                    dark = parseBoolean(page.global[globalProperty]);
                    if (dark != null) {
                        source = "global";
                    }
                }

                if (dark == null && useStorage && typeof window !== "undefined" && window.localStorage) {
                    try {
                        dark = parseBoolean(window.localStorage.getItem(storageKey));
                        if (dark != null) {
                            source = "storage";
                        }
                    } catch (e) {
                    }
                }

                if (dark == null && useSystem && typeof window !== "undefined" && window.matchMedia) {
                    dark = !!window.matchMedia("(prefers-color-scheme: dark)").matches;
                    source = "system";
                }

                if (dark == null) {
                    dark = !!fallbackDark;
                    source = "fallback";
                }

                if (page && page.global && globalProperty != "") {
                    page.global[globalProperty] = !!dark;
                    page.global.themeMode = dark ? "dark" : "light";
                }

                if (applyTheme && typeof (this as any).SetThemeAction === "function") {
                    (this as any).SetThemeAction(page, {
                        dark: !!dark,
                        storageKey: storageKey,
                        globalProperty: globalProperty,
                        darkClass: darkClass,
                        lightClass: lightClass,
                        useStorage: useStorage,
                        useSystem: useSystem,
                        persist: persistWhenApply,
                        setRootClass: true,
                        emitResize: emitResizeWhenApply,
                        fallbackDark: fallbackDark
                    }, vars).then(function () {
                        resolve({
                            dark: !!dark,
                            mode: dark ? "dark" : "light",
                            source: source,
                            storageKey: storageKey
                        });
                    }).catch(function (e) {
                        reject(e);
                    });
                    return;
                }

                resolve({
                    dark: !!dark,
                    mode: dark ? "dark" : "light",
                    source: source,
                    storageKey: storageKey
                });
            } catch (e) {
                reject(e);
            }
        });
    }
