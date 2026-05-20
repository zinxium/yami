# Ya Mi — Palette & Direction Visuelle

> **Version 1.0** — Identité visuelle officielle

---

## Vision de la marque

Ya Mi est une application de gestion de prêts personnels entre particuliers.
L'identité visuelle transmet :

- la **confiance**
- la **stabilité**
- la **simplicité**
- la **proximité humaine**
- une approche **moderne** de la finance personnelle

> Ya Mi ne ressemble pas à une banque traditionnelle ni à une plateforme crypto.
> Ya Mi est une **fintech humaine, élégante et accessible.**

---

## Palette de couleurs officielle

### 1. Burgundy — Couleur principale

```
Hex : #800020
RGB : 128, 0, 32
```

**Signification :**
Confiance, sérieux, responsabilité, accords et contrats, stabilité financière.
Contrairement aux fintechs classiques (bleu ou vert), le burgundy apporte une sensation plus chaleureuse et humaine tout en gardant un aspect premium.

**Utilisation :**
- Boutons CTA principaux
- Header et navigation
- Identité principale de la marque
- Éléments importants de l'interface

---

### 2. Burgundy foncé — Profondeur UI

```
Hex : #4d0013
RGB : 77, 0, 19
```

**Signification :**
Contraste, profondeur, sophistication.

**Utilisation :**
- États hover et actifs
- Fonds de sections premium
- Textes sur surfaces claires
- Alertes critiques (retard, impayé)
- Éléments premium

---

### 3. Mustard — Couleur d'accent

```
Hex : #ffdb58
RGB : 255, 219, 88
```

**Signification :**
Chaleur, énergie, proximité, valeur, accessibilité.
Le mustard casse le côté institutionnel de la finance et donne à Ya Mi une personnalité humaine.

**Utilisation :**
- Badges et highlights
- Statistiques positives
- Notifications de rappel
- Accents visuels
- Éléments de mise en avant

> ATTENTION : Le mustard doit être utilisé **avec modération** pour garder une interface élégante et équilibrée.

---

### 4. Crème — Fond principal

```
Hex : #FAF7F2
RGB : 250, 247, 242
```

**Signification :**
Douceur, modernité, confort visuel, respiration dans l'interface.
Évite l'effet froid ou clinique d'un blanc pur.

**Utilisation :**
- Fond principal de l'application
- Sections secondaires
- Surfaces UI larges
- Fond des écrans mobiles

---

### 5. Graphite foncé — Texte principal

```
Hex : #222222
RGB : 34, 34, 34
```

**Signification :**
Lisibilité, confort de lecture, élégance.
Plus doux et premium qu'un noir pur (#000000).

**Utilisation :**
- Textes principaux
- Titres et headings
- Informations financières (montants, dates)
- Contenu général

---

### 6. Dust Grey — Gris UI

```
Hex : #cfcfcf
RGB : 207, 207, 207
```

**Signification :**
Équilibre, légèreté, neutralité.

**Utilisation :**
- Bordures et séparateurs
- Inputs et formulaires
- Cartes secondaires
- Placeholders
- Éléments désactivés

---

## Récapitulatif de la palette

| Rôle | Nom | Hex | Usage principal |
|------|-----|-----|-----------------|
| Principale | Burgundy | `#800020` | CTA, header, navigation |
| Profondeur | Burgundy foncé | `#4d0013` | Hover, actif, alertes |
| Accent | Mustard | `#ffdb58` | Badges, highlights (modéré) |
| Fond | Crème | `#FAF7F2` | Background général |
| Texte | Graphite | `#222222` | Textes, titres, chiffres |
| UI | Dust Grey | `#cfcfcf` | Bordures, inputs, séparateurs |

---

## Direction Visuelle

### Principes généraux

- **Minimaliste** — peu d'éléments, chacun à sa place
- **Moderne** — lignes propres, pas d'ornementation inutile
- **Premium** — chaque détail compte
- **Chaleureuse** — humanité dans chaque interaction
- **Mobile-first** — pensé pour le pouce, pas pour la souris

> L'interface doit laisser beaucoup d'espace respirer. Pas de surcharge visuelle.

---

### Typographie

#### Hiérarchie recommandée

