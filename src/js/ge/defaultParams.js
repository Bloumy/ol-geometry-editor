
/**
 * Default GeometryEditor parameters
 */
var defaultParams = {
    tileLayers: [
       {
           url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
           attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
       }
    ],
    /*
     * display or hide corresponding form item
     */
    hide: true,
    editable: true,
    width: '100%',
    height: '500',
    lon: 2.0,
    lat: 45.0,
    zoom: 4,
    maxZoom: 18,
    geometryType: 'Geometry',
    centerOnResults: true,
    onResult: function(){}
} ;

module.exports = defaultParams ;
