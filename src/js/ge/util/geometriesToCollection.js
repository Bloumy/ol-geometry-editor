/**
 * geometriesToCollection
 * 
 * Converts an array of geometries to a geometry collection (MultiPoint, MultiLineString,
 * MultiPolygon, GeometryCollection).
 * 
 * @param {Array} geometries
 * 
 * @return {Object}
 */
var geometriesToCollection = function (geometries) {


    // regrouper les geometries par type
    var geometriesPerType = {};
    geometries.forEach(function (geometry) {
        if (!geometriesPerType[geometry.type]) {
            geometriesPerType[geometry.type] = [];
        }
        geometriesPerType[geometry.type].push(geometry);
    });

    // regrouper les multipoints, multilinestring et multipolygon
    for (var type in geometriesPerType) {

        if (type.includes('Multi')) {

            var coordinates = [];
            geometriesPerType[type].forEach(function (geometry) {
                coordinates.push(geometry.coordinates[0]);
            });

            var multiGeometry = {
                type: type,
                coordinates: coordinates
            };
            geometriesPerType[type] = [multiGeometry];
        }

    }

    // S'il y a plusieurs types differents retourner une geometrieCollection
    if (Object.keys(geometriesPerType).length > 1) {

        var geoms = [];
        for (var type in geometriesPerType) {
            for (var i in geometriesPerType[type]) {
                geoms.push(geometriesPerType[type][i]);
            }
        }

        return {
            "type": "GeometryCollection",
            "geometries": geoms
        };
    } else {

        for (var type in geometriesPerType) {
            // s'il y a plusieurs geometries par type retourner une geometrieCollection
            if (geometriesPerType[type].length > 1) {
                var geoms = [];
                for (var i in geometriesPerType[type]) {
                    geoms.push(geometriesPerType[type][i]);
                }
                return {
                    "type": "GeometryCollection",
                    "geometries": geoms
                };

            // sinon renvoyer la geometrie de la feature
            } else {
                return geometriesPerType[type][0]
            }
        }

    }
};

module.exports = geometriesToCollection;