| Niveau | Taille | Poids | Couleur | Usage |
|--------|--------|-------|---------|-------|
| Titre principal | 28px | 500 | `#222222` | Nom de l'écran |
| Section heading | 20px | 500 | `#800020` | Titres de sections |
| Corps de texte | 15px | 400 | `#222222` | Contenu général |
| Label secondaire | 12px | 400 | `#888888` | Dates, métadonnées |
| Badge / catégorie | 11px | 500 | Variable | Uppercase + letter-spacing |
| Chiffres financiers | 32px | 500 | `#222222` | Monospace — montants |

#### Règles typographiques

- Titres en sentence case (pas de ALL CAPS généralisé)
- Chiffres financiers en police monospace pour alignement
- Line-height : 1.6 minimum pour les corps de texte
- Pas de texte blanc sur fond mustard → utiliser `#4d0013` ou `#7a5f00`

---

### Composants UI

#### Cartes (Cards)

```
- Border-radius : 12px
- Border : 0.5px solid #e8e4dc
- Background : #ffffff
- Padding : 16px
- Shadow : légère (4px, opacité 8%) ou aucune
```

#### Boutons

```
CTA principal   → background #800020, texte #ffffff, radius 8px
CTA secondaire  → border 1.5px #800020, texte #800020, transparent
CTA accent      → background #ffdb58, texte #4d0013, radius 8px
Désactivé       → background #cfcfcf30, texte #888888, border #cfcfcf
```

Tous les boutons : padding `10px 16px`, font-size `14px`, font-weight `500`.

#### Inputs

```
- Border : 0.5px solid #cfcfcf (repos)
- Border focus : 1.5px solid #800020
- Border-radius : 8px
- Background : #ffffff
- Placeholder : #cfcfcf
- Font-size : 13-14px
```

#### Badges et statuts

| Statut | Background | Texte | Border |
|--------|-----------|-------|--------|
| Actif | `#800020` | `#ffffff` | — |
| En retard | `#4d001320` | `#4d0013` | `#4d001340` |
| Remboursé | `#22222215` | `#555555` | `#cfcfcf` |
| Partiel | `#ffdb5830` | `#7a5f00` | `#ffdb5870` |
| Nouveau | `#ffdb58` | `#4d0013` | — |

#### Cartes de statistiques (Dashboard)

```
- Border-radius : 10px
- Border-left : 3px solid [couleur selon statut]
- Background : version transparente (10-15%) de la couleur
- Padding : 14px
- Chiffre : 22px, font-weight 500, monospace
- Label : 11px, uppercase, letter-spacing 0.05em
```

---

### Espacements

```
xs  :  4px
sm  :  8px
md  : 12px
lg  : 16px
xl  : 24px
2xl : 32px
3xl : 48px
```

Utiliser des multiples de 4px. L'interface doit respirer — préférer espacements généreux.

---

### Border-radius

```
Petit (tags, badges)  :  20px (pill)
Inputs, boutons       :  8px
Cartes                :  12px
Modales               :  16px
Avatar                :  50% (cercle)
```

---

## Règles d'or

1. **Le burgundy domine** — c'est la couleur de l'identité, pas une couleur parmi d'autres.
2. **Le mustard est rare** — une touche d'accent, pas un fond de page.
3. **Le crème respire** — laisser de l'espace, ne pas remplir tous les blancs.
4. **Les chiffres sont lisibles** — monospace, taille généreuse, toujours en graphite.
5. **Pas de blanc pur** — utiliser le crème `#FAF7F2` comme fond, jamais `#ffffff` en background d'écran.
6. **Jamais de texte blanc sur mustard** — utiliser `#4d0013` ou `#7a5f00` pour garantir le contraste.

---

## Identité émotionnelle

Ya Mi doit donner cette sensation :

> *"Je peux prêter de l'argent à quelqu'un de manière sérieuse, simple et sécurisée."*

L'expérience utilisateur doit rester :

- **Humaine** — des vraies personnes, pas des numéros de compte
- **Rassurante** — chaque action est claire et confirmée
- **Élégante** — premium sans être inaccessible
- **Accessible** — simple à comprendre au premier regard

---

> *Ya Mi n'est PAS une banque.*
> *Ya Mi est une plateforme intelligente de gestion de prêts personnels.*