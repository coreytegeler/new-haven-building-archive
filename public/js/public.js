// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $buildings, $buildingsMap, $buildingsWrap, $glossarySect, $indexSect, $infoSect, $main, $searchSect, $side, $singleSect, addTourList, centerMap, clickBuilding, clickFilter, closeSide, constrainArray, filter, getContent, hoverBuilding, initPublic, insertMap, insertStreetView, makeDraggable, openSide, panelMapSetUp, resizeMap, selectBuilding, switchSection, unhoverBuilding, updatePanelSection;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    $buildingsWrap = $('.mapWrap.buildings');
    $buildingsMap = $('.map.buildings');
    $buildings = $('.building');
    $infoSect = $('section#info');
    $indexSect = $('section#index');
    $glossarySect = $('section#glossary');
    $searchSect = $('section#search');
    $singleSect = $('section#single');
    initPublic = function() {
      $buildingsMap.masonry({
        transitionDuration: 0
      });
      resizeMap();
      makeDraggable();
      $(window).resize(resizeMap);
      $body.on('mouseenter', '.building a', hoverBuilding);
      $body.on('mouseleave', '.building a', unhoverBuilding);
      $body.on('click', '.building a', clickBuilding);
      $body.on('click', '#filter a', clickFilter);
      $body.on('click', 'aside .tab', switchSection);
      $body.on('click', '#closedHeader', openSide);
      if (loadedSlug && loadedType) {
        if (loadedType === 'building') {
          selectBuilding(loadedSlug);
        }
        if (loadedType === 'tour') {
          return filter(loadedSlug, loadedType);
        }
      } else {
        return $infoSect.addClass('show');
      }
    };
    switchSection = function() {
      var $section, $tab, sectionId;
      $tab = $(event.target);
      sectionId = $tab.attr('data-section');
      if (sectionId) {
        $section = $side.find('section#' + sectionId);
        $side.find('section.show').removeClass('show');
        return $section.addClass('show');
      } else if ($tab.is('.close')) {
        return closeSide();
      }
    };
    makeDraggable = function() {
      return Draggable.create($buildingsMap, {
        type: 'x,y',
        edgeResistance: 0.9,
        throwProps: true,
        bounds: $buildingsWrap
      });
    };
    constrainArray = function() {
      var hDiff, wDiff;
      wDiff = $buildingsWrap.innerWidth() - $buildingsMap.innerWidth();
      hDiff = $buildingsWrap.innerHeight() - $buildingsMap.innerHeight();
      return [hDiff, 0, 0, wDiff];
    };
    resizeMap = function() {
      var $window, edge, larger, length, mapHeight, mapWidth, smaller;
      $window = $(window);
      length = $buildings.length;
      smaller = Math.floor(Math.sqrt(length));
      larger = Math.round(Math.sqrt(length));
      edge = $buildings.eq(0).innerWidth();
      mapWidth = larger * edge;
      mapHeight = smaller * edge;
      $buildingsMap.css({
        width: mapWidth + 'px',
        height: mapHeight + 'px'
      }).masonry('layout');
      if (!$buildingsMap.is('.dragged')) {
        return centerMap();
      }
    };
    centerMap = function() {
      var left, mapHeight, mapWidth, top, wrapHeight, wrapWidth;
      wrapWidth = $buildingsWrap.innerWidth();
      wrapHeight = $buildingsWrap.innerHeight();
      mapWidth = $buildingsMap.innerWidth();
      mapHeight = $buildingsMap.innerHeight();
      left = wrapWidth / 2 - mapWidth / 2;
      top = wrapHeight / 2 - mapHeight / 2;
      return $buildingsMap.css({
        left: left,
        top: top
      });
    };
    hoverBuilding = function() {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.addClass('hover');
    };
    unhoverBuilding = function() {
      var $building, parent, self, slug;
      self = event.target;
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      $building = $('.building[data-slug="' + slug + '"]');
      return $building.removeClass('hover');
    };
    clickBuilding = function() {
      var parent, self, slug, url;
      event.preventDefault();
      self = this;
      if ($buildingsMap.is('.dragging')) {
        return;
      }
      parent = $(self).parents('.building')[0];
      slug = parent.dataset.slug;
      url = self.href;
      return selectBuilding(slug, url);
    };
    selectBuilding = function(slug, url) {
      var $building;
      $building = $('.building[data-slug="' + slug + '"]');
      if (!$building) {
        return;
      }
      $('.building.selected').removeClass('selected');
      $building.addClass('selected');
      getContent(slug, 'building', 'html');
      if (url) {
        window.history.pushState('', document.title, url);
      }
      return openSide();
    };
    clickFilter = function() {
      var slug, type, url;
      event.preventDefault();
      slug = $(this).parent().attr('data-slug');
      type = $(this).parent().attr('data-type');
      url = this.href;
      return filter(slug, type, url);
    };
    filter = function(slug, type, url) {
      getContent(slug, type, 'html');
      if (url) {
        window.history.pushState('', document.title, url);
      }
      openSide();
    };
    getContent = function(slug, type, format, filter) {
      var url;
      $singleSect.addClass('show loading');
      url = '/api/' + type + '/?slug=' + slug + '&format=' + format;
      if (filter) {
        url += '&filter=' + filter;
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
            return updatePanelSection(response, slug);
          } else if (type === 'tour' && format === 'html') {
            return updatePanelSection(response, slug);
          }
        }
      });
    };
    updatePanelSection = function(content, slug) {
      var tours;
      $('section.show').removeClass('show');
      $singleSect.html(content).addClass('show').removeClass('loading').attr('data-slug', slug);
      if (($(content).find('.gMapWrap').length)) {
        panelMapSetUp($singleSect);
      }
      tours = $(content).attr('data-tour');
      if (tours) {
        return addTourList(tours);
      }
    };
    addTourList = function(tours) {
      var tour;
      if (tours.includes('[')) {
        tours = JSON.parse(tours);
        return $(tours).each(function(i, tour) {
          console.log(tour);
          return getContent(tour, 'building', 'html', 'tour');
        });
      } else {
        tour = tours;
        console.log(tour);
        return getContent(tour, 'building', 'html', 'tour');
      }
    };
    panelMapSetUp = function(container) {
      var address, geocoder;
      address = $(container).find('.buildingWrap').data('address') + ', New Haven, CT 06510';
      geocoder = new google.maps.Geocoder();
      console.log(address);
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
      var $gMap, $gMapWrap, address, gMapObj, marker;
      $(container).find('show').removeClass('show');
      address = $(container).find('.address').text() + ', New Haven, CT 06510';
      $gMapWrap = $(container).find('.gMapWrap');
      $gMap = $gMapWrap.find('.gMap');
      gMapObj = new google.maps.Map($gMap[0], {
        scrollwheel: false,
        center: coords,
        zoom: 16
      });
      marker = new google.maps.Marker({
        map: gMapObj,
        position: coords
      });
      $gMapWrap.addClass('show');
    };
    insertStreetView = function(container, coords) {
      var $streetView, $streetViewWrap, address, streetViewObj, streetViewService;
      address = $(container).find('.address').text() + ', New Haven, CT 06510';
      $streetViewWrap = $(container).find('.streetViewWrap');
      $streetView = $streetViewWrap.find('.streetView');
      streetViewObj = new google.maps.StreetViewPanorama($streetView[0], {
        position: coords
      });
      streetViewService = new google.maps.StreetViewService;
      streetViewService.getPanoramaByLocation(streetViewObj.getPosition(), 50, function(data) {
        var center, heading, marker, pov;
        if (data !== null) {
          center = data.location.latLng;
          heading = google.maps.geometry.spherical.computeHeading(center, coords);
          pov = streetViewObj.getPov();
          pov.heading = heading;
          streetViewObj.setPov(pov);
          $streetViewWrap.addClass('show');
          marker = new google.maps.Marker({
            map: streetViewObj,
            position: coords
          });
        }
      });
    };
    closeSide = function() {
      var a, b, c, d, matrix, matrixParse, newMatrix, newX, sideWidth, x, y;
      matrix = $buildingsMap.css('transform');
      matrixParse = matrix.split('(')[1].split(')')[0].split(',');
      a = parseInt(matrixParse[0]);
      b = parseInt(matrixParse[1]);
      c = parseInt(matrixParse[2]);
      d = parseInt(matrixParse[3]);
      x = parseInt(matrixParse[4]);
      y = parseInt(matrixParse[5]);
      sideWidth = parseInt($side.innerWidth());
      newX = x + sideWidth;
      newMatrix = [a, b, c, d, newX, y].join(',');
      $buildingsMap.css({
        transform: 'matrix(' + newMatrix + ')'
      });
      matrix = $buildingsMap.css('transform');
      $body.addClass('full');
      $main.attr('style', '');
      resizeMap();
      return makeDraggable();
    };
    openSide = function() {
      return $body.removeClass('full');
    };
    return initPublic();
  });

}).call(this);
