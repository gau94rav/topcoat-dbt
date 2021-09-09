<template>
  <div class="dag-section">
    <div style="z-index: 10" class="cy" :id="cy_id"></div>
  </div>
</template>

<script>

import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import nodeHtmlLabel from 'cytoscape-node-html-label'
import { mapState } from 'vuex';

cytoscape.use( nodeHtmlLabel );
cytoscape.use( dagre );

export default {
    name: "Dag",
    data () {
      return {
          cy_id: 'cy' + this._uid,
          cy: null,
      }
    },
    mounted() {
      window[this.cy_id] = null;
      if (this.dag && this.dag.nodes) {
        this.drawDag()
      }
    },
    updated() {
      window[this.cy_id] = null;
      if (this.dag && this.dag.nodes) {
        this.drawDag()
      }
    },
    methods: {
      drawDag() {
        var cy_dict = {
          container: document.getElementById(this.cy_id),

          boxSelectionEnabled: false,
          autounselectify: true,
          //userZoomingEnabled: false,
          minZoom: 0,
          maxZoom: 1.5,

          layout: {
            name: 'dagre',
            rankDir: 'LR'
          },

          style: [
            {
              selector: 'node',
              style: {
                'background-color': 'data(background)',
                'shape': 'data(shape)',
                'width': 'data(width)',
                'height': 32,
                //'label': 'data(id)',
                'color': 'white',
                'border-color': 'data(border_color)',
                'border-width': 'data(border_width)',
                'text-valign': 'center',
                'text-halign': 'center'
              }
            },

            {
              selector: 'edge',
              style: {
                'width': 2,
                'target-arrow-shape': 'triangle',
                'line-color': '#272727',
                'target-arrow-color': '#272727',
                'curve-style': 'bezier'
              }
            }
          ],

          elements: {
            nodes: [],
            edges: []
          }
        };

        for (var i=0; i< this.dag.nodes.length; i++) {
          var node = { data: { id: this.dag.nodes[i].id, width: (this.dag.nodes[i].id.length * 7) + 30, type: this.dag.nodes[i].type, border_width: 0, border_color: 'transparent', shape: 'round-rectangle', background: 'gray' } };

          if (this.dag.nodes[i].source == 'topcoat') {
            node.data.img = 'topcoat-icon-tp.png'

            if (this.dag.nodes[i].type == 'layer') {
                node.data.background = '#dd7e6b'
            } else if (this.dag.nodes[i].type == 'page') {
                node.data.background = '#2a9d8f'
            } else if (this.dag.nodes[i].type == 'filter') {
                node.data.background = 'rgb(61, 149, 206)';
                node.data.shape = 'cut-rectangle'
            } else if (this.dag.nodes[i].type == 'persona') {
              node.data.background = '#6b7280';
            }
          } else if (this.dag.nodes[i].source == 'dbt') {
            node.data.img = 'dbt-icon.png'

            if (this.dag.nodes[i].type == 'source') {
                node.data.background = '#b6d7a8'
            } else {
                node.data.background = '#e9c46a'
            }
          }

          if (this.layer && this.layer == this.dag.nodes[i].id) {
            node.data.border_color = '#dd7e6b';
            node.data.border_width = 2;
          }

          cy_dict.elements.nodes.push(node);
        }

        for (var i=0; i< this.dag.edges.length; i++) {
          cy_dict.elements.edges.push({ data: this.dag.edges[i] })
        }

        var cy = window[this.cy_id] = cytoscape(cy_dict);

        cy.nodeHtmlLabel([{
            query: 'node',
            valign: "center",
            halign: "center",
            valignBox: "center",
            halignBox: "center",
            cssClass: 'cyBox',
            tpl: function(data) {
                return '<div class="cy_container"><div class="cy_title">' + data.id + '</div>' + '<div class="cy_subtitle"><img class="cy_img" height=8 src="' + static_url + data.img + '">' + data.type + '</div></div>';
            }
        }]);
      }
    },
    computed: {
      ...mapState('ide', [
        'full_dag',
      ]),
      dag() {
        return this.full_dag || '';
      }
    },
    watch: {
      dag() {
        window[this.cy_id] = null;
        this.drawDag();
      }
    }
}
</script>

<style>
.dag-section {
  position: relative;
  height: 100%;
  width: 100%;
}

.cy_img {
  margin-top: -1px;
  padding-right: 2px;
}
.cy_title {
    padding-bottom: 4px;
    text-align: center;
}
.cy_subtitle {
    font-weight: normal;
    font-size: 8px;
    text-align: center;
    background: #454545;
    padding: 1.5px 5px;
    border-radius: 3px;
    width: max-content;
    position: relative;
    left: 0;
    right: 0;
    bottom: 1px;
    margin: auto;
}
.cyBox {
    padding: 0px;
    color: white;
    line-height: 1;
    font-size: 13px;
}
.cy {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    z-index: 999;
  }
</style>
