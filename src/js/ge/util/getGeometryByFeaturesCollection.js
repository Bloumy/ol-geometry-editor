var featuresCollectionToGeometryCollection = require('./featuresCollectionToGeometryCollection');

/**
 * getGeometryByFeaturesCollection
 *
 * @param {ol.Collection}   featuresCollection
 * @param {Object}          options
 * @param {string}          options.mapProjection
 * @param {string}          options.dataProjection
 * @param {int}             options.precision
 * 
 * @return {Object}
 */
var getGeometryByFeaturesCollection = function (featuresCollection, options) {

    var featuresGeoJson = (new ol.format.GeoJSON()).writeFeatures(
        featuresCollection.getArray(),
        {
            featureProjection: options.mapProjection,
            dataProjection: options.dataProjection,
            decimals: options.precision
        });

    return featuresCollectionToGeometryCollection(JSON.parse(featuresGeoJson));
};



module.exports = getGeometryByFeaturesCollection;
