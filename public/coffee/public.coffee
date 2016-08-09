$ ->
	$main = $('main')
	$buildingWrap = $('.mapWrap.buildings')
	$buildingMap = $('.map.buildings')
	$buildings = $('.building')

	init = () ->
		$buildingMap.masonry({
			transitionDuration: 0
		})
		resizeMap()
		$(window).resize resizeMap
		handleBuildings()

		$buildingMap.pep({
			useCSSTranslation: false,
			constrainTo: constrainArray(),
			start: (event) ->
				$buildingMap.addClass('dragged')
				$buildingMap.addClass('dragging')
			stop: ->
				$buildingMap.removeClass('dragging')
		})

	constrainArray = () ->
	  wDiff = $buildingMap.width() - $buildingWrap.innerWidth();
	  hDiff = $buildingMap.height() - $buildingWrap.innerHeight();
	  return [-hDiff, 0, 0, -wDiff]

	resizeMap = () -> 
		$window = $(window)
		length = $buildings.length
		smaller = Math.floor(Math.sqrt(length))
		larger = Math.round(Math.sqrt(length))
		edge = $buildings.eq(0).innerWidth();
		width = larger * edge
		height = smaller * edge
		$buildingMap.css({
			width: width+'px',
			height: height+'px'
		})
		$buildingMap.masonry('layout')
		if(!$buildingMap.is('.dragged'))
			width = $buildingMap.width()
			height = $buildingMap.height()
			left = $buildingWrap.innerWidth()/2 - width/2
			top = $buildingWrap.innerHeight()/2 - height/2
			$buildingMap.css({
				left: left,
				top: top
			});
		return

	handleBuildings = () ->
		$('body').on 'mouseenter', '.building a', ->
			hoverBuilding(this)
		$('body').on 'mouseleave', '.building a', ->
			unhoverBuilding(this)
		$('body').on 'click', '.building a', ->
			selectBuilding(this)

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

	selectBuilding = (self) ->
		event.preventDefault()
		if($buildingMap.is('.dragging'))
			return
		parent = $(self).parents('.building')[0]
		slug = parent.dataset.slug
		type = parent.dataset.type
		url = self.href
		$building = $('.building[data-slug="'+slug+'"]')
		if(!$building)
			return
		$('.building.selected').removeClass('selected')
		$building.addClass('selected')
		openBuilding(slug, type)
		window.history.pushState('', document.title, url);

	openBuilding = (slug, type) ->
		$panel = $('.buildingPanel')
		$main.addClass('opened')
		$panel.addClass('loading')
		getData(slug, type, $panel)

	getData = (slug, type, container) ->
		console.log slug, type
		$(container).addClass('show loading')
		$.ajax
			url: '/api/'+type+'/'+slug+'/html'
			error:  (jqXHR, status, error) ->
				console.log jqXHR, status, error
				return
			success: (response, status, jqXHR) ->
				$(container).html(response)
				$(container).removeClass('loading')
				if($(response).find('#gMapWrap'))
					initMap(container)
		return

	initMap = (container) ->
		address = $(container).find('.address').text() + ', New Haven, CT 06510'
		gMapWrap = $(container).find('.gMapWrap')[0]
		geocoder = new google.maps.Geocoder()

		gMap = new google.maps.Map gMapWrap, {
			center: {lat: -34.397, lng: 150.644},
			zoom: 16
		}
		geocoder.geocode {'address': address}, (results, status) ->
			if(status == 'OK')
				gMap.setCenter(results[0].geometry.location)
				marker = new google.maps.Marker {
	        map: gMap,
	        position: results[0].geometry.location
	      }

	init()