import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const skillsPath = path.join(packageRoot, 'skills');

function getSourceRoot() {
  if (process.env.REACT_ROUTER_SOURCE_ROOT) {
    return path.resolve(process.env.REACT_ROUTER_SOURCE_ROOT);
  }

  const dataHome =
    process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share');
  return path.join(dataHome, 'opencode', 'react-router-source');
}

function addUniquePath(paths, nextPath) {
  if (!paths.includes(nextPath)) {
    paths.push(nextPath);
  }
}

function ensureSkillsPath(config) {
  if (
    !config.skills ||
    typeof config.skills !== 'object' ||
    Array.isArray(config.skills)
  ) {
    config.skills = {};
  }

  if (!Array.isArray(config.skills.paths)) {
    config.skills.paths = [];
  }

  addUniquePath(config.skills.paths, skillsPath);
}

function ensureExternalDirectoryPermission(config, sourceRoot) {
  if (!config.permission) {
    config.permission = {};
  }

  if (
    typeof config.permission !== 'object' ||
    Array.isArray(config.permission)
  ) {
    return;
  }

  const allowPattern = path.join(sourceRoot, '**');
  const current = config.permission.external_directory;

  if (current === 'allow') {
    return;
  }

  if (current === 'ask' || current === 'deny') {
    config.permission.external_directory = {
      '*': current,
      [allowPattern]: 'allow'
    };
    return;
  }

  if (!current || typeof current !== 'object' || Array.isArray(current)) {
    config.permission.external_directory = {};
  }

  config.permission.external_directory[allowPattern] = 'allow';
}

export const ReactRouterSourcePlugin = async () => {
  const sourceRoot = getSourceRoot();

  return {
    config: config => {
      ensureSkillsPath(config);
      ensureExternalDirectoryPermission(config, sourceRoot);
    },
    'shell.env': async (_input, output) => {
      output.env.REACT_ROUTER_SOURCE_ROOT =
        output.env.REACT_ROUTER_SOURCE_ROOT || sourceRoot;
    }
  };
};

export default ReactRouterSourcePlugin;
