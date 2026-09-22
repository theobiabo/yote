# Tokens

The skill designs against **token names and roles, never values.** Values belong to whoever themes the library. A consumer who sets `--yote-feature-base: #0f6dff` and `--yote-radius-md: 4px` in their own stylesheet should get designs, specs and code in their blue and their radius, not Yöte's purple and 12px.

## Resolving the values for this project

Run this before quoting any value, passing files in the order the app loads them:

```bash
node scripts/resolve-tokens.mjs node_modules/yote-ui/dist/styles.css app/globals.css
```

Where to look, in order:

1. The library defaults: `node_modules/yote-ui/dist/styles.css` (or `packages/yote-ui/src/styles.css` inside the Yöte repo).
2. The consumer's overrides: whichever global stylesheet declares `--yote-*` (commonly `app/globals.css`, `src/index.css`, `styles/theme.css`). Search for `--yote-` if unsure.
3. Scoped overrides: any selector other than `:root` / `[data-theme]` that sets `--yote-*` (a card, a modal, a `.checkout` wrapper).

Later files win, matching the cascade. The script prints the resolved value per theme with its source file, and warns about the two ways a theme half-applies (below).

**No stylesheet available** (a pure design conversation, no repo): ask once for the user's `:root` token block. If they don't have one, use the defaults column below and label every value as a Yöte default.

**The user pastes tokens in chat:** treat the pasted block as the override file.

## Rules for using resolved values

- **Refer to tokens by name in specs and code.** Write `border-color: var(--yote-feature-base)`, never the hex. Quote resolved values only where a human needs to see them (a Figma spec, a contrast check).
- **Judge by resolved value, not by default.** Contrast, ring visibility and dark derivation are checked against what the project actually resolves to. A consumer who darkens `--yote-text-soft` may have made it safe for sentences; a consumer who lightens it may have broken placeholders.
- **Missing role, add a token.** If the design needs a value no role covers, propose `--yote-<name>` with a default, add it to every theme block, and say so. Never inline a literal.
- **Respect a consumer's deliberate departure.** If they set `--yote-radius-md: 4px`, the ramp is now 8 / 4 / 4 unless they also changed `sm`. Point out the inversion once; don't "fix" it.

## Two ways an override half-applies

**One dark block, not both.** Dark is declared under `@media (prefers-color-scheme: dark)` and under `[data-theme='dark']`. An override in only one leaves system-dark and toggled-dark disagreeing. Put dark overrides in both.

**Scoped override of a composed token's input.** `--yote-focus-active` and `--yote-focus-error` read other tokens through `var()`, and a custom property resolves at the element where it is declared. Overriding `--yote-purple-alpha-24` on `:root` works. Overriding it on `.checkout` does not: descendants inherit the ring already baked on `:root`. Restate the composed token in the same scope.

```css
.checkout {
  --yote-purple-alpha-24: rgba(15, 109, 255, 0.24);
  --yote-focus-active: 0 0 0 2px var(--yote-bg-default), 0 0 0 4px var(--yote-purple-alpha-24);
}
```

## Role contract

The names and roles are the contract; the defaults column is what Yöte ships. Dark defaults are provisional.

### Surfaces, strokes and text

| Token | Role | Yöte default (light / dark) |
| --- | --- | --- |
| `--yote-bg-default` | Field fill: idle, focused, error | `#ffffff` / `#0c0c0c` |
| `--yote-bg-surface` | Hover fill, disabled fill | `#f7f7f7` / `#161616` |
| `--yote-bg-layer` | Hover border | `#f5f5f5` / `#1c1c1c` |
| `--yote-bg-subtle` | Empty tracks and segments | `#ebebeb` / `#262626` |
| `--yote-stroke-soft` | Idle border | `rgba(0,0,0,0.05)` / `rgba(255,255,255,0.08)` |
| `--yote-text-strong` | Values, labels | `#171717` / `#f2f2f2` |
| `--yote-text-sub` | Hints, messages, kbd hints | `#5c5c5c` / `#a3a3a3` |
| `--yote-text-soft` | Placeholders, icons, affixes, counters | `#a3a3a3` / `#6f6f6f` |
| `--yote-text-disabled` | Disabled text, "(Optional)" | `#d1d1d1` / `#4a4a4a` |
| `--yote-scroll-thumb` | Scrollbar thumb inside a panel | `rgba(0,0,0,0.16)` / `rgba(255,255,255,0.18)` |
| `--yote-flag-ring` | Hairline around a flag or other round mark | `rgba(0,0,0,0.16)` / `rgba(255,255,255,0.24)` |

