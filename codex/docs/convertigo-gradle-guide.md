# Guide Gradle Convertigo

Ce document resume la maniere d exploiter `build.gradle` sur le projet C8Oforms pour charger, construire et deployer un projet Convertigo.

## 1. Pre requis

- Installer un JDK pris en charge par le plugin Convertigo (Java 11 ou 17 conseille). Verifier avec `java -version` et exporter `JAVA_HOME` si necessaire.
- Rendre le wrapper executable sous macOS/Linux: `chmod +x gradlew`.
- Pour les builds mobiles (`compileMobileBuilder`), disposer de Node.js et npm dans le `PATH`.
- Eventuellement configurer un proxy Maven via `~/.gradle/gradle.properties` si l environnement en a besoin.

## 2. Commandes de base

| Commande | Description | Notes |
| --- | --- | --- |
| `./gradlew load` | Charge et migre le projet vers la version du plugin (`build.gradle:23`). | Accepte des proprietes `convertigo.load.*` pour ajuster la version ou l endpoint. |
| `./gradlew generateMobileBuilder` | Regenerer les sources Ionic dans `_private/ionic` (`build.gradle:63`). | Utiliser `-Pconvertigo.generateMobileBuilder.mode=debugplus|debug|fast` pour changer le mode. |
| `./gradlew compileMobileBuilder` | Compiler l application mobile via npm (`build.gradle:71`). | Peut heriter du mode precedemment defini ou forcer `convertigo.compileMobileBuilder.mode`. |
| `./gradlew export` | Sauvegarder `c8oProject.yaml`, applique le remplacement 8.4.x -> 8.3.x (`build.gradle:43-59`). | Depend de `compileMobileBuilder` si `performsMobileBuild` est true. |
| `./gradlew car` | Produire le package `<project>.car` dans `build/` (`build.gradle:79-112`). | Parametrable via `convertigo.car.*` (destination, includeTestCases, etc.). |
| `./gradlew deploy` | Deployer le projet sur un serveur Convertigo (`build.gradle:114-142`). | Exige `convertigo.deploy.server`, `user`, `password`. |
| `./gradlew remoteBuild` | Preparer un build natif via Convertigo Build Gateway (`build.gradle:145-182`). | Voir `convertigo.remoteBuild.*` pour les certificats et plateformes. |
| `./gradlew localBuild` | Construire un package natif localement (`build.gradle:184-225`). | Necessite la configuration des certificats (`convertigo.localBuild.*`). |
| `./gradlew launchRemoteBuild` / `downloadRemoteBuild` | Lancer puis recuperer un build distant (`build.gradle:228-244`). | `downloadRemoteBuild` peut cibler un dossier via `convertigo.downloadRemoteBuild.destinationDir`. |
| `./gradlew wrapper --gradle-version 8.5` | Regenerer le wrapper Gradle (`build.gradle:246-253`). | A executer uniquement en cas de mise a jour du wrapper. |

## 3. Proprietes utiles

- `convertigo.performsMobileBuild`: par defaut true si `_c8oProject/mobilePages` existe (`build.gradle:21`). Passer `-Pconvertigo.performsMobileBuild=false` pour accelerer `export` quand le front n est pas requis.
- `convertigo.load.projectVersion`: forcer la version du projet au chargement.
- `convertigo.load.mobileApplicationEndpoint`: mettre a jour l endpoint mobile lors du `load`.
- `convertigo.car.destinationDir`: changer la destination du fichier `.car`.
- `convertigo.deploy.trustAllCertificates`: ignorer les certificats serveur (false par defaut).
- `convertigo.remoteBuild.platforms` / `convertigo.localBuild.platforms`: cibler une liste de plateformes, separees par des virgules.
- `convertigo.localBuild.mode`: choisir `debug` (defaut) ou `release`.

Toutes les proprietes Gradle sont passees en ligne de commande via `-Pnom=valeur` ou definies dans `gradle.properties`.

## 4. Scenarios types

### 4.1 Charger le projet

```
./gradlew load
```

Utiliser cette commande apres un pull pour appliquer les migrations de version et regenerer les metadonnees Convertigo.

### 4.2 Regenerer le front Ionic

```
./gradlew generateMobileBuilder compileMobileBuilder
```

`generateMobileBuilder` produit le code dans `_private/ionic`; `compileMobileBuilder` lance npm pour consolider le build. Ajouter `-Pconvertigo.generateMobileBuilder.mode=debugplus` pour un build debug enrichi.

### 4.3 Exporter le projet pour tests

```
./gradlew export -Pconvertigo.performsMobileBuild=false
```

Cette sequence re-ecrit `c8oProject.yaml` avec le tag `convertigo: 8.3.x` impose par le script (`build.gradle:50-58`). Le flag `performsMobileBuild` permet d eviter la recompilation Ionic lorsque seul le backend doit etre verifie.

### 4.4 Produire et deployer un package .car

```
./gradlew car
./gradlew deploy -Pconvertigo.deploy.server=https://myserver/convertigo \
                 -Pconvertigo.deploy.user=admin \
                 -Pconvertigo.deploy.password=admin
```

`car` genere un fichier dans `build/` et `deploy` le pousse vers le serveur si les proprietes sont renseignees. Ajouter `-Pconvertigo.deploy.trustAllCertificates=true` en environnement de dev si necessaire.

### 4.5 Valider une modification Convertigo

```
JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew load
```

Cette commande recharge le projet et recompile les YAML. Elle doit se conclure par `BUILD SUCCESSFUL`. Les avertissements listant des symboles globaux non definis indiquent simplement que des secrets/proprietes manquent dans l environnement; ils n empechent pas la validation du YAML. Si `JAVA_HOME` pointe deja sur un JDK 11 ou 17, la commande peut etre reduite a `./gradlew load`. En cas d echec, relancer avec `--stacktrace` pour obtenir plus de details.

## 5. Diagnostic et bonnes pratiques

- Si `./gradlew` affiche `Unable to locate a Java Runtime`, verifier l installation du JDK et relancer le terminal pour rafraichir le `PATH`.
- L option `--stacktrace` facilite l analyse en cas d erreur Gradle.
- `./gradlew tasks --group convertigo` liste les taches exposees par le plugin une fois Java disponible.
- Apres toute modification d un YAML Convertigo, relancer `JAVA_HOME=$(/usr/libexec/java_home -v 17) ./gradlew load` pour verifier que le projet se recharge correctement.
- Conserver les modifications de `build.gradle` sous controle de version; toute personnalisation doit etre documentee pour l equipe.
- Eviter d editer `_private/ionic` manuellement: les commandes ci-dessus regenerent ces fichiers a partir des YAML.

## 6. Checklist avant livraison

1. `JAVA_HOME` pointe vers un JDK supporte et `./gradlew --version` reussit.
2. Les proprietes Gradle incontournables sont definies (serveur de deploy, certificats, etc.).
3. Les tasks front (`generateMobileBuilder` / `compileMobileBuilder`) sont executees uniquement si necessaire.
4. Le `.car` produit est teste dans le serveur cible avant diffusion.
5. Les commandes utilisees sont consignees dans les comptes rendus pour reference future.
