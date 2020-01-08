
/**
 * isSingleGeometryType
 * 
 * Indicates if the given type corresponds to a mutli geometry
 * @param {string} geometryType tested geometry type
 * 
 * @return {boolean}
 */
var isSingleGeometryType = function (geometryType) {
    return ["Point", "LineString", "Polygon", "Rectangle"].indexOf(geometryType) !== -1;
};

module.exports = isSingleGeometryType;
