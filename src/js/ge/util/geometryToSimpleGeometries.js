/**
 * multiToGeometries
 * Converts a multi-geometry to an array of geometries
 * 
 * @param {MultiPoint|MultiPolygon|MultiLineString} multiGeometry
 * 
 * @returns {Geometry[]} simple geometries
 * 
 * @private
 */
var multiToGeometries = function (multiGeometry) {
    var geometries = [];

    var simpleType = multiGeometry.type.substring("Multi".length);
    multiGeometry.coordinates.forEach(function (subCoordinates) {
        geometries.push(
            {
                "type": simpleType,
                "coordinates": subCoordinates
            }
        );
    });

    return geometries;
};

/**
 * geometryCollectionToGeometries
 * 
 * Converts a geometry collection to an array of geometries
 * 
 * @param {ol.Collection} geometryCollection
 * 
 * @returns {Geometry[]} simple geometries
 * 
 * @private
 */
var geometryCollectionToGeometries = function (geometryCollection) {
    var geometries = [];
    geometryCollection.geometries.forEach(function (geometry) {
        geometries.push(geometry);
    });
    return geometries;
};


/**
 *
 * Converts a geometry to an array of single geometries. For
 * example, MultiPoint is converted to Point[].
 *
 * @param {ol.Geometry} geometry
 * 
 * @returns {Geometry[]} simple geometries
 */
var geometryToSimpleGeometries = function (geometry) {
    switch (geometry.type) {
        case "Point":
        case "LineString":
        case "Polygon":
            return [geometry];
        case "MultiPoint":
        case "MultiLineString":
        case "MultiPolygon":
            return multiToGeometries(geometry);
        case "GeometryCollection":
            return geometryCollectionToGeometries(geometry);
        default:
            throw "unsupported geometry type : " + geometry.type;
    }
};

module.exports = geometryToSimpleGeometries;
