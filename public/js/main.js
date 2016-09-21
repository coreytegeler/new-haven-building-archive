// Generated by CoffeeScript 1.10.0
(function() {
  $(function() {
    var $body, $main, $side, init, openNestedNav, resize, switchSection;
    $body = $('body');
    $main = $('main');
    $side = $('aside');
    init = function() {
      resize();
      $(window).resize(resize);
      $body.on('click', 'aside li .title', openNestedNav);
      return $body.on('click', 'aside .tab', switchSection);
    };
    resize = function() {
      var $window, sideWidth, windowWidth;
      $window = $(window);
      windowWidth = $window.innerWidth();
      return sideWidth = $side.innerWidth();
    };
    openNestedNav = function(event) {
      var $childList, $parentList, $title, slug;
      $title = $(this);
      slug = $title.attr('data-slug');
      $parentList = $title.parent();
      $childList = $parentList.find('ul.' + slug);
      $title.toggleClass('toggled');
      return $childList.toggleClass('open');
    };
    switchSection = function(event) {
      var $section, $tab, sectionId;
      $tab = $(this);
      sectionId = $tab.attr('data-section');
      if (sectionId) {
        $section = $side.find('section#' + sectionId);
        $side.find('section.show').removeClass('show');
        $side.find('.tab.selected').removeClass('selected');
        $tab.addClass('selected');
        if ($section.length) {
          $('.building.selected').removeClass('selected');
          $section.addClass('show');
          return event.preventDefault();
        } else {

        }
      }
    };
    return init();
  });

}).call(this);
