var DrawToolsControl = require('./controls/DrawToolsControl');
var TileLayerSwitcher = require('./controls/TileLayerSwitcherControl');
var ExportToPngControl = require('./controls/ExportToPngControl');
var ShowGeometryControl = require('./controls/ShowGeometryControl');

var TileLayer = require('./models/TileLayer');

var guid = require('./util/guid');
var isSingleGeometryType = require('./util/isSingleGeometryType.js');
var defaultStyleLayerFunction = require('./util/defaultStyleLayerFunction');
var fitViewToFeaturesCollection = require('./util/fitViewToFeaturesCollection');
var isValidGeometryType = require('./util/isValidGeometryType');


/**
 * Geometry editor viewer
 * 
 * @constructor 
 * 
 * @param {Object} options Options list
 * 
 * @param {HTMLElement} options.dataElement Target where GeoJSON or bounding box is
 * 
 * @param {string} options.geometryType Type of geometry to show and read ("GeometryCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","Rectangle"). if not precised or invalid, don't show geometries on map and don't read geometries from map
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
var Viewer = function (options) {

    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };

    $.extend(this.settings, options);

    this.map = this.createMap();

    this.layers = this.createLayersFromTileLayersConfig();
    this.addLayersToMap(this.layers);


    // init layer for geometries to show
    this.geometryLayer = this.initGeometriesLayer();

    if (this.settings.geometryType && isValidGeometryType(this.settings.geometryType)) {
        this.showGeometryControl = this.initShowGeometryControl();
    }

    // init tileLayerSwitcher
    if (this.settings.tileLayerSwitcher) {
        this.initTileLayerSwitcher();
    }

    // init geometries editable
    if (this.settings.editable) {
        this.drawToolsControls = this.initDrawToolsControl();
    }

    // export to image control
    if (this.settings.allowCapture) {
        this.initExportToPngControl();
    }

};

/**
 * getMap
 * Get the map object
 * 
 * @return {ol.Map}
 */
Viewer.prototype.getMap = function () {
    return this.map;
};

/**
 * addLayersToMap
 * Add layers to map
 *
 * @param {Array<ol.layer.Layer>} layers - array of layer configurations
 */
Viewer.prototype.addLayersToMap = function (layers) {
    for (var i in layers) {
        if (layers[i] !== null) {
            this.getMap().addLayer(layers[i]);
        }
    }
};

/**
 * createVectorLayer
 * Create a ol.layer.Vector object with the featuresCollection object associed
 *
 * @param {ol.Collection} featuresCollection
 * 
 * @returns {ol.layer.Vector}
 */
Viewer.prototype.createVectorLayer = function (featuresCollection) {
    var layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: featuresCollection
        }),
        style: defaultStyleLayerFunction
    });
    return layer;
};

/**
 * createMap
 * 
 * @return {ol.Map}
 * 
 * @private
 */
Viewer.prototype.createMap = function () {
    options = this.settings;

    var target = 'map-' + guid();
    var $mapDiv = $('<div id="' + target + '"></div>');
    $mapDiv.addClass('map');
    $mapDiv.css('width', options.width);
    $mapDiv.css('height', options.height);
    $mapDiv.insertAfter(options.dataElement);

    return new ol.Map({
        target: target,
        view: new ol.View({
            center: ol.proj.transform([options.lon, options.lat], this.settings.dataProjection, this.settings.mapProjection),
            zoom: options.zoom,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
            projection: this.settings.mapProjection
        }),
        controls: [new ol.control.Zoom(), new ol.control.Attribution({
            collapsible: false
        })]
    });

};

/**
 * initGeometriesLayer
 * Init the layer used for the reading and the writting of geometries
 * 
 * @return {ol.layer.Vector}
 * 
 * @private
 */
Viewer.prototype.initGeometriesLayer = function () {
    var geometryFeaturesCollection = new ol.Collection();
    var geometryLayer = this.createVectorLayer(geometryFeaturesCollection);

    this.getMap().addLayer(geometryLayer);

    return geometryLayer;
};

/**
 * initShowGeometryControl
 * Init the componant doing the link between dataElement where GeoJson is read/wrote and the map
 * 
 * @return {ShowGeometryControl}
 * 
 * @private
 */
Viewer.prototype.initShowGeometryControl = function () {

    var showGeometryControl = new ShowGeometryControl({
        geometryType: this.settings.geometryType,
        layer: this.geometryLayer,
        targetElement: this.settings.dataElement,
        hide: this.settings.hide,
        dataProjection: this.settings.dataProjection,
        precision: this.settings.precision
    });

    showGeometryControl.on('set:geometries', function (e) {
        if (this.settings.centerOnResults) {
            fitViewToFeaturesCollection(this.getMap(), this.geometryLayer.getSource().getFeaturesCollection());
        }
        this.getMap().dispatchEvent($.extend(e, { type: 'change:geometries' }));
    }.bind(this));

    showGeometryControl.on('error', function (e) {
        this.getMap().dispatchEvent({ type: 'change:geometries', geojson: "{}", geometries: [] });
        console.log(e.message);
    });

    this.getMap().addControl(showGeometryControl);

    return showGeometryControl;
};

