---
name: yote-ui
description: How to build React form fields with Yöte (npm package `yote-ui`), a zero-dependency input library with one shared prop vocabulary across nine fields. Use this skill whenever the user mentions Yöte, Yote, yote-ui, or asks to build, fix or style a form, sign-up flow, checkout, OTP or verification screen, phone field, date field, card field, tags field or searchable select in a React or Next.js project that already has yote-ui installed or where a lightweight styled input library would fit. Also use it when wiring Yöte into Tailwind v4, theming it with tokens, or debugging layer-order issues such as the digit input showing raw text over its cells.
---

# Yöte (yote-ui)

Yöte is a small set of React form inputs, styled and animated out of the box, with zero dependencies (about 24KB, TypeScript). Every field shares one prop vocabulary, so once you know one field you know all of them. Each component only adds a few props of its own on top of that shared contract.

Docs: https://yote.shatermt.com/docs
Repo: https://github.com/Tsavsar/yote

## Install and set up once, then render fields with nothing else to wire

```bash
npm i yote-ui   # or pnpm add / yarn add / bun add
```

Import the stylesheet once, where global styles live. All of it sits inside `@layer yote`.

```tsx
// app/layout.tsx
import 'yote-ui/styles.css'
```

Then import and render a field:

```tsx
import { PinInput } from 'yote-ui'

<PinInput label="Verification code" onComplete={(code) => verify(code)} />
```

### Tailwind v4 needs an explicit layer order or the digit input breaks

Tailwind v4 emits real cascade layers, so layer order decides the winner, not specificity. Declare the order before any import, with `yote` after `base` and before `utilities`:

```css
/* app/globals.css */
@layer theme, base, yote, components, utilities;

@import 'tailwindcss';
```

Why each side matters:
- `yote` before `base`: Tailwind preflight wins and resets form controls with `color: inherit; opacity: 1`. The hidden input inside `PinInput` becomes visible and paints the raw value over the cells. If a user reports this symptom, the layer order is the fix.
- `yote` after `utilities`: the user's own classes stop overriding Yöte.

Import order must match, so the file holding the `@layer` statement is read first:

```tsx
import './globals.css'
import 'yote-ui/styles.css'
```

## The shared prop contract that every field accepts

Learn this table and most of the API is covered. Per-component sections below only list what each field adds.

| Prop | Type | Default | Behaviour |
| --- | --- | --- | --- |
| `value` | string | | Controlled value |
| `defaultValue` | string | | Uncontrolled initial value |
| `onChange` | `(value: string) => void` | | Receives the value, **never the event** |
| `label` | ReactNode | | Real `<label>` wired by `htmlFor` |
| `hint` | ReactNode | | Helper text under the field |
| `error` | ReactNode | | Error text. Implies invalid unless `invalid` overrides |
| `invalid` | boolean | | Forces error styling on or off |
| `errorKey` | string \| number | | Change it to replay the error shake |
| `disabled` | boolean | false | Greys the field out |
| `readOnly` | boolean | false | Reads as filled, stays focusable |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Every field except `PinInput`, which sizes to its container |
| `classNames` | `Record<Part, string>` | | Per-part class names |

Most fields also take `required` (asterisk plus `aria-required`), `optional` (muted "(Optional)" note) and `info` (string tooltip on an info marker beside the label). Two exceptions: `PasswordInput` takes `info` but not `required` or `optional`, and `PinInput` takes none of the three.

### Rules that follow from the contract and trip people up

1. `onChange` gets the value directly. Write `onChange={setName}`, never `onChange={(e) => setName(e.target.value)}`.
2. Pass `error` to show an error. Do not also pass `invalid` unless you need to force the state.
3. A second failed submit with the same error message shows nothing new. Increment an `errorKey` counter on each failure to replay the shake.
4. There is no single `className` for internals. Use `classNames={{ part: '...' }}`.

## Scope boundary: Yöte renders fields and never owns validation or form state

Yöte does not hold form state, does not decide what is valid, and does not ship things that sit on top of a field (no calendar, no combobox library, no Luhn check, no phone normalisation). Validation state comes in as props and the library renders it.

When generating code:
- Put validation in the user's form layer (their own logic, react-hook-form, zod, a server response) and pass the result into `error`.
- Do not suggest Yöte props for date pickers, phone formatting or card validation. They do not exist by design.
- If a request needs those, pair Yöte with another tool rather than inventing props.

## Components: what each field adds on top of the shared contract

### Input, the plain one-line field that every other field is shaped like

Four slots, split on purpose:
- `leading` / `trailing`: a mark (icon, spinner, button). `trailing` is also where `InlineSelect` goes.
- `prefix` / `suffix`: text read as part of the value (currency, protocol, unit). Spaced differently from marks.

Unset slots render nothing and leave no stray padding.

```tsx
<Input label="Website" prefix="https://" placeholder="example.com" />
<Input label="Amount" prefix="$" suffix="USD" />
<Input label="Search" leading={<SearchIcon />} />
```

Sizes: `sm` (8px radius, 8px padding), `md` default (12px, 10px), `lg` (12px, 12px).

