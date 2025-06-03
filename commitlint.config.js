// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix'], // chỉ cho phép feat, fix
    ],
    'subject-empty': [2, 'never'],
  },
};
