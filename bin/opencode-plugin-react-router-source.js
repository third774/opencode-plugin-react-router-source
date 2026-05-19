#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const DEFAULT_REPO = 'https://github.com/remix-run/react-router.git';
const DEFAULT_V5_REF = 'v5.3.4';
const DEFAULT_V6_REF = 'v6';

function usage() {
  console.log(`Usage: opencode-plugin-react-router-source install-sources [--source-root <path>]

Installs or updates the React Router source cache used by the OpenCode plugin.

Environment variables:
  REACT_ROUTER_SOURCE_ROOT   Source cache root
  REACT_ROUTER_V5_REPO       v5 remote URL, default: ${DEFAULT_REPO}
  REACT_ROUTER_V5_REF        v5 checkout ref, default: ${DEFAULT_V5_REF}
  REACT_ROUTER_V6_REPO       v6 remote URL, default: ${DEFAULT_REPO}
  REACT_ROUTER_V6_REF        v6 checkout ref, default: ${DEFAULT_V6_REF}`);
}

function getDefaultSourceRoot() {
  if (process.env.REACT_ROUTER_SOURCE_ROOT) {
    return path.resolve(process.env.REACT_ROUTER_SOURCE_ROOT);
  }

  const dataHome =
    process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(dataHome, 'opencode', 'react-router-source');
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function getOutput(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options
  });

  if (result.error) {
    throw result.error;
  }

  return {
    ok: result.status === 0,
    stdout: result.stdout.trim()
  };
}

function checkoutRef(dir, ref) {
  const remoteBranch = getOutput('git', [
    '-C',
    dir,
    'rev-parse',
    '--verify',
    '--quiet',
    `refs/remotes/origin/${ref}`
  ]);

  if (remoteBranch.ok) {
    run('git', ['-C', dir, 'checkout', '-B', ref, `origin/${ref}`]);
    return;
  }

  const tag = getOutput('git', [
    '-C',
    dir,
    'rev-parse',
    '--verify',
    '--quiet',
    `refs/tags/${ref}`
  ]);

  if (tag.ok) {
    run('git', ['-C', dir, 'checkout', '--detach', ref]);
    return;
  }

  run('git', ['-C', dir, 'checkout', ref]);
}

function cloneOrUpdate({ name, repo, ref, sourceRoot }) {
  const dir = path.join(sourceRoot, name);

  if (fs.existsSync(path.join(dir, '.git'))) {
    console.log(`Updating ${name} in ${dir}`);
    run('git', [
      '-C',
      dir,
      'fetch',
      '--prune',
      '--tags',
      'origin',
      '+refs/heads/*:refs/remotes/origin/*'
    ]);
  } else {
    console.log(`Cloning ${name} into ${dir}`);
    fs.mkdirSync(path.dirname(dir), { recursive: true });
    run('git', ['clone', '--filter=blob:none', repo, dir]);
    run('git', [
      '-C',
      dir,
      'fetch',
      '--prune',
      '--tags',
      'origin',
      '+refs/heads/*:refs/remotes/origin/*'
    ]);
  }

  checkoutRef(dir, ref);
}

function parseArgs(argv) {
  if (argv.length === 0 || argv[0] === '-h' || argv[0] === '--help') {
    return { command: 'help', sourceRoot: getDefaultSourceRoot() };
  }

  const [command, ...rest] = argv;
  let sourceRoot = getDefaultSourceRoot();

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === '--source-root') {
      const value = rest[index + 1];
      if (!value) {
        throw new Error('--source-root requires a path');
      }
      sourceRoot = path.resolve(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { command, sourceRoot };
}

function main() {
  const { command, sourceRoot } = parseArgs(process.argv.slice(2));

  if (command === 'help') {
    usage();
    return;
  }

  if (command !== 'install-sources') {
    throw new Error(`Unknown command: ${command}`);
  }

  cloneOrUpdate({
    name: 'react-router-v5',
    repo: process.env.REACT_ROUTER_V5_REPO || DEFAULT_REPO,
    ref: process.env.REACT_ROUTER_V5_REF || DEFAULT_V5_REF,
    sourceRoot
  });

  cloneOrUpdate({
    name: 'react-router-v6',
    repo: process.env.REACT_ROUTER_V6_REPO || DEFAULT_REPO,
    ref: process.env.REACT_ROUTER_V6_REF || DEFAULT_V6_REF,
    sourceRoot
  });

  console.log(`\nReact Router source cache is ready: ${sourceRoot}`);
  console.log('Restart OpenCode after adding the plugin to your config.');
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
