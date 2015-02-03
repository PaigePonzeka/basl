(function(){
  var isLocal = false;
  var jsonUrl = 'https://ratings-manager.herokuapp.com/getleaguesponsors.json',
      cssFile = 'http://paigeponzeka.github.io/basl/site/site.css',
      cardUrl = 'http://paigeponzeka.github.io/basl/site/card-overlay.png';

  // for local testing
  if (isLocal) {
    cssFile = 'site.css';
    cardUrl = 'card-overlay.png';
    jsonUrl = 'http://localhost:3000/getleaguesponsors.json';
  }

  var Carousel = function(options){
   this.options = $.extend(true, {}, this.defaults, options);
   // you have to change this if you move the files

   this.options.windowClass = 'sponsors-carousel-window js-sponsors-carousel-window';
   this.options.wrapperClass = 'sponsors-carousel-wrapper js-sponsors-carousel-wrapper';
   // if you move the folder you have to change this link
   this.options.imageJson = jsonUrl;
   this.init();
  };

  /**
   * Intializes the plugin
   */
  Carousel.prototype.init = function() {
    this.$container = $('.js-sponsors-carousel');
    if (this.$container.length > 0) {
      this.itemHeight = 300;
      this.currentPage = 0;
      this.wrapContainer();
      this.loadSponsorsJson();
      this.$thumbnailContainer = $('<ul />', {class: 'sponsors-carousel-thumbnails js-sponsors-carousel-thumbnails cf'});
      this.$container.closest('.js-sponsors-carousel-wrapper').append(this.$thumbnailContainer);
    }
  };

  /**
    * Wraps the ul list of images with a container
    * used mainly for styling
    */
  Carousel.prototype.wrapContainer = function() {
    this.$container.addClass('sponsors-carousel');
    this.$container.wrap('<div class="cf ' + this.options.windowClass + '"></div>');
    this.$carouselWindow = this.$container.closest('.js-sponsors-carousel-window');
    this.$carouselWindow.wrap('<div class="cf ' + this.options.wrapperClass + '"></div>');
    this.$wrapper = this.$container.closest('.js-sponsors-carousel-wrapper');
  };

  /**
   * Assumes the number of direct li's is the number of 'pages' in the carousel
   */
  Carousel.prototype.setNumberOfImages = function() {
    this.pageCount = this.$container.find('> li').length;
  };

  /**
   * The inner width of the carousel should be
   * numOfImages * widthOfLi (all fixed widths)
   */
  Carousel.prototype.setInnerWidth = function() {
    $('.js-sponsors-carousel').css('width', 3423);
  };

  /**
   * Changes the page
   */
  Carousel.prototype.changePage = function() {
    // change the margin to bring the right img into the frame
    this.$container.css('margin-top', -(this.itemHeight * this.currentPage));;
    this.currentPage++;
    $('.js-sponsors-carousel-thumbnails > li').removeClass('active');
    $('.js-thumbnail-page-' + this.currentPage).addClass('active');
    // if we get past the total number of pages go back to the first page
    if (this.currentPage >= this.pageCount) {
      this.currentPage = 0;
    }
  };

  /**
   * intializes the set time out to show the page change
   * calls itself ever 5000 ms
   */
  Carousel.prototype.initAutoPageChange = function() {
    var self = this;
    self.changePage();
      setTimeout(function() {
          self.initAutoPageChange();
      }, 5000);
  };

  /**
   * Sponsors are stored in an outside file
   * we have to load it in here in order to read it
   * @return {[type]} [description]
   */
  Carousel.prototype.loadSponsorsJson = function() {
    var self = this; // assign self to this so I can access Carousel functions in other calls
     $.ajax( {
      type: 'GET',
      datatype: 'jsonp',
      data: {},
      crossDomain: 'true',
      url: this.options.imageJson,
      error: function(textStatus, errorThrown) {
      },
      success: function(json) {
        if (json) {
          var count = 0;
          $.each(json, function(){
            count++;
            self.createAndAppendNewImage(this.url, this.logo_url, count);
          });

          self.setNumberOfImages();
          self.initAutoPageChange();
        }
      }
    });
  };

  /**
   * Generates HTML and appends it to the carousel
   * @param  {object} sponsor data containing the image and link to a sponsor
   */
  Carousel.prototype.createAndAppendNewImage = function(url, logoUrl, count) {
    var sponsorItem = $('<li />');
    var sponsorLink = $('<a />', {href: url, target: '_blank'});
    var sponsorImage = $('<img>', {src: logoUrl});

    sponsorLink.html(sponsorImage.clone());
    sponsorItem.html(sponsorLink);

    var sponsorThumbnailItem = $('<li />', {class: 'js-thumbnail-page-' + count});
    sponsorThumbnailItem.html(sponsorImage);

    this.$thumbnailContainer.append(sponsorThumbnailItem);
    this.$container.append(sponsorItem);
  };

  

  /**
   * Contact card Generator Constructor
   */
  var ContactCardGenerator= function(options){
    this.options = $.extend(true, {}, this.defaults, options);
    this.cards = $('.js-baseball-card');
    this.cardUrl = cardUrl;
    if (this.cards.length > 0) { // make sure cards exisit before doing anything
      this.init();
    }
  };

  ContactCardGenerator.prototype.init = function() {
    var self = this;
    $.each(this.cards, function(){
      self.initCard($(this));
    });
  };

  ContactCardGenerator.prototype.initCard = function($card) {
    // get the card title, link
    var name = $card.data('name') || 'Player Name',
        title = $card.attr('title') || $card.data('title'),
        emails = $card.data('email'); 
    if (emails) { // just make sure there are emails so we don't break shit
      emails = emails.split(',');
    }

    // wrap the image
    $card.wrap('<div class="card"></div');
    this.$wrapper = $card.closest('.card');
    this.$wrapper.append('<div class="card-overlay"></div>');
    this.$wrapper.find('.card-overlay').css('background-image: url(' + this.cardUrl + ')');
    if (title) {
      this.appendTitle(emails, title);
    }
    if (emails) {
      this.appendEmail(emails);
    }

    this.appendPlayerName(emails, name);
  };

  ContactCardGenerator.prototype.appendEmail = function(emails) {
    var self = this;
    $.each(emails, function(){
      self.$wrapper.append('<a class="card-email" target="_blank" href="mailto:' + this + '">' + this + '</a>');
    });

  };

  ContactCardGenerator.prototype.appendPlayerName = function(emails, name) {
    if (emails) {
      this.$wrapper.append('<a class="card-player-name" target="_blank" href="mailto:' + emails[0] + '">' + name + '</a>');
    } else {
      this.$wrapper.append('<span class="card-player-name">' + name + '<span>');
    }
  };

  ContactCardGenerator.prototype.appendTitle = function(emails, title) {
    if (emails) {
      this.$wrapper.append('<a class="card-title" target="_blank" href="mailto:' + emails[0] + '">' + title + '</a>');
    } else {
      this.$wrapper.append('<span class="card-title">' + title + '<span>');
    }
  }

  /** -- UTILITIES */
  var insertCSS = function() {
    $("head").append("<link id='sponsors-carousel-css' href='" + cssFile + "' type='text/css' rel='stylesheet' />");
  };

  // intializing the carousel
  insertCSS();
  var sponsorsCarousel = new Carousel();
  var contactCardGenerator = new ContactCardGenerator();



}());

