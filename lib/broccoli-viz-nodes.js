
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

  getTotalStatByName(name, getTimeCb) {
    var nodes = this.getAllNodesByName(name);
    if (!nodes) {
      console.error('No nodes with name: ' + name);
      return undefined;
    }
    var ignoredIds = nodes.map((node) => { return node._id; });
    return nodes.reduce((duration, node) => {
      return duration + this.getTotalStatByNode(node, ignoredIds, getTimeCb)
    }, 0);
  },

  getTotalStatByNode(node, ignoredIds, getTimeCb) {
    return node.children.reduce((duration, childNodeId) => {
      var total = duration;
      if (ignoredIds.indexOf(childNodeId) < 0) {
        total += this.getTotalStatByNode(this.getNodeById(childNodeId.toString()), ignoredIds, getTimeCb);
      }
      return total;
    }, getTimeCb(node));
  }
};

module.exports = BroccoliVizNodes;
