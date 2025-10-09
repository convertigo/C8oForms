# Reference des steps utilisables dans une sequence Convertigo

Ce document rappelle a Codex la liste des steps qu'il peut placer dans une sequence Convertigo, la maniere de les ecrire dans un fichier YAML de projet et le role fonctionnel de chacun.

## Sequence vs step Sequence JS

- **Une sequence** (`GenericSequence`) est une requestable Convertigo complete. Elle orchestre des steps, expose des variables, peut avoir des feuilles XSL et devient un service REST/SOAP.
- **Sequence JS** est un **step** (`steps.SimpleStep`) que l'on insere *dans* une sequence pour executer du JavaScript inline. Il ne remplace pas une sequence.

Lorsque l'on parle ici de "sequence", il s'agit bien du fichier YAML `sequences/<NomSequence>.yaml` decrivant l'objet `GenericSequence`.

## Structure YAML d'une sequence

Convertigo stocke les projets "shrinkes" sous forme de YAML. Les sequences se trouvent dans `sequences/<NomSequence>.yaml`. Quelques rappels :

- Chaque bean est ecrit avec la notation `↓Nom [package.Classe-ordre]`.
- Les attributs simples sont prefixes par `↑`.
- Les proprietes (valeurs, SmartTypes, etc.) sont exprimees sous la forme `propriete: valeur`. Les valeurs multilignes sont automatiquement converties en bloc `|`.
- Les collections sont des tableaux YAML standards (prefixe `-`).

### Exemple minimal

```yaml
↓MySequence [sequences.GenericSequence]:
  ↑comment: "Declenche le traitement de nuit"
  sheetLocation: None
  steps:
    - ↓StartLog [steps.LogStep]:
        level: INFO
        logger: cems.Context
        expression: "'Start ' + context.user"
    - ↓Guard [steps.IfStep]:
        condition: "context.user != null"
        ↓Then [steps.ThenStep]:
          - ↓CallBackend [steps.TransactionStep]:
              sourceTransaction: "MyConnector.myTransaction"
        ↓Else [steps.ElseStep]:
          - ↓Stop [steps.ReturnStep]:
              expression: "'Missing user'"
```

Points cles :

- La propriete `steps` contient un tableau d'items `- ↓NomStep [steps.<Classe>]`.
- Certains steps (ex. `IfThenElse`, `FunctionStep`, `ParallelStep`) encapsulent a leur tour une collection de steps enfants, de nouveau sous forme de tableau.
- Si un step ne necessite pas de propriete additionnelle, il suffit de le declarer vide (`- ↓BreakLoop [steps.BreakStep]:`).

## Regles pratiques pour les steps

- Nommer explicitement chaque step pour faciliter les sources (`↓NomStep [steps.XxxStep]`).
- Utiliser les proprietes exposees par le BeanInfo (champ `set/get` correspondant). Le nom YAML est identique au nom Java (camelCase).
- Les proprietes de type SmartType comportent les sous-champs `mode`, `smartValue`, etc. Conserver la structure generee par Convertigo.
- Les steps disposent tous des attributs standards (`↑isEnabled`, `↑output`, `↑comment`) mais ils ne doivent etre ajoutes que lorsqu'on s'ecarte de la valeur par defaut.

## Catalogue des steps

Les tableaux ci-dessous listent les steps disponibles dans une sequence, repartis par thematique. Le nom de cle YAML correspond a la valeur attendue dans les crochets (`[steps.<Classe>]`).

### Flux & orchestration

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Block | `steps.BlockStep` | Conteneur generique pour regrouper ou factoriser des steps. |
| Branch | `steps.BranchStep` | Selectionne et execute un step enfant en fonction d'un nom calcule. |
| jBreak | `steps.BreakStep` | Interrompt l'execution de la boucle ou du bloc courant. |
| jDoWhile | `steps.DoWhileStep` | Boucle `do...while` basee sur une condition JavaScript. |
| jElse | `steps.ElseStep` | Branche `else` d'un bloc conditionnel. |
| jException | `steps.ExceptionStep` | Leve une exception Convertigo personnalisee. |
| jFunction | `steps.FunctionStep` | Declare un bloc de steps reutilisable et retournant une valeur. |
| IfExist | `steps.IfExistStep` | Condition `if` verifiant l'existence de noeuds via XPath. |
| IfExistThenElse | `steps.IfExistThenElseStep` | Variante avec branches `then` / `else` sur XPath. |
| IfFileExists | `steps.IfFileExistStep` | Teste l'existence d'un fichier ou repertoire. |
| IfFileExistsThenElse | `steps.IfFileExistThenElseStep` | Condition fichier avec branches `then` / `else`. |
| jIf | `steps.IfStep` | Condition JavaScript simple avec bloc enfant. |
| jIfThenElse | `steps.IfThenElseStep` | Condition JavaScript avec branches `then` et `else`. |
| IfIsIn | `steps.IsInStep` | Verifie la presence d'une valeur dans une source (XPath). |
| IfIsInThenElse | `steps.IsInThenElseStep` | Condition `isIn` avec branches `then` / `else`. |
| Iterator | `steps.IteratorStep` | Itere sur un ensemble de noeuds XPath et execute des steps pour chacun. |
| Loop | `steps.LoopStep` | Repete un sous-ensemble de steps selon un compteur incremental. |
| Parallel | `steps.ParallelStep` | Execute les steps enfants en parallele (threads). |
| Serial | `steps.SerialStep` | Force l'execution sequentielle des steps enfants (utile apres un Parallel). |
| jIterator | `steps.SimpleIteratorStep` | Itere sur une liste issue d'une expression JavaScript. |
| jThen | `steps.ThenStep` | Branche `then` d'un bloc. |
| jWhile | `steps.WhileStep` | Boucle `while` JavaScript evaluee avant chaque iteration. |
| Return | `steps.ReturnStep` | Stoppe la sequence (ou une fonction) et renvoie une valeur optionnelle. |
| Test | `steps.TestStep` | Verifie qu'une expression (XPath, RegExp, etc.) est vraie, sinon leve une erreur. |

