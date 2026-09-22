# Recipes

Starting points for the pieces every new Yöte field needs. Copy, then change only what the field genuinely adds. All CSS lives inside `@layer yote`, uses single-class selectors, and never uses `!important`.

The recipes reference tokens by name, so they pick up a consumer's theme with no edits. The only literals are layout geometry (padding, gaps, fixed slot widths), and those sit in component-scoped properties a consumer can override. Keep it that way: if you catch yourself typing a hex or a radius into a recipe, it belongs in a token.

## Field shell

```css
.yote-field { display: flex; flex-direction: column; gap: 10px; width: 100%; }

.yote-label-row { display: flex; align-items: center; gap: 6px; width: 100%; }
.yote-label {
  font-size: 14px; font-weight: 500; line-height: 20px; letter-spacing: 0.28px;
  color: var(--yote-text-strong);
}
.yote-info { display: inline-flex; flex: none; margin-left: auto; color: var(--yote-text-soft); }

/* Reserved so an error appearing never moves the form. */
.yote-message {
  display: flex; align-items: center; gap: 4px; min-height: 16px;
  font-size: 12px; line-height: 16px; letter-spacing: 0.24px;
  color: var(--yote-text-sub);
  transition: color var(--yote-duration) ease;
}
.yote-message[data-invalid] { color: var(--yote-error-base); }
.yote-message-icon { flex: none; align-self: flex-start; width: 14px; height: 14px; margin-top: 1px; }
```

## Size ramp as custom properties on the root

```css
.yote-x { --yote-x-pad: 8px; --yote-x-radius: var(--yote-radius-sm); }            /* sm */
.yote-x[data-size='md'] { --yote-x-pad: 10px; --yote-x-radius: var(--yote-radius-md); }
.yote-x[data-size='lg'] { --yote-x-pad: 12px; --yote-x-radius: var(--yote-radius-md); }
```

Every measured value is a property, so a consumer can retune one field with `style` instead of a stylesheet.

## State block in priority order

Hover first and lowest, disabled last and strongest.

```css
.yote-x-field {
  border: 1px solid var(--yote-stroke-soft);
  border-radius: var(--yote-x-radius);
  background: var(--yote-bg-default);
  box-shadow: var(--yote-shadow-field);
  transition:
    border-color var(--yote-duration) ease,
    background-color var(--yote-duration) ease,
    box-shadow var(--yote-duration) ease;
}
@media (hover: hover) and (pointer: fine) {
  .yote-x-field:hover {
    background: var(--yote-bg-surface);
    border-color: var(--yote-bg-layer);
    box-shadow: var(--yote-shadow-field-hover);
  }
}
.yote-x-field[data-focused] {
  background: var(--yote-bg-default);
  border-color: var(--yote-feature-base);
  box-shadow: var(--yote-focus-active);
}
.yote-x-field[data-invalid] {
  background: var(--yote-bg-default);
  border-color: var(--yote-error-base);
  box-shadow: var(--yote-focus-error);
}
.yote-x-field[data-disabled] {
  background: var(--yote-bg-surface);
  border-color: var(--yote-bg-surface); /* kept, not removed */
  box-shadow: none;
}
```

## Ring that fades without repainting, and a heavier border that doesn't shift

Use when the element carries its own shadow (cells) or the ring must fade independently.

```css
.yote-cell { position: relative; border: 1px solid var(--yote-stroke-soft); }
.yote-cell::after {
  content: ''; position: absolute; inset: -1px; border-radius: inherit;
  box-shadow: var(--yote-focus-active); opacity: 0; pointer-events: none;
  transition: opacity var(--yote-duration) var(--yote-ease-out);
}
.yote-cell[data-active] {
  border-color: var(--yote-feature-base);
  box-shadow: inset 0 0 0 0.5px var(--yote-feature-base); /* 1.5px look, 1px box */
}
.yote-cell[data-active]::after { opacity: 1; }
.yote-cell[data-invalid] { border-color: var(--yote-error-base); box-shadow: inset 0 0 0 0.5px var(--yote-error-base); }
.yote-cell[data-invalid]::after { box-shadow: var(--yote-focus-error); opacity: 1; } /* not gated on focus */
```

