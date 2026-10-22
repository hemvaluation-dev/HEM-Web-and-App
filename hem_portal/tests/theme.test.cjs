const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const css = fs.readFileSync('src/app/globals.css', 'utf8')
function luminance(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16) / 255)
    .map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
}
test('normal text and primary button states maintain 4.5:1 contrast in both modes', () => {
  for (const mode of [':root', '.dark']) {
    const block = css.slice(css.indexOf(mode + ' {')).split('}')[0]
    const colors = Object.fromEntries([...block.matchAll(/(--[\w-]+):\s*(#[a-f\d]{6})/gi)].map(m => [m[1], m[2]]))
    for (const bg of ['--color-paper', '--color-paper-2', '--color-surface', '--color-surface-hover']) {
      for (const fg of ['--color-ink', '--color-muted', '--color-text-subtle', '--color-brand-dark']) {
        const a = luminance(colors[bg]), b = luminance(colors[fg])
        assert.ok((Math.max(a, b) + .05) / (Math.min(a, b) + .05) >= 4.5, `${mode}: ${fg} on ${bg}`)
      }
    }
    for (const bg of ['--primary', '--primary-hover']) {
      assert.ok((luminance(colors['--on-primary']) + .05) / (luminance(colors[bg]) + .05) >= 4.5)
    }
  }
})
