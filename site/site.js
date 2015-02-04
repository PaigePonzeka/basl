(function(){
  var isLocal = false; // for testing, should always be false on production
  var jsonUrl = 'https://ratings-manager.herokuapp.com/getleaguesponsors.json',
      cssFile = 'http://paigeponzeka.github.io/basl/site/site.css',
      cardUrl = 'http://paigeponzeka.github.io/basl/site/card-overlay.png',
      weatherJs = 'http://paigeponzeka.github.io/basl/site/jquery.simpleWeather.min.js';

  // for local testing
  if (isLocal) {
    cssFile = 'site.css';
    cardUrl = 'card-overlay.png';
    jsonUrl = 'http://localhost:3000/getleaguesponsors.json',
    weatherJs = 'jquery.simpleWeather.min.js';
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
    this.$container = $('.container > .sponsors > ul');
    var sponsorsList = this.$container.clone();
    this.$container.attr('id', 'sponsors-carousel');
    this.$container.find('.container > .sponsors h3.font-custom').remove();
    if (this.$container.length > 0) {
      this.itemHeight = 200;
      this.currentPage = 0;
      this.wrapContainer();
      this.setNumberOfImages();
      this.initAutoPageChange();
      this.$thumbnailContainer = sponsorsList.addClass('sponsors-carousel-thumbnails js-sponsors-carousel-thumbnails cf').attr('id','sponsors-carousel-thumbnails');
      this.prepocessSponsorsListToThumbnails(this.$thumbnailContainer);
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

  Carousel.prototype.prepocessSponsorsListToThumbnails = function(sponsorsList) {
    // remove ahref
    var count = 0;
    $.each(sponsorsList.find('a'), function() {
      count++;
      var listItem = $(this).closest('li');
      listItem.addClass('js-thumbnail-page-' + count);
      if (count == 1) {
        listItem.addClass('active');
      }
    });
    // add page number
    //
    return sponsorsList;
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

  var WeatherWidget = function($container) {
    this.$container = $container;
    this.$container.append('<div id="weather"></div>');
    this.loadJs();
    this.init();
  };

  WeatherWidget.prototype.loadJs = function() {
    /*! simpleWeather v3.0.2 - http://simpleweatherjs.com */
!function(e){"use strict";function t(e,t){return Math.round("f"===e?5/9*(t-32):1.8*t+32)}e.extend({simpleWeather:function(i){i=e.extend({location:"",woeid:"",unit:"f",success:function(){},error:function(){}},i);var o=new Date,n="https://query.yahooapis.com/v1/public/yql?format=json&rnd="+o.getFullYear()+o.getMonth()+o.getDay()+o.getHours()+"&diagnostics=true&callback=?&q=";if(""!==i.location)n+='select * from weather.forecast where woeid in (select woeid from geo.placefinder where text="'+i.location+'" and gflags="R" limit 1) and u="'+i.unit+'"';else{if(""===i.woeid)return i.error({message:"Could not retrieve weather due to an invalid location."}),!1;n+="select * from weather.forecast where woeid="+i.woeid+' and u="'+i.unit+'"'}return e.getJSON(encodeURI(n),function(e){if(null!==e&&null!==e.query&&null!==e.query.results&&"Yahoo! Weather Error"!==e.query.results.channel.description){var o,n=e.query.results.channel,r={},s=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW","N"],a="https://s.yimg.com/os/mit/media/m/weather/images/icons/l/44d-100567.png";r.title=n.item.title,r.temp=n.item.condition.temp,r.code=n.item.condition.code,r.todayCode=n.item.forecast[0].code,r.currently=n.item.condition.text,r.high=n.item.forecast[0].high,r.low=n.item.forecast[0].low,r.text=n.item.forecast[0].text,r.humidity=n.atmosphere.humidity,r.pressure=n.atmosphere.pressure,r.rising=n.atmosphere.rising,r.visibility=n.atmosphere.visibility,r.sunrise=n.astronomy.sunrise,r.sunset=n.astronomy.sunset,r.description=n.item.description,r.city=n.location.city,r.country=n.location.country,r.region=n.location.region,r.updated=n.item.pubDate,r.link=n.item.link,r.units={temp:n.units.temperature,distance:n.units.distance,pressure:n.units.pressure,speed:n.units.speed},r.wind={chill:n.wind.chill,direction:s[Math.round(n.wind.direction/22.5)],speed:n.wind.speed},r.heatindex=n.item.condition.temp<80&&n.atmosphere.humidity<40?-42.379+2.04901523*n.item.condition.temp+10.14333127*n.atmosphere.humidity-.22475541*n.item.condition.temp*n.atmosphere.humidity-6.83783*Math.pow(10,-3)*Math.pow(n.item.condition.temp,2)-5.481717*Math.pow(10,-2)*Math.pow(n.atmosphere.humidity,2)+1.22874*Math.pow(10,-3)*Math.pow(n.item.condition.temp,2)*n.atmosphere.humidity+8.5282*Math.pow(10,-4)*n.item.condition.temp*Math.pow(n.atmosphere.humidity,2)-1.99*Math.pow(10,-6)*Math.pow(n.item.condition.temp,2)*Math.pow(n.atmosphere.humidity,2):n.item.condition.temp,"3200"==n.item.condition.code?(r.thumbnail=a,r.image=a):(r.thumbnail="https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/"+n.item.condition.code+"ds.png",r.image="https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/"+n.item.condition.code+"d.png"),r.alt={temp:t(i.unit,n.item.condition.temp),high:t(i.unit,n.item.forecast[0].high),low:t(i.unit,n.item.forecast[0].low)},r.alt.unit="f"===i.unit?"c":"f",r.forecast=[];for(var m=0;m<n.item.forecast.length;m++)o=n.item.forecast[m],o.alt={high:t(i.unit,n.item.forecast[m].high),low:t(i.unit,n.item.forecast[m].low)},"3200"==n.item.forecast[m].code?(o.thumbnail=a,o.image=a):(o.thumbnail="https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/"+n.item.forecast[m].code+"ds.png",o.image="https://s.yimg.com/zz/combo?a/i/us/nws/weather/gr/"+n.item.forecast[m].code+"d.png"),r.forecast.push(o);i.success(r)}else i.error({message:"There was an error retrieving the latest weather information. Please try again.",error:e.query.results.channel.item.title})}),this}})}(jQuery);
  };

  WeatherWidget.prototype.init = function() {
    if ($.simpleWeather) {
      console.log("here");
      $.simpleWeather({
        woeid: '2357536', //2357536
        location: '10010',
        unit: 'f',
        success: function(weather) {
          html = '<h3>Current Weather</h3>';
          html += '<h2> <i class="weather-icon"><img src="'+weather.thumbnail+'"></i>'+weather.temp+'&deg;'+weather.units.temp+'</h2>';
          html += '<ul><li>'+weather.city+', '+weather.region+'</li>';
          html += '<li class="currently">'+weather.currently+'</li>';
          html += '</ul>';

          /*for(var i=0;i<weather.forecast.length;i++) {
            html += '<p>'+weather.forecast[i].day+': '+weather.forecast[i].high+'</p>';
          }*/
          $('#weather').html(html);
        },
        error: function(error) {
          $("#weather").html('<p>'+error+'</p>');
        }
      });
    }
  };

  /** -- UTILITIES */
  var insertCSS = function() {
    $("head").append("<link id='sponsors-carousel-css' href='" + cssFile + "' type='text/css' rel='stylesheet' />");
  };



  $(document).ready(function() {
      // intializing the carousel
    insertCSS();
    var sponsorsCarousel = new Carousel();
    var contactCardGenerator = new ContactCardGenerator();
    var weatherWidget = new WeatherWidget($('.container > .sponsors'));
  });

}());

