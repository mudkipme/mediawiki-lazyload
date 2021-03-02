( function ( $, mw ) {

	$.fn.lazyload = function ( options ) {
		var opt = $.extend( {
			threshold: 50,
			effect: "show"
		}, options );

		var elements = this;
		var timer;

		function replaceHost( url ) {
			var host = mw.config.get( 'Lazyload.imageHost' );
			if ( !host ) {
				return url;
			}
			if ( host.indexOf( '//' ) === -1 ) {
				host = '//' + host;
			}
			return url.replace( /(https?:)?\/\/[^\s\/]+/g, host );
		}

		function update() {
			clearTimeout( timer );
			timer = setTimeout( function () {
				elements.each( function () {
					if ( $( this ).is( ':visible' ) && $( this ).width() > 0 && $( this ).height() > 0
						&& $( window ).scrollTop() - opt.threshold < $( this ).offset().top + $( this ).height()
						&& $( window ).scrollTop() + $( window ).height() > $( this ).offset().top - opt.threshold ) {
						$( this ).trigger( 'appear' );
					}
				} );
			}, 200 );
		}

		this.each( function () {
			var $this = $( this );

			$this.one( 'appear', function () {

				if( this.loaded ) {
					return;
				}

				this.loaded = true;

				if ( $this.data( 'url' ) ) {
					var img = this.tagName.toUpperCase() == 'IMG' ? $this : $( '<img />' );

					img.one( 'load', function ( e ) {
						if ( $this.prop( 'tagName' ).toUpperCase() != 'IMG' ) {
							$this.html( img );
						}
						img.hide()[ opt.effect ]();
						if ( $this.hasClass( 'apng' ) && window.APNG ) {
							APNG.ifNeeded().then( function () {
								APNG.animateImage( img.get( 0 ) );
							} );
						}
					} );

					img.attr( 'src', replaceHost( $this.data( 'url' ) ) );
					if ( img.data( 'srcset' ) && !mw.config.get( 'Lazyload.disableHidpi' ) ) {
						img.attr( 'srcset', replaceHost( img.data( 'srcset' ) ) );
						var testImage = new Image();

						if ( window.devicePixelRatio > 1 && testImage.srcset === undefined ) {
							var srcset = img.attr( 'srcset' ), match;
							if ( typeof srcset === 'string' && srcset !== '' ) {
								match = $.matchSrcSet( devicePixelRatio, srcset );
								if ( match !== null ) {
									img.attr( 'src', match );
								}
							}
						}
					}

					// Let other extensions to handle updated content
					mw.hook( 'wikipage.content' ).fire(
					// images are always wrapped either into `thumb` or `p`
					// so it's safe to pass 2nd parent chunk and
					// to also make the MultimediaViewer happy
						$( img ).parent().parent()
					);
				}

            elements = $($.grep(elements, function(element) {
                return !element.loaded;
            }));
        });
    });

		$( function () {
			update();
		} );

		$( window ).on( 'resize scroll', function () {
			update();
		} );

		$( document ).on( 'mouseup touchend', function () {
			update();
		} );

		return this;
	};

	$( '.external-image, img[data-url]' ).lazyload();

}( jQuery, mediaWiki ) );
