var markerShadowUrl = require('../../../images/marker-shadow.png');
var markerIconUrl = require('../../../images/marker-icon.png');
var getDefaultStyle = require('./getDefaultStyle');

/**
 * defaultStyleDrawFunction
 * 
 * @param {ol.Feature} feature 
 * @param {number} resolution 
 * @param {string} type
 *
 * @return {ol.style.Style}
 */
var defaultStyleDrawFunction = function (feature, resolution, type) {

    switch (type) {
        case "Point":
        case "MultiPoint":
            var markerStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 41],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: markerIconUrl
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: markerShadowUrl
                })
            });
            return [shadowMarker, markerStyle];
    }

    return getDefaultStyle();

};

module.exports = defaultStyleDrawFunction;
