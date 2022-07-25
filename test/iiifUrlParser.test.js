// JavaScript IIIF URL Parser TESTING
// Adapted from: https://github.com/NCSU-Libraries/iiif_url/blob/master/test/iiif_url_parser_test.rb
// IIIF Image API: https://iiif.io/api/image/3.0/
const parse = require('./src/iiifUrlParser');
// TODO: Uncomment `module.exports = parse` in iiifUrlParser.

function compare(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function parseSimpleUrl(url) {
  const params = parse(url);

  const expected = {
    identifier: 'abc',
    region: 'full',
    size: 'full',
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'png'
  };

  console.log(compare(expected, params), url);
}

function parseSimplePathWithIdentifier(url) {
  const params = parse(url);

  const expected = {
    identifier: 'abc',
    region: 'full',
    size: 'full',
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'png'
  };

  console.log(compare(expected, params), url);

}

function parseSimplePathWithoutIdentifier(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: 'full',
    size: 'full',
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'png'
  };
  console.log(compare(expected, params), url);

}

function parseMirror(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: 'full',
    size: 'full',
    rotation: { mirror: true, degrees: 180 },
    quality: 'default',
    format: 'png'
  };
  console.log(compare(expected, params), url);
}

function parseParameterizedPathWithoutIdentifier(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: { x: 0, y: 100, w: 200, h: 300 },
    size: { w: 75, h: null },
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'jpg'
  };
  console.log(compare(expected, params), url);
}

function parseJustHeightSize(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: 'full',
    size: { w: null, h: 76 },
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'jpg'
  };
  console.log(compare(expected, params), url);
}

function parsePcts(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: { pctx: 0, pcty: 100, pctw: 200, pcth: 300 },
    size: { pct: 75 },
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'jpg'
  };
  console.log(compare(expected, params), url);
}

function parseConfinedSize(url) {
  const params = parse(url);

  const expected = {
    identifier: null,
    region: 'full',
    size: { confined: true, w: 225, h: 100 },
    rotation: { mirror: false, degrees: 0 },
    quality: 'default',
    format: 'jpg'
  };
  console.log(compare(expected, params), url);
}

parseSimpleUrl('http://example.org/prefix/abc/full/full/0/default.png');
parseSimplePathWithIdentifier('/abc/full/full/0/default.png');
parseSimplePathWithoutIdentifier('/full/full/0/default.png');
parseMirror('/full/full/!180/default.png');
parseParameterizedPathWithoutIdentifier('/0,100,200,300/75,/0/default.jpg');
parseJustHeightSize('/full/,76/0/default.jpg');
parsePcts('/pct:0,100,200,300/pct:75/0/default.jpg');
parseConfinedSize('/full/!225,100/0/default.jpg');
