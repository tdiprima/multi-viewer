function IiifUrl(params) {
  if (typeof params === 'undefined') params = {};
  this._params = params
}

IiifUrl._base_url = "";

IiifUrl.prototype = {
  identifier: function (identifier) {
    this._params.identifier = identifier;
    this
  },

  region: function (region) {
    this._params.region = region;
    this
  },

  size: function (size) {
    this._params.size = size;
    this
  },

  rotation: function (rotation) {
    this._params.rotation = rotation;
    this
  },

  quality: function (quality) {
    this._params.quality = quality;
    this
  },

  format: function (format) {
    this._params.format = format;
    this
  }
};

Object.defineProperty(
  IiifUrl.prototype,
  "to_s",

  {
    enumerable: true, configurable: true, get: function () {
      return IiifUrl.from_params(this._params)
    }
  }
);

IiifUrl.set_base_url = function (base_url) {
  IiifUrl._base_url = base_url
};

Object.defineProperty(
  IiifUrl,
  "base_url",

  {
    enumerable: true, configurable: true, get: function () {
      return IiifUrl._base_url
    }
  }
);

IiifUrl.from_params = function (params) {
  if (typeof params === 'undefined') params = {};
  var base_url = params.base_url;

  if (base_url == false) {
    base_url = ""
  } else if (base_url.nil) {
    base_url = IiifUrl._base_url
  }


  this.region = params.region || "full";

  if (region.is_a(Hash)) {
    if (region.x) {
      this.region = region.x + "," + region.y + "," + region.w + "," + region.h
    } else if (region.pctx) {
      this.region = "pct:" + region.pctx + "," + region.pcty + "," + region.pctw + "," + region.pcth
    }
  }


  this.size = params.size || "full";

  if (size.is_a(Hash)) {
    if (size.w || size.h) {
      this.size = size.w + "," + size.h
    } else if (size.pct) {
      this.size = "pct:" + size.pct
    }
  }


  this.rotation = params.rotation || 0;

  if (rotation.is_a(Hash)) {
    if (rotation.mirror) {
      this.rotation = "!" + rotation.degrees
    } else {
      this.rotation = rotation.degrees
    }
  }


  this.quality = params.quality || "default";
  this.format = params.format || "jpg";
  var path = "/" + region + "/" + size + "/" + rotation + "/" + quality + "." + format;

  if (params.identifier) {
    File.join(base_url, params.identifier, path)
  } else {
    path
  }
};

IiifUrl.parse = function (url) {
  var w, h, identifier;
  var url_parts = url.split("/");
  var quality_format = url_parts.pop;
  this.quality = quality_format.split(".")[0];
  this.format = quality_format.split(".")[1];
  var rotation_string = url_parts.pop;
  this.rotation = {};

  rotation.mirror = rotation_string.include("!") ? function () {
    rotation_string.sub("!", "");
    return true
  }() : false;

  rotation.degrees = is_number(rotation_string) ? rotation_string.to_i : rotation_string;
  var size_string = url_parts.pop;
  this.size = {};

  if (/^!\d+,\d+/m.test(size_string)) {
    size.confined = true;
    size_string.gsub("!", "")
  }


  if (size_string.include(",")) {
    w = size_string.split(",")[0];
    h = size_string.split(",")[1];
    w = w.empty ? null : w.to_i;
    if (!h.nil) h = h.to_i;
    size.w = w;
    size.h = h
  } else if (size_string.include("pct")) {
    var pct = size_string.split(":")[0];
    var pct_size = size_string.split(":")[1];
    size.pct = pct_size.to_f
  } else {
    this.size = size_string
  }


  var region_string = url_parts.pop;

  this.region = region_string.include(",") ? region_string.include("pct") ? function () {
    var pctx = region_string.split(",")[0];
    var pcty = region_string.split(",")[1];
    var pctw = region_string.split(",")[2];
    var pcth = region_string.split(",")[3];
    var pct = pctx.split(":")[0];
    pctx = pctx.split(":")[1];

    return {
      pctx: pctx.to_f,
      pcty: pcty.to_f,
      pctw: pctw.to_f,
      pcth: pcth.to_f
    }
  }() : function () {
    var x = region_string.split(",")[0];
    var y = region_string.split(",")[1];
    w = region_string.split(",")[2];
    h = region_string.split(",")[3];
    return {x: x.to_i, y: y.to_i, w: w.to_i, h: h.to_i}
  }() : region_string;

  this.identifier = url_parts.pop;
  if (identifier === "") this.identifier = null;

  var idk =
    {
      identifier: identifier,
      region: region,
      size: size,
      rotation: rotation,
      quality: quality,
      format: format
    }
};

IiifUrl.is_number = function (string) {
  try {
    if (Float(string)) true
  } catch ($EXCEPTION) {
    false
  }
}
