/**------------------------------
 * epResponsive DataTables Plugin
 * ------------------------------
 * Feature Letter: R
 * 
 */

(function(window, document, $, undefined) {
	
var callbacks = [];

$.fn.dataTable.epResponsive = function ( inst ) {
	var api = new $.fn.dataTable.Api( inst );
	var settings = api.settings()[0];
	var columns = settings.oInit.columns;
	var CELL_FONT_SIZE = Number($(api.table().body()).css("font-size").match(/(\d+)*/)[0]);
	var errorLogged = false;
	var that = this;
	
	// use default font size of 14px
	if(CELL_FONT_SIZE === 0) {
		CELL_FONT_SIZE = 14;
	}

	// calls all resize callbacks
	this._call_resize_callbacks = function () {
		callbacks.forEach(function (callback) {
			callback();
		});
	};

	// hides columns that cannot fit within the table container's width
	this._resize_cols = function () {
		var totalWidth = 0;
		var tableWidth = $(api.table().container()).width();
		var visibilityChanged = false;
		
		for(var i = 0; i < columns.length; i++) {
			// table width is stored as string in em units (e.g. "10em")
			if(columns[i].width) {
				totalWidth += Number(columns[i].width.match(/(\d+)*/)[0]) * CELL_FONT_SIZE;
			} else {
				totalWidth += CELL_FONT_SIZE;
				if(!errorLogged) {
					console.error("Column #" + i + " should have width property. Using default of 1em.");
					errorLogged = true;
				}
			}
			
			if(totalWidth < tableWidth) {
				if(api.column(i).visible() !== true) {
					visibilityChanged = true;
				}
				api.column(i).visible(true);
				columns[i].visible = true;
			} else {
				if(api.column(i).visible() !== false) {
					visibilityChanged = true;
				}
				api.column(i).visible(false);
				columns[i].visible = false;
			}
		}

		// only call resize callbacks if visibility actually changed
		if(visibilityChanged) {
			this._call_resize_callbacks();
		}
	};
	
	// resize columns on window resize
	$(window).resize(function () {
		that._resize_cols();
	});
	
	// resize columns on table init
	api.on("init.dt", function () {
		that._resize_cols();	
	});
	
	if (settings._responsive ) {
		throw "Responsive already initialised on table " + settings.nTable.id;
	}
	
	settings._responsive = this;
};

// Subscribe the feature plug-in to DataTables, ready for use
$.fn.dataTable.ext.feature.push( {
	"fnInit": function( settings ) {
		new $.fn.dataTable.epResponsive( settings );
	},
	"cFeature": "R",
	"sFeature": "epResponsive"
});

// Create responsive object on API
$.fn.dataTable.Api.register( 'epResponsive()', function () {} );

// Resize callback registration method.
$.fn.dataTable.Api.register( 'epResponsive.onResize()', function ( callback ) {
	callbacks.push(callback);
});

})(window, document, jQuery);