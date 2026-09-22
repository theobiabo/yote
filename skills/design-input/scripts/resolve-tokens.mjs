#!/usr/bin/env node
// Resolve the design tokens a project actually uses.
//
// Usage:
//   node resolve-tokens.mjs <file.css> [more.css ...] [--prefix=--yote-] [--json]
//
// Pass files in the order the app loads them. Later files override earlier ones,
// which mirrors how a consumer's :root overrides beat the library defaults.
// Declarations are grouped by theme: light (:root, [data-theme='light']),
// dark (system) from prefers-color-scheme, and dark (attribute) from
// [data-theme='dark']. The two dark blocks are kept apart on purpose: an
// override that lands in only one of them leaves the other theme on the old
// value, and the warnings at the end point that out. Anything else is
// reported under its own selector so component-scoped tokens are not lost.
// Zero dependencies.

import { readFileSync, existsSync } from 'node:fs'

const args = process.argv.slice(2)
const files = args.filter((a) => !a.startsWith('--'))
const prefix = (args.find((a) => a.startsWith('--prefix=')) || '--prefix=--yote-').split('=')[1]
const asJson = args.includes('--json')

if (!files.length) {
  console.error('Usage: node resolve-tokens.mjs <file.css> [more.css ...] [--prefix=--yote-] [--json]')
  process.exit(1)
}

const themes = {} // theme -> token -> { value, file }

function themeOf(selector, atRules) {
  const s = selector.replace(/\s+/g, ' ').trim()
  const inDarkMedia = atRules.some((a) => /prefers-color-scheme:\s*dark/.test(a))
  if (/\[data-theme=['"]?dark/.test(s)) return 'dark (attribute)'
  if (inDarkMedia) return 'dark (system)'
  if (/^:root\b|\[data-theme=['"]?light/.test(s) || s === 'html') return 'light'
  return s
}

function parse(css, file) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const stack = [] // { kind: 'at' | 'rule', text }
  let buf = ''
  for (const ch of css) {
    if (ch === '{') {
      const head = buf.trim()
      stack.push({ kind: head.startsWith('@') ? 'at' : 'rule', text: head })
      buf = ''
    } else if (ch === '}') {
      flush(buf, stack, file)
      buf = ''
      stack.pop()
    } else if (ch === ';') {
      flush(buf, stack, file)
      buf = ''
    } else buf += ch
  }
}

function flush(decl, stack, file) {
  const d = decl.trim()
  if (!d.startsWith(prefix)) return
  const i = d.indexOf(':')
  if (i < 0) return
  const name = d.slice(0, i).trim()
  const value = d.slice(i + 1).trim()
  const rule = [...stack].reverse().find((s) => s.kind === 'rule')
  if (!rule) return
  const atRules = stack.filter((s) => s.kind === 'at').map((s) => s.text)
  for (const sel of rule.text.split(',')) {
    const t = themeOf(sel, atRules)
    themes[t] ??= {}
    const prev = themes[t][name]
    themes[t][name] = { value, file, overrides: prev && prev.file !== file ? prev.value : prev?.overrides }
  }
}

for (const f of files) {
  if (!existsSync(f)) {
    console.error(`Not found: ${f}`)
    continue
  }
  parse(readFileSync(f, 'utf8'), f)
}

if (asJson) {
  console.log(JSON.stringify(themes, null, 2))
} else {
  const named = ['light', 'dark (system)', 'dark (attribute)']
  const order = [...named, ...Object.keys(themes).filter((t) => !named.includes(t))]
  for (const t of order) {
    if (!themes[t]) continue
    console.log(`\n## ${t}\n`)
    console.log('| Token | Value | Source |')
    console.log('| --- | --- | --- |')
    for (const [name, { value, file, overrides }] of Object.entries(themes[t])) {
      const src = overrides ? `${file} (overrides ${overrides})` : file
      console.log(`| \`${name}\` | \`${value}\` | ${src} |`)
    }
  }
}

// Warnings: the mistakes that make a theme half-apply.
const warnings = []
const sys = themes['dark (system)'] || {}
const attr = themes['dark (attribute)'] || {}
for (const name of new Set([...Object.keys(sys), ...Object.keys(attr)])) {
  if (sys[name]?.value !== attr[name]?.value) {
    warnings.push(`${name} differs between dark (system) and dark (attribute): ${sys[name]?.value ?? 'unset'} vs ${attr[name]?.value ?? 'unset'}`)
  }
}
// Composed tokens (ones whose value reads another token through var()) resolve
// at the element where they are declared, and the finished string is what
// inherits. Overriding an input on :root is fine, because the composed token is
// declared on :root too. Overriding it on a scoped selector (a card, a modal,
// .checkout) is not: descendants inherit the composed token already baked on
// :root, so the change never reaches it unless it is restated in that scope.
const themeNames = ['light', 'dark (system)', 'dark (attribute)']
const composed = {}
for (const t of themeNames) {
  for (const [name, { value }] of Object.entries(themes[t] || {})) {
    const refs = [...value.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1])
    if (refs.length) composed[name] = refs
  }
}
for (const [scope, block] of Object.entries(themes)) {
  if (themeNames.includes(scope)) continue
  for (const [name, refs] of Object.entries(composed)) {
    const hit = refs.filter((r) => block[r])
    if (hit.length && !block[name]) {
      warnings.push(`${scope} sets ${hit.join(', ')} but not ${name}, which reads it. Restate ${name} in ${scope} or the change will not reach it`)
    }
  }
}
if (!asJson && warnings.length) {
  console.log('\n## Warnings\n')
  for (const w of [...new Set(warnings)]) console.log(`- ${w}`)
}
