
var defaultParams = require('./defaultParams.js');

var Viewer = require('./Viewer');

/**
 * GeometryEditor constructor from a dataElement containing a serialized geometry
 * 
 * @constructor 
 * 
 * @param {HTMLElement} dataElement Target where GeoJSON or bounding box is
 * 
 * @param {Object} options Options list
 * 
 * @param {string} options.geometryType Type of geometry to show and read ("GeometryCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","Rectangle"). if not precised or invalid, don't show geometries on map and don't read geometries from map
 * 
 * @param {boolean} [options.hide=true] Show or hide geometry input/tag element (dataElement option)
 * 
 * @param {Array<Object>} options.tileLayers Backgroud layers
 * @param {string} [options.tileLayers[].title="Openstreet Map"] Title of the layer in the LayerSwitcher if activated
 * @param {string} [options.tileLayers[].url="https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"] Url of the layer
 * @param {string} [options.tileLayers[].attribution="©<a href=\"http://openstreetmap.org\">OpenStreetMap contributors</a>"] Attribution of the layer
 * 
 * @param {boolean} [options.tileLayerSwitcher=true] Activate the layer switcher or not containing layers form tileLayers options
 * @param {Array} [options.switchableLayers=[]] Organise layers inside layer switcher based on the title attribute of tileLayers options
 * @param {Array} [options.tileCoordinates=[9, 253, -177]] Coordinates which is used to set image based on a tile of the layer in layer switcher
 * @param {number} [options.defaultSwitchableTile=1] Position in layer switcher which is used to load layers corresponding at load
 * 
 * @param {string} [options.editable=true] Add drawing controls on map to modify geometries by draw
 * 
 * @param {string} [options.allowCapture=false] Add capture control to screen map
 * 
 * @param {string} [options.width="100%"] Width of the map 
 * @param {string} [options.height="500"] Height of the map
 * 
 * @param {number} [options.lon=2.0] Longitude of the center of the map at load
 * @param {number} [options.lat=45.0] Latitude of the center of the map at load
 * @param {number} [options.zoom=4] Zoom of the view map at load
 * @param {number} [options.minZoom=4] Minimum zoom of the map
 * @param {number} [options.maxZoom=19] Maximum zoom of the map
 * 
 * @param {boolean} [options.centerOnResults=true] Recenter view on the results 
 * 
 * @param {number}  [options.precision=7] Decimals after comma for the geometry showed
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
 * getMap
 * Get the openlayers map object
 * 
 * @return {ol.Map}
 */
GeometryEditor.prototype.getMap = function () {
    return this.viewer.getMap();
};


module.exports = GeometryEditor;
