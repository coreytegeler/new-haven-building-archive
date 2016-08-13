$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')
	$buildingsWrap = $('.mapWrap.buildings')
	$buildingsMap = $('.map.buildings')
	$buildings = $('.building')
	$infoSect = $('section#info')
	$indexSect = $('section#index')
	$glossarySect = $('section#glossary')
	$searchSect = $('section#search')
	$singleSect = $('section#single')

	initPublic = () ->
		$buildingsMap.masonry({
			transitionDuration: 0
		})

		resizeMap()
		makeDraggable()

		$(window).resize resizeMap

		$('body').on 'mouseenter', '.building a', ->
			hoverBuilding(this)
		$('body').on 'mouseleave', '.building a', ->
			unhoverBuilding(this)
		$('body').on 'click', '.building a', ->
			 clickBuilding(this)

		if(loadedSlug && loadedType)
			selectBuilding(loadedSlug, loadedType)
		else
			$infoSect.addClass('show')

	$('aside .tab').click () ->
		$tab = $(event.target)
		sectionId = $tab.attr('data-section')
		if(sectionId)
			$section = $side.find('section#'+sectionId)
			$side.find('section.show').removeClass('show')
			$section.addClass('show')
		else if($tab.is('.close'))
			left = parseInt($buildingsMap.css('left'))
			sideWidth = parseInt($side.innerWidth())
			newLeft = left+sideWidth
			$buildingsMap.css({left: newLeft})
			$body.addClass('full')
			$main.attr('style', '')
			resizeMap()
			makeDraggable()

	$('#closedHeader').click () ->
		$body.removeClass('full')

	makeDraggable = () ->
		Draggable.create $buildingsMap, {
			type: 'x,y',
			edgeResistance: 0.9,
			throwProps: true,
			bounds: $buildingsWrap
		}

	constrainArray = () ->
	  wDiff = $buildingsWrap.innerWidth() - $buildingsMap.innerWidth();
	  hDiff = $buildingsWrap.innerHeight() - $buildingsMap.innerHeight();
	  return [hDiff, 0, 0, wDiff]

	resizeMap = () -> 
		$window = $(window)
		length = $buildings.length
		smaller = Math.floor(Math.sqrt(length))
		larger = Math.round(Math.sqrt(length))
		edge = $buildings.eq(0).innerWidth()
		mapWidth = larger * edge
		mapHeight = smaller * edge
		$buildingsMap.css({
			width: mapWidth+'px',
			height: mapHeight+'px'
		}).masonry('layout')

		if(!$buildingsMap.is('.dragged'))
			centerMap()

	centerMap = () ->
		wrapWidth = $buildingsWrap.innerWidth()
		wrapHeight = $buildingsWrap.innerHeight()
		mapWidth = $buildingsMap.innerWidth()
		mapHeight = $buildingsMap.innerHeight()
		left = wrapWidth/2 - mapWidth/2
		top = wrapHeight/2 - mapHeight/2
		$buildingsMap.css({
			left: left,
			top: top
		});

	hoverBuilding = (self) -> 
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.addClass('hover');

	unhoverBuilding = (self) -> 
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.removeClass('hover');

	clickBuilding = (self) ->
		event.preventDefault()
		if($buildingsMap.is('.dragging'))
			return
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		type = parent.dataset.type
		url = self.href
		selectBuilding(slug, type, url)

	selectBuilding = (slug, type, url) ->
		$building = $('.building[data-slug="'+slug+'"]')
		if(!$building)
			return
		$('.building.selected').removeClass('selected')
		$building.addClass('selected')
		getContent(slug, 'building', $singleSect)
		if(url)
			window.history.pushState('', document.title, url);

	getContent = (slug, type) ->
		$singleSect.addClass('show loading')
		$.ajax
			url: '/api/'+type+'/'+slug+'/html'
			error:  (jqXHR, status, error) ->
				console.log jqXHR, status, error
				return
			success: (response, status, jqXHR) ->
				$singleSect.html(response)
				$singleSect.removeClass('loading')
				if($(response).find('#gMapWrap'))
					panelMapSetUp($singleSect)
		return

	panelMapSetUp = (container) ->
		address = $(container).find('.address').text() + ', New Haven, CT 06510'
		geocoder = new google.maps.Geocoder()
		geocoder.geocode {'address': address}, (results, status) ->
			if(status == 'OK')
				coords = results[0].geometry.location
				insertMap(container, coords)
				insertStreetView(container, coords)
		return

	insertMap = (container, coords) ->
		$(container).find('show').removeClass('show');
		address = $(container).find('.address').text() + ', New Haven, CT 06510'
		$gMapWrap = $(container).find('.gMapWrap')
		$gMap = $gMapWrap.find('.gMap')
		gMapObj = new google.maps.Map $gMap[0], {
			center: coords,
			zoom: 16
		}
		marker = new google.maps.Marker {
      map: gMapObj,
      position: coords
    }
		$gMapWrap.addClass('show')
		return

	insertStreetView = (container, coords) ->
		address = $(container).find('.address').text() + ', New Haven, CT 06510'
		$streetViewWrap = $(container).find('.streetViewWrap')
		$streetView = $streetViewWrap.find('.streetView')
		streetViewObj = new  google.maps.StreetViewPanorama $streetView[0], {
			position: coords
		}
		streetViewService = new google.maps.StreetViewService
		streetViewService.getPanoramaByLocation streetViewObj.getPosition(), 50, (data) ->
			if (data != null)
				center = data.location.latLng
				heading = google.maps.geometry.spherical.computeHeading(center, coords)
				pov = streetViewObj.getPov()
				pov.heading = heading
				streetViewObj.setPov(pov)
				$streetViewWrap.addClass('show')
				marker = new google.maps.Marker {
          map: streetViewObj,
          position: coords
        }
			return
		return

	initPublic()