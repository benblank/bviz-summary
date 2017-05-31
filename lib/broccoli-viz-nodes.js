
function BroccoliVizNodes(jsonObj) {
  var nodesById = {};
  var nodesByName = {};
  jsonObj.nodes.forEach((node) => {
    var label = node.label || node.id;

    nodesById[typeof node._id !== 'undefined' ? node._id : node.id] = node;
    if (!nodesByName[label.name]) {
      nodesByName[label.name] = [node];
    } else {
      nodesByName[label.name].push(node);
    }
  });
  this.nodesById = nodesById;
  this.nodesByName = nodesByName;
}

const operation = 'readSync';

BroccoliVizNodes.prototype = {

  /**
   * Returns the node with the given id.
   * @param id
   * @returns {Object} the node pojo
   */
  getNodeById(id) {
    return this.nodesById[id.toString()];
  },

  /**
   * Returns an array of nodes with the given name.
   * @param name
   * @returns {Array} an array of node pojos
   */
  getAllNodesByName(name) {
    return this.nodesByName[name];
  },

  /**
   * Returns the total number of nodes.
   * @returns {Number} the total number of nodes
   */
  getNodeCount() {
    return Object.keys(this.nodesById).length;
  },

  /**
   * Returns an array of unique node names
   * @returns {Array}
   */
  getAllNodeNames() {
    return Object.keys(this.nodesByName);
  },

  getTotalStatByName(name, getStatCb) {
    var nodes = this.getAllNodesByName(name);
    if (!nodes) {
      console.error('No nodes with name: ' + name);
      return undefined;
    }
    var ignoredIds = nodes.map((node) => { return typeof node._id !== 'undefined' ? node._id : node.id; });
    return nodes.reduce((stats, node) => {
      const moreStats = this.getTotalStatByNode(node, ignoredIds, getStatCb)
      var statCount = stats.statCount + moreStats.statCount;
      var nodeCount = stats.nodeCount + moreStats.nodeCount;
      return { statCount: statCount, nodeCount: nodeCount };
    }, { statCount: 0, nodeCount: 0 });
  },

  getTotalStatByNode(node, ignoredIds, getStatCb) {
    return node.children.reduce((stats, childNodeId) => {
      var statCount = stats.statCount;
      var nodeCount = stats.nodeCount;
      if (ignoredIds.indexOf(childNodeId) < 0) {
        const moreStats = this.getTotalStatByNode(this.getNodeById(childNodeId.toString()), ignoredIds, getStatCb);
        statCount += moreStats.statCount;
        nodeCount += moreStats.nodeCount;
      }
      return { statCount: statCount, nodeCount: nodeCount };
    }, { statCount: getStatCb(node), nodeCount: 1 });
  },

  getFullFSStats(name, statToGet){
    var nodes = this.getAllNodesByName(name);
    if (!nodes) {
      console.error('No nodes with name: ' + name);
      return undefined;
    }
    //var ignoredIds = nodes.map((node) => { return node.label; });
    var ignoredIds = nodes.map((node) => { return node.label || node.id; });
    var stats = {};

    nodes.map((node) => {
      stats = this.geFullFSStatsFromNode(node, ignoredIds, stats, statToGet)
    });

    return stats;
  },

  geFullFSStatsFromNode(node, ignoredIds, stats, statToGet) {
    node.children.map((childNodeId) => {
      if (ignoredIds.indexOf(childNodeId) < 0) {
        stats = this.geFullFSStatsFromNode(this.getNodeById(childNodeId.toString()), ignoredIds, stats, statToGet);
      }
    });

    if (node.stats.fs) {
      Object.keys(node.stats.fs).map((key) => {
        if (stats[key] === undefined) {
          stats[key] = 0;
        }
        // output the count, node id and node label
        if (key === operation){
          console.log(node.stats.fs[key][statToGet] + ','+ (typeof node._id !== 'undefined' ? node._id : node.id) + ','+(node.label || node.id).name )
        }
        stats[key] += node.stats.fs[key][statToGet];
      });
    }

    return stats;
  },
};

module.exports = BroccoliVizNodes;