## Fixed slot for content that appears later

```css
.yote-x-mark {
  display: inline-grid; place-items: center; flex: none;
  width: 29px; /* whatever is inside, including nothing */
}
```

## Segmented field on one real input

```jsx
<div className="yote-group" data-invalid={invalid || undefined}>
  <input
    className="yote-pin-control"   /* absolute, inset 0, opacity 0, font-size 16px */
    type="text"
    inputMode="numeric"
    autoComplete="one-time-code"
    maxLength={length}
    value={value}
    onChange={(e) => set(e.target.value.replace(/\D/g, '').slice(0, length))}
  />
  {cells.map((_, i) => <div key={i} className="yote-cell" data-active={...} data-filled={...} />)}
</div>
```

The group is block `display: flex` with `line-height: 0`, never `inline-flex`. The caret sits at `min(value.length, length - 1)`.

## Mask that appends punctuation behind digits only

```ts
// pattern: '0' is a digit slot, anything else is a literal
function applyMask(raw: string, pattern: string) {
  const digits = raw.replace(/\D/g, '')
  let out = '', d = 0
  for (const ch of pattern) {
    if (d >= digits.length) break          // never type a literal ahead of the caret
    out += ch === '0' ? digits[d++] : ch
  }
  return out
}
```

One `pattern` prop drives mask, placeholder shape and max length together.

## Shake that replays on every failed attempt

```css
.yote-group[data-shaking] { animation: yote-shake 280ms var(--yote-ease-out); }
@keyframes yote-shake {
  0%, 100% { transform: translate3d(0,0,0); }
  15% { transform: translate3d(-6px,0,0); }
  32% { transform: translate3d(5px,0,0); }
  49% { transform: translate3d(-3px,0,0); }
  66% { transform: translate3d(2px,0,0); }
  83% { transform: translate3d(-1px,0,0); }
}
```

```js
// On errorKey change. One rAF gets batched and the keyframes never restart.
setShaking(false)
requestAnimationFrame(() => requestAnimationFrame(() => setShaking(true)))
```

## Entrances

```css
@keyframes yote-digit-in { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes yote-cell-in  { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@keyframes yote-pop-in   { from { opacity: 0; transform: translateY(-4px) scale(0.99); } to { opacity: 1; transform: none; } }
@keyframes yote-pop-in-up{ from { opacity: 0; transform: translateY(4px) scale(0.99); } to { opacity: 1; transform: none; } }
```

## Popover

Portal to `document.body`, position against the viewport, flip above when there's no room below. Control is `role="combobox"` with `aria-expanded`; panel is `role="listbox"`; rows are `role="option"` with `aria-selected`. Track the highlight with `aria-activedescendant` so focus stays in the field. Arrows wrap, Home/End jump, Enter chooses, Escape closes; with the panel shut, Down and Enter open it. Pointer and keyboard share one highlight.

## Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  .yote-group[data-shaking] { animation: none; }
  .yote-digit { animation: yote-fade-in 140ms var(--yote-ease-out); }
  .yote-cell { animation: yote-fade-in 180ms var(--yote-ease-out); }
  .yote-caret { animation: none; opacity: 1; }
  /* colour transitions stay: they carry the error */
}
```

## Coarse pointer type size

```css
@media (pointer: coarse) {
  .yote-x-control { font-size: 16px; line-height: 20px; letter-spacing: 0.32px; }
}
```

## Spec template

Headings state the decision, not a category.

```markdown
# <Component>: <one-line purpose>

## What this field does and what it deliberately leaves to the consumer
## Value shape returned by onChange, and why it is shaped that way
## Anatomy, and which parts are inherited unchanged from the shared field
## Geometry across sm, md and lg, with any departure from the ramp justified
## State treatments, including where one state overrides another
## Behaviour while typing, pasting, deleting and committing
## Motion, with durations, curves and the reduced-motion fallback
## Accessibility contract and keyboard map
## Props this component adds on top of the shared contract
## Data attributes and classNames parts for styling from outside
## Layout stability risks found and how the design prevents them
## Open questions, stated as questions rather than guesses
```
