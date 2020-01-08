var markerShadowUrl = require('../../../images/marker-shadow.png');
var markerIconUrl = require('../../../images/marker-icon.png');
var getDefaultStyle = require('./getDefaultStyle');

var defaultStyleLayerFunction = function (feature, resolution) {

    type = feature.getGeometry().getType();

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
//                    src: "../../../images/marker-icon.png"
                })
            });
            var shadowMarker = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [14, 41],
                    anchorXUnits: 'pixels',
                    anchorYUnits: 'pixels',
                    opacity: 1,
                    src: markerShadowUrl
//                    src: "../../../images/marker-shadow.png"
                })
            });
            return [shadowMarker, markerStyle];
    }

    return getDefaultStyle();

};

module.exports = defaultStyleLayerFunction;


