let apiRoot = ''

console.log('import.mete', import.meta.env)
console.log('process.env', process.env)

if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'http://localhost:8017'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://trello-api-wt7a.onrender.com'
}
export const API_ROOT = apiRoot
