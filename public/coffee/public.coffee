$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')
	$gridWrap = $('.gridWrap')
	$grid = $('.grid')
	$buildingTiles = $grid.find('.building')
	$buildings = $('.building')
	$infoSect = $('section#info')
	$indexSect = $('section#index')
	$glossarySect = $('section#glossary')
	$searchSect = $('section#search')
	$singleSect = $('section#single')
	filterQuery = {}

	initPublic = () ->
		$grid.masonry({
			transitionDuration: 0
		})
		resizeGrid()
		makeDraggable()
		$(window).resize () ->
			resizeGrid()
			setUpSlider()
		$(window).on 'popstate', popState
		$body.on 'mouseenter', '.building a', hoverBuilding
		$body.on 'mouseleave', '.building a', unhoverBuilding
		$body.on 'click', '.building a', clickBuilding
		$body.on 'click', 'a.filter', clickFilter
		$body.on 'click', '#closedHeader', openSide
		$body.on 'click', '.close.tab', closeSide
		$body.on 'click', '.slide', nextSlide
		$body.on 'click', '.toggler', clickToggle


		$buildingTiles.imagesLoaded().progress (instance, image) ->
    	status = if image.isLoaded then 'loaded' else 'broken'
	    $(image.img).parents('.building').addClass(status)


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
		grid = Draggable.create $grid, {
			type: 'x,y',
			edgeResistance: 0.95,
			throwProps: true,
			bounds: $gridWrap
		}

	constrainArray = () ->
	  wDiff = $gridWrap.innerWidth() - $grid.innerWidth();
	  hDiff = $gridWrap.innerHeight() - $grid.innerHeight();
	  return [hDiff, 0, 0, wDiff]

	hoverBuilding = (event) -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.addClass('hover');

	unhoverBuilding = (event) -> 
		self = event.target
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		$building = $('.building[data-slug="'+slug+'"]')
		return $building.removeClass('hover');

	clickBuilding = (event) ->
		event.preventDefault()
		self = this
		if($grid.is('.dragging'))
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
		$singleSect.addClass('loading')
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
		$('.grid.buildings .building').each (i, building) ->
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
		resizeGrid()

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
			.addClass('show')
			.html(content)
			.attr('data-id', id)
		if($(content).find('.mapWrap').length)
			panelMapSetUp($singleSect)
			setUpSlider()
		$singleSect.removeClass('loading')
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
		$mapWrap = $(container).find('.mapWrap')
		$map = $mapWrap.find('.map')
		mapObj = new google.maps.Map $map[0], {
			scrollwheel: false,
			center: coords,
			zoom: 16
		}
		marker = new google.maps.Marker
      map: mapObj,
      position: coords
		$mapWrap.addClass('loaded')

	# insertStreetView = (container, coords) ->
	# 	address = $(container).find('.address').text() + ', New Haven, CT 06510'
	# 	$streetViewWrap = $(container).find('.streetViewWrap')
	# 	$streetView = $streetViewWrap.find('.streetView')
	# 	streetViewObj = new  google.maps.StreetViewPanorama $streetView[0], {
	# 		position: coords
	# 	}
	# 	streetViewService = new google.maps.StreetViewService
	# 	streetViewService.getPanoramaByLocation streetViewObj.getPosition(), 50, (data) ->
	# 		if (data != null)
	# 			center = data.location.latLng
	# 			heading = google.maps.geometry.spherical.computeHeading(center, coords)
	# 			pov = streetViewObj.getPov()
	# 			pov.heading = heading
	# 			streetViewObj.setPov(pov)
	# 			$streetViewWrap.addClass('show')
	# 			marker = new google.maps.Marker {
 #          grid: streetViewObj,
 #          position: coords
 #        }
	# 		return
	# 	return

	setUpSlider = () ->
		$slider = $('.slider')
		$slidesWrap = $('.sliderWrap')
		$slideWrap = $('.slideWrap')
		$slides = $('.slide')
		sliderWidth = $slider.innerWidth()
		sliderHeight = $slider.innerHeight()

		$slideWrap.imagesLoaded().progress (instance, image) ->
    	status = if image.isLoaded then 'loaded' else 'broken'
	    $(image.img).parents('.slide').addClass(status)

	  if($slides.length > 1)
	  	$slider.addClass('slippery')

		$slides.each (i, slide) ->
			$image = $(slide).find('img')
			$imageWrap = $(slide).find('.imageWrap')
			imageWidth = $image[0].naturalWidth || $image[0].width
			imageHeight = $image[0].naturalHeight || $image[0].height
			ratio = imageWidth/imageHeight
			orientation = if ratio > 1 then 'landscape' else 'portait'
			$caption = $(slide).find('.caption')
			captionHeight = $caption.innerHeight()
			
			$imageWrap.css({
				height: sliderHeight - captionHeight
			})

			$(slide).css({
				width: sliderWidth
				height:	sliderHeight
			})

			if(orientation == 'landscape')
				$image.css({
					maxWidth: sliderWidth - captionHeight,
					maxHeight: sliderHeight
				})
			else if (orientation == 'portait')
				$image.css({
					maxHeight: sliderHeight - captionHeight,
					maxWidth: sliderWidth
				})

	nextSlide = () ->
		$slide = $(this)
		$next = $slide.next('.slide')
		if(!$next.length)
			$next = $slide.siblings('.slide').eq(0)
		if($next.length)
			$slide.removeClass('show')
			$next.addClass('show')
		setUpSlider()

	clickToggle = () ->
		group = this.dataset.group
		$group = $('.togglable[data-group="'+group+'"]')
		if(!$group.hasClass('show'))
			$('.togglable.show').removeClass('show')
			$group.addClass('show')
			$('.toggler.selected').removeClass('selected')
			$(this).addClass('selected')

	openSide = () ->
		# $grid = $('.grid')
		# matrix = $grid.css('transform')
		# matrixParse = matrix.split('(')[1].split(')')[0].split(',')
		# a = parseInt(matrixParse[0])
		# b = parseInt(matrixParse[1])
		# c = parseInt(matrixParse[2])
		# d = parseInt(matrixParse[3])
		# x = parseInt(matrixParse[4])
		# y = parseInt(matrixParse[5])
		# sideWidth = parseInt($side.innerWidth())
		# newX = 0
		# newMatrix = [a,b,c,d,newX,y].join(',')
		# $grid.css({transform: 'matrix('+newMatrix+')'})
		# matrix = $grid.css('transform')
		$body.removeClass('full')
		$main.attr('style', '')

	closeSide = () ->
		$body.addClass('full')
		$main.attr('style', '')
		resizeGrid()

	resizeGrid = () -> 
		$window = $(window)
		length = $buildingTiles.filter(':not(.hidden)').length
		smaller = Math.floor(Math.sqrt(length))
		larger = Math.round(Math.sqrt(length))
		edge = $buildingTiles.eq(0).innerWidth()
		gridWidth = larger * edge
		gridHeight = smaller * edge
		if(gridWidth <= parseInt($window.innerWidth()))
			gridWidth = parseInt($window.innerWidth())
		if(gridHeight <= parseInt($window.innerHeight()))
			gridHeight = parseInt($window.innerHeight())
		$grid.css({
			width: gridWidth+'px',
			height: gridHeight+'px'
		}).masonry('layout')

	centerGrid = () ->
		wrapWidth = $gridWrap.innerWidth()
		wrapHeight = $gridWrap.innerHeight()
		gridWidth = $grid.innerWidth()
		gridHeight = $grid.innerHeight()
		matrix = $grid.css('transform')	
		centerX = wrapWidth/2 - gridWidth/2
		centerY = wrapHeight/2 - gridHeight/2
		centerMatrix = [1,0,0,1,centerX,centerY].join(',')
		$grid.css({transform: 'matrix('+centerMatrix+')'}).addClass('show')

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