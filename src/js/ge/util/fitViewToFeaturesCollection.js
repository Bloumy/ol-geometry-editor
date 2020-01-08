/**
 * fitViewToFeaturesCollection
 * 
 * Center map on featuresCollection extent
 * 
 * @param {ol.Map} map 
 * @param {ol.Collection} featuresCollection 
 */
var fitViewToFeaturesCollection = function (map, featuresCollection) {
    var geometries = [];
    featuresCollection.forEach(function (feature) {
        geometries.push(feature.getGeometry());
    });

    if(geometries.length === 0){
        return;
    }

    map.getView().fit((new ol.geom.GeometryCollection(geometries)).getExtent(), {
        size: map.getSize(),
        duration: 100
    });
};


module.exports = fitViewToFeaturesCollection;