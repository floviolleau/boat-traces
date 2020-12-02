<script>
    import 'leaflet.control.layers.tree'
    import {control} from 'leaflet'
    import ControlMixin from 'vue2-leaflet/src/mixins/Control';
    import Options from 'vue2-leaflet/src/mixins/Options';
    import {optionsMerger} from 'vue2-leaflet/src/utils/utils';

    const props = {
        collapsed: {
            type: Boolean,
            default: true
        },
        autoZIndex: {
            type: Boolean,
            default: true
        },
        hideSingleBase: {
            type: Boolean,
            default: false
        },
        sortLayers: {
            type: Boolean,
            default: false
        },
        sortFunction: {
            type: Function,
            default: undefined
        },
        map: {
            type: Object,
            default() {
                return null;
            }
        },
        baseTree: {
            type: Object,
            default() {
                return null;
            }
        },
        overlaysTree: {
            type: Object,
            default() {
                return null;
            }
        },
        options: {
            type: Object,
            default() {
                return {
                    namedToggle: false,
                    collapseAll: 'tout réduire',
                    expandAll: 'tout ouvrir',
                    collapsed: false
                };
            }
        }
    };
    export default {
        name: 'LControlLayersTree',
        props,
        mixins: [ControlMixin, Options],
        mounted() {
            const options = optionsMerger({
                    ...this.controlOptions,
                    collapsed: this.collapsed,
                    autoZIndex: this.autoZIndex,
                    hideSingleBase: this.hideSingleBase,
                    sortLayers: this.sortLayers,
                    sortFunction: this.sortFunction
                },
                this
            );

            this.mapObject = control.layers.tree(this.baseTree, null, options);
            this.mapObject.addTo(this.map).collapseTree().expandSelected();
            this.mapObject.setOverlayTree(this.overlaysTree);

            this.$nextTick(() => {
                /**
                 * Triggers when the component is ready
                 * @type {object}
                 * @property {object} mapObject - reference to leaflet map object
                 */
                this.$emit('ready', this.mapObject);
            });
        },
        render() {
            return null;
        }
    };
</script>
<style>
    @import "~leaflet.control.layers.tree/L.Control.Layers.Tree.css";

    .leaflet-control-layers-base .leaflet-layerstree-expand-collapse {
        display: none;
    }

    .leaflet-control-layers-toggle.leaflet-layerstree-named-toggle {
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAQAAAADQ4RFAAACf0lEQVR4AY1UM3gkARTePdvdoTxXKc+qTl3aU5U6b2Kbkz3Gtq3Zw6ziLGNPzrYx7946Tr6/ee/XeCQ4D3ykPtL5tHno4n0d/h3+xfuWHGLX81cn7r0iTNzjr7LrlxCqPtkbTQEHeqOrTy4Yyt3VCi/IOB0v7rVC7q45Q3Gr5K6jt+3Gl5nCoDD4MtO+j96Wu8atmhGqcNGHObuf8OM/x3AMx38+4Z2sPqzCxRFK2aF2e5Jol56XTLyggAMTL56XOMoS1W4pOyjUcGGQdZxU6qRh7B9Zp+PfpOFlqt0zyDZckPi1ttmIp03jX8gyJ8a/PG2yutpS/Vol7peZIbZcKBAEEheEIAgFbDkz5H6Zrkm2hVWGiXKiF4Ycw0RWKdtC16Q7qe3X4iOMxruonzegJzWaXFrU9utOSsLUmrc0YjeWYjCW4PDMADElpJSSQ0vQvA1Tm6/JlKnqFs1EGyZiFCqnRZTEJJJiKRYzVYzJck2Rm6P4iH+cmSY0YzimYa8l0EtTODFWhcMIMVqdsI2uiTvKmTisIDHJ3od5GILVhBCarCfVRmo4uTjkhrhzkiBV7SsaqS+TzrzM1qpGGUFt28pIySQHR6h7F6KSwGWm97ay+Z+ZqMcEjEWebE7wxCSQwpkhJqoZA5ivCdZDjJepuJ9IQjGGUmuXJdBFUygxVqVsxFsLMbDe8ZbDYVCGKxs+W080max1hFCarCfV+C1KATwcnvE9gRRuMP2prdbWGowm1KB1y+zwMMENkM755cJ2yPDtqhTI6ED1M/82yIDtC/4j4BijjeObflpO9I9MwXTCsSX8jWAFeHr05WoLTJ5G8IQVS/7vwR6ohirYM7f6HzYpogfS3R2OAAAAAElFTkSuQmCC);
    }

    a.leaflet-control-layers-toggle.leaflet-layerstree-named-toggle {
        text-indent: -9999px;
    }
</style>
