function grb(hex) {
  const r = hex.slice(0,2)
  const g = hex.slice(2,4)
  const b = hex.slice(4,6)
  const grb = `0x${g}${r}${b}`
  return grb
}
module.exports = grb;