var defaultTranslations = require('../translations/translation.fr.json');


var DrawControl = require('./DrawControl');
var EditControl = require('./EditControl');
var TranslateControl = require('./TranslateControl');
var RemoveControl = require('./RemoveControl');
var defaultStyleDrawFunction = require('../util/defaultStyleDrawFunction');

var serializeGeometry = require('../util/serializeGeometry');
var getGeometryByFeaturesCollection = require('../util/getGeometryByFeaturesCollection');
var geometryToSimpleGeometries = require('../util/geometryToSimpleGeometries');


/**
 * Contrôle d'outils de dessins
 *
 * @constructor
 * @extends {ol.control.Control}
 *
 * @param {object} options
 * @param {String} options.type le type d'élément dessiné ('Text', 'Point', 'LineString' ou 'Polygon')
 *
 */
var DrawToolsControl = function (options) {
    this.translations = $.extend(defaultTranslations, options.translations || {});

    this.layer = options.layer;
    this.featuresCollection = this.layer.getSource().getFeaturesCollection();
    this.type = options.type || "Geometry";
    this.multiple = options.multiple || false;
    this.style = options.style;
    this.dataProjection = options.dataProjection;
    this.precision = options.precision;

    this.controls = [];

    var drawBar = $("<div>").addClass('ol-draw-tools ol-unselectable ol-control');

    ol.control.Control.call(this, {
        element: drawBar.get(0),
        target: options.target
    });
};

ol.inherits(DrawToolsControl, ol.control.Control);


DrawToolsControl.prototype.setMap = function (map) {
    ol.control.Control.prototype.setMap.call(this, map);
    this.initControl();
};

DrawToolsControl.prototype.initControl = function () {

    this.addDrawControls();
    this.addEditControl();
    // this.addTranslateControl();
    this.addRemoveControl();



    var handleDrawChange = function (e) {

        var geometry = getGeometryByFeaturesCollection(this.layer.getSource().getFeaturesCollection(), {
            precision: this.precision,
            dataProjection: this.dataProjection,
            mapProjection: this.getMap().getView().getProjection()
        });

        var geometryGeoJson = "";
        var geometries = null;

        if (geometry) {
            geometryGeoJson = serializeGeometry(geometry, this.type);

            geometries = geometryToSimpleGeometries(geometry);
        }

        this.dispatchEvent({ type: 'draw:change', originType: e.type, geometries: geometries, geojson: geometryGeoJson });

    }.bind(this);


    this.on('draw:added', handleDrawChange);
    this.on('draw:edited', handleDrawChange);
    this.on('draw:removed', handleDrawChange);

};


DrawToolsControl.prototype.addDrawControls = function () {
    if (this.type === "Geometry") {
        this.addDrawControl({ type: "MultiPoint", multiple: true, title: this.translations.draw.multipoint });
        this.addDrawControl({ type: "MultiLineString", multiple: true, title: this.translations.draw.multilinestring });
        this.addDrawControl({ type: "MultiPolygon", multiple: true, title: this.translations.draw.multipolygon });
    } else {
        this.addDrawControl({ type: this.type, multiple: this.multiple, title: this.translations.draw[this.type.toLowerCase()] });
    }

};

DrawToolsControl.prototype.addDrawControl = function (options) {
    options = options || {};

    var drawControl = new DrawControl({
        featuresCollection: this.featuresCollection,
        type: options.type,
        target: this.element,
        style: function (feature, resolution) {
            return defaultStyleDrawFunction(feature, resolution, options.type);
        },
        multiple: options.multiple,
        title: options.title
    });

    drawControl.on('draw:active', function () {
        this.deactivateControls(drawControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(drawControl);

    drawControl.getInteraction().on('drawend', function (e) {

        if (drawControl.isActive()) {

            // laisser le temps au croquis d'ajouter la feature  à la couche
            setTimeout(function () {
                this.dispatchEvent({ type: "draw:added" });
            }.bind(this), 0);
        }
    }.bind(this));

    this.controls.push(drawControl);
};

DrawToolsControl.prototype.addEditControl = function () {
    var editControl = new EditControl({
        // featuresCollection: this.featuresCollection,
        layer: this.layer,
        target: this.element,
        title: this.translations.edit[this.type.toLowerCase()]
    });

    editControl.on('edit:active', function () {
        this.deactivateControls(editControl);
        this.dispatchEvent('tool:active');
    }.bind(this));

    this.getMap().addControl(editControl);

    var modifyEnd = function () {

        // laisser le temps au croquis de mettre à jour la feature dans la couche
        setTimeout(function () {
            this.dispatchEvent({ type: "draw:edited" });
        }.bind(this), 0);
    }.bind(this);

    editControl.getInteractions().forEach(function (interaction) {
        interaction.on('modifyend', modifyEnd);
        interaction.on('translateend', modifyEnd);

    }.bind(this));

    

    this.controls.push(editControl);


};

// DrawToolsControl.prototype.addTranslateControl = function () {
//     var translateControl = new TranslateControl({
//         featuresCollection: this.featuresCollection,
//         target: this.element,
//         title: this.translations.translate[this.type.toLowerCase()]
//     });

//     translateControl.on('translate:active', function () {
//         this.deactivateControls(translateControl);
//         this.dispatchEvent('tool:active');
//     }.bind(this));

//     this.getMap().addControl(translateControl);
//     this.controls.push(translateControl);
// };

DrawToolsControl.prototype.addRemoveControl = function () {
    var removeControl = new RemoveControl({
        featuresCollection: this.featuresCollection,
        target: this.element,
        title: this.translations.remove[this.type.toLowerCase()]
    });

    removeControl.on('remove:active', function () {
        this.deactivateControls(removeControl);
        this.dispatchEvent('tool:active');
    }.bind(this));


    this.getMap().addControl(removeControl);

    removeControl.getInteraction().on('deleteend', function () {
        this.dispatchEvent({ type: "draw:removed" });
        // laisser le temps au croquis de retirer la feature de la couche
        setTimeout(function () {
            this.dispatchEvent({ type: "draw:removed" });
        }.bind(this), 0);
    }.bind(this));

    this.controls.push(removeControl);

};

DrawToolsControl.prototype.deactivateControls = function (keepThisOne) {
    this.controls.forEach(function (control) {
        if (control !== keepThisOne) {
            control.setActive(false);
        }
    });
};

DrawToolsControl.prototype.getControls = function () {
    return this.controls;
};


module.exports = DrawToolsControl;
