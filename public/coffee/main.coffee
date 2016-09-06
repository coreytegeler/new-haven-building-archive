$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')

	init = () ->
		resize()
		$(window).resize resize
		$body.on 'click', 'aside li .title', openNestedNav
		$body.on 'click', 'aside .tab', switchSection
		$body.on 'click', '.close.tab', closeSide
		
	resize = () -> 
		$window = $(window)
		windowWidth = $window.innerWidth()
		sideWidth = $side.innerWidth()

		if(!$body.is('.full'))
			mainWidth = windowWidth - sideWidth
			$main.css({
				marginLeft: sideWidth+'px',
				width: mainWidth+'px'
			})

	openNestedNav = (event) ->
		$title = $(this)
		slug = $title.attr('data-slug')
		$parentList = $title.parent()
		$childList = $parentList.find('ul.'+slug)
		$title.toggleClass('toggled')
		$childList.toggleClass('open')

	switchSection = (event) ->
		$tab = $(this)
		sectionId = $tab.attr('data-section')
		if(sectionId)
			$section = $side.find('section#'+sectionId)
			$side.find('section.show').removeClass('show')
			$side.find('.tab.selected').removeClass('selected')
			$tab.addClass('selected')
			if($section.length)
				$section.addClass('show')
				event.preventDefault()
			else
				return

	closeSide = () ->
		$grid = $('.grid')
		if($grid.length)
			matrix = $grid.css('transform')
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
			$grid.css({transform: 'matrix('+newMatrix+')'})
			matrix = $grid.css('transform')
		$body.addClass('full')
		$main.attr('style', '')
		resizeMap()
		makeDraggable()

	init()
