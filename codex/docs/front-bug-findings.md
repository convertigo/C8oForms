
# Front-End Bug Findings

Ce document recense les anomalies relevées dans le front Ionic/Angular du projet C8Oforms. Chaque entrée indique le fichier concerné, la ligne approximative et l’impact observé.

## Collisions sur les callbacks de sources
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3538-3570
- **Symptôme**: Les callbacks des sources (`functionsById`) sont indexés uniquement par un hash du nom/vars. Deux widgets partageant la même configuration se marchent dessus : la deuxième inscription écrase la première et l’élément initial ne se met plus à jour.
- **Impact**: Valeurs qui ne se rafraîchissent plus dès qu’un autre widget utilise la même source.
- **Suggestion**: Ajouter l’identifiant du widget dans la clé (`${sha}-${item.id}`) ou stocker un tableau de callbacks.

## Collisions sur l’évaluation HTML
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3604-3632
- **Symptôme**: Les blocs HTML dynamiques sont mis en cache via `functionsById[sha256(html)]`. Deux blocs avec le même contenu partagent la même clé : seul le dernier reste actif.
- **Impact**: Les champs HTML identiques sur plusieurs pages/éléments ne se mettent plus à jour.
- **Suggestion**: Incorporer le nom ou l’identifiant du champ dans la clé (p. ex. `sha256(html + name)`).

## `forEach` asynchrone non attendu
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3638-3642
- **Symptôme**: `fillPages` appelle `evalHtml` via `pages.forEach(async …)` ; les promesses retournées ne sont pas attendues et toute exception est silencieuse.
- **Impact**: Les pages peuvent arriver sans contenu formaté ou masquer les erreurs d’évaluation.
- **Suggestion**: Utiliser `for…of` + `await` ou `Promise.all(pages.map(...))`.

## `eval` sur les filtres utilisateur
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~5030-5055
- **Symptôme**: La construction des filtres (`res.filters.map`) appelle `eval(x.value)` sur des fragments issus du modèle.
- **Impact**: Le moindre champ mal formé casse l’évaluation ; un utilisateur malveillant peut injecter du code.
- **Suggestion**: Reprendre la logique `asyncFunction`/`removeSafeOperatorsInLHS` utilisée ailleurs ou refuser l’entrée invalide.

## `debugger` restant dans le code map
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3582-3586
- **Symptôme**: Lorsque `sourceMarkersEnabled` est vrai, le code atteint un `debugger;` sans fallback.
- **Impact**: Le rendu carte est bloqué si les DevTools sont ouverts ; inutilement intrusif.
- **Suggestion**: Retirer le `debugger` ou remplacer par une trace contrôlée.

## Hooks de composants qui enterrent les erreurs
- **Fichier**: exemple `_private/ionic/src/app/components/c8oforms.itemnavigateappactioneditor/c8oforms-itemnavigateappactioneditor.ts`
- **Lignes**: ~118-220
- **Symptôme**: Chaque hook (`onInit`, `ngOnChanges`, etc.) wrappe la logique dans `try { … } catch(e) { console.log(e) }`.
- **Impact**: Les erreurs runtime disparaissent du reporting Convertigo/Angular, rendant les bugs difficiles à diagnostiquer.
- **Suggestion**: Supprimer ces `try/catch` génériques ou relayer l’erreur vers `page.c8o.log.error` / le handler global.

## Annotation à surveiller
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: usage de `sha256(JSON.stringify(html))`
- **Note**: L’empreinte peut être identique pour une chaîne vide sur plusieurs champs ; conséquence identique à la collision d’HTML.

## Suivi
- Contrôler systématiquement la présence de `debugger` / `console.log` laissés dans la base (nombreux logs générés automatiquement).
- Après correction, relancer `JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew load` pour valider les YAML générateurs.


## Calcul initial de `itemSize` sur la mauvaise configuration
- **Fichier**: `_private/ionic/src/app/pages/selectorpage/selectorpage.ts`
- **Lignes**: ~138-154
- **Symptôme**: `computeItemSize()` est appelé avant `this.global.grid = true`. La première valeur est calculée comme une liste (hauteur 130) au lieu du mode grille (232), provoquant une hauteur incorrecte jusqu’au prochain resize.
- **Suggestion**: Affecter `this.global.grid` avant l’appel ou recalculer immédiatement après avoir positionné le flag.

## Listener `resize` non nettoyé et fragile
- **Fichier**: `_private/ionic/src/app/pages/selectorpage/selectorpage.ts`
- **Lignes**: ~148-151
- **Symptôme**: Le handler `window.addEventListener('resize', …)` est déclaré avec un callback anonyme : impossible de le retirer, et il peut se déclencher alors que `this.viewport` est encore `undefined`, provoquant `Cannot read properties of undefined (reading 'checkViewportSize')`.
- **Suggestion**: Stocker la fonction dans une propriété, vérifier la disponibilité de `viewport` avant l’appel et retirer le listener dans `ngOnDestroy`.

## `createAndStoreBlobUrl` sans révocation
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3762-3765
- **Symptôme**: Les `URL.createObjectURL` sont stockés dans `this.local.keepBlobs` mais jamais révoqués via `URL.revokeObjectURL`. Chaque mise à jour laisse les blobs en mémoire.
- **Suggestion**: Révoquer les URLs lorsqu’elles ne sont plus utilisées (ex. lors de la fermeture de page ou du rafraîchissement du contenu).


