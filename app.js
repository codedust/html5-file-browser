var app = function(){
  var base_dir = (location.pathname.replace('/index.html', '/') +
                  "/files/").replace(/\/\//g, '/');
  var current_dir = (base_dir + location.hash.substring(1) +
                     '/').replace(/\/\//g, '/');
  var IMG_EXTENSIONS = ['bmp', 'gif', 'jpg', 'jpeg', 'jpe', 'png'];
  var IGNORED_ELEMENTS = ['../', 'Name', 'Last modified', 'Size', 'Description',
                          'Parent Directory'];
  var imgCache = [];
  var prev_img = "";
  var next_img = "";


  // create a tile
  function createTile(href, name) {
    return '<a href="'+href+name+'"><span class="glyphicon glyphicon-file" aria-hidden="true"></span>'+name+'</a>';
  }

  // cache an image for future usage
  function cacheImage(file) {
    for (var i=0; i<imgCache.length; i++) {
      if (imgCache[i].src == file) return;
    }
    imgCache.push(file);
  }

  // check if the given path points to an image
  function isImage(path) {
    return $.inArray(path.split('.').pop().toLowerCase(), IMG_EXTENSIONS) != -1;
  }

  function isValidTile(name) {
    return $.inArray(name, IGNORED_ELEMENTS) == -1;
  }

  // load the contents of the given directory
  function cd(dir) {
    current_dir = dir;

    location.hash = current_dir.replace(base_dir, '');

    // show the location bar
    $(".current-dir").text('');
    var path = current_dir.replace(base_dir, '/').split('/');

    var temp_path = "";
    for (var i=0; i<path.length-1; i++) {
      var a = document.createElement('a');
      temp_path += path[i] + '/';
      $(a).text(path[i] + '/');
      a.title = base_dir + temp_path.substring(1);
      $(a).click(function(){
        cd(this.title);
      });
      $(".current-dir").append(a);
    }

    // retrieve the contents of the directory
    $.get(current_dir, function(data) {
      html = $.parseHTML(data);
      $(".browser-view").html("");

      // create tiles
      $(html).find("a").each(function(i, element){
        if (isValidTile(element.text)) {
          $(".browser-view").append(
            createTile(current_dir, element.text));
        }
      });

      // add events to tiles
      $(".browser-view a").each(function(i, element){
        if (element.pathname.slice(-1) == "/" ) {
          // open directories
          $(element).click(function(e) {
            e.preventDefault();
            cd(element.pathname);
          });
        } else if (isImage(element.pathname)) {
          // show image previews
          $(element).click(function(e) {
            e.preventDefault();
            showPreview(element.pathname);
          });
        }
      });
    });
  }

  // show an image preview of the given file
  function showPreview(filepath){
    $(".bg-translucent").css('display', 'block');
    $(".file-view-img").css('padding-top', '2em');
    $(".file-view-img").attr('src', 'loader.gif');
    $(".file-view-wrapper").css('display', 'block');
    var img = new Image();
    img.src = filepath;
    img.onload = function() {
      $(".file-view-img").fadeOut(0);
      $(".file-view-img").css('padding-top', '0');
      $(".file-view-img").attr('src', filepath);
      $(".file-view-img").fadeIn();
      var scale_width = 0.8 * $(window).width() / img.width;
      var scale_height = 0.8 * $(window).height() / img.height;
      var imgWidth = img.width * Math.min(scale_width, scale_height);
      var imgHeight = img.height * Math.min(scale_width, scale_height);
      $(".file-view-wrapper").css('left', ($(document).width() - imgWidth) / 2);
      $(".file-view-wrapper").css('width', imgWidth);
      $(".file-view-wrapper").css('height', imgHeight);
      $(".file-view-prev").css('display', 'block');
      $(".file-view-next").css('display', 'block');
    };
    cacheImage(filepath);

    // search for the previous and next image to be displayed
    var first_img = "";
    var last_img = "";
    prev_img = "";
    next_img = "";
    var img_found = false;
    $(".browser-view a").each(function(i, element){
      if (isImage(element.pathname)) {
        if (first_img === "") first_img = element.pathname;
        if (img_found && next_img === "") { next_img = element.pathname; }
        if (element.pathname == filepath) img_found = true;
        if (!img_found) prev_img = element.pathname;
        last_img = element.pathname;
      }
    });
    if (next_img === "") next_img = first_img;
    if (prev_img === "") prev_img = last_img;
  }

  // close the image preview
  function closePreview() {
    $(".bg-translucent").css('display', 'none');
    $(".file-view-wrapper").css('display', 'none');
  }

  // add various event handlers
  $('.file-view-prev').click(function(){
    showPreview(prev_img);
  });
  $('.file-view-next').click(function(){
    showPreview(next_img);
  });
  $("body").keydown(function(event) {
    switch (event.which) {
      case 27: // ESC
        closePreview();
        break;
      case 37: // left arrow key
        showPreview(prev_img);
        break;
      case 39: // right arrow key
        showPreview(next_img);
        break;
    }
  });
  $(".bg-translucent").click(closePreview);
  $('.base-dir-icon').click(function(){
    cd(base_dir);
  });

  cd(current_dir);
}();
