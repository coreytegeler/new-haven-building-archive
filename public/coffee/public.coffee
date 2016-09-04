$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')
	$buildingsWrap = $('.mapWrap.buildings')
	$buildingsMap = $('.map.buildings')
	$buildingTiles = $buildingsMap.find('.building')
	$buildings = $('.building')
	$infoSect = $('section#info')
	$indexSect = $('section#index')
	$glossarySect = $('section#glossary')
	$searchSect = $('section#search')
	$singleSect = $('section#single')
	filterQuery = {}

	initPublic = () ->
		$buildingsMap.masonry({
			transitionDuration: 0
		})
		resizeMap()
		makeDraggable()
		$(window).resize resizeMap
		$(window).on 'popstate', popState
		$body.on 'mouseenter', '.building a', hoverBuilding
		$body.on 'mouseleave', '.building a', unhoverBuilding
		$body.on 'click', '.building a', clickBuilding
		$body.on 'click', 'a.filter', clickFilter
		$body.on 'click', '#closedHeader', openSide
		$body.on 'click', '.close.tab', closeSide
		filterQuery = {
			'tour': getQuery('tour'),
			'neighborhood': getQuery('neighborhood'),
			'era': getQuery('era'),
			'style': getQuery('style')
		}
		filter()

		if(loadedSlug && loadedType)
			if(loadedType == 'building')
				selectBuilding('slug', loadedSlug)
			else if(loadedType == 'tour')
				id = $('#filter .tour[data-slug="'+loadedSlug+'"]').data('id')
				getContent(id, loadedType, 'html')
				filter(id, loadedType)
		else
			$infoSect.addClass('show')


	makeDraggable = () ->
		Draggable.create $buildingsMap, {
			type: 'x,y',
			edgeResistance: 0.95,
			throwProps: true,
			bounds: $buildingsWrap
		}

	constrainArray = () ->
	  wDiff = $buildingsWrap.innerWidth() - $buildingsMap.innerWidth();
	  hDiff = $buildingsWrap.innerHeight() - $buildingsMap.innerHeight();
	  return [hDiff, 0, 0, wDiff]

	resizeMap = () -> 
		$window = $(window)
		length = $buildingTiles.filter(':not(.hidden)').length
		smaller = Math.floor(Math.sqrt(length))
		larger = Math.round(Math.sqrt(length))
		edge = $buildingTiles.eq(0).innerWidth()
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

	hoverBuilding = () -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.addClass('hover');

	unhoverBuilding = () -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.removeClass('hover');

	clickBuilding = () ->
		event.preventDefault()
		self = this
		if($buildingsMap.is('.dragging'))
			return
		building = $(self).parents('.building')[0]
		if($(building).is('.selected'))
			return
		id = building.dataset.id
		url = self.href
		selectBuilding('id', id, url)

	selectBuilding = (attr, val, url) ->
		$building = $('.building[data-'+attr+'='+val+']')
		if(!$building)
			return
		id = $building.attr('data-id')
		$('.building.selected').removeClass('selected')
		$building.addClass('selected')
		getContent(id, 'building', 'html')
		if(url)
			window.history.pushState('', document.title, url);
		openSide()

	clickFilter = () ->
		event.preventDefault()
		id = this.dataset.id
		type = this.dataset.type
		url = this.href
		$li = $(this).parent()
		if(url)
			window.history.pushState('', document.title, url);
		if($(this).is('.selected'))
			$(this).removeClass('selected')
			filterQuery[type] = ''
		else
			$('#filter .'+type+' a.filter').removeClass('selected')
			$(this).addClass('selected')
			filterQuery[type] = id
		filter()

	filter = (id, type) ->
		$('.map.buildings .building').each (i, building) ->
			show = true
			for key, value of filterQuery
				if(value)
					id = $('#filter a.filter[data-slug="'+value+'"]').data('id')
					if(id)
						value = id
					buildingValue = $(building).data(key)
					if(buildingValue != value)
						show = false
			if(show)
				$(building).removeClass('hidden')
			else
				$(building).addClass('hidden')
		resizeMap()

	getContent = (id, type, format, filter) ->
		url = '/api/?type='+type
		if(id)
			url += '&id='+id
		if(format)
			url += '&format='+format
		$.ajax
			url: url,
			error:  (jqXHR, status, error) ->
				console.log jqXHR, status, error
				return
			success: (response, status, jqXHR) ->
				if(type=='building'&&format=='html'&&filter=='tour')
					$singleSect.find('.group.tour').html(response)
				else if(type=='building'&&format=='html')
					updateSingleSect(response, id)
				else if(type=='tour'&&format=='html')
					updateSingleSect(response, id)
		return

	updateSingleSect = (content, id) ->
		$('section.show').removeClass('show')
		$singleSect.parents('.inner').scrollTop(0)
		$singleSect
			.html(content)
			.addClass('show')
			.removeClass('loading')
			.attr('data-id', id)
		if($(content).find('.gMapWrap').length)
			panelMapSetUp($singleSect)
		openSide()

	panelMapSetUp = (container) ->
		address = $(container).find('.buildingWrap').data('address') + ', New Haven, CT 06510'
		geocoder = new google.maps.Geocoder()
		geocoder.geocode {'address': address}, (results, status) ->
			if(status == 'OK')
				coords = results[0].geometry.location
				insertMap(container, coords)
				# insertStreetView(container, coords)
		return

	insertMap = (container, coords) ->
		$(container).find('show').removeClass('show');
		address = $(container).find('.address').text() + ', New Haven, CT 06510'
		$gMapWrap = $(container).find('.gMapWrap')
		$gMap = $gMapWrap.find('.gMap')
		gMapObj = new google.maps.Map $gMap[0], {
			scrollwheel: false,
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

	closeSide = () ->
		matrix = $buildingsMap.css('transform')
		matrixParse = matrix.split('(')[1].split(')')[0].split(',')
		a = parseInt(matrixParse[0])
		b = parseInt(matrixParse[1])
		c = parseInt(matrixParse[2])
		d = parseInt(matrixParse[3])
		x = parseInt(matrixParse[4])
		y = parseInt(matrixParse[5])
		sideWidth = parseInt($side.innerWidth())
		newX = x+sideWidth
		newMatrix = [a,b,c,d,newX,y].join(',')
		$buildingsMap.css({transform: 'matrix('+newMatrix+')'})
		matrix = $buildingsMap.css('transform')
		$body.addClass('full')
		$main.attr('style', '')
		resizeMap()
		makeDraggable()

	openSide = () ->
		$body.removeClass('full')

	getQuery = (type) ->
  	query = window.location.search.substring(1)
  	strings = query.split('&')
  	for string in strings
  		pair = string.split('=')
			if(pair[0] == type)
				return pair[1]

	popState = (e) ->
		e.preventDefault()
		state = e.originalEvent.state
		location = e.originalEvent.currentTarget.location
		path = location.pathname
		params = path.split('/')
		type = params[1]
		slug = params[2]
		url = location.href
		if(!slug)
			return
		if (type == 'building')
			selectBuilding('slug', slug)

		
	initPublic()