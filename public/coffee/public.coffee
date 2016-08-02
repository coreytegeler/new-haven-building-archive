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
		url = self.href
		$building = $('.building[data-slug="'+slug+'"]')
		if(!$building)
			return
		$('.building.selected').removeClass('selected')
		$building.addClass('selected')

		window.history.pushState('', document.title, url);





	init()