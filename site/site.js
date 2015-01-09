(function(){
  var cssFile = "http://paigeponzeka.github.io/basl/site/site.css";
  var Carousel = function(options){
   this.options = $.extend(true, {}, this.defaults, options);
   // you have to change this if you move the files

   this.options.wrapperClass = 'sponsors-carousel-wrapper';
   // if you move the folder you have to change this link
   this.options.imageJson = 'https://35b7f1d7d0790b02114c-1b8897185d70b198c119e1d2b7efd8a2.ssl.cf1.rackcdn.com/website_files/31832/original/sponsors.json?1420773673';
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
    }
  };

  /**
    * Wraps the ul list of images with a container
    * used mainly for styling
    */
  Carousel.prototype.wrapContainer = function() {
    this.$container.wrap('<div class="cf ' + this.options.wrapperClass + '"></div>');
  };

  /**
   * Assumes the number of direct li's is the number of 'pages' in the carousel
   */
  Carousel.prototype.setNumberOfImages = function() {
    this.pageCount = this.$container.find('> li').length;
    console.log(this.pageCount);
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
    $.getJSON(
      this.options.imageJson,
      function(json){
      // we can only initialize the carousel AFTER we've loaded all the image data
      // make sure we at least get back results so we don't break things
      if (json && json.sponsors) {
        $.each(json.sponsors, function(){
          self.createAndAppendNewImage(this);
        });

        self.setNumberOfImages();
        self.initAutoPageChange();
      }
    });
  };

  /**
   * Generates HTML and appends it to the carousel
   * @param  {object} sponsor data containing the image and link to a sponsor
   */
  Carousel.prototype.createAndAppendNewImage = function(sponsor) {
    var sponsorItem = $('<li />');
    var sponsorLink = $('<a />', {href: sponsor.linkUrl, target: '_blank'});
    var sponsorImage = $('<img>', {src: sponsor.imageUrl});

    sponsorLink.html(sponsorImage);
    sponsorItem.html(sponsorLink);

    this.$container.append(sponsorItem);
  };

  /**
   * Contact card Generator Constructor
   */
  var ContactCardGenerator= function(options){
    this.options = $.extend(true, {}, this.defaults, options);
    this.cards = $('.js-baseball-card');
    this.cardUrl = 'http://paigeponzeka.github.io/basl/site/card-overlay.png';
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