/**
 * initTileLayerSwitcher
 * Init the layer switcher
 *
 * @return {TreeLayerSwitcher}
 * 
 * @private
 */
Viewer.prototype.initTileLayerSwitcher = function () {
    var tileLayerSwitcherControl = this.createTileLayerSwitcher();
    this.getMap().addControl(tileLayerSwitcherControl);
    tileLayerSwitcherControl.setFondCartoByTilePosition(this.settings.defaultSwitchableTile);

    return tileLayerSwitcherControl;
};

/**
 * initExportToPngControl
 * Init control to export map in png
 * 
 * @private
 */
Viewer.prototype.initExportToPngControl = function () {
    var exportToPngControl = new ExportToPngControl();
    this.getMap().addControl(exportToPngControl);
};

/**
 * initDrawToolsControl
 * Init draw tools controls
 *
 * @private
 */
Viewer.prototype.initDrawToolsControl = function () {

    var drawToolsControl = new DrawToolsControl({
        layer: this.geometryLayer,
        type: this.settings.geometryType,
        multiple: !isSingleGeometryType(this.settings.geometryType),
        translations: this.settings.translations,
        precision: this.settings.precision,
        dataProjection: this.settings.dataProjection
    });

    this.getMap().addControl(drawToolsControl);

    drawToolsControl.on('draw:change', function (e) {
        if (this.settings.centerOnResults && e.originType !== "draw:removed") {
            fitViewToFeaturesCollection(this.getMap(), this.geometryLayer.getSource().getFeaturesCollection());
        }

        this.getMap().dispatchEvent({ type: 'change:geometries', geometries: e.geometries, geojson: e.geojson });

        // modifier le contenu de l'input
        if (this.settings.geometryType && isValidGeometryType(this.settings.geometryType)) {
            this.showGeometryControl.setRawData(e.geojson);
        }
    }.bind(this));


    return drawToolsControl;
};

/**
 * createLayersFromTileLayersConfig
 *
 * @return {Array<ol.layer.Tile>}
 * 
 * @private
 */
Viewer.prototype.createLayersFromTileLayersConfig = function (tileLayersConfig) {
    var tileLayersConfig = this.settings.tileLayers;

    var extractTileLayerFromTileLayerConfig = function (tileLayerConfig) {
        var url = tileLayerConfig.url;
        var title = tileLayerConfig.title;
        var options = {
            minResolution: tileLayerConfig.minResolution,
            maxResolution: tileLayerConfig.maxResolution,
            opacity: tileLayerConfig.opacity,
            attributions: [tileLayerConfig.attribution],
            minZoom: tileLayerConfig.minZoom,
            maxZoom: tileLayerConfig.maxZoom,
            projection: tileLayerConfig.projection,
            opaque: tileLayerConfig.opaque,
            cacheSize: tileLayerConfig.cacheSize,
            transition: tileLayerConfig.transition,
            wrapX: tileLayerConfig.wrapX
        };
        return new TileLayer(url, title, options);
    };

    var layers = [];

    for (var i in tileLayersConfig) {
        var tileLayer = extractTileLayerFromTileLayerConfig(tileLayersConfig[i]);
        layers[tileLayer.getTitle()] = (tileLayer.getLayer());
    }

    return layers;
};

/**
 * createTileLayerSwitcher
 * 
 * @return {TileLayerSwitcher}
 * 
 * @private
 */
Viewer.prototype.createTileLayerSwitcher = function () {

    var tileLayerSwitcherControl = new TileLayerSwitcher({
        tileCoord: this.settings.tileCoordinates
    });


    // switchableLayers not renseigned
    if (this.settings.switchableLayers === null || this.settings.switchableLayers.length === 0) {

        for (var title in this.layers) {
            if (this.layers[title] === null) {
                tileLayerSwitcherControl.addTile([], title);
            } else {
                tileLayerSwitcherControl.addTile([this.layers[title]], title);
            }
        };

        // switchableLayers renseigned
    } else {
        for (var i in this.settings.switchableLayers) {

            // switchableLayers [["titre1","titre2"]]
            if (Array.isArray(this.settings.switchableLayers[i])) {
                var groupedTitle = this.settings.switchableLayers[i].join(' & ');
                var groupedLayers = [];
                for (var u in this.settings.switchableLayers[i]) {

                    if (this.layers[this.settings.switchableLayers[i][u]] !== null) {
                        groupedLayers.push(this.layers[this.settings.switchableLayers[i][u]]);
                    }
                }
                tileLayerSwitcherControl.addTile(groupedLayers, groupedTitle);

                // switchableLayers ["titre3"]
            } else {
                if (this.layers[this.settings.switchableLayers[i]] === null) {
                    tileLayerSwitcherControl.addTile([], this.settings.switchableLayers[i]);
                } else {
                    tileLayerSwitcherControl.addTile([this.layers[this.settings.switchableLayers[i]]], this.settings.switchableLayers[i]);
                }
            }
        }
    }

    tileLayerSwitcherControl.on('change:tile', function (e) {
        this.getMap().dispatchEvent({ type: 'change:tile', tile: e.tile });
    }.bind(this));


    return tileLayerSwitcherControl;
};


module.exports = Viewer;
