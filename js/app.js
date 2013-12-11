$(function() {
  var app;
  app = (function() {
    
    function app() {
      window.app = this;
      this.screenSize();
      this.uiListeners();
      this.loadManifest();
      this.slides = [];
      this.slideCount = 0;
      this.preloadCount = 0;
      this.stage = $('.stage');
      this.galleryCount = 0;
    }
    
    app.prototype.screenSize = function() {
      $('html').height($(window).height());
      $('body').height($(window).height());
    }
    
    app.prototype.router = function() {
      if ((typeof window.location.hash !== 'undefined') && window.location.hash.length > 1) {
        this.slide(window.location.hash.slice(1, window.location.hash.length));
      } else {
        this.slide(0);
      }
    }
    
    app.prototype.slide = function(number) {
      window.location.hash = number;
      if (this.slides[number].code !== '') {
        $('.stage-container').animate({ opacity: 0 }, 400, function() {
          $('.stage-container').html(window.app.slides[number].code);
          $('.stage-container').animate({ opacity: 1 }, 400);
        });
      } else {
        $('.stage-container').animate({ opacity: 0 }, 400, function() {
          $('.stage-container').off('click', '.slide-image');
          img = document.createElement('img');
          img.className = (typeof window.app.slides[number].popup === 'undefined') ? 'slide-image' : 'slide-image action';
          img.src = 'images/slides/' + window.app.slides[number].photo;
          $('.stage-container').html(img).animate({ opacity: 1 }, 400);
          
          if (typeof window.app.slides[number].popup !== 'undefined') {
            $('.stage-container').on('click', '.slide-image', function() {
              window.app.modal(window.app.slides[number].popup, window.app.slides[number].modifier);
              
              if (typeof window.app.slides[number].doSomething !== 'undefined') {
                window.app[window.app.slides[number].doSomething]();
              }
            });
          }
          
          if (typeof window.app.slides[number].bubble !== 'undefined') {
            $('.stage-container').append('<div class="wordbubble">' + window.app.slides[number].bubble + '</div>');
          }
        });
      }
    }
    
    app.prototype.previous = function() {
      currentSlide = parseInt(window.location.hash.slice(1, window.location.hash.length));
      if (currentSlide <= 0) {
        this.slide(this.slideCount);
      } else {
        this.slide(currentSlide - 1);
      }
    }
    
    app.prototype.next = function() {
      currentSlide = parseInt(window.location.hash.slice(1, window.location.hash.length));
      if (currentSlide >= this.slideCount) {
        this.slide(0);
      } else {
        this.slide(currentSlide + 1);
      }
    }
    
    app.prototype.uiListeners = function() {
      window.onresize = function() { window.app.screenSize(); }
      $('.previous').click(function() { window.app.previous(); });
      $('.next').click(function() { window.app.next(); });
    }
    
    app.prototype.manifest = function(json) {
      this.slides = json.slides;
      this.preloader();
      this.slideCount = json.slides.length - 1;
      this.router();
    }
    
    app.prototype.loadManifest = function() {
      $.ajax({
        url: 'js/manifest.json',
        dataType: 'json'
      }).done(function(json) {
        window.app.manifest(json);
      });
    }
    
    app.prototype.preloader = function() {
      if (!this.checkForCrapBrowser()) {
        bank = document.getElementById('imagebank');
        for (slide in this.slides) {
          img = document.createElement('img');
          img.src = 'images/slides/' + this.slides[slide].photo;
          img.setAttribute('onload', 'javascript:app.preloaderProgress();');
          bank.appendChild(img);
        }
      } else {
        this.initCard();
      }
    }
    
    app.prototype.preloaderProgress = function() {
      if (this.preloadCount >= this.slideCount) {
        this.initCard();
      } else {
        this.preloadCount++;
        percent = parseInt((this.preloadCount / this.slideCount) * 100);
        $('.preloader .preloader-container .progress-bar span').width(percent + '%');
      }
    }
    
    app.prototype.initCard = function() {
      $('.preloader').fadeOut();
      $('.wrapper').fadeIn();
      this.initSnowflakes();
    }
    
    app.prototype.modal = function(content, modifier) {
      fullContent = '<a href="javascript:void(0);" class="modal-close">&times;</a>' + content + '<div class="clear"></div>';
      $('.modal').attr('class', 'modal').addClass(modifier).html(fullContent).fadeIn();
      $('.modal-close').click(function() { window.app.modalClose(); });
    }
    
    app.prototype.modalClose = function() {
      $('.modal').fadeOut().delay(500).html('');
    }
    
    app.prototype.photoGallery = function() {
      $('.modal').off('click', '.photos li');
      $('.modal').on('click', '.photos li', function() {
        $(this).animate({ left: '-2000px' });
        if (window.app.galleryCount >= $('.photos').children().length - 1) {
          window.app.modalClose();
          window.app.galleryCount = 0;
        } else {
          window.app.galleryCount++;
        }
      });
    }
    
    app.prototype.initSnowflakes = function() {
      params = {
        image: 'images/shared/flake.png',
        flakeIndex: 0,
        minSize: 10,
        maxSize: 100,
        minSpeed: 1,
        maxSpeed: 3,
        flakeCount: 20
      };
      if ($(window).width() >= 480) { $('.container').snowfall(params); };
    }
    
    app.prototype.hoverlay = function(x, y, width, height, angle) {
      element = $('.hoverlay');
      element.css('top', x + 'px');
      element.css('left', y + 'px');
      element.css('width', width + 'px');
      element.css('height', height + 'px');
      element.css('-webkit-transform', 'rotate(' + angle + 'deg)');
      element.css('-moz-transform', 'rotate(' + angle + 'deg)');
      element.css('-ms-transform', 'rotate(' + angle + 'deg)');
      element.css('-o-transform', 'rotate(' + angle + 'deg)');
      element.css('transform', 'rotate(' + angle + 'deg)');
      element.css('filter', 'progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678, sizingMethod=\'auto expand\'');
    }
    
    app.prototype.share = function(url) {
      var pop = window.open(url, 'Share the Holiday Cheer', 'menubar=0,scrollbars=0,location=0,width=600,height=400');
    }
    
    app.prototype.checkForCrapBrowser = function() {
      if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
        ieversion = new Number(RegExp.$1);
        return (ieversion < 8) ? true : false;
      }
      return false;
    }
    
    app.prototype.vidEmbed = function() {
      ratio = 0.563;
      width = $(window).width();
      $('.modal iframe').width(width).height(width * ratio);
    }
    
    return app;
    
  })();
  
  app = new app();
  
});