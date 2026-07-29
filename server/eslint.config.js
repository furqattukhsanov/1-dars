// Maqsad: modullar orasida YO'QOLGAN import'ni ushlash.
// Refaktoringdan keyin eng katta xavf shu edi — sintaksis to'g'ri, route javob
// beradi, lekin handler ichida import qilinmagan nom bor va u faqat o'sha
// endpoint ishlatilganda (ya'ni production'da) ishdan chiqadi.
//
// `no-undef` aynan shuni statik ravishda topadi — testdan farqli o'laroq,
// kod yo'li bajarilishini talab qilmaydi.

module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'writable',
        exports: 'writable',
        __dirname: 'readonly',
        __filename: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: ['node_modules/**'],
  },
];