### Integration Convertigo

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Call Sequence | `steps.SequenceStep` | Appelle une autre sequence Convertigo. |
| Call Transaction | `steps.TransactionStep` | Appelle une transaction d'un connecteur. |
| Input variables | `steps.InputVariablesStep` | Injecte les variables d'entree dans le flux XML courant. |

### Sources & scripting (JS)

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Sequence JS | `steps.SimpleStep` | Bloc de JavaScript arbitraire execute cote serveur. |
| jSimpleSource | `steps.SimpleSourceStep` | Extrait un texte (XPath) et le place dans une variable JavaScript. |
| jSource | `steps.SourceStep` | Extrait une liste de noeuds XPath dans une variable JavaScript. |
| JsonSource | `steps.JsonSourceStep` | Recupere une structure JSON typee a partir d'une source et la lie au scope JS. |

### Donnees JSON

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Array | `steps.JsonArrayStep` | Cree un tableau JSON dans le flux resultant. |
| Field | `steps.JsonFieldStep` | Ajoute un champ JSON de type primitif. |
| Object | `steps.JsonObjectStep` | Cree un objet JSON et contient ses champs enfants. |
| JSON to XML | `steps.JsonToXmlStep` | Convertit un texte ou objet JSON en structure XML typee. |

### Donnees XML

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| jAttribute | `steps.AttributeStep` | Genere un attribut XML via expression JavaScript. |
| jElement | `steps.ElementStep` | Genere un element XML via expression JavaScript. |
| Action | `steps.XMLActionStep` | Applique des actions successives sur une liste de sources XML. |
| Attribute | `steps.XMLAttributeStep` | Ajoute un attribut XML statique ou issu d'un SmartType. |
| Complex | `steps.XMLComplexStep` | Cree un element conteneur vide pour y ajouter des steps enfants. |
| Concat | `steps.XMLConcatStep` | Concatene plusieurs sources dans un seul element texte. |
| Copy | `steps.XMLCopyStep` | Copie des noeuds XML existants a un nouvel emplacement. |
| Count | `steps.XMLCountStep` | Calcule un `count()` XML et expose la valeur. |
| Date/Time | `steps.XMLDateTimeStep` | Formate une date/heure et la restitue en XML. |
| Element | `steps.XMLElementStep` | Cree un element XML avec contenu texte. |
| Error structure | `steps.XMLErrorStep` | Produit une structure XML normalisee d'erreur applicative. |
| Generate dates | `steps.XMLGenerateDatesStep` | Genere une serie de dates a partir de parametres (debut, fin, pas). |
| Generate | `steps.XMLGenerateStep` | Produit dynamiquement des steps enfants a partir d'une definition d'entree. |
| Sort | `steps.XMLSortStep` | Trie des noeuds XML selon une cle XPath. |
| Split | `steps.XMLSplitStep` | Decoupe un texte en elements XML separes. |
| Transform | `steps.XMLTransformStep` | Remplace via expressions regulieres dans du contenu XML. |

