# epResponsive

The epResponsive plug-in allows columns to be hidden as the window is resized, using metadata-defined column widths for the column definitions.

# Installation

Install using bower or npm

# Usage

Include the feature letter `R` on the dom option. An array of the column definitions should be pushed to the datatables settings object, named `columns`. Each column in the array should
have a width defined in either em, %, or px units. Make sure to disable the autoWidth feature on the datatable, as this will interfere with the column sizing.

# GitHub

Submit PRs to the [GitHub repo](https://github.com/eikospartners/datatables-epResponsive).