const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')

// Execute actual application modules, substituting only explicit external I/O mocks.
function load(file, dependencies = {}, cache = new Map()) {
  const resolved = path.resolve(file)
  if (cache.has(resolved)) return cache.get(resolved)
  const code = ts.transpileModule(fs.readFileSync(resolved, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  cache.set(resolved, loaded.exports)
  const dependency = name => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name]
    if (name.startsWith('@/') || name.startsWith('.')) {
      const base = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(resolved), name)
      const target = ['', '.ts', '.js'].map(extension => base + extension).find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
      const alias = '@/' + path.relative(path.resolve('src'), target).split(path.sep).join('/').replace(/\.(ts|js)$/, '')
      if (Object.hasOwn(dependencies, alias)) return dependencies[alias]
      return load(target, dependencies, cache)
    }
    return require(name)
  }
  new Function('require', 'module', 'exports', code)(dependency, loaded, loaded.exports)
  cache.set(resolved, loaded.exports)
  return loaded.exports
}
module.exports = { load }
