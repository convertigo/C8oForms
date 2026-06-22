    /**
     * Function SetLanguageAction
     *
     * @param page  , the current page
     * @param props , the object which holds properties key-value pairs
     * @param vars  , the object which holds variables key-value pairs
     */
    SetLanguageAction(page: C8oPageBase, props, vars) : Promise<any> {
        return new Promise((resolve, reject) => {
            props = props || {};

            try {
                var isSignalLike = function(value: any): boolean {
                    return typeof value === "function" && value != null && typeof value.set === "function";
                };

                var writeGlobalSignal = function(host: any, propertyName: string, value: any): void {
                    if (!host || !host.global || propertyName == "") {
                        return;
                    }
                    var current = host.global[propertyName];
                    if (isSignalLike(current)) {
                        try {
                            current.set(value);
                            return;
                        } catch (e) {
                        }
                    }
                    host.global[propertyName] = signal(value);
                };

                var normalizeLang = function(value: any): string {
                    if (value == null) {
                        return "";
                    }
                    var lang = ("" + value).trim().toLowerCase();
                    lang = lang.replace(/^[\[\]\s'"]+/, "").replace(/[\[\]\s'"]+$/, "");
                    if (lang == "") {
                        return "";
                    }
                    return lang.split(/[-_]/)[0];
                };

                var parseLanguages = function(value: any): string[] {
                    if (Array.isArray(value)) {
                        return value
                            .map(function(item) { return normalizeLang(item); })
                            .filter(function(item) { return item != ""; });
                    }

                    if (typeof value === "string") {
                        var trimmed = value.trim();
                        if (trimmed == "") {
                            return [];
                        }

                        if (trimmed.charAt(0) == "[") {
                            try {
                                var parsed = JSON.parse(trimmed);
                                if (Array.isArray(parsed)) {
                                    return parsed
                                        .map(function(item) { return normalizeLang(item); })
                                        .filter(function(item) { return item != ""; });
                                }
                            } catch (e) {
                            }
                        }

                        return trimmed
                            .split(",")
                            .map(function(item) { return normalizeLang(item); })
                            .filter(function(item) { return item != ""; });
                    }

                    return [];
                };

                var resolveLanguageLabelKey = function(value: any): string {
                    var lang = normalizeLang(value);
                    if (lang == "fr") {
                        return "Lang_French";
                    }
                    if (lang == "it") {
                        return "Lang_Italian";
                    }
                    if (lang == "es") {
                        return "Lang_Spanish";
                    }
                    return "Lang_English";
                };

                var exposeLanguageLabelHelper = function(host: any, propertyName: string, fallbackLang: string): void {
                    if (!host || !host.global) {
                        return;
                    }
                    host.global.getLanguageLabelKey = function(inputLanguage: any): string {
                        var lang = "";
                        if (inputLanguage != null && ("" + inputLanguage).trim() != "") {
                            lang = normalizeLang(inputLanguage);
                        } else if (propertyName != "") {
                            var current = host.global[propertyName];
                            if (isSignalLike(current)) {
                                try {
                                    lang = normalizeLang(current());
                                } catch (e) {
                                }
                            } else {
                                lang = normalizeLang(current);
                            }
                        }
                        if (lang == "") {
                            lang = normalizeLang(fallbackLang) || "en";
                        }
                        return resolveLanguageLabelKey(lang);
                    };
                };

                var storageKey = (props.storageKey != null && ("" + props.storageKey).trim() != "") ? ("" + props.storageKey).trim() : "c8o.language";
                var fallbackLanguage = normalizeLang(props.fallbackLanguage) || "en";
                var supportedLanguages = parseLanguages(props.supportedLanguages);
                var useStorage = props.useStorage !== false;
                var persist = props.persist !== false;
                var setDefaultLanguage = props.setDefaultLanguage !== false;
                var globalProperty = (props.globalProperty != null && ("" + props.globalProperty).trim() != "") ? ("" + props.globalProperty).trim() : "language";

                var selectedLanguage = normalizeLang(props.language);

                if (selectedLanguage == "" && useStorage && typeof window !== "undefined" && window.localStorage) {
                    try {
                        selectedLanguage = normalizeLang(window.localStorage.getItem(storageKey));
                    } catch (e) {
                    }
                }

                if (selectedLanguage == "" && typeof navigator !== "undefined") {
                    var browserLanguage = (navigator as any).language || (navigator as any).userLanguage;
                    selectedLanguage = normalizeLang(browserLanguage);
                }

                if (selectedLanguage == "") {
                    selectedLanguage = fallbackLanguage;
                }

                if (supportedLanguages.length > 0 && supportedLanguages.indexOf(selectedLanguage) == -1) {
                    if (supportedLanguages.indexOf(fallbackLanguage) != -1) {
                        selectedLanguage = fallbackLanguage;
                    } else {
                        selectedLanguage = supportedLanguages[0];
                    }
                }

                if (setDefaultLanguage) {
                    this.translate.setDefaultLang(fallbackLanguage);
                }

                this.translate.use(selectedLanguage);

                if (persist && typeof window !== "undefined" && window.localStorage) {
                    try {
                        window.localStorage.setItem(storageKey, selectedLanguage);
                    } catch (e) {
                    }
                }

                if (page && page.global && globalProperty != "") {
                    writeGlobalSignal(page, globalProperty, selectedLanguage);
                    exposeLanguageLabelHelper(page, globalProperty, fallbackLanguage);
                }

                resolve({
                    lang: selectedLanguage,
                    fallback: fallbackLanguage,
                    supportedLanguages: supportedLanguages
                });
            } catch (e) {
                reject(e);
            }
        });
    }
