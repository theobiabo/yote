# design-input

A skill that teaches your agent to design form inputs the way Yöte's were designed.

Point it at a field you need, a currency input, a time field, a stepper, a URL field with a protocol affix, and it makes the calls in the order that decides whether the field holds up. Does it belong in an input library at all. What does it return. What does it inherit. How does every state look. What must never move. How does it animate. How does it behave under a keyboard and a screen reader. Then it writes the spec and the code.

## Install

```bash
npx skills@latest add Tsavsar/yote
```

## Why use it?

Agents build inputs that look finished and feel broken.

The field that jumps half a pixel when it takes focus, because the border went from 1px to 1.5px. The OTP field built as six separate inputs, so pasting the code does nothing and the SMS suggestion never appears. The error message that pushes the whole form down when it arrives. The card mark that shoves every digit sideways the moment the brand is recognised. The date field that types the slash before you've typed the month. The shake that runs 400ms on `ease-in`. The phone field that quietly decides how to format a number it was never asked to validate.

None of these show up in a screenshot. All of them show up the first time someone uses the form.

Every one of them happened while building Yöte, and every fix is written into this skill as a rule with its reason, so your agent doesn't have to find them the hard way.

## It designs in your theme, not mine

The skill works against token names, never values. Before it draws anything, it reads your stylesheets and resolves what `--yote-feature-base`, `--yote-radius-md` and the rest actually are in your project:

```bash
node scripts/resolve-tokens.mjs node_modules/yote-ui/dist/styles.css app/globals.css
```

Set your accent to blue and your radius to 4px, and the spec comes back in blue at 4px. It also catches the two ways a theme half-applies: dark mode overridden in one dark block but not the other, and a scoped override that never reaches the focus ring.

## What's inside

| File | What it does |
| --- | --- |
| [SKILL.md](SKILL.md) | The design sequence, the hard rules, and the list of things that never ship |
| [TOKENS.md](TOKENS.md) | The token contract: every name, its role, and Yöte's default |
| [RECIPES.md](RECIPES.md) | Copy-ready pieces: the field shell, the state block, the focus ring, the single-input segmented field, the mask, the shake, the popover, and a spec template |
| [scripts/resolve-tokens.mjs](scripts/resolve-tokens.mjs) | Reads your CSS and resolves the tokens per theme. Zero dependencies |

## What it won't do

It won't design a calendar, a validator or a form library, because Yöte doesn't ship those either. Ask for one and it will tell you so, then design the field half properly. A narrow skill that says no is the point.

## Credit

The structure follows Emil Kowalski's [animate](https://github.com/emilkowalski/skills/blob/main/skills/animate/SKILL.md) skill, and the motion rules owe a lot to his writing. Yöte itself takes its lead from [Sonner](https://sonner.emilkowal.ski).
