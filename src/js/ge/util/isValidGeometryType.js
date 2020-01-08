/**
 * 
 * isValidGeometryType
 * 
 * Indicates if the given geometryType is valid
 * 
 * @param {string} geometryType tested geometryType
 *
 * @return {boolean}
 */
var isValidGeometryType = function (geometryType) {
    switch (geometryType) {
        case "Point":
        case "LineString":
        case "Polygon":
        case "MultiPoint":
        case "MultiLineString":
        case "MultiPolygon":
        case "Geometry":
        case "Rectangle":
            return true;
        default:
            return false;
    }
};

module.exports = isValidGeometryType;
