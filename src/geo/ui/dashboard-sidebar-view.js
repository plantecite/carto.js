var _ = require('underscore');
var $ = require('jquery');
var Ps = require('perfect-scrollbar');
var View = require('cdb/core/view');
var Model = require('cdb/core/model');
var CategoryContentView = require('cdb/geo/ui/widgets/category/content_view');
var FormulaContentView = require('cdb/geo/ui/widgets/formula/content_view');
var HistogramContentView = require('cdb/geo/ui/widgets/histogram/content-view');
var ListContentView = require('cdb/geo/ui/widgets/list/content_view');
var WidgetViewFactory = require('cdb/geo/ui/widgets/widget-view-factory');

module.exports = View.extend({

  className: 'Widget-canvas',

  initialize: function(options) {
    this._widgetViewFactory = new WidgetViewFactory([
      {
        type: 'formula',
        createContentView: function(m) {
          return new FormulaContentView({
            model: m
          });
        }
      }, {
        type: 'list',
        createContentView: function(m) {
          return new ListContentView({
            model: m
          });
        }
      }, {
        match: function(m) {
          return m.get('type') === 'histogram' && m.layer.get('type') !== 'torque';
        },
        createContentView: function(m) {
          return new HistogramContentView({
            dataModel: m,
            viewModel: new Model(),
            filter: m.filter
          });
        }
      }, {
        type: 'aggregation',
        createContentView: function(m) {
          return new CategoryContentView({
            model: m,
            filter: m.filter
          });
        }
      }
    ]);

    this._widgets = options.widgets;

    this._widgets.bind('add', this._maybeRenderWidgetView, this);
    this._widgets.bind('reset', this.render, this);
    this._widgets.bind('change:collapsed', this._onWidgetCollapsed, this);
    this.add_related_model(this._widgets);
  },

  render: function() {
    this._cleanScrollEvent();
    this.clearSubViews();
    this.$el.empty();
    this.$el.append($('<div>').addClass('Widget-canvasInner'));
    this._widgets.each(this._maybeRenderWidgetView, this);
    this._renderScroll();
    this._renderShadows();
    this._bindScroll();
    return this;
  },

  _maybeRenderWidgetView: function(widgetModel) {
    var view = this._widgetViewFactory.createWidgetView(widgetModel);
    if (view) {
      this.addView(view);
      this.$('.Widget-canvasInner').append(view.render().el);
    }
  },

  _bindScroll: function() {
    this.$('.Widget-canvasInner')
      .on('ps-y-reach-start', _.bind(this._onScrollTop, this))
      .on('ps-y-reach-end', _.bind(this._onScrollBottom, this))
      .on('ps-scroll-y', _.bind(this._onScroll, this));
  },

  _renderScroll: function() {
    Ps.initialize(this.$('.Widget-canvasInner').get(0), {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20
    });
  },

  _onWidgetCollapsed: function() {
    Ps.update(this.$('.Widget-canvasInner').get(0));
  },

  _renderShadows: function() {
    var self = this;
    this.$shadowTop = $('<div>').addClass("Widget-canvasShadow Widget-canvasShadow--top");
    this.$shadowBottom = $('<div>').addClass("Widget-canvasShadow Widget-canvasShadow--bottom is-visible");
    this.$el.append(this.$shadowTop);
    this.$el.append(this.$shadowBottom);
  },

  _onScrollTop: function() {
    this.$shadowTop.removeClass('is-visible');
  },

  _onScroll: function() {
    var $el = this.$('.Widget-canvasInner');
    var currentPos = $el.scrollTop();
    var max = $el.get(0).scrollHeight;
    var height = $el.outerHeight();
    var maxPos = max - height;
    this.$shadowTop.toggleClass('is-visible', currentPos > 0);
    this.$shadowBottom.toggleClass('is-visible', currentPos < maxPos);
  },

  _onScrollBottom: function() {
    this.$shadowBottom.removeClass('is-visible');
  },

  _cleanScrollEvent: function() {
    this.$('.Widget-canvasInner').off('ps-scroll-y');
  },

  clean: function() {
    this._cleanScrollEvent();
    View.prototype.clean.call(this);
  }

});