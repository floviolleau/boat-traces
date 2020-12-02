<template>
    <div class="map">
        <l-map :zoom="zoom" :center="center" ref="map">
            <l-tile-layer
                v-for="tileProvider in tileProviders"
                :key="tileProvider.id"
                :name="tileProvider.name"
                :visible="tileProvider.visible"
                :url="tileProvider.url"
                :attribution="tileProvider.attribution"
                :layer-type="tileProvider.layerType"
                ref="tileProviders" />
            <l-control-layers-tree
                v-if="childLoaded"
                position="topright"
                :map="map"
                :base-tree="baseTree"
                :overlays-tree="overlaysTree" />
            <l-layer-group>
                <l-layer-group
                    :visible=true
                    layer-type="overlay"
                    name="Avis urgent aux navigateurs"
                    ref="avurnav">
                    <l-marker v-for="marker in markers" :key="marker.id"
                              :visible="marker.visible"
                              :icon="marker.icon"
                              :lat-lng="marker.position">
                        <l-popup :content="marker.tooltip" />
                    </l-marker>
                </l-layer-group>
                <l-layer-group
                    :visible="gpx.year === currentYear"
                    v-for="gpx in gpxs" :key="gpx.id"
                    layer-type="overlay"
                    :name="gpx.id"
                    ref="gpxs">
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
                    </l-gpx>
                </l-layer-group>
            </l-layer-group>
        </l-map>
    </div>
</template>

<script>
    import axios from 'axios';
    import L from 'leaflet';
    import {LTileLayer, LLayerGroup, LMap, LMarker, LPopup} from 'vue2-leaflet';
    import LGpx from './LGpx';
    import LControlLayersTree from './LControlLayersTree'
    import * as Utils from '../utils'
    import gpxList from '../../public/gpxs/list.json';
    import Config from '../config.json';

    export default {
        name: 'map-layers',
        components: {
            LMap,
            LTileLayer,
            LMarker,
            LPopup,
            LLayerGroup,
            LGpx,
            LControlLayersTree
        },
        mounted() {
            this.map = this.$refs.map.mapObject;

            this.$nextTick(() => {
                const tree = this.constructTree(this.$refs);
                this.baseTree = tree.baseTree
                this.overlaysTree = tree.overlaysTree
                this.childLoaded = true;
            });
        },
        data() {
            return {
                map: this.map,
                childLoaded: false,
                zoom: Config.zoom,
                center: Config.center,
                tileProviders: Config.tileProviders,
                markers: [],
                content: '',
                gpxs: gpxList.gpxFiles,
                gpxContents: [],
                baseTree: {},
                overlaysTree: {},
                currentYear: new Date().getFullYear()
            }
        },
        methods: {
            constructTree: function (refs) {
                const baseChildren = [];
                const overlayChildren = [];

                refs.tileProviders.forEach((layer) => {
                    if (layer.layerType === 'base') {
                        baseChildren.push({label: layer.name, layer: layer.mapObject});
                    }

                    if (layer.layerType === 'overlay') {
                        overlayChildren.push({label: layer.name, layer: layer.mapObject});
                    }
                })

                overlayChildren.push({label: refs.avurnav.name, layer: refs.avurnav.mapObject});
                overlayChildren.push({
                    label: 'GPX',
                    selectAllCheckbox: true,
                    children: this.gpxTree(refs.gpxs)
                });

                return {
                    baseTree: {
                        label: 'Cartes',
                        noShow: true,
                        children: baseChildren
                    },
                    overlaysTree: {
                        label: 'overlay',
                        noShow: true,
                        children: overlayChildren
                    }
                };
            },
            gpxTree: (gpxs) => {
                const gpxChildren = [];
                const sortedGpxs = {}

                gpxs.forEach((gpx) => {
                    const year = gpx.name.split('-')[0];
                    if (!Object.prototype.hasOwnProperty.call(sortedGpxs, year)) {
                        sortedGpxs[year] = [{label: gpx.name, layer: gpx.mapObject}];
                    } else {
                        sortedGpxs[year].push({label: gpx.name, layer: gpx.mapObject})
                    }
                })

                for (const [year, subChildren] of Object.entries(sortedGpxs)) {
                    gpxChildren.push({
                        label: year,
                        collapsed: true,
                        selectAllCheckbox: true,
                        children: subChildren
                    });
                }
                return gpxChildren;
            },
            onGpxLoaded: function (loadedEvent) {
                const gpxMapObject = loadedEvent.target;
                let id = Utils.basename(gpxMapObject._gpx, '/');
                id = Utils.stripExtension(id);

                const distance = gpxMapObject.get_distance();
                const speed = gpxMapObject.get_total_speed();
                const content = `<div>Début : ${Utils.formatDate(gpxMapObject.get_start_time())}</div>
<div>Fin : ${Utils.formatDate(gpxMapObject.get_end_time())}</div>
<div>Durée totale : ${Utils.msToTime(gpxMapObject.get_total_time())}</div>
<div>Distance parcourue : ${Utils.roundTwoDigits(distance / 1852)}nm (${Utils.roundTwoDigits(distance / 1000)}km)</div>
<div>Vitesse moyenne : ${Utils.roundTwoDigits((speed * 1000) / 1852)} nœuds (${Utils.roundTwoDigits(speed)}km/h)</div>`;
                this.gpxContents.push({id, content});
            },
            iconColor: (date) => {
                if (date === null) {
                    return 'blue';
                }
                date = new Date(date);
                const today = new Date();

                if (today <= Utils.addDays(date, 2)) {
                    return 'red';
                }

                if (today <= Utils.addDays(date, 8)) {
                    return 'orange';
                }

                return 'blue';
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
                Dates prévues : ${Utils.cleanDate(el['valid_from'])} — ${Utils.cleanDate(el['valid_until'])}
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
