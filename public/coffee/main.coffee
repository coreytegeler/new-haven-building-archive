$ ->
	$main = $('main')
	$buildingMap = $('.map.buildings')
	$buildings = $('.building')
	$buildingMap.pep()
	$buildingMap.masonry({
		transitionDuration: 0
	})
	resizeMap()
	width = $buildingMap.width()
	height = $buildingMap.height()
	left = $(window).innerWidth()/2 - width/2
	top = $(window).innerHeight()/2 - height/2
	$buildingMap.css({
		left: left,
		top: top
	});
	$(window).resize(resizeMap)
	return

resizeMap = () -> 
	$window = $(window)
	$buildings = $('.building')
	$buildingMap = $('.map.buildings')
	length = $buildings.length
	half = Math.floor(Math.sqrt(length))
	edge = $buildings.eq(0).innerWidth();
	width = half * edge
	height = half * edge
	$buildingMap.css({
		width: width+'px',
		height: height+'px'
	})
	$buildingMap.masonry('layout')
	return