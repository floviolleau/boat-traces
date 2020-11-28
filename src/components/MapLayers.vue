<template>
    <div class="map">
        <l-map :zoom="zoom" :center="center" ref="map">
            <l-tile-layer
                    :visible=true
                    name="Base"
                    :url="url"
                    :attribution="attribution"
                    layer-type="base"
            ></l-tile-layer>
            <l-tile-layer
                    :visible=true
                    name="Sea info"
                    :url="seaUrl"
                    :attribution="seaAttribution"
                    layer-type="overlay"
            ></l-tile-layer>
            <l-control-layers position="topright"></l-control-layers>
            <l-layer-group>
                <l-layer-group
                        :visible=true
                        layer-type="overlay"
                        name="Avis urgent aux navigateurs">
                    <l-marker v-for="marker in markers" :key="marker.id"
                              :visible="marker.visible"
                              :icon="marker.icon"
                              :lat-lng="marker.position">
                        <l-popup :content="marker.tooltip" />
                    </l-marker>
                </l-layer-group>
                <l-layer-group
                        :visible=true
                        v-for="gpx in gpxs" :key="gpx.id"
                        layer-type="overlay"
                        :name="gpx.id">
                    <l-gpx
                            :visible=true
                            :gpx-file="gpx.fileName"
                            :gpx-options="{
                                async: true,
                                 polyline_options: {color: gpx.color}
                            }"
                            @gpx-loaded="onGpxLoaded">
                        <div v-for="gpxContent in gpxContents" :key="gpxContent.id">
                            <l-popup v-if="gpxContent.id === gpx.id" :content="gpxContent.content" />
                        </div>
                        <!--                        <button class="button" @click="onClickButton">Hide/Show Track</button>-->
                    </l-gpx>
                </l-layer-group>
            </l-layer-group>
        </l-map>
    </div>
</template>

