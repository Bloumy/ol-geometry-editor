var extent = require('turf-extent');

/**
 * SerializeGeometry 
 * 
 * @param {Object} geometry
 * @param {string} geometryType
 * 
 * @return {string}
 *
 */
var serializeGeometry = function (geometry, geometryType) {

    if (geometryType === 'Rectangle') {
        return JSON.stringify(extent(geometry));
    } 
    
    return  JSON.stringify(geometry);
    
};


module.exports = serializeGeometry;
