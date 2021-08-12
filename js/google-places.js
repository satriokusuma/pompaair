/* https://github.com/peledies/google-places */
(function ($) {
  var namespace = 'googlePlaces';

  $.googlePlaces = function (element, options) {
    var defaults = {
      placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // placeId provided by google api documentation
      render: ['reviews'],
      min_rating: 0,
      max_rows: 0,
      map_plug_id: 'map-plug',
      rotateTime: false,
      shorten_names: true,
      schema: {
        displayElement: '#schema',
        type: 'Store',
        beforeText: 'Google Users Have Rated',
        middleText: 'based on',
        afterText: 'ratings and reviews',
        image: null,
        priceRange: null,
      },
      address: {
        displayElement: '#google-address',
      },
      phone: {
        displayElement: '#google-phone',
      },
      staticMap: {
        displayElement: '#google-static-map',
        width: 512,
        height: 512,
        zoom: 17,
        type: 'roadmap',
      },
      hours: {
        displayElement: '#google-hours',
      },
    };

    var plugin = this;

    plugin.settings = {};

    var $element = $(element),
      element = element;

    plugin.init = function () {
      plugin.settings = $.extend({}, defaults, options);
      plugin.settings.schema = $.extend({}, defaults.schema, options.schema);
      $element.html("<div id='" + plugin.settings.map_plug_id + "'></div>"); // create a plug for google to load data into
      initialize_place(function (place) {
        plugin.place_data = place;

        // Trigger event before render
        $element.trigger('beforeRender.' + namespace);

        if (plugin.settings.render.indexOf('rating') > -1) {
          renderRating(plugin.place_data.rating);
        }
        // render specified sections
        if (plugin.settings.render.indexOf('reviews') > -1) {
          renderReviews(plugin.place_data.reviews);
          if (!!plugin.settings.rotateTime) {
            initRotation();
          }
        }
        if (plugin.settings.render.indexOf('address') > -1) {
          renderAddress(capture_element(plugin.settings.address.displayElement), plugin.place_data.adr_address);
        }
        if (plugin.settings.render.indexOf('phone') > -1) {
          renderPhone(capture_element(plugin.settings.phone.displayElement), plugin.place_data.formatted_phone_number);
        }
        if (plugin.settings.render.indexOf('staticMap') > -1) {
          renderStaticMap(capture_element(plugin.settings.staticMap.displayElement), plugin.place_data.formatted_address);
        }
        if (plugin.settings.render.indexOf('hours') > -1) {
          renderHours(capture_element(plugin.settings.hours.displayElement), plugin.place_data.opening_hours);
        }

        // render schema markup
        addSchemaMarkup(capture_element(plugin.settings.schema.displayElement), plugin.place_data);

        // Trigger event after render
        $element.trigger('afterRender.' + namespace);
      });
    };

    var capture_element = function (element) {
      if (element instanceof jQuery) {
        return element;
      } else if (typeof element == 'string') {
        try {
          var ele = $(element);
          if (ele.length) {
            return ele;
          } else {
            throw 'Element [' + element + '] couldnt be found in the DOM. Skipping ' + element + ' markup generation.';
          }
        } catch (e) {
          console.warn(e);
        }
      }
    };

    var initialize_place = function (c) {
      var map = new google.maps.Map(document.getElementById(plugin.settings.map_plug_id));

      var request = {
        placeId: plugin.settings.placeId,
      };

      var service = new google.maps.places.PlacesService(map);

      service.getDetails(request, function (place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          c(place);
        }
      });
    };

    var sort_by_date = function (ray) {
      ray.sort(function (a, b) {
        var keyA = new Date(a.time),
          keyB = new Date(b.time);
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      return ray;
    };

    var filter_minimum_rating = function (reviews) {
      for (var i = reviews.length - 1; i >= 0; i--) {
        if (reviews[i].rating < plugin.settings.min_rating) {
          reviews.splice(i, 1);
        }
      }
      return reviews;
    };

    var renderRating = function (rating) {
      var html = '';
      var star = renderAverageStars(rating);
      html = "<div class='average-rating'><h4>" + star + '</h4></div>';
      $element.append(html);
    };

    var shorten_name = function (name) {
      if (name.split(' ').length > 1) {
        var xname = '';
        xname = name.split(' ');
        return xname[0] + ' ' + xname[1][0] + '.';
      }
    };

    var renderReviews = function (reviews) {
      reviews = sort_by_date(reviews);
      reviews = filter_minimum_rating(reviews);
      var html = '';
      var row_count = plugin.settings.max_rows > 0 ? plugin.settings.max_rows - 1 : reviews.length - 1;
      // make sure the row_count is not greater than available records
      row_count = row_count > reviews.length - 1 ? reviews.length - 1 : row_count;
      for (var i = row_count; i >= 0; i--) {
        var stars = renderStars(reviews[i].rating);
        var date = convertTime(reviews[i].time);
        if (plugin.settings.shorten_names == true) {
          var name = shorten_name(reviews[i].author_name);
        } else {
          var name = reviews[i].author_name + "</span><span class='review-sep'>, </span>";
        }
        html =
          html +
          "<div class='review-item'><div class='review-meta'><span class='review-author'>" +
          name +
          "<span class='review-date'>" +
          date +
          '</span></div>' +
          stars +
          "<p class='review-text'>" +
          reviews[i].text +
          '</p></div>';
      }
      $element.append(html);
    };

    var renderHours = function (element, data) {
      if (element instanceof jQuery) {
        var html = '<ul>';
        data.weekday_text.forEach(function (day) {
          html += '<li>' + day + '</li>';
        });
        html += '</ul>';
        element.append(html);
      }
    };

    var renderStaticMap = function (element, data) {
      if (element instanceof jQuery) {
        var map = plugin.settings.staticMap;
        element.append(
          "<img src='https://maps.googleapis.com/maps/api/staticmap" +
            '?size=' +
            map.width +
            'x' +
            map.height +
            '&zoom=' +
            map.zoom +
            '&maptype=' +
            map.type +
            '&markers=size:large%7Ccolor:red%7C' +
            data +
            "'>" +
            '</img>'
        );
      }
    };

    var renderAddress = function (element, data) {
      if (element instanceof jQuery) {
        element.append(data);
      }
    };

    var renderPhone = function (element, data) {
      if (element instanceof jQuery) {
        element.append(data);
      }
    };

    var initRotation = function () {
      var $reviewEls = $element.children('.review-item');
      var currentIdx = $reviewEls.length > 0 ? 0 : false;
      $reviewEls.hide();
      if (currentIdx !== false) {
        $($reviewEls[currentIdx]).show();
        setInterval(function () {
          if (++currentIdx >= $reviewEls.length) {
            currentIdx = 0;
          }
          $reviewEls.hide();
          $($reviewEls[currentIdx]).fadeIn('slow');
        }, plugin.settings.rotateTime);
      }
    };

    var renderStars = function (rating) {
      var stars = "<div class='review-stars'><ul>";

      // fill in gold stars
      for (var i = 0; i < rating; i++) {
        stars = stars + "<li><i class='star'></i></li>";
      }

      // fill in empty stars
      if (rating < 5) {
        for (var i = 0; i < 5 - rating; i++) {
          stars = stars + "<li><i class='star inactive'></i></li>";
        }
      }
      stars = stars + '</ul></div>';
      return stars;
    };

    var renderAverageStars = function (rating) {
      var stars = "<div class='review-stars'><ul><li><i>" + rating + '&nbsp;</i></li>';
      var activeStars = parseInt(rating);
      var inactiveStars = 5 - activeStars;
      var width = (rating - activeStars) * 100 + '%';

      // fill in gold stars
      for (var i = 0; i < activeStars; i++) {
        stars += "<li><i class='star'></i></li>";
      }

      // fill in empty stars
      if (inactiveStars > 0) {
        for (var i = 0; i < inactiveStars; i++) {
          if (i === 0) {
            stars +=
              "<li style='position: relative;'><i class='star inactive'></i><i class='star' style='position: absolute;top: 0;left: 0;overflow: hidden;width: " +
              width +
              "'></i></li>";
          } else {
            stars += "<li><i class='star inactive'></i></li>";
          }
        }
      }
      stars += '</ul></div>';
      return stars;
    };

    var convertTime = function (UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var time = months[a.getMonth()] + ' ' + a.getDate() + ', ' + a.getFullYear();
      return time;
    };

    var addSchemaMarkup = function (element, placeData) {
      if (element instanceof jQuery) {
        var schema = plugin.settings.schema;
        var schemaMarkup = '<span itemscope="" itemtype="http://schema.org/' + schema.type + '">';

        if (schema.image !== null) {
          schemaMarkup += generateSchemaItemMarkup('image', schema.image);
        } else {
          console.warn(
            'Image is required for some schema types. Visit https://search.google.com/structured-data/testing-tool to test your schema output.'
          );
        }

        if (schema.priceRange !== null) {
          schemaMarkup += generateSchemaItemMarkup('priceRange', schema.priceRange);
        }

        schemaMarkup += generateSchemaItemMarkup('url', location.origin);
        schemaMarkup += generateSchemaItemMarkup('telephone', plugin.place_data.formatted_phone_number);
        schemaMarkup += generateSchemaAddressMarkup();
        schemaMarkup += generateSchemaRatingMarkup(placeData, schema);
        schemaMarkup += '</span>';

        element.append(schemaMarkup);
      }
    };

    var generateSchemaAddressMarkup = function () {
      var $address = $('<div />', {
        itemprop: 'address',
        itemscope: '',
        itemtype: 'http://schema.org/PostalAddress',
      }).css('display', 'none');
      $address.append(plugin.place_data.adr_address);
      $address.children('.street-address').attr('itemprop', 'streetAddress');
      $address.children('.locality').attr('itemprop', 'addressLocality');
      $address.children('.region').attr('itemprop', 'addressRegion');
      $address.children('.postal-code').attr('itemprop', 'postalCode');
      $address.children('.country-name').attr('itemprop', 'addressCountry');
      return $address[0].outerHTML;
    };

    var generateSchemaRatingMarkup = function (placeData, schema) {
      var reviews = placeData.reviews;
      var lastIndex = reviews.length - 1;
      var reviewPointTotal = 0;

      for (var i = lastIndex; i >= 0; i--) {
        reviewPointTotal += reviews[i].rating;
      }

      var averageReview = reviewPointTotal / reviews.length;

      return (
        schema.beforeText +
        ' <span itemprop="name">' +
        placeData.name +
        '</span> ' +
        '<span itemprop="aggregateRating" itemscope="" itemtype="http://schema.org/AggregateRating">' +
        '<span itemprop="ratingValue">' +
        averageReview.toFixed(2) +
        '</span>/<span itemprop="bestRating">5</span> ' +
        schema.middleText +
        ' <span itemprop="ratingCount">' +
        reviews.length +
        '</span> ' +
        schema.afterText +
        '</span>'
      );
    };

    var generateSchemaItemMarkup = function (name, value) {
      return '<meta itemprop="' + name + '" content="' + value + '">';
    };

    plugin.init();
  };

  $.fn.googlePlaces = function (options) {
    return this.each(function () {
      if (undefined == $(this).data(namespace)) {
        var plugin = new $.googlePlaces(this, options);
        $(this).data(namespace, plugin);
      }
    });
  };
})(jQuery);
