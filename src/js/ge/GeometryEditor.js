
var defaultParams = require('./defaultParams.js');

var Viewer = require('./Viewer');

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * 
 * @constructor 
 * 
 * @param {HTMLElement} dataElement Target where GeoJSON or bounding box is
 * @param {Object} options Options list
 * @param {string} options.geometryType Type of geometry to show and read ("GeometryCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","Rectangle"). if not precised or invalid, don't show geometries on map
 * @param {Array<Object>} options.tileLayers Backgroud layers
 * @param {string} [options.tileLayers[].title="Openstreet Map"] Title of the layer in the LayerSwitcher if activated
 * @param {string} [options.tileLayers[].url="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"] Url of the layer
 * @param {string} [options.tileLayers[].attribution="©<a href=\"http://openstreetmap.org\">OpenStreetMap contributors</a>"] Attribution of the layer
 * @param {boolean} [options.tileLayerSwitcher=true] Activate the layer switcher or not
 * @param {Array} options.switchableLayers
 * @param {string} options.tileCoordinates
 * @param {string} options.defaultSwitchableTile
 * @param {string} options.hide
 * @param {string} options.editable
 * @param {string} options.width
 * @param {string} options.height
 * @param {string} options.lon
 * @param {string} options.lat
 * @param {string} options.zoom
 * @param {string} options.minZoom
 * @param {string} options.maxZoom
 * @param {boolean} options.centerOnResults
 * @param {number} options.precision
 * 
 * 
 */
var GeometryEditor = function (dataElement, options) {

    this.settings = {
        dataElement: dataElement
    };

    $.extend(true, this.settings, defaultParams, options); // deep copy


    // hide or not the element
    if (this.settings.hide) {
        $(this.settings.dataElement).hide();
    }

    // init viewer
    this.viewer = new Viewer(this.settings);

};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 */
GeometryEditor.prototype.getMap = function () {
    return this.viewer.getMap();
};




module.exports = GeometryEditor;
