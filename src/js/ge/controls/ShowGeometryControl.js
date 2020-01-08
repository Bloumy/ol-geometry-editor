
var bboxPolygon = require('turf-bbox-polygon');
var isValidGeometry = require('../util/isValidGeometry');
var geometryToSimpleGeometries = require('../util/geometryToSimpleGeometries');

var serializeGeometry = require('../util/serializeGeometry');
var getGeometryByFeaturesCollection = require('../util/getGeometryByFeaturesCollection');



/**
 * Control to show geometries from an input or other tag to a map and vice versa
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 * @param {Object} options
 * @param {jQuery} options.targetElement
 * @param {jQuery} options.geometryType
 * @param {String} options.layer
 * @param {String} options.hide
 * @param {String} options.dataProjection
 * @param {String} options.precision
 * @param {String} options.centerOnResults
 *
 */
var ShowGeometryControl = function (options) {

    this.geometryType = options.geometryType;
    this.layer = options.layer;
    this.hide = options.hide;
    this.dataProjection = options.dataProjection;
    this.precision = options.precision;
    this.centerOnResults = options.centerOnResults;

    ol.control.Control.call(this, {
        element: options.targetElement
    });

};

ol.inherits(ShowGeometryControl, ol.control.Control);


ShowGeometryControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

ShowGeometryControl.prototype.initControl = function () {
    $(this.element).insertBefore(this.getMap().getTargetElement());

    // hide data
    if (this.hide) {
        $(this.element).hide();
    }

    this.updateGeometriesOnMap();

    $(this.element).on('change', function (e) {
        this.updateGeometriesOnMap();
    }.bind(this));


};




/**
 * Update geometry to map
 *
 * @private
 */
ShowGeometryControl.prototype.updateGeometriesOnMap = function () {


    var geoJSON = this.getRawData();
    if (geoJSON === '') {
        return;
    }
    try {
        var geometry = JSON.parse(geoJSON);

    } catch (error) {
        this.dispatchEvent({ type: 'error', message: "Invalid GeoJSON.", error: error })
        this.layer.getSource().clear();
        return;
    }

    // hack to accept bbox
    if (geometry instanceof Array && geometry.length === 4) {
        geometry = bboxPolygon(geometry).geometry;
    }



    if (!isValidGeometry(geometry)) {
        return;
    }

    var geometries = geometryToSimpleGeometries(geometry);

    this.setGeometriesOnMap(geometries);

    this.dispatchEvent({ type: 'set:geometries', geometries: geometries, geojson: geoJSON });

};


/**
 * Ajoute des features dans une feature collection à partir d'un tableau de géométries GeoJson
 *
 * @param {Array} geometries - simple geometries
 */
ShowGeometryControl.prototype.setGeometriesOnMap = function (geometries) {
    this.layer.getSource().clear();

    var formatGeojson = new ol.format.GeoJSON();

    // var features =  [];
    for (var i in geometries) {
        var geometry = formatGeojson.readGeometry(JSON.stringify(geometries[i]));

        var feature = new ol.Feature({
            geometry: geometry.transform(this.dataProjection, this.getMap().getView().getProjection())
        });

        // necessaire pour les rectangles, pour les interractions d'édition 
        feature.set('type', this.geometryType);

        // TODO : declanche l'evenement a chaque feature ajouté alors qu'on ne veux le declancher qu'une fois
        this.layer.getSource().getFeaturesCollection().push(feature);
    }

};


/**
 * Update geometry to element
 *
 * @private
 */
ShowGeometryControl.prototype.updateGeometriesOnElement = function () {
    this.serializeGeometry();
};


/**
 * Serialize geometry to element
 *
 * @private
 */
ShowGeometryControl.prototype.serializeGeometry = function () {
    var geometry = getGeometryByFeaturesCollection(this.layer.getSource().getFeaturesCollection(), {
        precision: this.precision,
        dataProjection: this.dataProjection,
        mapProjection: this.getMap().getView().getProjection()
    });

    var geometryGeoJson = "";
    if (geometry) {
        geometryGeoJson = serializeGeometry(geometry, this.geometryType);
    }

    this.setRawData(geometryGeoJson);
};


/**
 * Get raw data from the element
 * @returns {String}
 */
ShowGeometryControl.prototype.getRawData = function () {
    if (this.isDataElementAnInput()) {
        return $.trim($(this.element).val());
    } else {
        return $.trim($(this.element).html());
    }
};

/**
 * Set raw data to the element
 * @param {String} value
 */
ShowGeometryControl.prototype.setRawData = function (value) {
    var currentData = this.getRawData();
    if (currentData === value) {
        return;
    }

    if (this.isDataElementAnInput()) {
        $(this.element).val(value);
    } else {
        $(this.element).html(value);
    }
};

/**
 * Indicates if data element is an input field (<input>, <textarea>, etc.)
 * @private
 */
ShowGeometryControl.prototype.isDataElementAnInput = function () {
    return typeof $(this.element).attr('value') !== 'undefined';
};



module.exports = ShowGeometryControl;
