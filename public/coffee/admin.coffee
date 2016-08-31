$main = $('main')
$ ->
	getData()
	$('body').on('click', 'form .add', openQuickCreate)
	$('body').on('click', '.quickCreate .close', closeQuickCreate)
	$('body').on('submit', '.quickCreate form', quickCreate)
	$('a.delete').click(askToDelete)		
	$('.select .display').click(openSelect)
	$('.select .options input').change(updateSelectValue)
	$('.updateTemplate input').change(updateTemplate)
	return

getData = () ->
	addQuickCreates('image')
	$('.populate').each (i, container) ->
		modelType = $(container).data('model')
		containerType = $(container).data('type')
		addQuickCreates(modelType)
		$.ajax
			url: '/api/?type='+modelType+'&format=json',
			error:  (jqXHR, status, error) ->
				console.log jqXHR, status, error
				return
			success: (objects, status, jqXHR) ->
				if(!objects)
					return
				switch containerType
					when 'checkboxes'
						$(objects).each (i, object) ->
							addCheckbox(container, object)
				$(container).addClass('loaded')
				return
		return
	return

addCheckbox = (container, object, checked) ->
	$clone = $(container).find('.sample').clone().removeClass('sample')
	$label = $clone.find('label')
	$input = $clone.find('input')
	value = object._id
	
	$input.attr('value', value).attr('id', object.slug+'Checkbox')
	$label.text(object.name).attr('for', object.slug+'Checkbox')
	model = $(container).data('model')
	if(!checked)
		checked = $(container).data('checked')
	if(checked)
		if(value == checked || checked.indexOf(value) > -1)
			$input.attr('checked', true)

	$clone
		.attr('data-slug', object.slug)
		.appendTo(container)
	return

openSelect = (event) ->
	$select = $(event.target).parents('.select')
	datetype = $select.attr('data-datetype')
	$options = $select.find('.options')
	$select.siblings('.select').find('.options').removeClass('open')
	$options.toggleClass('open')
	return

updateSelectValue = (event) ->
	option = event.target 
	value = option.value
	$select = $(option).parents('.select')
	$options = $select.find('.options')
	$display = $select.find('.display')
	$display.html(value)
	$options.removeClass('open')
	return

addQuickCreates = (type) ->
	$.ajax
		url: '/admin/'+type+'/quick-create'
		error: (jqXHR, status, error) ->
			console.log jqXHR, status, error
			return
		success: (html, status, jqXHR) ->
			if(!html)
				return
			$main.addClass('noscroll')
			return $('.quickCreates').append(html)
	return

openQuickCreate = (event) ->
	$button = $(event.target)
	type = $button.data('model')
	$module = $button.parents('.module')
	$quickCreate = $('.quickCreate[data-model="'+type+'"]')
	$quickCreate.addClass('open')
	return

closeQuickCreate = () ->
	$quickCreate = $(this).parents('.quickCreate')
	$quickCreate.removeClass('open')
	$main.removeClass('noscroll')
	return

quickCreate = (event) ->
	event.stopPropagation()
	event.preventDefault()
	$form = $(this)
	$quickCreate = $form.parents('.quickCreate')
	type = $quickCreate.data('model')
	data = new FormData()
	if(type == 'image')
		image = $form.find('input:file')[0].files[0]
		caption = $form.find('input.caption').val()
		data.append('image', image, image.name)
		data.append('caption', caption)
		contentType = false
		processData = false
	else
  	data = $form.serializeArray() 
  	contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  	processData = true
  console.log(data)
  console.log(postUrl)
	postUrl = $form.attr('action')
	$.ajax
		type: 'POST',
		data: data,
		url: postUrl,
		processData: processData,
		contentType: contentType,
		error: (jqXHR, status, error) ->
			console.log(jqXHR, status, error)
		success: (object, status, jqXHR) ->
			console.log(object)
			type = $quickCreate.data('model')
			checkboxes = $('.checkboxes.'+type)
			$quickCreate.removeClass('open')
			$main.removeClass('noscroll')
			if(checkboxes.length)
				addCheckbox(checkboxes, object, object._id)
			else if(type == 'image')
				addImage(object)
	return

addImage = (object) ->
	$imagesWrapper = $('.images')
	$clone = $imagesWrapper.find('.sample').clone()
	$clone.removeClass('sample')
	imageObject = {
		id: object._id,
		path: object.path,
		caption: object.caption
	}
	$clone.val(JSON.stringify(imageObject))
	$clone.attr('name', 'images[5]')
	$imagesWrapper.append($clone)

updateTemplate = (event) ->
	$input = $(event.target)
	value = $input.val()
	$('[data-template]').removeClass('show')
	$('[data-template="'+value+'"]').addClass('show')

askToDelete = (event) ->
	if(!confirm('Are you sure you want to delete this?'))
		event.preventDefault();




