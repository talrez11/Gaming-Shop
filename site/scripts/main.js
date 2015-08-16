/**
 * Main JavaScript
 * Site Name
 *
 * Copyright (c) 2015. by Way2CU, http://way2cu.com
 * Authors:
 */

// create or use existing site scope
var Site = Site || {};

// make sure variable cache exists
Site.variable_cache = Site.variable_cache || {};


/**
 * Check if site is being displayed on mobile.
 * @return boolean
 */
Site.is_mobile = function() {
	var result = false;

	// check for cached value
	if ('mobile_version' in Site.variable_cache) {
		result = Site.variable_cache['mobile_version'];

	} else {
		// detect if site is mobile
		var elements = document.getElementsByName('viewport');

		// check all tags and find `meta`
		for (var i=0, count=elements.length; i<count; i++) {
			var tag = elements[i];

			if (tag.tagName == 'META') {
				result = true;
				break;
			}
		}

		// cache value so next time we are faster
		Site.variable_cache['mobile_version'] = result;
	}

	return result;
};

Site.ItemView = function(item) {
	var self = this;

	self.item = item;
	self.cart = item.cart;
	self.currency = null;
	self.exchange_rate = 1;

	self.container = null;
	self.label_name = null;
	self.label_count = null;
	self.label_total = null;
	self.option_remove = null;

	/**
	 * Complete object initialization.
	 */
	self._init = function() {
		// get list containers
		var item_list = self.cart.get_list_container();
		self.currency = self.cart.default_currency;

		// create container
		self.container = $('<li>').appendTo(item_list);
		self.container.addClass('item');

		// create labels
		self.option_remove = $('<a>').appendTo(self.container);
		self.option_remove
				.attr('href', 'javascript: void(0);')
				.on('click', self._handle_remove);

		self.option_remove.svg = $('<img>').appendTo(self.option_remove);	
		self.option_remove.svg
							  .attr('src','site/images/x.svg');
							  

				

		self.figure = $('<figure>').appendTo(self.container);
		self.image = $('<img>').appendTo(self.figure);

		self.label_total = $('<span>').appendTo(self.container);
		self.label_total
				.addClass('total')
				.attr('data-currency', self.currency);

		self.label_count = $('<span>').appendTo(self.container);
		self.label_count.addClass('count');

		self.label_name = $('<span>').appendTo(self.container);
		self.label_name.addClass('name');
		// create options

	};

	/**
	 * Handle clicking on remove item.
	 *
	 * @param object event
	 */
	self._handle_remove = function(event) {
		event.preventDefault();
		self.item.remove();
	};

	/**
	 * Handler externally called when item count has changed.
	 */
	self.handle_change = function() {
		self.image
				.attr('src', self.item.image)
				.attr('alt', self.item.name[language_handler.current_language])
		self.label_name.text(self.item.name[language_handler.current_language]);

		self.label_count.text( self.item.count + " " + language_handler.getText(null, 'unit'));

		self.label_total
				.text((self.item.count * self.item.price * self.exchange_rate + " " + language_handler.getText(null, 'price1')))
				.attr('data-currency', self.currency);
	};

	/**
	 * Handle shopping cart currency change.
	 *
	 * @param string currency
	 * @param float rate
	 */
	self.handle_currency_change = function(currency, rate) {
		// store values
		self.currency = currency;
		self.exchange_rate = rate;

		// update labels
		self.handle_change();
	};

	/**
	 * Handler externally called before item removal.
	 */
	self.handle_remove = function() {
		self.container.remove();
	};

	// finalize object
	self._init();
}

/**
 * Function called when document and images have been completely loaded.
 */
Site.on_load = function() {

	Site.cart = new Caracal.Shop.Cart();
	Site.cart
			.ui.add_item_list($('div#popup div.cart ul'))
			.ui.connect_checkout_button($('a.buy'))
			.ui.add_total_cost_label($('div.cart p.total_price'))
			.ui.add_total_count_label($('div.cart p.total_quantity'))
			.ui.add_total_count_label($('div#popup > span.total_count'))
			.add_item_view(Site.ItemView);
	

	advertise = new PageControl('div.link_images_container','a')
	advertise.attachControls($('div.btn_controls a'))
	.setInterval(6000)
	.setWrapAround(true);

	// Function Displaying Product Big Image
	function showImage() {
		var item = $(this);
		var myurl = item.data('image');
		var bImage = $('div.gallery_wrap figure img').attr('src',myurl);
	}

	var images = $('div.gallery_wrap a');
	images.on('click',showImage);

	//Function displaying shop cart

	var cart_btn = $('div#popup a.wrap');
	var cart = $('div#popup div.cart');
	cart_btn.on('click',function(){
		cart.toggleClass('open');
	});

	//Function Closing shop cart

	var close_btn = $('a.close');
	close_btn.on('click',function(){
		cart.removeClass('open');
	});	

	/*Function inserting item to cart*/
	function insertToCart() {
		
		var uid = $('div.product_wrap').data('id');
		var list = Site.cart.get_item_list_by_uid(uid);

		var item_list = Site.cart.get_item_list_by_uid(uid);
		var found_item = null;

		for (var i=0, count=item_list.length; i<count; i++) {
			var item = item_list[i];

			if (item.uid) {
				found_item = item;
				break;
			}
		}

			if (found_item == null) {
				// add new item
				Site.cart.add_item_by_uid(uid);
				$('div#popup div.cart').addClass('open');

			} else {
				// increase count
				found_item.alter_count(1);
				$('div#popup div.cart').addClass('open');
			}
	}

	var btn_add_cart = $('a.add_cart');
	btn_add_cart.on('click',insertToCart);
};


// connect document `load` event with handler function
$(Site.on_load);
