/**------------------------------
 * epResponsive DataTables Plugin
 * ------------------------------
 * Feature Letter: R
 *
 */
import $ from 'jquery';
import 'datatables';
	(function(window, document, $, undefined) {

		var resizeCallback,
			responsiveOptions,
			ignoreColumns;

		$.fn.dataTable.epResponsive = function ( inst ) {
			var api = new $.fn.dataTable.Api( inst );
			var settings = api.settings()[0];
			var columns = settings.oInit.columns;
			var CELL_FONT_SIZE = Number($(api.table().body()).css("font-size").match(/(\d+)*/)[0]);
			var ERROR_PREFIX = "epResponsive (" + settings.sTableId + "): ";
			var errorLogged = false;
			var that = this;

			ignoreColumns = columns.map(function() {
				return false;
			})

			if(settings.oFeatures.bAutoWidth) {
				console.error(ERROR_PREFIX + "Auto Width should be disabled.")
			}

			// use default font size of 14px
			if(CELL_FONT_SIZE === 0) {
				CELL_FONT_SIZE = 14;
			}

			// parses width string to number. width can be provided in em, % or px
			this._parse_width = function (widthString) {
				var match = widthString.match(/(^[0-9]+)(.*$)/);
				if(match[2] === "em") {
					return Number(match[1]) * CELL_FONT_SIZE;
				} else if(match[2] === "%") {
					return Math.round(Number(match[1]) / 100 * CELL_FONT_SIZE);
				} else if(match[2] === "px") {
					return Number(match[1]);
				}
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
				if(idx < columns.length) {
					api.column(idx).visible(visible, false); // disable redraw for performance
				}
			}

			// hides columns that cannot fit within the table container's width
			this._resize_cols = function () {
				var totalWidth = that._init_total_width();
				var tableWidth = $(api.table().container()).width();
				var visibilityChanged = false;
				var hiddenColumns = [];
				var fixedColumnsOverflow = totalWidth - tableWidth;

				for(var i = 0; i < columns.length; i++) {
					if(!ignoreColumns[i]) {
						if(!columns[i].fixed) {
							if(columns[i].width) {
								totalWidth += that._parse_width(columns[i].width);
							} else {
								totalWidth += CELL_FONT_SIZE;
								if(!errorLogged) {
									console.error(ERROR_PREFIX + "Column #" + i + " should have width property. Using default of 1em.");
									errorLogged = true;
								}
							}
						}

						if(totalWidth < tableWidth || columns[i].fixed) {
							if(api.column(i).visible() !== true) {
								visibilityChanged = true;
							}
							that._set_column_visibility(i, true);
						} else {
							if(api.column(i).visible() !== false) {
								visibilityChanged = true;
							}
							that._set_column_visibility(i, false);
							hiddenColumns.push(columns[i]);
						}
					}
				}

				// hide fixed columns if needed
				for(var i = columns.length - 1; i >= 0 && fixedColumnsOverflow > 0; i--) {
					if(!ignoreColumns[i] && columns[i].fixed) {
						if(api.column(i).visible() !== false) {
							visibilityChanged = true;
						}
						that._set_column_visibility(i, false);
						hiddenColumns.push(columns[i]);
						fixedColumnsOverflow -= that._parse_width(columns[i].width);
					}
				}

				// hide columns that should be hidden when all columns are being shown
				if(hiddenColumns.length === 0) {
					if(Array.isArray(responsiveOptions.hideWhenAllColumnsAreVisible)) {
						responsiveOptions.hideWhenAllColumnsAreVisible.forEach(function (col) {
							that._set_column_visibility(col, false);
						});
					}
				}

				// perform redraw now
				api.columns.adjust().draw( false );

				// only call resize callbacks if visibility actually changed
				if(visibilityChanged) {
					resizeCallback(hiddenColumns);
				}
			};

			// resize columns on window resize
			$(window).on("resize.epR", function () {
				that._resize_cols();
			});

			// resize columns on table init
			api.on("init.dt", function () {

				//push this to the end of the stack
				setTimeout(function () {
					that._resize_cols();
				});

			});

			// clean up on table destroy
			api.on("destroy.dt", function () {
				$(window).off("resize.epR");
				resizeCallback = null;
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
			resizeCallback = callback;
		});

		// Set options.
		$.fn.dataTable.Api.register( 'epResponsive.setOptions()', function ( options ) {
			responsiveOptions = options;
		});

		// Set whether epResponsive should ignore the given column when doing calculations.
		// Use this when you want to manage a column's visibility manually.
		$.fn.dataTable.Api.register( 'epResponsive.setIgnoreColumn()', function ( index, bIgnore ) {
			if(ignoreColumns && index < ignoreColumns.length) {
				ignoreColumns[index] = bIgnore;
			}
		});
	})(window, document, $)
