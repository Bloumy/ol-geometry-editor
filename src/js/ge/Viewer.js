var DrawToolsControl = require('./controls/DrawToolsControl');
var TileLayerSwitcher = require('./controls/TileLayerSwitcherControl');
var ExportToPngControl = require('./controls/ExportToPngControl');
var ShowGeometryControl = require('./controls/ShowGeometryControl');

var guid = require('./util/guid');

var isSingleGeometryType = require('./util/isSingleGeometryType.js');
var defaultStyleLayerFunction = require('./util/defaultStyleLayerFunction');

var fitViewToFeaturesCollection = require('./util/fitViewToFeaturesCollection');

var isValidGeometryType = require('./util/isValidGeometryType');

var TileLayer = require('./models/TileLayer');


/**
 * Geometry editor viewer
 *
 * @param {Object} options
 */
var Viewer = function (options) {

    this.settings = {
        dataProjection: "EPSG:4326",
        mapProjection: "EPSG:3857"
    };

    $.extend(this.settings, options);

    this.map = this.createMap(this.settings);

    this.layers = this.createLayersFromTileLayersConfig(this.settings.tileLayers);
    this.addLayersToMap(this.layers);


    // init layer for geometries to show
    this.geometryLayer = this.initGeometriesLayer();

    if (this.settings.geometryType && isValidGeometryType(this.settings.geometryType)) {
        this.showGeometryControl = this.initShowGeometryControl();
    }

    // init tileLayerSwitcher
    if (this.settings.tileLayerSwitcher) {
        this.initTileLayerSwitcher(this.settings);
    }

    // init geometries editable
    if (this.settings.editable) {
        this.drawToolsControls = this.initDrawToolsControl({
            layer: this.geometryLayer,
            geometryType: this.settings.geometryType,
            translations: this.settings.translations
        });
    }

    // export to image control
    if (this.settings.allowCapture) {
        this.initExportToPngControl();
    }

};


Viewer.prototype.getMap = function () {
    return this.map;
};


/**
 * Create a map
 * @param {Object} options - params are :
 *
 * @param {string|int} options.height - map height
 * @param {string|int} options.width - map width
 * @param {float} options.lat - latitude at start for map center
 * @param {float} options.lon - longitude at start for map center
 * @param {float} options.zoom - map zoom
 *
 */
Viewer.prototype.createMap = function (options) {
    options = options || {};

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
 * Init draw layer
 */
Viewer.prototype.initGeometriesLayer = function () {
    var geometryFeaturesCollection = new ol.Collection();
    var geometryLayer = this.createVectorLayer(geometryFeaturesCollection);

    this.getMap().addLayer(geometryLayer);

    return geometryLayer;
};

/**
 * Init control export to png
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
 * init TileLayerSwitcher
 *
 * @param {object} params parametres
 * @param {object} params.tileCoordinates coordonnées pour l'image tuile
 * @param {object} params.switchableLayers Mapping des couches pour chaque tuile en fonction du title
 * @param {object} params.defaultSwitchableTile Mapping des couches pour chaque tuile en fonction du title
 *
 * @return {TreeLayerSwitcher}
 */
Viewer.prototype.initTileLayerSwitcher = function (params) {
    var tileLayerSwitcherControl = this.createTileLayerSwitcher(this.layers, params);
    this.getMap().addControl(tileLayerSwitcherControl);
    tileLayerSwitcherControl.setFondCartoByTilePosition(params.defaultSwitchableTile);

    return tileLayerSwitcherControl;
};

/**
 * Init control export to png
 */
Viewer.prototype.initExportToPngControl = function () {
    var exportToPngControl = new ExportToPngControl();
    this.getMap().addControl(exportToPngControl);
};


/**
 * Init draw controls
 *
 * @private
 */
Viewer.prototype.initDrawToolsControl = function (params) {

    var drawToolsControl = new DrawToolsControl({
        layer: params.layer,
        type: params.geometryType,
        multiple: !isSingleGeometryType(params.geometryType),
        translations: params.translations,
        precision: this.settings.precision,
        dataProjection: this.settings.dataProjection
    });

    this.getMap().addControl(drawToolsControl);

    drawToolsControl.on('draw:change', function (e) {
        if (this.settings.centerOnResults && e.originType !== "draw:removed") {
            fitViewToFeaturesCollection(this.getMap(), this.geometryLayer.getSource().getFeaturesCollection());
        }

        this.getMap().dispatchEvent($.extend(e, { type: 'change:geometries' }));

        // modifier le contenu de l'input
        if (this.settings.geometryType && isValidGeometryType(this.settings.geometryType)) {
            this.showGeometryControl.setRawData(e.geojson);
        }
    }.bind(this));


    return drawToolsControl;
};


/**
 * Add layers to Viewer map
 *
 * @param {array<ol.layer.Layer>} layers - array of layer configurations
 *
 */
Viewer.prototype.addLayersToMap = function (layers) {
    for (var i in layers) {
        if (layers[i] !== null) {
            this.getMap().addLayer(layers[i]);
        }
    }
};


/**
 *
 * @param {ol.Collection} featuresCollection
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
 * tileLayers to [ol.layer.Layer]
 *
 * @param {Array} tileLayersConfig - array of layer configurations
 * @param {string} tileLayersConfig[].url - url
 * @param {string} tileLayersConfig[].attribution - attribution
 * @param {string} tileLayersConfig[].title - titre
 *
 * @private
 */
Viewer.prototype.createLayersFromTileLayersConfig = function (tileLayersConfig) {


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
 * @param {array} layers Liste sous la forme {'couche 1': layer1 },{...}
 * @param {object} params parametres
 * @param {object} params.tileCoordinates coordonnées pour l'image tuile
 * @param {object} params.switchableLayers Mapping des couches pour chaque tuile en fonction du title
 */
Viewer.prototype.createTileLayerSwitcher = function (layers, params) {

    var tileLayerSwitcherControl = new TileLayerSwitcher({
        tileCoord: params.tileCoordinates
    });


    var switchableLayers = params.switchableLayers

    // switchableLayers not renseigned
    if (switchableLayers === null || switchableLayers.length === 0) {

        for (var title in layers) {
            if (layers[title] === null) {
                tileLayerSwitcherControl.addTile([], title);
            } else {
                tileLayerSwitcherControl.addTile([layers[title]], title);
            }
        };

        // switchableLayers renseigned
    } else {
        for (var i in switchableLayers) {

            // switchableLayers [["titre1","titre2"]]
            if (Array.isArray(switchableLayers[i])) {
                var groupedTitle = switchableLayers[i].join(' & ');
                var groupedLayers = [];
                for (var u in switchableLayers[i]) {

                    if (layers[switchableLayers[i][u]] !== null) {
                        groupedLayers.push(layers[switchableLayers[i][u]]);
                    }
                }
                tileLayerSwitcherControl.addTile(groupedLayers, groupedTitle);

                // switchableLayers ["titre3"]
            } else {
                if (layers[switchableLayers[i]] === null) {
                    tileLayerSwitcherControl.addTile([], switchableLayers[i]);
                } else {
                    tileLayerSwitcherControl.addTile([layers[switchableLayers[i]]], switchableLayers[i]);
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
