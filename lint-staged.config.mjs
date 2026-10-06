export default {
  '*.{ts,tsx,js,mjs}': [
    'eslint --flag v10_config_lookup_from_file --fix --no-warn-ignored',
    'prettier --write',
  ],
  '*.{json,css,yml,yaml}': 'prettier --write',
};
