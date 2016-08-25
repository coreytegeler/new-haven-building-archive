// Generated by CoffeeScript 1.10.0
(function() {
  var $main, addCheckbox, askToDelete, createQuickAddForms, getData, openQuickCreate, openSelect, quickCreate, updateSelectValue, updateTemplate;

  $main = $('main');

  $(function() {
    getData();
    $('.add').click(openQuickCreate);
    $('a.delete').click(askToDelete);
    $('.select .display').click(openSelect);
    $('.select .options input').change(updateSelectValue);
    $('.updateTemplate input').change(updateTemplate);
  });

  getData = function() {
    $('.populate').each(function(i, container) {
      var containerType, modelType;
      createQuickAddForms(container);
      modelType = $(container).data('model');
      containerType = $(container).data('type');
      $.ajax({
        url: '/api/json/?type=' + modelType,
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

  addCheckbox = function(container, object) {
    var $clone, $input, $label, checked, model, value;
    $clone = $(container).find('.sample').clone().removeClass('sample');
    $label = $clone.find('label');
    $input = $clone.find('input');
    value = object._id;
    $input.attr('value', value).attr('id', object.slug + 'Checkbox');
    $label.text(object.name).attr('for', object.slug + 'Checkbox');
    model = $(container).data('model');
    checked = $(container).data('checked');
    if (checked) {
      if (value === checked || checked.indexOf(value) > -1) {
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

  createQuickAddForms = function(container) {
    var type;
    type = $(container).data('model');
    $.ajax({
      url: '/admin/' + type + '/quick-create',
      error: function(jqXHR, status, error) {
        console.log(jqXHR, status, error);
      },
      success: function(html, status, jqXHR) {
        if (!html) {
          return;
        }
        $main.addClass('noscroll');
        return $('.quickCreates').append(html);
      }
    });
  };

  openQuickCreate = function(event) {
    var $button, $close, $module, $quickCreate, $submit, type;
    $button = $(event.target);
    type = $button.data('model');
    $module = $button.parents('.module');
    $quickCreate = $('.quickCreate[data-model="' + type + '"]');
    $quickCreate.addClass('open');
    $submit = $quickCreate.find('input[type="submit"]');
    $submit.click(quickCreate);
    $close = $quickCreate.find('.close');
    $close.click(function() {
      $quickCreate.removeClass('open');
      return $main.removeClass('noscroll');
    });
  };

  quickCreate = function(event) {
    var $form, $quickCreate, checkboxes, data, postUrl, type;
    event.preventDefault();
    $quickCreate = $(event.target).parents('.quickCreate');
    $form = $quickCreate.find('form');
    postUrl = $form.attr('action');
    data = $form.serializeArray();
    type = $quickCreate.data('model');
    checkboxes = $('.checkboxes.' + type);
    $.ajax({
      type: 'POST',
      data: data,
      url: postUrl,
      dataType: 'HTML',
      error: function(jqXHR, status, error) {
        return console.log(jqXHR, status, error);
      },
      success: function(object, status, jqXHR) {
        $quickCreate.removeClass('open');
        $main.removeClass('noscroll');
        return addCheckbox(checkboxes, JSON.parse(object), [object.slug]);
      }
    });
  };

  updateTemplate = function(event) {
    var $input, value;
    $input = $(event.target);
    value = $input.val();
    $('[data-template]').removeClass('show');
    return $('[data-template="' + value + '"]').addClass('show');
  };

  askToDelete = function(event) {
    if (!confirm('Are you sure you want to delete this?')) {
      return event.preventDefault();
    }
  };

}).call(this);
