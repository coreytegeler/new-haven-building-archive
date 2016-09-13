// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $main, addCheckbox, addImage, addQuicky, closeQuicky, deleteObject, getData, initAdmin, openQuicky, openSelect, quickySave, updateSelectValue, updateTemplate;
    $body = $('body');
    $main = $('main');
    initAdmin = function() {
      getData();
      $body.on('click', 'form .add', openQuicky);
      $body.on('click', 'form .images .edit', openQuicky);
      $body.on('click', '.quicky .close', closeQuicky);
      $body.on('submit', '.quicky form', quickySave);
      $body.on('click', 'a.delete', deleteObject);
      $('.select .display').click(openSelect);
      $('.select .options input').change(updateSelectValue);
      return $('.updateTemplate input').change(updateTemplate);
    };
    getData = function() {
      if (($('form .images').length)) {
        $('form .images .image').each(function(i, imageWrap) {
          var id;
          if ($(imageWrap).is('.sample')) {
            return addQuicky('image');
          } else {
            id = $(imageWrap).attr('data-id');
            if (id) {
              return addQuicky('image', id);
            }
          }
        });
      }
      $('form .populate').each(function(i, container) {
        var containerType, modelType;
        modelType = $(container).data('model');
        containerType = $(container).data('type');
        addQuicky(modelType);
        $.ajax({
          url: '/api/?type=' + modelType + '&format=json',
          error: function(jqXHR, status, error) {
            console.log(jqXHR, status, error);
          },
          success: function(objects, status, jqXHR) {
            if (!objects) {
              return;
            }
            switch (containerType) {
              case 'checkboxes':
                $(objects).each(function(i, object) {
                  return addCheckbox(container, object);
                });
            }
            $(container).addClass('loaded');
          }
        });
      });
    };
    addCheckbox = function(container, object, checked) {
      var $clone, $input, $label, checkedValue, j, len, model, value, valueObject;
      $clone = $(container).find('.sample').clone().removeClass('sample');
      $label = $clone.find('label');
      $input = $clone.find('input');
      if (!object) {
        return;
      }
      valueObject = {
        name: object.name,
        slug: object.slug,
        id: object._id
      };
      value = JSON.stringify(valueObject);
      $input.attr('value', value).attr('id', object.slug + 'Checkbox');
      $label.text(object.name).attr('for', object.slug + 'Checkbox');
      model = $(container).data('model');
      if (!checked) {
        checked = $(container).data('checked');
      }
      if (checked) {
        if ($.isArray(checked)) {
          for (j = 0, len = checked.length; j < len; j++) {
            checkedValue = checked[j];
            if (valueObject.id === checkedValue.id) {
              $input.attr('checked', true);
            }
          }
        }
        if (valueObject.id === checked.id) {
          $input.attr('checked', true);
        }
      }
      $clone.attr('data-slug', object.slug).appendTo(container);
    };
    openSelect = function(event) {
      var $options, $select, datetype;
      $select = $(event.target).parents('.select');
      datetype = $select.attr('data-datetype');
      $options = $select.find('.options');
      $select.siblings('.select').find('.options').removeClass('open');
      $options.toggleClass('open');
    };
    updateSelectValue = function(event) {
      var $display, $options, $select, option, value;
      option = event.target;
      value = option.value;
      $select = $(option).parents('.select');
      $options = $select.find('.options');
      $display = $select.find('.display');
      $display.html(value);
      $options.removeClass('open');
    };
    addQuicky = function(type, id) {
      var url;
      url = '/admin/' + type + '/quicky/';
      if (id) {
        url += id;
      }
      $.ajax({
        url: url,
        error: function(jqXHR, status, error) {
          console.log(jqXHR, status, error);
        },
        success: function(html, status, jqXHR) {
          if (!html) {
            return;
          }
          return $('.quickies').append(html);
        }
      });
    };
    openQuicky = function() {
      var $button, $module, $quicky, id, type;
      $button = $(this);
      id = $button.data('id');
      type = $button.data('model');
      $module = $button.parents('.module');
      if (!id) {
        $quicky = $('.quicky.create[data-model="' + type + '"]');
      } else {
        $quicky = $('.quicky.edit[data-id="' + id + '"]');
      }
      $quicky.addClass('open');
      $main.addClass('noscroll');
    };
    closeQuicky = function() {
      var $quicky;
      $quicky = $(this).parents('.quicky');
      $quicky.removeClass('open');
      $main.removeClass('noscroll');
    };
    quickySave = function(event) {
      var $form, $quicky, caption, contentType, data, id, image, postUrl, processData, type;
      event.stopPropagation();
      event.preventDefault();
      $form = $(this);
      $quicky = $form.parents('.quicky');
      id = $quicky.data('id');
      type = $quicky.data('model');
      data = new FormData();
      if (type === 'image' && !id.length) {
        image = $form.find('input:file')[0].files[0];
        caption = $form.find('input.caption').val();
        data.append('image', image, image.name);
        data.append('caption', caption);
        contentType = false;
        processData = false;
      } else {
        data = $form.serializeArray();
        contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        processData = true;
      }
      postUrl = $form.attr('action');
      if (!data) {
        return;
      }
      $.ajax({
        type: 'POST',
        data: data,
        url: postUrl,
        processData: processData,
        contentType: contentType,
        error: function(jqXHR, status, error) {
          console.log(jqXHR, status, error);
          return alert('Error, check browser console logs');
        },
        success: function(object, status, jqXHR) {
          var checkboxes;
          type = $quicky.data('model');
          checkboxes = $('.checkboxes.' + type);
          $quicky.removeClass('open');
          $main.removeClass('noscroll');
          if (checkboxes.length) {
            return addCheckbox(checkboxes, object, object._id);
          } else if (type === 'image') {
            return addImage(object);
          }
        }
      });
    };
    addImage = function(object) {
      var $clone, $cloneCaption, $cloneImg, $imagesInput, $imagesWrapper, i, imageObject, imagesInputVal, thisObject, updating;
      $imagesWrapper = $('.images');
      $imagesInput = $imagesWrapper.find('input:text');
      imageObject = {
        id: object._id,
        path: object.path,
        caption: object.caption
      };
      if ($imagesInput.val()) {
        imagesInputVal = JSON.parse($imagesInput.val());
      } else {
        imagesInputVal = [];
      }
      updating = false;
      if (imagesInputVal.length) {
        for (i in imagesInputVal) {
          thisObject = imagesInputVal[i];
          if (thisObject.id === imageObject.id) {
            imagesInputVal[i] = imageObject;
            updating = true;
          }
        }
        if (!updating) {
          imagesInputVal.push(imageObject);
        }
      } else {
        imagesInputVal = [imageObject];
      }
      $imagesInput.val(JSON.stringify(imagesInputVal));
      if (!$imagesWrapper.find('.image[data-id="' + object._id + '"]').length) {
        $clone = $imagesWrapper.find('.sample').clone();
        $cloneImg = $clone.find('img');
        $cloneCaption = $clone.find('.caption');
        $clone.removeClass('sample');
        $clone.attr('data-id', imageObject._id);
        $cloneImg.attr('src', imageObject.path);
        $cloneCaption.text(imageObject.caption);
        return $imagesWrapper.append($clone);
      }
    };
    updateTemplate = function(event) {
      var $input, value;
      $input = $(event.target);
      value = $input.val();
      $('[data-template]').removeClass('show');
      return $('[data-template="' + value + '"]').addClass('show');
    };
    deleteObject = function(event) {
      var $input, $quicky, id, inputVal;
      if (!confirm('Are you sure you want to delete this?')) {
        return event.preventDefault();
      }
      $quicky = $(this).parents('.quicky');
      if ($quicky.length) {
        id = $quicky.attr('data-id');
        $input = $('.images input:text[name="images"]');
        inputVal = JSON.parse($input.val());
        inputVal = inputVal.filter(function(image) {
          return image.id !== id;
        });
        inputVal = JSON.stringify(inputVal);
        $input.val(inputVal);
        $('.image[data-id="' + id + '"]').remove();
        $quicky.remove();
        $main.removeClass('noscroll');
        return event.preventDefault();
      }
    };
    return initAdmin();
  });

}).call(this);
