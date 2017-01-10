var $ = require('jquery');
var Backbone = require('backbone');
// var utils = require('../helpers/utils');

module.exports = Backbone.View.extend({
  initialize: function (opts) {
    if (!opts.imageClass) { throw new Error('Image class is mandatory.'); }
    if (!opts.$imgContainer) { throw new Error('$imgContainer element is mandatory.'); }

    this.$imgContainer = opts.$imgContainer;
    this._imageClass = opts.imageClass;
    this._lastImage = {
      url: null,
      content: null
    };
  },

  _loadImage: function (imageUrl, color) {
    var self = this;
    var isSVG = this._isSVG(imageUrl);

    if (this.$imgContainer.length === 0) {
      return;
    }

    if (isSVG) {
      this._requestImage(imageUrl, function (content) {
        var svg = content.cloneNode(true);
        var $svg = $(svg);
        $svg = $svg.removeAttr('xmlns:a');
        $svg.attr('class', self._imageClass + ' js-image');

        self.$imgContainer.empty().append($svg);

        $svg.css('fill', color);
        $svg.find('path').css('fill', 'inherit');
      });
    } else {
      var $img = $('<img crossorigin="anonymous"/>');
      $img.attr('class', self._imageClass + ' js-image');
      $img.attr('src', imageUrl + '?req=markup');
      this.$imgContainer.empty().append($img);
    }
  },

  _requestImage: function (url, callback) {
    var self = this;
    var completeUrl = url + '?req=ajax';

    if (this._lastImage.url === completeUrl) {
      callback && callback(this._lastImage.content);
    } else {
      $.ajax(completeUrl)
      .done(function (data) {
        self._lastImage.url = completeUrl;
        var content = self._lastImage.content = data.getElementsByTagName('svg')[0];
        callback && callback(content);
      })
      .fail(function () {
        throw new Error("Couldn't get " + completeUrl + ' file.');
      });
    }
  },

  _updateImageColor: function (color) {
    this.$('.js-image').css('fill', color);
  },

  _isSVG: function (url) {
    if (!url) {
      return false;
    }
    var noQueryString = url.split('?')[0];
    return noQueryString && cdb.core.util.endsWith(noQueryString.toUpperCase(), 'SVG');
  }
});