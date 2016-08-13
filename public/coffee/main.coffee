$ ->
	$body = $('body')
	$main = $('main')
	$side = $('aside')

	init = () ->
		resize()
		$(window).resize resize
		
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

	$('aside li .title').click () ->
		$title = $(event.target)
		slug = $title.attr('data-slug')
		$parentList = $title.parent()
		$childList = $parentList.find('ul.'+slug)
		$title.toggleClass('toggled')
		$childList.toggleClass('open')

	init()
