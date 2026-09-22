import { CodeBlock } from '../../../components/code-block'
import { docsMetadata } from '../metadata'

const REPO = 'https://github.com/Tsavsar/yote/tree/main/skills'

export const metadata = docsMetadata('/docs/skills')

export default function SkillsPage() {
  return (
    <>
      <h1 className="docs-title">Skills</h1>
      <p className="docs-lede">
        Two agent skills, published from the same repo as the library, so an agent building a form
        gets the rules rather than guessing at them.
      </p>

      <h2 id="why" className="docs-h2">
        Why
      </h2>
      <p className="docs-p">
        Agents build inputs that look finished and feel broken. The field that jumps half a pixel
        when it takes focus, because the border went from 1px to 1.5px. The one-time-code field
        built as six separate inputs, so pasting the code does nothing and the SMS suggestion never
        appears. The error message that pushes the whole form down when it arrives. None of those
        show up in a screenshot, and all of them show up the first time somebody uses the form.
      </p>
      <p className="docs-p">
        Every one of them came up while building Yöte, and every fix is in the source. The skills
        write those rules down, with their reasons, so an agent working in a codebase that is not
        this one gets them right the first time.
      </p>

      <h2 id="install" className="docs-h2">
        Install
      </h2>
      <p className="docs-p">Both skills install together.</p>
      <CodeBlock code="npx skills@latest add Tsavsar/yote" />

      <h2 id="skills" className="docs-h2">
        The two skills
      </h2>
      <ul className="bullets">
        <li>
          <a className="docs-inline-link" href={`${REPO}/design-input`}>
            design-input
          </a>
          : designing a new field in the Yöte system, or extending one that ships. The decision
          sequence, the state matrix, the things that must never shift, and the list of what never
          ships.
        </li>
        <li>
          <a className="docs-inline-link" href={`${REPO}/yote-ui`}>
            yote-ui
          </a>
          : using the components in an app. Install, the Tailwind v4 layer order, the shared prop
          contract, and what each field adds on top of it.
        </li>
      </ul>
      <p className="docs-p">
        <code className="inline-code">design-input</code> is the one that matters. It designs
        against token names rather than values, and reads your stylesheets before it quotes a single
        one, so a project that sets its own{' '}
        <code className="inline-code">--yote-feature-base</code> gets specs and code in that colour
        rather than in ours. The script that resolves them also flags the two ways a theme
        half-applies: dark overridden in one of the two dark blocks but not the other, and a scoped
        override that never reaches the focus ring.
      </p>
      <p className="docs-p">
        Both live in{' '}
        <a className="docs-a" href={REPO}>
          skills/
        </a>{' '}
        in the repo, which is the one source of truth for what they say. The structure follows Emil
        Kowalski&apos;s{' '}
        <a className="docs-a" href="https://github.com/emilkowalski/skills">
          animate
        </a>{' '}
        skill.
      </p>
    </>
  )
}
