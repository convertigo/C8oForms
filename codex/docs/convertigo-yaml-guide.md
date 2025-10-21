# Guide YAML Convertigo (YamlConverter)

Ce document explique comment ecrire un YAML compatible avec Convertigo. Il resume le comportement de `YamlConverter` (`engine/src/com/twinsoft/convertigo/engine/util/YamlConverter.java`) et sert de reference lorsque l on genere manuellement des fichiers `c8oProject.yaml` et `_c8oProject/*`.

## 1. Organisation generale d un projet shrinke

- Le projet racine est `c8oProject.yaml`. Il contient les beans principaux (projet, sequences, connecteurs, etc.).
- Les definitions volumineuses sont deplacees dans des sous-fichiers ranges dans le dossier `_c8oProject`. Par exemple : `_c8oProject/sequences/MySequence.yaml`.
- Une ligne de bean peut pointer vers un sous-fichier avec le symbole `🗏` :

```
↓MySequence [sequences.GenericSequence]: 🗏 sequences/MySequence.yaml
```

Le fichier reference doit exister dans `_c8oProject/<chemin>` et contenir la suite exacte du bean.

## 2. Symboles utilises dans le YAML

`YamlConverter` produit toujours un YAML base sur les symboles suivants :

| Symbole | Signification | Exemple |
| --- | --- | --- |
| `↓` | Bean Convertigo (objet) | `↓LogStep [steps.LogStep]` |
| `↑` | Attribut/Property d un bean | `↑comment: "Message"` |
| `→` | Texte ou CDATA | `→: |` suivi d un bloc multi-ligne |
| `🗏` | Deferement vers un sous-fichier | `: 🗏 sequences/MySequence.yaml` |

Chaque bean affiche sa cle `yaml_key` entre crochets : `Nom [package.Classe-priorite]`. La partie `-priorite` est optionnelle mais doit etre conservee si presente.

## 3. Indentation et listes

- L indentation est de **2 espaces**. Aucun tabulateur.
- Un bean enfant dans une collection est precede de `- `. Exemple pour la propriete `steps` d une sequence :

```
steps:
  - ↓StartLog [steps.LogStep]:
      ↑comment: "Trace"
      level: INFO
```

- Les proprietes complexes (SmartType, listes, etc.) sont representees par des sous-elements. `YamlConverter` repete automatiquement le motif `- ↑nom: valeur` lorsque l element parent n est pas un bean.

## 4. Attributs, proprietes et textes

- Les attributs ou proprietes simples d un bean se notent `↑nom: valeur`. Exemple : `↑isEnabled: false`.
- Les valeurs textuelles suivent les regles de `writeYamlText` :
  - Chaques valeur est nettoyee des retours chariot Windows.
  - Si la valeur commence par un caractere YAML special ou contient `: `, elle est entouree de quotes simples (`'`).
  - Une valeur vide devient `''`.
  - Les chaines multi-lignes utilisent un bloc `|` en conservant l indentation :

```
expression: |
  // premiere ligne
  return context.user;
```

- Lorsque le XML d origine contient du CDATA, `YamlConverter` ajoute un bloc `→:`. Dans la pratique, ecrire un bloc `→:` revient a fournir le contenu exact du CDATA :

```
→: |
  <soapenv:Envelope>...</soapenv:Envelope>
```

## 5. Gestion des sous-fichiers (`🗏`)

- Lorsqu un bean possede l attribut XML `yaml_file`, son contenu est ecrit dans `_c8oProject/<yaml_file>`.
- Le bean parent dans `c8oProject.yaml` ne contient alors que la ligne `↓...: 🗏 chemin`.
- Le fichier cible reprend la meme notation que si le bean etait inline, sans indentation supplementaire.
- `YamlConverter` nettoie automatiquement les fichiers orphelins dans `_c8oProject`. Conserver les chemins existants pour eviter des suppressions involontaires.

## 6. Exemple complet (sequence simplifiee)

`c8oProject.yaml` :

```
↓MyProject [core.Project]:
  sequences:
    - ↓MySequence [sequences.GenericSequence]: 🗏 sequences/MySequence.yaml
```

`_c8oProject/sequences/MySequence.yaml` :

```
↓MySequence [sequences.GenericSequence]:
  ↑comment: "Sequence de demonstration"
  steps:
    - ↓StartLog [steps.LogStep]:
        level: INFO
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

## 7. Checklist pour generer un YAML valide

1. Respecter les symboles (`↓`, `↑`, `→`, `🗏`) et la casse des classes.
2. Utiliser une indentation de 2 espaces et conserver l ordre existant des elements.
3. Quoter les valeurs selon les regles ci-dessus; utiliser `|` pour tout contenu multi-ligne.
4. Lorsqu un bean reference un sous-fichier, verifier que `_c8oProject/<chemin>` existe et contient la definition complete.
5. Conserver les priorites (`-123456789`) dans la cle `yaml_key` lorsqu elles sont presentes.
6. Tester la reimportation dans Convertigo Studio si possible pour valider le YAML.
