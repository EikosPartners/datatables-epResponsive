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
	this._call_resize_callbacks = function (hiddenColumns) {
		callbacks.forEach(function (callback) {
			callback(hiddenColumns);
		});
	};
	
	// parses width string to number (e.g. "10em" to 140, assuming cell font size of 14)
	this._parse_width = function (widthString) {
		return Number(widthString.match(/(\d+)*/)[0]) * CELL_FONT_SIZE;
	}

	// calculates the initial value for total width.
	// this is equal to the summation of the widths of fixed columns
	this._init_total_width = function () {
		var totalWidth = 0;
		columns.forEach( function (column) {
			if(column.fixed) {
				totalWidth += that._parse_width(column.width);
			}
		});
		return totalWidth;
	}
	
	// sets the visibility of the column in datatables and in the metadata to the given value
	this._set_column_visibility = function(idx, visible) {
		api.column(idx).visible(visible);
		columns[idx].visible = visible;
	}

	// hides columns that cannot fit within the table container's width
	this._resize_cols = function () {
		var totalWidth = that._init_total_width();
		var tableWidth = $(api.table().container()).width();
		var visibilityChanged = false;
		var hiddenColumns = [];
		var fixedColumnsOverflow = totalWidth - tableWidth;
		
		for(var i = 0; i < columns.length; i++) {
			if(!columns[i].fixed) {
				if(columns[i].width) {
					totalWidth += that._parse_width(columns[i].width);
				} else {
					totalWidth += CELL_FONT_SIZE;
					if(!errorLogged) {
						console.error("Column #" + i + " should have width property. Using default of 1em.");
						errorLogged = true;
					}
				}
			}
			
			if(totalWidth < tableWidth || columns[i].fixed) {
				if(columns[i].visible !== true) {
					visibilityChanged = true;
				}
				that._set_column_visibility(i, true);
			} else {
				if(columns[i].visible !== false) {
					visibilityChanged = true;
				}
				that._set_column_visibility(i, false);
				hiddenColumns.push(columns[i]);
			}
		}
		
		// hide fixed columns if needed
		for(var i = columns.length - 1; i >= 0 && fixedColumnsOverflow > 0; i--) {
			if(columns[i].fixed) {
				if(columns[i].visible !== false) {
					visibilityChanged = true;
				}
				that._set_column_visibility(i, false);
				fixedColumnsOverflow -= that._parse_width(columns[i].width);
			}
		}
		
		// only call resize callbacks if visibility actually changed
		if(visibilityChanged) {
			this._call_resize_callbacks(hiddenColumns);
		}
	};
	
	// resize columns on window resize
	$(window).resize(function () {
		that._resize_cols();
	});
	
	// resize columns on table init
	api.on("init.dt", function () {
		
		//push this to the end of the stack
		setTimeout(function () {
        	that._resize_cols();
        });
			
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