### PinInput, one real input underneath visual cells so paste and SMS autofill work

A single `<input>` spans the group with `inputMode="numeric"` and `autocomplete="one-time-code"`. Never suggest rebuilding it as one input per cell.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `length` | number | 4 | Cell count, also sets maxLength |
| `onComplete` | `(value: string) => void` | | Fires when the last cell fills |
| `mask` | boolean | false | Dots instead of digits |

No `size`, `required`, `optional` or `info`: the cells size to their container, shrinking below 87.5px wide when there is not room for the full group, so six cells fit a 320px column.

State attributes for styling from outside: `data-active` (focused cell), `data-filled` (root and filled cells), `data-invalid`, `data-disabled` (root and cells), `data-focused` (root).

```tsx
const [attempt, setAttempt] = useState(0)

<PinInput
  length={6}
  label="Verification code"
  error={wrong ? 'That code is incorrect. Try again.' : undefined}
  errorKey={attempt}
  onComplete={async (code) => {
    const ok = await verify(code)
    if (!ok) setAttempt((n) => n + 1)
  }}
  classNames={{ cell: 'data-[active]:ring-4 data-[filled]:bg-neutral-50' }}
/>
```

### Textarea, multi-line entry with an optional counter and a real drag handle

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `maxLength` | number | | Caps the value and turns the counter on |
| `showCounter` | boolean | auto | On when `maxLength` is set. `false` hides it |
| `resizable` | boolean | true | Shows the drag handle |

The handle writes to `--yote-ta-height`, so set a starting height with `style={{ '--yote-ta-height': '200px' }}`. Other tunable properties: `--yote-ta-radius`, `--yote-ta-pad-y`, `--yote-ta-pad-left`, `--yote-ta-pad-right`. Sizes: `sm` 113px, `md` 127px, `lg` 141px.

### PasswordInput, where the consumer defines the rules and the field reports on them

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `requirements` | `{ label, test }[]` | four defaults | `[]` hides the block |
| `requirementsTitle` | ReactNode | "Must contain at least:" | |
| `showRequirements` | boolean | true | Strength bar and list |
| `revealable` | boolean | true | Reveal toggle (`aria-pressed`) |
| `forgotHref` | string | | Renders the forgot link |
| `forgotLabel` | ReactNode | "Forgot password" | |

Defaults are exported as `DEFAULT_PASSWORD_REQUIREMENTS` (1 symbol, 1 uppercase, 1 number, 8+ characters). Extend instead of retyping:

```tsx
import { PasswordInput, DEFAULT_PASSWORD_REQUIREMENTS } from 'yote-ui'

<PasswordInput
  label="Password"
  requirements={[
    ...DEFAULT_PASSWORD_REQUIREMENTS,
    { label: 'Not your email', test: (v) => !v.includes(email) },
  ]}
/>
```

For sign-in forms, use `showRequirements={false}`. The strength bar has one segment per rule and exposes `data-strength` of `none`, `partial`, `strong` or `invalid`. `invalid` beats the count and disabled beats everything.

### PhoneInput, which keeps the country and the number as two separate values

`onChange` returns the number exactly as typed. `onCountryChange` returns the ISO code. Nothing is formatted, normalised or validated, so combining and validating them is the consumer's job.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `countries` | `{ code, dial, name, flag? }[]` | eight common | Pass a real list for production |
| `country` | string | | Controlled ISO code |
| `defaultCountry` | string | "US" | Uncontrolled ISO code |
| `onCountryChange` | `(code: string) => void` | | |

The eight defaults draw inline SVG flags. Anything else falls back to the regional emoji, which renders as two letters on Windows, so pass `flag` for other countries (for example with `flag-icons`: `flag: <span className="fi fi-ee" />`).

```tsx
const [country, setCountry] = useState('GB')
const [number, setNumber] = useState('')

<PhoneInput
  label="Phone number"
  country={country}
  onCountryChange={setCountry}
  value={number}
  onChange={setNumber}
/>
```

Sizes pad left 12 / 14 / 16px with right fixed at 8px.

### SelectInput and InlineSelect, where the field itself is the search

`SelectInput` filters as you type into it. `value` is the option's `value`, never its label. Typed filter text is discarded when the panel closes.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `options` | `{ value, label, keywords? }[]` | | `keywords` match but never show |
| `leading` | ReactNode | | |
| `emptyLabel` | ReactNode | "No match" | |

`InlineSelect` is not a field and skips the shared contract (no label, hint, error or size). It takes `options`, `value`, `defaultValue` (first option), `onChange`, `disabled`, `className` and `aria-label`. The type marks `aria-label` optional, but always pass it: there is no visible label to name the control, so without one a screen reader announces the chosen option and nothing about what it chooses. Place it in another field's `trailing` slot:

```tsx
<Input
  label="Share with"
  trailing={<InlineSelect aria-label="Access level" options={ACCESS} />}
/>
```

### TagsInput, whose value is an array because the field collects a list

