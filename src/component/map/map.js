// import './leaflet.css'

// import leaflet from 'leaflet'
import router from '../../store/router'
import ajax from '../../utils/ajax.js'
import t from '../../utils/translator'

// var MQ = require('imports?leaflet=leaflet!exports?MQ!./mapquest.es5')
var MQ = require('exports?MQ!./mapquest.es5')


// var oms = new OverlappingMarkerSpiderfier(map);


//icones
var greenIcon = leaflet.icon({
    iconUrl: 'assets/img/empenhado.png',
    iconSize: [25, 41],
    popupAnchor: [0, -10],
});
var blueIcon = leaflet.icon({
    iconUrl: 'assets/img/liquidado.png',
    iconSize: [25, 41],
    popupAnchor: [0, -10],
});
var redIcon = leaflet.icon({
    iconUrl: 'assets/img/planejado.png',
    iconSize: [25, 41],
    popupAnchor: [0, -10],
});
// var yellowIcon = leaflet.icon({
//     iconUrl: 'assets/img/amarelo.png',
//     iconSize: [25, 41],
//     popupAnchor: [0, -10],
// });

function getcolor(state) {
    if(state == "orcado") return redIcon
    if(state == "atualizado") return redIcon
    if(state == "empenhado") return greenIcon
    if(state == "liquidado") return blueIcon
    return null
}

leaflet.Icon.Default.imagePath = "assets/img/leaflet"


// This flag is used to know if the user clicked the marker (so the map
// already panned to it) or if the "code" was changed another way, so the
// map still needs to pan to it.
var justClickedMarker = false



class Map {

    initMap(domId, tag) {
        this.domId = domId
        this.tag = tag
        this.popup = new leaflet.Popup()

        this.map = leaflet.map(domId, {
            layers: MQ.mapLayer(),
            center: [-23.58098, -46.61293],
            zoom: 12,
            // maxZoom: 20
        })

        // $.getJSON('assets/geojson/subprefeituras.json')
        //     .done(function(response_data) {
        //         leaflet.geoJson(response_data).addTo(map);
        //     });

    }

    redraw() {
        if (this.map) {
            let center = this.map.getCenter()
            this.map.invalidateSize()
            this.map.setView(center)
        }
    }

    updateMap(points) {
        if (!this.map) this.initMap(this.domId)

        // var newYear = content ? content.value : urlManager.getParam('year')

        // Avoids realoading data if year didn't change
        // if (newYear != year) {
            // year = newYear
            // Remove possible previous markers layer
        if (this.map.yearMarkers) this.map.removeLayer(this.map.yearMarkers)

        // Create new cluster layer
        var markers = new leaflet.MarkerClusterGroup({
            maxClusterRadius: 60,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            iconCreateFunction: function (cluster) {
                var markers = cluster.getAllChildMarkers()
                // var html = markers.length
                return leaflet.divIcon({
                    html: markers.length,
                    className: 'cluster-circle',
                    iconSize: leaflet.point(32, 32)
                })
            }
        })

        for (let point of points.FeatureColletion) {
            var marker = leaflet.geoJson(point, {
                pointToLayer: this.pointToLayer
            })
            marker.on('click', this.markerClicked.bind(this))
            markers.addLayer(marker)
        }
        this.map.addLayer(markers);
        this.map.yearMarkers = markers
    }

    pointToLayer (feature, latlng) {
        var marker = leaflet.marker(latlng, {icon: getcolor(feature.properties.state)})
        return marker
    }

    setCenter(latlng) {
        this.map.panTo(latlng)
    }

    // Called when a marker is clicked
    markerClicked(event) {
        let code = event.layer.feature.properties.uid
        if (router.getParam('code') != code) this.popup.setContent("Carregando...")
        this.popup.setLatLng(event.latlng)
        // this.map.openPopup(this.popup)
        this.map.panTo(event.latlng)
        justClickedMarker = true
        router.route('despesa', {code})
    }

    // // Update popup with the new data
    // updatePopup(event, data) {
    //     if (data && data.ds_projeto_atividade) {
    //         // If row has geometry (is mapped)
    //         if (data.geometry) {
    //             if (justClickedMarker) {
    //                 justClickedMarker = false
    //             } else {
    //                 var coords = data.geometry.coordinates
    //                 // Inversion of coords needed... Leaflet standard != geoJSON
    //                 if (data.geometry) this.map.panTo([coords[1], coords[0]])
    //             }
    //             this.popup.setContent(data.ds_projeto_atividade)
    //             // TODO: add something to comment and else
    //             // If row has no geometry, ...
    //         } else {
    //         }
    //     } else {
    //         this.popup.setContent("Erro: descrição não encontrada!")
    //     }
    // }

    async locateAddress(address) {
        let base = "https://nominatim.openstreetmap.org/search/",
            query = "?format=json&limit=1&countrycodes=br&viewbox=-47.16,-23.36,-45.97,-23.98&bounded=1",
            url = base + address + query,
            response = await ajax({url})

        if (response && response.json) {
            let data = response.json
            if (data.length) this.map.setView([data[0].lat,data[0].lon], 16)
            else alert(t.translate('address_not_found'))
        }
    }
}


let instance = new Map()

export default instance
