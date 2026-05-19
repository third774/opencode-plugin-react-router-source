---
name: react-router-source
description: Answer questions about React Router behavior, internals, APIs, and differences between v5 and v6 by inspecting local React Router source clones. Use this skill whenever the user asks how React Router works, why a route/hook/component behaves a certain way, how v5 differs from v6, or how `react-router-dom-v5-compat` behaves. Always use this skill for source-backed React Router explanations instead of relying on memory.
---

# React Router Source Research

Use this skill to answer questions about React Router behavior from local source code. Resolve the React Router source clones before searching:

1. If `REACT_ROUTER_SOURCE_ROOT` is set, use that directory.
2. Otherwise use `${XDG_DATA_HOME:-$HOME/.local/share}/opencode/react-router-source`.

Expected clone layout:

| Topic | Local source |
| --- | --- |
| React Router v5 / `react-router-dom` v5 | `<source-root>/react-router-v5` |
| React Router v6 / `react-router-dom` v6 | `<source-root>/react-router-v6` |
| `react-router-dom-v5-compat` | `<v6-source>/packages/react-router-dom-v5-compat` |

The compat package lives in the v6 repo. For any question about `react-router-dom-v5-compat`, inspect the v6 clone, not the v5 clone.

## Workflow

1. Identify the version and package the user is asking about.
2. Resolve the source paths. Use a shell only for path/version discovery if needed:

   ```sh
   SOURCE_ROOT="${REACT_ROUTER_SOURCE_ROOT:-${XDG_DATA_HOME:-$HOME/.local/share}/opencode/react-router-source}"
   printf '%s\n' "$SOURCE_ROOT"
   ```

3. Verify the relevant clone revision before making version-specific claims:

   ```sh
   git -C "$SOURCE_ROOT/react-router-v5" describe --tags --always && git -C "$SOURCE_ROOT/react-router-v5" branch --show-current
   git -C "$SOURCE_ROOT/react-router-v6" describe --tags --always && git -C "$SOURCE_ROOT/react-router-v6" branch --show-current
   ```

4. Search the local source first. Prefer `Grep`, `Glob`, and direct file reads. Use `sg` for syntax-aware searches when matching code structure.
5. Read the implementation and the nearest tests/docs before answering. Tests often encode important edge cases.
6. Answer with the observed behavior, version differences, and file references.

Keep the answer practical. Quote or summarize only the source lines needed to support the conclusion.

## Version Selection

Use the v5 clone for:

- v5 `<Switch>`, `<Route>`, `<Redirect>`, `<Prompt>`, `withRouter`, `useHistory`, `useRouteMatch`, `matchPath`, and v5 matching semantics
- `react-router-dom` v5 `<BrowserRouter>`, `<HashRouter>`, `<Link>`, and `<NavLink>` behavior
- `history@4` integration behavior used by v5

Use the v6 clone for:

- v6 `<Routes>`, `<Route element>`, `<Navigate>`, `useNavigate`, `useMatch`, `useResolvedPath`, `useRoutes`, and v6 ranking/matching semantics
- data router APIs such as loaders, actions, fetchers, blockers, redirects, and router state behavior
- `history@5` integration behavior used by v6
- `react-router-dom-v5-compat`, including `CompatRouter`, `CompatRoute`, and v6 API re-exports used during incremental migration

If the local v6 clone is on a later branch/tag than the user expects, call that out and avoid presenting the behavior as universal v6 behavior without checking the relevant tag or changelog.

## High-Value Source Paths

### v5

- Core exports: `<v5-source>/packages/react-router/modules/index.js`
- Matching: `<v5-source>/packages/react-router/modules/matchPath.js`
- Route rendering: `<v5-source>/packages/react-router/modules/Route.js`
- Switch matching: `<v5-source>/packages/react-router/modules/Switch.js`
- Redirect behavior: `<v5-source>/packages/react-router/modules/Redirect.js`
- Hooks: `<v5-source>/packages/react-router/modules/hooks.js`
- Router context/history wiring: `<v5-source>/packages/react-router/modules/Router.js`
- DOM APIs: `<v5-source>/packages/react-router-dom/modules/`
- Tests: `<v5-source>/packages/*/modules/__tests__/`

### v6

- React components: `<v6-source>/packages/react-router/lib/components.tsx`
- Hooks: `<v6-source>/packages/react-router/lib/hooks.tsx`
- Router internals: `<v6-source>/packages/react-router/lib/router/`
- DOM integration: `<v6-source>/packages/react-router/lib/dom/`
- DOM package exports: `<v6-source>/packages/react-router-dom/index.tsx`
- Compat package: `<v6-source>/packages/react-router-dom-v5-compat/`
- Compat docs: `<v6-source>/packages/react-router-dom-v5-compat/README.md`
- Tests: `<v6-source>/packages/*/__tests__/`

## Answer Format

For short questions, use this shape:

```markdown
Short answer: <direct answer>

Source-backed details:
- `<path>`: <what this file shows>
- `<path>`: <what this test/doc adds>

v5 vs v6 difference: <only if relevant>
```

For debugging or migration questions, include:

- What the current code is doing
- Which version's semantics apply
- The smallest safe change, if the user asked how to fix it
- Any caveat where compat package behavior differs from pure v5 or pure v6

## Research Rules

- Do not answer from memory when local source can answer the question.
- Do not treat `react-router-dom-v5-compat` as part of the v5 clone. Its source is in the v6 clone.
- Distinguish public API docs from implementation details. If the behavior comes from internals and is not documented, say so.
- Check tests for edge cases before making broad claims about matching, redirects, params, relative paths, blockers, or navigation state.
- When comparing versions, inspect both clones. Do not infer v5 behavior from v6 code or v6 behavior from v5 code.
- If the user asks about Stratus migration practice, combine this skill with the existing `migrating-react-router-v5-to-v6` skill; this skill answers upstream behavior, while that skill covers local migration conventions.

## Common Search Starting Points

Use these searches as first passes when relevant. Replace `$SOURCE_ROOT` with the resolved global cache path:

```sh
rg "function Switch|class Switch|<Switch|matchPath" "$SOURCE_ROOT/react-router-v5/packages/react-router"
rg "function Routes|createRoutesFromChildren|rankRouteBranches|matchRoutes" "$SOURCE_ROOT/react-router-v6/packages/react-router"
rg "CompatRoute|CompatRouter|react-router-dom-v5-compat" "$SOURCE_ROOT/react-router-v6/packages/react-router-dom-v5-compat"
rg "useHistory|useNavigate|useRouteMatch|useMatch" "$SOURCE_ROOT/react-router-v5" "$SOURCE_ROOT/react-router-v6/packages/react-router"
```

Prefer the dedicated `Grep` tool for routine text searches in OpenCode. Use shell `rg` when you need counts, context flags, or multi-root searches that are awkward with the tool interface.
