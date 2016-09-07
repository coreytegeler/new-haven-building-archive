// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $buildingTiles, $buildings, $glossarySect, $grid, $gridWrap, $indexSect, $infoSect, $main, $searchSect, $side, $singleSect, centerMap, clickBuilding, clickFilter, clickToggle, constrainArray, filter, filterQuery, getContent, getQuery, hoverBuilding, initPublic, insertMap, makeDraggable, nextSlide, openSide, panelMapSetUp, popState, resizeMap, selectBuilding, setUpSlider, unhoverBuilding, updateSingleSect;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    $gridWrap = $('.gridWrap');
    $grid = $('.grid');
    $buildingTiles = $grid.find('.building');
    $buildings = $('.building');
    $infoSect = $('section#info');
    $indexSect = $('section#index');
    $glossarySect = $('section#glossary');
    $searchSect = $('section#search');
    $singleSect = $('section#single');
    filterQuery = {};
    initPublic = function() {
      var id;
      $grid.masonry({
        transitionDuration: 0
      });
      resizeMap();
      makeDraggable();
      $(window).resize(function() {
        resizeMap();
        return setUpSlider();
      });
      $(window).on('popstate', popState);
      $body.on('mouseenter', '.building a', hoverBuilding);
      $body.on('mouseleave', '.building a', unhoverBuilding);
      $body.on('click', '.building a', clickBuilding);
      $body.on('click', 'a.filter', clickFilter);
      $body.on('click', '#closedHeader', openSide);
      $body.on('click', '.slide', nextSlide);
      $body.on('click', '.toggler', clickToggle);
      $buildingTiles.imagesLoaded().progress(function(instance, image) {
        var status;
        status = image.isLoaded ? 'loaded' : 'broken';
        return $(image.img).parents('.building').addClass(status);
      });
      filterQuery = {
        'tour': getQuery('tour'),
        'neighborhood': getQuery('neighborhood'),
        'era': getQuery('era'),
        'style': getQuery('style')
      };
      filter();
      if (loadedSlug && loadedType) {
        if (loadedType === 'building') {
          return selectBuilding('slug', loadedSlug);
        } else if (loadedType === 'tour') {
          id = $('#filter .tour[data-slug="' + loadedSlug + '"]').data('id');
          getContent(id, loadedType, 'html');
          return filter(id, loadedType);
        }
      } else {
        return $infoSect.addClass('show');
      }
    };
    makeDraggable = function() {
      return Draggable.create($grid, {
        type: 'x,y',
        edgeResistance: 0.95,
        throwProps: true,
        bounds: $gridWrap
      });
    };
    constrainArray = function() {
      var hDiff, wDiff;
      wDiff = $gridWrap.innerWidth() - $grid.innerWidth();
      hDiff = $gridWrap.innerHeight() - $grid.innerHeight();
      return [hDiff, 0, 0, wDiff];
    };
    resizeMap = function() {
      var $window, edge, gridHeight, gridWidth, larger, length, smaller;
      $window = $(window);
      length = $buildingTiles.filter(':not(.hidden)').length;
      smaller = Math.floor(Math.sqrt(length));
      larger = Math.round(Math.sqrt(length));
      edge = $buildingTiles.eq(0).innerWidth();
      gridWidth = larger * edge;
      gridHeight = smaller * edge;
      $grid.css({
        width: gridWidth + 'px',
        height: gridHeight + 'px'
      }).masonry('layout');
      if (!$grid.is('.dragged')) {
        return centerMap();
      }
    };
    centerMap = function() {
      var gridHeight, gridWidth, left, top, wrapHeight, wrapWidth;
      wrapWidth = $gridWrap.innerWidth();
      wrapHeight = $gridWrap.innerHeight();
      gridWidth = $grid.innerWidth();
      gridHeight = $grid.innerHeight();
      left = wrapWidth / 2 - gridWidth / 2;
      top = wrapHeight / 2 - gridHeight / 2;
      return $grid.css({
        left: left,
        top: top
      });
    };
    hoverBuilding = function(event) {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.addClass('hover');
    };
    unhoverBuilding = function(event) {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.removeClass('hover');
    };
    clickBuilding = function(event) {
      var building, id, self, url;
      event.preventDefault();
      self = this;
      if ($grid.is('.dragging')) {
        return;
      }
      building = $(self).parents('.building')[0];
      if ($(building).is('.selected')) {
        return;
      }
      id = building.dataset.id;
      url = self.href;
      return selectBuilding('id', id, url);
    };
    selectBuilding = function(attr, val, url) {
      var $building, id;
      $building = $('.building[data-' + attr + '=' + val + ']');
      if (!$building) {
        return;
      }
      id = $building.attr('data-id');
      $('.building.selected').removeClass('selected');
      $building.addClass('selected');
      $singleSect.addClass('loading');
      getContent(id, 'building', 'html');
      if (url) {
        window.history.pushState('', document.title, url);
      }
      return openSide();
    };
    clickFilter = function() {
      var $li, id, type, url;
      event.preventDefault();
      id = this.dataset.id;
      type = this.dataset.type;
      url = this.href;
      $li = $(this).parent();
      if (url) {
        window.history.pushState('', document.title, url);
      }
      if ($(this).is('.selected')) {
        $(this).removeClass('selected');
        filterQuery[type] = '';
      } else {
        $('#filter .' + type + ' a.filter').removeClass('selected');
        $(this).addClass('selected');
        filterQuery[type] = id;
      }
      return filter();
    };
    filter = function(id, type) {
      $('.grid.buildings .building').each(function(i, building) {
        var buildingValue, key, show, value;
        show = true;
        for (key in filterQuery) {
          value = filterQuery[key];
          if (value) {
            id = $('#filter a.filter[data-slug="' + value + '"]').data('id');
            if (id) {
              value = id;
            }
            buildingValue = $(building).data(key);
            if (buildingValue !== value) {
              show = false;
            }
          }
        }
        if (show) {
          return $(building).removeClass('hidden');
        } else {
          return $(building).addClass('hidden');
        }
      });
      return resizeMap();
    };
    getContent = function(id, type, format, filter) {
      var url;
      url = '/api/?type=' + type;
      if (id) {
        url += '&id=' + id;
      }
      if (format) {
        url += '&format=' + format;
      }
      $.ajax({
        url: url,
        error: function(jqXHR, status, error) {
          console.log(jqXHR, status, error);
        },
        success: function(response, status, jqXHR) {
          if (type === 'building' && format === 'html' && filter === 'tour') {
            return $singleSect.find('.group.tour').html(response);
          } else if (type === 'building' && format === 'html') {
            return updateSingleSect(response, id);
          } else if (type === 'tour' && format === 'html') {
            return updateSingleSect(response, id);
          }
        }
      });
    };
    updateSingleSect = function(content, id) {
      $('section.show').removeClass('show');
      $singleSect.parents('.inner').scrollTop(0);
      $singleSect.addClass('show').html(content).attr('data-id', id);
      if (($(content).find('.mapWrap').length)) {
        panelMapSetUp($singleSect);
        setUpSlider();
      }
      $singleSect.removeClass('loading');
      return openSide();
    };
    panelMapSetUp = function(container) {
      var address, geocoder;
      address = $(container).find('.buildingWrap').data('address') + ', New Haven, CT 06510';
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({
        'address': address
      }, function(results, status) {
        var coords;
        if (status === 'OK') {
          coords = results[0].geometry.location;
          return insertMap(container, coords);
        }
      });
    };
    insertMap = function(container, coords) {
      var $map, $mapWrap, address, mapObj, marker;
      $(container).find('show').removeClass('show');
      address = $(container).find('.address').text() + ', New Haven, CT 06510';
      $mapWrap = $(container).find('.mapWrap');
      $map = $mapWrap.find('.map');
      mapObj = new google.maps.Map($map[0], {
        scrollwheel: false,
        center: coords,
        zoom: 16
      });
      marker = new google.maps.Marker({
        map: mapObj,
        position: coords
      });
      return $mapWrap.addClass('loaded');
    };
    setUpSlider = function() {
      var $slideWrap, $slider, $slides, $slidesWrap, sliderHeight, sliderWidth;
      $slider = $('.slider');
      $slidesWrap = $('.sliderWrap');
      $slideWrap = $('.slideWrap');
      $slides = $('.slide');
      sliderWidth = $slider.innerWidth();
      sliderHeight = $slider.innerHeight();
      $slideWrap.imagesLoaded().progress(function(instance, image) {
        var status;
        status = image.isLoaded ? 'loaded' : 'broken';
        return $(image.img).parents('.slide').addClass(status);
      });
      if ($slides.length > 1) {
        $slider.addClass('slippery');
      }
      return $slides.each(function(i, slide) {
        var $caption, $image, $imageWrap, captionHeight, imageHeight, imageWidth, orientation, ratio;
        $image = $(slide).find('img');
        $imageWrap = $(slide).find('.imageWrap');
        imageWidth = $image[0].naturalWidth || $image[0].width;
        imageHeight = $image[0].naturalHeight || $image[0].height;
        ratio = imageWidth / imageHeight;
        orientation = ratio > 1 ? 'landscape' : 'portait';
        $caption = $(slide).find('.caption');
        captionHeight = $caption.innerHeight();
        $imageWrap.css({
          height: sliderHeight - captionHeight
        });
        $(slide).css({
          width: sliderWidth,
          height: sliderHeight
        });
        if (orientation === 'landscape') {
          return $image.css({
            maxWidth: sliderWidth - captionHeight,
            maxHeight: sliderHeight
          });
        } else if (orientation === 'portait') {
          return $image.css({
            maxHeight: sliderHeight - captionHeight,
            maxWidth: sliderWidth
          });
        }
      });
    };
    nextSlide = function() {
      var $next, $slide;
      $slide = $(this);
      $next = $slide.next('.slide');
      if (!$next.length) {
        $next = $slide.siblings('.slide').eq(0);
      }
      if ($next.length) {
        $slide.removeClass('show');
        $next.addClass('show');
      }
      return setUpSlider();
    };
    openSide = function() {
      return $body.removeClass('full');
    };
    clickToggle = function() {
      var $group, group;
      group = this.dataset.group;
      $group = $('.togglable[data-group="' + group + '"]');
      if (!$group.hasClass('show')) {
        $('.togglable.show').removeClass('show');
        $group.addClass('show');
        $('.toggler.selected').removeClass('selected');
        return $(this).addClass('selected');
      }
    };
    getQuery = function(type) {
      var j, len, pair, query, string, strings;
      query = window.location.search.substring(1);
      strings = query.split('&');
      for (j = 0, len = strings.length; j < len; j++) {
        string = strings[j];
        pair = string.split('=');
      }
      if (pair[0] === type) {
        return pair[1];
      }
    };
    popState = function(e) {
      var location, params, path, slug, state, type, url;
      e.preventDefault();
      state = e.originalEvent.state;
      location = e.originalEvent.currentTarget.location;
      path = location.pathname;
      params = path.split('/');
      type = params[1];
      slug = params[2];
      url = location.href;
      if (!slug) {
        return;
      }
      if (type === 'building') {
        return selectBuilding('slug', slug);
      }
    };
    return initPublic();
  });

}).call(this);
