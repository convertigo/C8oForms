    /**
     * Function SetThemeAction
     *
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    SetThemeAction(page: C8oPageBase, props, vars) : Promise<any> {
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

                var useStorage = props.useStorage !== false;
                var useSystem = props.useSystem !== false;
                var persist = props.persist !== false;
                var setRootClass = props.setRootClass !== false;
                var emitResize = props.emitResize !== false;

                var fallbackDark = parseBoolean(props.fallbackDark);
                if (fallbackDark == null) {
                    fallbackDark = false;
                }

                ensureThemeGlobals();

                var dark = parseBoolean(props.dark);
                var source = "input";

                if (dark == null && page && page.global && globalProperty != "") {
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

                var root = (typeof window !== "undefined" && window.document && window.document.documentElement) ? window.document.documentElement : null;
                if (setRootClass && root) {
                    root.classList.remove(darkClass);
                    root.classList.remove(lightClass);
                    root.classList.add(dark ? darkClass : lightClass);
                }

                if (persist && useStorage && typeof window !== "undefined" && window.localStorage) {
                    try {
                        window.localStorage.setItem(storageKey, dark ? "1" : "0");
                    } catch (e) {
                    }
                }

                if (page && page.global && globalProperty != "") {
                    page.global[globalProperty] = !!dark;
                    page.global.themeMode = dark ? "dark" : "light";
                }

                if (emitResize && typeof window !== "undefined") {
                    setTimeout(function () {
                        window.dispatchEvent(new Event("resize"));
                    }, 10);
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