### Fichiers & systemes

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Copy file | `steps.CopyStep` | Copie un fichier ou repertoire vers une autre destination. |
| Create directory | `steps.CreateDirectoryStep` | Cree un nouveau dossier. |
| Delete file | `steps.DeleteStep` | Supprime un fichier ou un dossier. |
| Duplicate file | `steps.DuplicateStep` | Duplique un fichier ou dossier sur place avec suffixe. |
| Hash code | `steps.GenerateHashCodeStep` | Calcule l'empreinte (hash) d'un fichier. |
| List directory | `steps.ListDirStep` | Liste le contenu d'un dossier. |
| Move file (MoveStep) | `steps.MoveStep` | Deplace un fichier ou dossier (API multi-plateforme). |
| Move file (MoveFileStep) | `steps.MoveFileStep` | Deplace un fichier (chemins simples, historiques). |
| Rename file | `steps.RenameStep` | Renomme un fichier ou dossier. |
| Read file | `steps.ReadFileStep` | Lit un fichier texte ou binaire via SmartType. |
| Read CSV | `steps.ReadCSVStep` | Lit un fichier CSV et le convertit en XML. |
| Read JSON | `steps.ReadJSONStep` | Lit un fichier JSON et le charge en XML type. |
| Read XML | `steps.ReadXMLStep` | Lit un fichier XML et l'injecte tel quel. |
| Write File | `steps.WriteFileStep` | Ecrit du contenu (texte ou binaire) dans un fichier. |
| Write CSV | `steps.WriteCSVStep` | Genere un fichier CSV depuis des donnees XML. |
| Write JSON | `steps.WriteJSONStep` | Exporte des donnees XML en JSON (fichier). |
| Write XML | `steps.WriteXMLStep` | Exporte des donnees XML dans un fichier. |
| Write binary from Base64 | `steps.WriteBase64Step` | Decode un Base64 et ecrit le binaire resultant. |
| Process execute | `steps.ProcessExecStep` | Execute une commande externe sur le serveur. |
| Form PDF | `steps.PdfFormStep` | Remplit les champs d'un formulaire PDF et produit un PDF final. |

### Session & contexte

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Get authenticated user | `steps.GetAuthenticatedUserStep` | Lit l'identifiant utilisateur stocke dans le contexte/session. |
| Remove authenticated user | `steps.RemoveAuthenticatedUserStep` | Efface l'identite authentifiee du contexte/session. |
| Set authenticated user | `steps.SetAuthenticatedUserStep` | Positionne l'utilisateur authentifie courant. |
| Get object from session | `steps.SessionGetObjectStep` | Recupere un objet (Java) stocke en session. |
| Get from session | `steps.SessionGetStep` | Recupere une valeur simple de session. |
| Remove from session | `steps.SessionRemoveStep` | Supprime une cle de session. |
| Set object in session | `steps.SessionSetObjectStep` | Stocke un objet Java en session. |
| Set in session | `steps.SessionSetStep` | Stocke une valeur simple de session. |
| Remove context | `steps.RemoveContextStep` | Detruit un contexte Convertigo nomme. |
| Remove session | `steps.RemoveSessionStep` | Termine la session HTTP courante. |
| Get request header | `steps.GetRequestHeaderStep` | Lit la valeur d'un en-tete HTTP entrant. |
| Set response header | `steps.SetResponseHeaderStep` | Ajoute ou modifie un en-tete HTTP de reponse. |
| Set response status | `steps.SetResponseStatusStep` | Definit le code HTTP de la reponse. |
| LDAP Authentication | `steps.LDAPAuthenticationStep` | Authentifie un utilisateur aupres d'un annuaire LDAP. |

### Communications & notifications

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| SMTP send | `steps.SmtpStep` | Envoie un e-mail via SMTP. |
| Push Notifications | `steps.PushNotificationStep` | (Deprecie) Envoie une notification mobile via push. |

### Utilitaires

| Step (palette) | Cle YAML | Role |
| --- | --- | --- |
| Log | `steps.LogStep` | Ecrit un message dans le log Convertigo (logger et niveau configurables). |
| Sleep | `steps.SleepStep` | Suspend l'execution pendant un delai. |

## Autres elements possibles dans une sequence

En plus des steps, un fichier `sequences/<NomSequence>.yaml` peut inclure :

- **Variables** (`↓NomVariable [variables.RequestableVariable]`, `...HttpVariable`, etc.) a declarer sous la propriete `variables`.
- **Cas de test** (`↓NomTest [core.TestCase]`) pour automatiser des scenarios d'appel.
- **Feuilles XSL** (`↓Sheet [core.Sheet]`) si `sheetLocation: From sequence`.

Les definitions YAML suivent les memes conventions `↓/↑` que pour les steps.

## Ressources utiles

- Descriptions detaillees : `sequence-step-details.md` (liste des parametres et effets) et `sequence-step-properties.md` (tableau des resumes).
- Conventions YAML : `convertigo-yaml-guide.md`.
- Proprietes exposees : se reporter a la documentation officielle Convertigo (BeanInfo des steps).
- Generateur YAML : la classe `YamlConverter` du moteur Convertigo.

Ces ressources permettent de verifier les noms exacts de proprietes ou les valeurs par defaut que Codex doit respecter lors de la generation d'une sequence.