## Listener `backbutton` jamais retiré
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~371-386
- **Symptôme**: `window.document.addEventListener('backbutton', …)` est enregistré à chaque ouverture de la page sans être supprimé dans `ngOnDestroy`. On accumule des handlers qui déclenchent plusieurs fois la navigation ou appellent `navigator.app.exitApp()` même lorsque la page est en arrière-plan.
- **Suggestion**: Mémoriser la fonction et appeler `document.removeEventListener('backbutton', handler)` lors du teardown.

## `URL.createObjectURL` dans `reduceImageSize` non révoqué
- **Fichier**: `_private/ionic/src/app/pages/editorpage/editorpage.ts`
- **Lignes**: ~742-777
- **Symptôme**: Chaque compression d’image crée une URL objet (`URL.createObjectURL(file)`) pour l’aperçu mais ne la révoque jamais (`URL.revokeObjectURL`). Les éditions répétées consomment la mémoire du navigateur inutilement.
- **Suggestion**: Révoquer l’URL dans `img.onload` / `onerror` après usage.

## `createObjectURL` directement dans le template image
- **Fichier**: `_private/ionic/src/app/components/c8oforms.itemimgviewer/c8oforms-itemimgviewer.html`
- **Symptôme**: L’expression de binding appelle `this.local.URLO.createObjectURL(this.model.value)` à chaque cycle de détection. Chaque passage crée une nouvelle URL blob sans jamais libérer les anciennes.
- **Impact**: Fuite mémoire rapide dès qu’une image change ou que la page détecte des changements fréquents.
- **Suggestion**: Générer l’URL une fois (dans le TS) et la révoquer lorsqu’on change de valeur / détruit le composant.


## Intervalle IA jamais libéré
- **Fichier**: `_private/ionic/src/app/pages/aichat/aichat.ts`
- **Lignes**: ~845-880
- **Symptôme**: `ResetForm` démarre un `setInterval` pour mettre à jour le message de chargement (toutes les 6s) sans conserver la référence ni l’arrêter lors de la destruction de la page. Après chaque requête, un nouveau timer reste actif en arrière-plan.
- **Suggestion**: Stocker le handle dans `this` et appeler `clearInterval` dans `ngOnDestroy`/quand la réponse arrive.


## `navigator.app.exitApp()` sans garde
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~372-384
- **Symptôme**: Le handler `backbutton` appelle `navigator.app.exitApp()` dès que l’on est sur la première page. Sur un navigateur (PWA ou desktop), `navigator.app` est `undefined`, ce qui lève `Cannot read properties of undefined`. Le bouton retour cesse alors de fonctionner.
- **Suggestion**: Vérifier la présence de `navigator.app` avant l’appel, ou dédier la sortie uniquement aux plateformes Cordova.

## Listener `message` persistant dans SharedNocodeDatabase
- **Fichier**: `_private/ionic/src/app/components/c8oforms.sharednocodedatabase/c8oforms-sharednocodedatabase.ts`
- **Lignes**: ~510-540
- **Symptôme**: L’iframe Baserow installe `window.addEventListener('message', evt => …)` sans référence ni retrait dans `ngOnDestroy`. Chaque fois que l’on ouvre/ferme la config, un nouveau handler reste actif, pouvant traiter des messages d’autres origines et dégrader les perfs.
- **Suggestion**: Stocker la fonction (ex. `this.local.onMessage`) et la retirer dans `ngOnDestroy`.

## Intervalle IA jamais libéré
- **Fichier**: `_private/ionic/src/app/pages/aichat/aichat.ts`
- **Lignes**: ~845-880
- **Symptôme**: `ResetForm` crée un `setInterval` pour faire défiler la traduction du message de chargement sans stocker le handle ni l’annuler sur destruction. Chaque requête laisse un timer tourner en arrière-plan.
- **Suggestion**: Mémoriser l’identifiant (`this.loadingMessageInterval`) et le nettoyer (`clearInterval`) dès que la réponse arrive ou dans `ngOnDestroy`.


## Mise à jour des préférences sans gestion d’erreur
- **Fichier**: `_private/ionic/src/app/pages/settingspage/settingspage.ts`
- **Lignes**: ~320-335 et ~428-433
- **Symptôme**: Les appels à `page.c8o.callJsonObject(...).async()` ne sont ni `await`, ni chaînés avec un `catch`. Une erreur réseau rejette la promesse de manière non gérée, ce qui laisse l’IHM croire que la préférence a été enregistrée alors que le backend a échoué.
- **Suggestion**: `await` l’appel (ou retourner la promesse) et afficher une notification d’échec en cas de rejet.


## Génération d’HTML qui crée des ObjectURL à chaque rendu
- **Fichier**: `_private/ionic/src/app/pages/viewerpage/viewerpage.ts`
- **Lignes**: ~3880-3890
- **Symptôme**: Les expressions générées pour les champs fichiers/images (`tmpStr = \`+(()=>{ let url = URL.createObjectURL(file); ...})()+\``) appellent `URL.createObjectURL` à chaque évaluation de template sans jamais révoquer l’URL, même quand la valeur ne change pas.
- **Impact**: À chaque changement de détection, de nouvelles URLs blobs s’accumulent, provoquant une fuite mémoire rapide lors de l’affichage de pièces jointes.
- **Suggestion**: Pré-calculer les URLs dans le composant, les réutiliser et les révoquer explicitement avant de les recréer.