### Brand and status

| Token | Role | Yöte default (light / dark) |
| --- | --- | --- |
| `--yote-feature-base` | Focus border, accent | `#7d52f4` / `#9a78f7` |
| `--yote-feature-dark` | Caret | `#351a75` / `#c4aefa` |
| `--yote-purple-alpha-24` | Focus ring tint (named for the default hue; holds whatever accent tint the theme uses) | `rgba(125,82,244,0.24)` / `rgba(154,120,247,0.28)` |
| `--yote-error-base` | Error border, text, digits | `#fb3748` / `#ff6170` |
| `--yote-error-faint` | Error ring tint | `#ffc0c5` / `rgba(255,97,112,0.22)` |
| `--yote-info-base` | Required asterisk | `#335cff` / `#6e8bff` |
| `--yote-success-base` | Met, strong | `#1fc16b` / `#3ad98a` |
| `--yote-warning-base` | Partial | `#fa7319` / `#ff8f3d` |

### Popover

| Token | Role | Yöte default (light) |
| --- | --- | --- |
| `--yote-popover-bg` | Panel fill | `#ffffff` |
| `--yote-popover-border` | Panel border | `rgba(0,0,0,0.06)` |
| `--yote-popover-active` | Highlighted row | `#f5f5f5` |
| `--yote-popover-shadow` | Panel shadow | `0 2px 4px -1px rgba(0,0,0,0.04), 0 12px 32px -8px rgba(0,0,0,0.14)` |

A floating panel has its own set because on light it separates by shadow and on dark there is no shadow to see, so dark lifts the surface instead.

### Radius, shadow and focus

| Token | Role | Yöte default |
| --- | --- | --- |
| `--yote-radius-sm` | `sm` controls, tags, kbd | 8px |
| `--yote-radius-md` | `md` and `lg` controls | 12px |
| `--yote-radius-lg` | Larger surfaces | 16px |
| `--yote-radius-xl` | Digit cells | 24px |
| `--yote-shadow-field` | Idle control | `0 2px 4px 0 rgba(54,54,54,0.04)` |
| `--yote-shadow-field-hover` | Hovered control | `0 2px 4px 0 rgba(138,138,138,0.08)` |
| `--yote-shadow-xs` | Digit cells | `0 2px 4px -1px rgba(0,0,0,0.02), 0 5px 13px -5px rgba(0,0,0,0.05)` |
| `--yote-focus-active` | Focus ring (composed) | `0 0 0 2px var(--yote-bg-default), 0 0 0 4px var(--yote-purple-alpha-24)` |
| `--yote-focus-error` | Error ring (composed) | `0 0 0 2px var(--yote-bg-default), 0 0 0 4px var(--yote-error-faint)` |

### Motion

| Token | Role | Yöte default |
| --- | --- | --- |
| `--yote-ease-out` | Every entrance, ring fade, shake | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--yote-duration` | State transitions | `160ms` |

Durations for entrances (140 / 180ms), the shake (280ms) and the caret (1.06s) are fixed in the component CSS rather than tokens. If a consumer lowers `--yote-duration`, keep those proportionate rather than untouched.

### Component-scoped properties

Each component exposes its measured geometry as properties on its root (`--yote-input-pad-y`, `--yote-input-radius`, `--yote-ta-height`, `--yote-ta-radius`, `--yote-phone-radius`, `--yote-pw-radius` and so on). They default to the global tokens and can be overridden per instance with `style`. The resolver lists them under their selectors. A new component follows the same pattern: `--yote-<component>-<property>`, defaulting to a global token where one exists.

## Type styles

Type is not tokenised; it inherits the consumer's font family. Sizes are fixed per role:

| Style | Size / line | Weight | Tracking |
| --- | --- | --- | --- |
| Label | 14 / 20 | 500 | 0.28px |
| Value, placeholder, affix | 14 / 20 | 400 | 0.28px |
| Message, optional, counter, tag, kbd | 12 / 16 | 400 | 0.24px |
| Digit | 30 / 38 | 400 | 0.3px, tabular |
| Controls at coarse pointers | 16 / 20 | | 0.32px |

## Deriving dark values for a consumer's palette

When the consumer has set a light value but no dark one, derive rather than invert: hold the hue and lift lightness for the accent, lift the error colour until it stops vibrating, and use **less** ring alpha than feels right (a pale tint on near-black reads as a halo; adjacent digit-cell rings at 0.42 welded into one blob). Write the result into both dark blocks and restate the composed focus tokens there.
