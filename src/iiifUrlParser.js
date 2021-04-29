// JavaScript IIIF URL Parser
// Adapted from: https://github.com/NCSU-Libraries/iiif_url/blob/master/lib/iiif_url.rb
// IIIF Image API: https://iiif.io/api/image/3.0/
function isNumeric(str) {
  if (typeof str != "string") return false
  return !isNaN(str) && !isNaN(parseFloat(str))
}

function parse(url) {
  let w, h, identifier
  let url_parts = url.split('/')
  let quality_format = url_parts.pop()
  let [quality, format] = quality_format.split('.')
  let rotation_string = url_parts.pop()
  let rotation = {}

  rotation.mirror = rotation_string.indexOf('!') >= 0 ? (() => {
    rotation_string = rotation_string.replace('!', '')
    return true
  })() : false

  rotation.degrees = isNumeric(rotation_string) ? parseInt(rotation_string) : rotation_string

  let size_string = url_parts.pop()
  let size = {}
  if (/^!\d+,\d+/m.test(size_string)) {
    size.confined = true
    size_string = size_string.replace('!', '')
  }

  if (size_string.indexOf(',') >= 0) {
    let [w, h] = size_string.split(',')
    w = w === '' ? null : parseInt(w)
    h = h === '' ? null : parseInt(h)
    size.w = w
    size.h = h
  } else if (size_string.indexOf('pct') >= 0) {
    let [pct, pct_size] = size_string.split(':')
    size.pct = parseFloat(pct_size)
  } else {
    size = size_string
  }
  let region_string = url_parts.pop()

  let region = region_string.indexOf(',') >= 0 ? region_string.indexOf('pct') >= 0 ? (() => {
    let [pctx, pcty, pctw, pcth] = region_string.split(',');
    [pct, pctx] = pctx.split(':')

    return {
      pctx: parseFloat(pctx),
      pcty: parseFloat(pcty),
      pctw: parseFloat(pctw),
      pcth: parseFloat(pcth)
    }
  })() : (() => {
    let x, y;
    [x, y, w, h] = region_string.split(',')
    return {x: parseInt(x), y: parseInt(y), w: parseInt(w), h: parseInt(h)}
  })() : region_string

  identifier = url_parts.pop()
  if (identifier === '')
    identifier = null

  return {identifier, region, size, rotation, quality, format}

}

// module.exports = parse
