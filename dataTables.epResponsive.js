/**------------------------------
 * epResponsive DataTables Plugin
 * ------------------------------
 * Feature Letter: R
 * 
 */

(function(window, document, $, undefined) {

$.fn.dataTable.epResponsive = function ( inst ) {
	var api = new $.fn.dataTable.Api( inst );
	var settings = api.settings()[0];
	var columns = settings.oInit.columns;
	var CELL_FONT_SIZE = $(api.cell(0).node()).css("font-size");
	var errorLogged = false;
	var that = this;

	// hides columns that cannot fit within the table container's width
	this._resize_cols = function () {
		var totalWidth = 0;
		var tableWidth = $(api.table().container()).width();
		
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
				api.column(i).visible(true);
			} else {
				api.column(i).visible(false);
			}
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

})(window, document, jQuery);