/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "experience-downstream-only",
      comment:
        "Experience (API/UI) may depend on control and pure model types only.",
      severity: "error",
      from: { path: "^src/experience" },
      to: {
        path: "^src/(?!control|model)(.+)$",
        pathNot: ["^node_modules"],
      },
    },
    {
      name: "control-downstream-only",
      comment: "Control may depend on capabilities, ports, and model — not experience or adapters.",
      severity: "error",
      from: { path: "^src/control" },
      to: {
        path: "^src/(?!capabilities|ports|model)(.+)$",
        pathNot: ["^node_modules"],
      },
    },
    {
      name: "capabilities-downstream-only",
      comment: "Capabilities may depend on ports and model only.",
      severity: "error",
      from: { path: "^src/capabilities" },
      to: {
        path: "^src/(?!ports|model)(.+)$",
        pathNot: ["^node_modules", "boundary-fixtures"],
      },
    },
    {
      name: "capabilities-no-adapters",
      comment: "Capabilities must not import concrete adapters.",
      severity: "error",
      from: { path: "^src/capabilities" },
      to: { path: "^src/adapters" },
    },
    {
      name: "capabilities-no-experience",
      comment: "Capabilities must not import API/UI (experience).",
      severity: "error",
      from: { path: "^src/capabilities" },
      to: { path: "^src/experience" },
    },
    {
      name: "ports-no-upper-layers",
      comment: "Ports stay below capabilities; no upward imports.",
      severity: "error",
      from: { path: "^src/ports" },
      to: {
        path: "^src/(experience|control|capabilities|adapters|domain)",
      },
    },
    {
      name: "adapters-implement-ports",
      comment: "Adapters may depend on ports and model, not experience/control/capabilities.",
      severity: "error",
      from: { path: "^src/adapters" },
      to: {
        path: "^src/(experience|control|capabilities|domain)",
      },
    },
    {
      name: "core-no-domain-packs",
      comment: "Reusable core must not import domain packs.",
      severity: "error",
      from: {
        path: "^src/(experience|control|capabilities|ports|adapters|model)",
      },
      to: { path: "^src/domain" },
    },
    {
      name: "model-pure-no-io",
      comment: "Model layer must remain pure — no IO or infrastructure.",
      severity: "error",
      from: { path: "^src/model" },
      to: {
        path: "^src/(experience|control|capabilities|ports|adapters|domain|data|artifacts)",
      },
    },
    {
      name: "model-no-node-io",
      comment: "Model must not import Node IO modules.",
      severity: "error",
      from: { path: "^src/model" },
      to: {
        path: "^(fs|fs/promises|node:fs|node:fs/promises|path|node:path|child_process|node:child_process|net|node:net|http|node:http|https|node:https)$",
      },
    },
    {
      name: "only-sqlite-adapter-touches-sqlite-package",
      comment: "Only the SQLite adapter may depend on better-sqlite3.",
      severity: "error",
      from: { path: "^src/(?!adapters/sqlite)" },
      to: { path: "better-sqlite3" },
    },
    {
      name: "only-sqlite-adapter-imports-sqlite-adapter",
      comment: "Only code under adapters/sqlite may import the sqlite adapter module.",
      severity: "error",
      from: { path: "^src/(?!adapters/sqlite)" },
      to: { path: "^src/adapters/sqlite" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: "boundary-fixtures",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
  },
};
