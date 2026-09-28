/** Same rules as production check, but includes boundary fixture files. */
const base = require("./.dependency-cruiser.cjs");

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  ...base,
  options: {
    ...base.options,
    exclude: {
      path: "node_modules",
    },
  },
};
