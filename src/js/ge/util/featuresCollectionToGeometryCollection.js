
var geometriesToCollection = require('./geometriesToCollection.js');

/**
 * featuresCollectionToGeometryCollection
 * Converts features collection (ol.Collection) to a normalized geometry collection
 * 
 * @param {ol.Collection} featuresCollection
 * 
 * @return {Object}
 * 
 */
var featuresCollectionToGeometryCollection = function (featuresCollection) {
    var geometries = [];
    featuresCollection.features.forEach(function (feature) {
        geometries.push(feature.geometry);
    });

    if (geometries.length === 0) {
        return null;
    }

    if (geometries.length >= 1) {
        return geometriesToCollection(geometries);
    }
};

module.exports = featuresCollectionToGeometryCollection;
