define(function(require){

  var Backbone = require('backbone');
  var Handlebars = require('handlebars');
  var OriginView = require('coreJS/app/views/originView');
  var Origin = require('coreJS/app/origin');

  var AssetItemView = OriginView.extend({

    tagName: 'div',

    className: function() {
        return 'asset-management-list-item id-' + this.model.get('_id');
    },

    events: {
        'click' : 'onAssetClicked'
    },

    preRender: function() {
        this.listenTo(Origin, 'assetManagement:modal:selectItem', this.selectItem);
        this.listenTo(Origin, 'assetManagement:assetViews:remove', this.remove);
        this.listenTo(this, 'remove', this.remove);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    postRender: function() {
      if (this.model.get('_isSelected')) {
        this.$el.addClass('selected');
        Origin.trigger('assetManagement:assetItemView:preview', this.model);
      }
      // Check if it needs to lazy load the asset image
      if (this.model.get('assetType') === 'image' || this.model.get('assetType') === 'video') {
          this.$el.on('inview', _.bind(this.onInview, this));
      }
    },

    onAssetClicked: function () {
        $('.asset-management-list-item').removeClass('selected');
        this.$el.addClass('selected');
        this.model.set('_isSelected', true);
        Origin.trigger('assetManagement:assetItemView:preview', this.model);
    },

    onInview: function() {
        // Once this asset is inview - change the data-style attribute to the
        // actual style attribute
        var $previewImage = this.$('.asset-management-list-item-image');
        $previewImage.attr('style', $previewImage.attr('data-style'));
        // Remove inview as it's not needed anymore
        this.$el.off('inview');
    },

    selectItem: function(modelId) {
      if (modelId === this.model.get('_id')) {
        this.onAssetClicked();
      }
    }

  }, {
    template: 'assetManagementListItem'
  });

  return AssetItemView;

});
