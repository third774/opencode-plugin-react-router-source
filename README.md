# opencode-plugin-react-router-source

OpenCode plugin that bundles the `react-router-source` skill and grants the skill narrow access to a shared local React Router source cache.

The skill answers React Router behavior questions from source instead of memory, including v5, v6, and `react-router-dom-v5-compat` migration behavior.

## Install The Plugin

Add the GitHub package to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "plugin": ["github:third774/opencode-plugin-react-router-source"]
}
```

For local development from a checkout, point OpenCode at the plugin file:

```jsonc
{
  "plugin": [
    "/absolute/path/to/opencode-plugin-react-router-source/src/index.js"
  ]
}
```

Restart OpenCode after changing plugin config. OpenCode loads plugins and skills at startup.

## Install The Source Cache

Install or update the source cache explicitly:

```sh
npx -y github:third774/opencode-plugin-react-router-source install-sources
```

For local development from a checkout:

```sh
node bin/opencode-plugin-react-router-source.js install-sources
```

The source cache lives at:

```text
${XDG_DATA_HOME:-$HOME/.local/share}/opencode/react-router-source/
  react-router-v5/
  react-router-v6/
```

## What The Plugin Configures

On startup, the plugin:

- Registers the bundled `skills/` directory with `config.skills.paths`.
- Allows OpenCode to read `${REACT_ROUTER_SOURCE_ROOT:-$HOME/.local/share/opencode/react-router-source}/**` through `permission.external_directory`.
- Sets `REACT_ROUTER_SOURCE_ROOT` for shell commands when it is not already set.

The permission change is intentionally narrow: it only allows reads from the React Router source cache. If a user has top-level `permission` configured as a string instead of an object, the plugin leaves it unchanged rather than rewriting unrelated permission behavior.

## Configuration

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `REACT_ROUTER_SOURCE_ROOT` | `${XDG_DATA_HOME:-$HOME/.local/share}/opencode/react-router-source` | Source cache location |
| `REACT_ROUTER_V5_REPO` | `https://github.com/remix-run/react-router.git` | v5 clone remote |
| `REACT_ROUTER_V5_REF` | `v5.3.4` | v5 checkout ref |
| `REACT_ROUTER_V6_REPO` | `https://github.com/remix-run/react-router.git` | v6 clone remote |
| `REACT_ROUTER_V6_REF` | `v6` | v6 checkout ref |

Custom source root:

```sh
npx -y github:third774/opencode-plugin-react-router-source install-sources --source-root ~/src/react-router-source
```

Set the same `REACT_ROUTER_SOURCE_ROOT` before starting OpenCode so the skill and permission rule use that custom cache.