The shared contract applies, except `value` / `defaultValue` are `string[]` and `onChange` receives the next array.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `tagsPosition` | `'outside' \| 'inside'` | `'outside'` | Outside for long lists, inside for a few |
| `inputValue` / `onInputValueChange` | string | | Drive the typed text |
| `commitKeys` | string[] | `['Enter', ',']` | |
| `validate` | `(tag, tags) => boolean` | | `false` keeps the text in the field |
| `maxTags` | number | | |
| `removeLabel` | `(tag) => string` | "Remove {tag}" | Accessible name for each remove button |
| `listLabel` | string | "Selected" | Accessible name for the `<ul>` of tags |

Blur commits the half-typed tag, duplicates are dropped silently, and Backspace on an empty field removes the last tag.

### DateInput, typed rather than picked, with the punctuation typed for you

No calendar ships and none is planned. Pair it with an external picker if one is needed.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `pattern` | string | `'00/00/0000'` | `0` is a digit slot, anything else is a literal |
| `onComplete` | `(value: string) => void` | | All slots filled |
| `shortcut` | ReactNode | | Keyboard hint at the end |
| `leading` | ReactNode | `<CalendarIcon />` | `null` removes it |

`pattern` drives the mask and max length together. Set `placeholder` to match (`pattern="0000-00-00" placeholder="YYYY-MM-DD"`). `onChange` returns the masked string, never a `Date`, so parse and validate it yourself (for example in `onComplete`). Pasting any shape works because only digits survive.

### CardInput, which regroups as it recognises the brand but never validates the number

Amex groups 4-6-5, everything else 4-4-4-4. Detected `CardBrand` values: `visa`, `mastercard`, `amex`, `discover`, `unknown`. There is no Luhn check. Pass `invalid` and `error` from the payment processor's response.

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `brand` | ReactNode | detected mark | Override the mark (fixed 29px slot) |
| `onBrandChange` | `(brand: CardBrand) => void` | | |

```tsx
const [brand, setBrand] = useState<CardBrand>('unknown')

<CardInput
  label="Card number"
  onBrandChange={setBrand}
  brand={<img src={`/brands/${brand}.svg`} alt="" width={29} />}
/>
```

## Theming through tokens instead of overriding component CSS

Every colour, radius, shadow and duration is a custom property on `:root`. Override tokens first, reach for `classNames` second.

```css
:root {
  --yote-feature-base: #0f6dff;
  --yote-radius-md: 4px;
  --yote-duration: 120ms;
}
```

To use the accent in Tailwind: `@theme { --color-yote-accent: var(--yote-feature-base); }`.

Dark values are declared under both `prefers-color-scheme: dark` and `[data-theme='dark']`, so system preference and a manual toggle both work. The attribute selector is not prefixed with `:root`, so `data-theme="dark"` on any element flips that subtree alone. Override dark in **both** blocks, or system dark and toggled dark disagree. Treat dark values as provisional.

One trap when overriding somewhere other than `:root`. `--yote-focus-active` and `--yote-focus-error` are composed from other tokens through `var()`, and a custom property resolves at the element where it is declared. Override `--yote-purple-alpha-24` on `:root` and the ring follows it; override it on `.checkout` and it does not, because descendants inherit the ring string already finished on `:root`. Restate the composed token in the same scope:

```css
.checkout {
  --yote-purple-alpha-24: rgba(15, 109, 255, 0.24);
  --yote-focus-active: 0 0 0 2px var(--yote-bg-default), 0 0 0 4px var(--yote-purple-alpha-24);
}
```

## Accessibility is built in, so do not re-add it by hand

Every field already does the following. Do not duplicate these attributes or wrap fields in extra labels:
- Real `<label>` via `htmlFor`, `aria-describedby` to the visible hint or error, `aria-invalid`, `aria-required`.
- An always-present `aria-live="polite"` message region, so errors never shift layout.
- 16px text at the control, so iOS does not zoom on focus. Keep this if restyling font size.
- Visible keyboard focus rings. Never remove them in custom classes.
- Dropdowns (phone country picker, `SelectInput`, `InlineSelect`) share one combobox/listbox implementation with `aria-activedescendant`, wrapping arrows, Home/End, Enter, Escape, and a portal to `document.body` so parent `overflow: hidden` cannot clip them.
- Tags are a real `<ul>` with announced add/remove counts.
- `prefers-reduced-motion` removes shake and movement but keeps colour changes. Hover styles only apply on fine pointers.

## Checklist before handing Yöte code back to the user

- [ ] `yote-ui/styles.css` imported once, after the globals file.
- [ ] On Tailwind v4, `@layer theme, base, yote, components, utilities;` declared first.
- [ ] Every `onChange` handler takes a value, not an event.
- [ ] `TagsInput` state is `string[]`.
- [ ] `PhoneInput` stores country and number separately.
- [ ] Validation lives outside Yöte and arrives through `error`, with `errorKey` for repeat failures.
- [ ] `InlineSelect` has an `aria-label`.
- [ ] No invented props for calendars, Luhn checks or phone formatting.
- [ ] Styling uses tokens or `classNames`, not overrides that remove focus rings or shrink control text below 16px.
