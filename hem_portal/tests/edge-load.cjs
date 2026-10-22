const ts = require('typescript')
const fs = require('node:fs')
const path = require('node:path')
function edgeLoad(file, env, fetch, cache = new Map()) {
  const target = path.resolve(file)
  if (cache.has(target)) return cache.get(target)
  const loaded = { exports: {} }
  cache.set(target, loaded.exports)
  const dependency = name => name.startsWith('.') ? edgeLoad(path.resolve(path.dirname(target), name), env, fetch, cache) : require(name === 'npm:pngjs@7.0.0' ? 'pngjs' : name)
  const code = ts.transpileModule(fs.readFileSync(target, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  new Function('require', 'module', 'exports', 'Deno', 'fetch', code)(dependency, loaded, loaded.exports, env, fetch)
  return loaded.exports
}
module.exports = { edgeLoad }
