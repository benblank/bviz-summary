
function BroccoliVizNodes(jsonObj) {
  var nodesById = {};
  var nodesByName = {};
  jsonObj.nodes.forEach((node) => {
    nodesById[node._id.toString()] = node;
    if (!nodesByName[node.id.name]) {
      nodesByName[node.id.name] = [node];
    } else {
      nodesByName[node.id.name].push(node);
    }
  });
  this.nodesById = nodesById;
  this.nodesByName = nodesByName;
}

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
    var ignoredIds = nodes.map((node) => { return node._id; });
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
  }
};

module.exports = BroccoliVizNodes;