<script>
    import axios from 'axios';
    import L from 'leaflet';
    import {LControlLayers, LLayerGroup, LMap, LMarker, LPopup, LTileLayer} from 'vue2-leaflet';
    // import LLayerGroup from './LLayerGroup';
    import LGpx from './LGpx';
    import gpxList from '../../public/gpxs/list.json';

    export default {
        name: 'map-layers',
        components: {
            LMap,
            LTileLayer,
            LMarker,
            LPopup,
            LLayerGroup,
            LControlLayers,
            LGpx
        },
        mounted() {
            // this.importAll(require.context('@/assets/gpxs/'));
            // this.$nextTick(() => {
            //this.map = this.$refs.map.mapObject;
            // });
        },
        data() {
            return {
                show: true,
                zoom: 10,
                center: [47.46, -2.7750773],
                markers: [],
                content: '',
                gpxs: gpxList.gpxFiles,
                gpxContents: [],
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>',
                seaUrl: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
                seaAttribution: '&copy; <a href="http://openseamap.org">OpenSeaMap</a>'
            }
        },
        methods: {
            // importAll(r) {
            //     r.keys().forEach(key => (this.gpxs.push({pathLong: r(key), pathShort: key})));
            //     console.log(this.gpxs)
            // },
            basename: function (str, sep) {
                return str.substr(str.lastIndexOf(sep) + 1);
            },
            // strip_extension: function (str) {
            //     return str.substr(0, str.lastIndexOf('.'));
            // },
            formatDate: function (stringDate, locale = 'fr') {
                const d = new Date(stringDate);
                const year = new Intl.DateTimeFormat(locale, {year: 'numeric'}).format(d);
                const month = new Intl.DateTimeFormat(locale, {month: 'long'}).format(d);
                const date = new Intl.DateTimeFormat(locale, {day: '2-digit'}).format(d);
                const hour = new Intl.DateTimeFormat(locale, {hour: '2-digit'}).format(d);
                let minute = parseInt(new Intl.DateTimeFormat(locale, {minute: '2-digit'}).format(d));

                if (minute < 10) {
                    minute = `0${minute}`;
                }
                return `${date} ${month} ${year} à ${hour}${minute}`;
            },
            // Pad to 2 or 3 digits, default is 2
            pad: function (n, z) {
                z = z || 2;
                return ('00' + n).slice(-z);
            },
            msToTime: function (s) {
                const ms = s % 1000;
                s = (s - ms) / 1000;
                const secs = s % 60;
                s = (s - secs) / 60;
                const mins = s % 60;
                const hrs = (s - mins) / 60;

                // return this.pad(hrs) + 'h' + this.pad(mins) + 'min ' + this.pad(secs) + 's.' + this.pad(ms, 3);
                return this.pad(hrs) + 'h' + this.pad(mins) + 'min ' + this.pad(secs) + 's';
            },
            roundTwoDigits: function (num) {
                return Math.round((num + Number.EPSILON) * 100) / 100;
            },
            onGpxLoaded: function (loadedEvent) {
                // const {mapObject} = this.$refs.map;
                const gpxMapObject = loadedEvent.target;
                const id = this.basename(gpxMapObject._gpx, '/');

                const distance = gpxMapObject.get_distance();
                const speed = gpxMapObject.get_total_speed();
                const content = `<div>Début : ${this.formatDate(gpxMapObject.get_start_time())}</div>
<div>Fin : ${this.formatDate(gpxMapObject.get_end_time())}</div>
<div>Durée totale : ${this.msToTime(gpxMapObject.get_total_time())}</div>
<div>Distance parcourue : ${this.roundTwoDigits(distance / 1852)}nm (${this.roundTwoDigits(distance / 1000)}km)</div>
<div>Vitesse moyenne : ${this.roundTwoDigits((speed * 1000) / 1852)} nœuds (${this.roundTwoDigits(speed)}km/h)</div>`;
                this.gpxContents.push({id, content});
            },
            // onClickButton: function () {
            //     this.visible = !this.visible;
            // },
            cleanDate: function (date) {
                if (date === null) {
                    return 'Inconnue'
                }
                return date
            },
            iconColor: function (date) {
                if (date === null) {
                    return 'blue'
                }
                date = new Date(date)
                const today = new Date()
                if (today <= this.addDays(date, 2)) {
                    return 'red'
                }
                if (today <= this.addDays(date, 8)) {
                    return 'orange'
                }
                return 'blue'
            },
            addDays: function (date, days) {
                let result = new Date(date)
                result.setDate(result.getDate() + days)
                return result
            }
        },
        created() {
            ['atlantique', 'manche', 'méditerranée'].forEach(region => {
                axios.get(`https://avurnav.antoine-augusti.fr/avurnavs/regions/${region}`).then(response => {
                    response.data.forEach(el => {
                        this.markers.push({
                            position: {
                                lng: el['longitude'],
                                lat: el['latitude']
                            },
                            visible: true,
                            icon: L.icon({
                                iconUrl: require(`@/assets/markers/markers-${this.iconColor(el['valid_from'])}@2x.png`),
                                shadowUrl: require('@/assets/markers/markers-shadow@2x.png'),
                                iconSize: [36, 46],
                                shadowSize: [34, 16]
                            }),
                            tooltip: `
              <div class="title">
                ${el['title']}
              </div>
              <div class="block">
                ${el['content']}
              </div>
              <div class="block small">
                Dates prévues : ${this.cleanDate(el['valid_from'])} — ${this.cleanDate(el['valid_until'])}
              </div>
              <div class="more small">
                Plus d'informations sur <a href="${el['url']}">le site de la préfecture maritime</a>.
              </div>
              `
                        })
                    })
                })
            })
        }
    }
</script>
<style>
    .title {
        padding-bottom: 0.5em;
        border-bottom: 2px solid #0B3F94;
        font-weight: bold;
        margin-bottom: 1.5em;
    }

    .block {
        border: 1px solid #efefef;
        padding: 1em .5em;
        margin-bottom: 1.5em;
    }

    .small {
        font-size: .9em;
    }

    .more {
        padding: 1em .5em;
        color: #555;
    }
</style>
