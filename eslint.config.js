import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react' // Bạn nên cài thêm plugin này nếu chưa có

export default [
  {
    // Bỏ qua thư mục build
    ignores: ['dist']
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node, // Thêm node: true như bản cũ
        ...globals.es2020
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    settings: {
      react: { version: '18.2' } // Giữ nguyên version từ bản cũ
    },
    rules: {
      // Tận dụng các quy tắc mặc định
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // --- CÁC RULES TỪ VIDEO HƯỚNG DẪN ---
      'react-refresh/only-export-components': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/prop-types': 0,
      'react/display-name': 0,
      'no-restricted-imports': [
      'error',
          {
            'patterns': [{ 'regex': '^@mui/[^/]+$' }]
          }
        ],
      'no-console': 1,
      'no-lonely-if': 1,
      'no-unused-vars': 1,
      'no-trailing-spaces': 1,
      'no-multi-spaces': 1,
      'no-multiple-empty-lines': 1,
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': [1, 'always'],
      'indent': ['warn', 2],
      'semi': [1, 'never'],
      'quotes': ['error', 'single'],
      'array-bracket-spacing': 1,
      'linebreak-style': 0,
      'no-unexpected-multiline': 'warn',
      'keyword-spacing': 1,
      'comma-dangle': 1,
      'comma-spacing': 1,
      'arrow-spacing': 1
    }
  }
]