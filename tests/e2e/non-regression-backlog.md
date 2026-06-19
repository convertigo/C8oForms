# Backlog des tests de non-regression

Derniere mise a jour: 2026-06-19

Cette liste reprend les tickets candidats selectionnes pour les prochains tests de non-regression, tries du plus simple au plus complexe. Le classement tient compte du nombre d'ecrans Studio a manipuler, de la presence ou non d'une source externe, et du risque de RED invalide lie au setup.

## Simple

| Ticket | Titre | Pourquoi c'est simple | Proposition de test |
| --- | --- | --- | --- |
| [#1354](https://github.com/convertigo/C8oForms/issues/1354) | Remove the "Question" section from Button components (misleading, CSS is configured in "Style") | Verification UI directe sur la configuration d'un composant Button, sans Baserow, preview ni workflow complexe. | Creer un formulaire, ajouter un Button, ouvrir sa configuration, verifier que la section "Question" n'est pas presente et que la configuration CSS reste accessible via "Style". |
| [#1353](https://github.com/convertigo/C8oForms/issues/1353) | "Sort" filter shows infinite progress bar when Data source is not configured | Test centre sur un etat vide du Studio. Pas besoin de source de donnees reelle si le bug porte bien sur l'absence de configuration. | Creer un formulaire, ouvrir la configuration d'un composant avec filtre "Sort", ne pas configurer de Data source, verifier que l'UI ne reste pas bloquee sur un spinner infini. |

## Moyen

| Ticket | Titre | Pourquoi c'est moyen | Proposition de test |
| --- | --- | --- | --- |
| [#1395](https://github.com/convertigo/C8oForms/issues/1395) | Dynamic fields[id] default values resolve to the target field value | Deja couvert localement par `e2e/issue-1395.spec.ts`. Le flow reste raisonnable, mais necessite Monaco et une assertion preview. | Conserver comme reference: creer deux champs texte, renseigner `select1`, configurer `fields[id]` en JS sur le second champ, verifier en preview que la valeur est resolue. |
| [#1370](https://github.com/convertigo/C8oForms/issues/1370) | Message configuration of a Toast component writes "true" instead of inserting the component chip in text mode | Necessite un workflow, une action Toast et la Source Palette. Le risque principal est de cliquer au mauvais niveau dans la configuration de l'action. | Creer un formulaire avec un champ temoin et un Button, ajouter une action Toast au flow du bouton, inserer le champ dans le message en mode texte via Source Palette, verifier que le chip/texte attendu est insere et pas `true`. |

## Complexe

| Ticket | Titre | Pourquoi c'est complexe | Proposition de test |
| --- | --- | --- | --- |
| [#1334](https://github.com/convertigo/C8oForms/issues/1334) | Fields in "If condition" action show no operator (empty box) | Manipulation d'une action conditionnelle dans les workflows. Le test doit distinguer un probleme de setup d'un vrai probleme d'affichage des operateurs. | Creer un formulaire avec un champ source, ajouter un Button, configurer une action If, choisir un champ dans la condition, verifier que la liste des operateurs est renseignee et selectionnable. |
| [#1335](https://github.com/convertigo/C8oForms/issues/1335) | Then/Else sections are empty and cannot be configured in "If" condition action | Meme zone que #1334 mais avec validation des branches Then/Else, donc plus de navigation dans le flow et plus de risques de selectors instables. | Creer un Button avec une action If, ouvrir Then et Else, ajouter une action simple dans chaque branche, verifier que les sections ne sont pas vides et restent configurables. |

## Regroupement conseille

#1334 et #1335 peuvent probablement etre traites dans une meme phase d'exploration, car ils concernent tous les deux l'action "If condition". En revanche, il vaut mieux garder deux specs si les assertions finales sont differentes: une pour les operateurs de condition, une pour la configurabilite des branches Then/Else.
