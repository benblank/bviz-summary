#!/usr/bin/env node

const fs = require('fs');
const BroccoliVizNodes = require('./lib/broccoli-viz-nodes');

if (process.argv.length != 4) {
  console.error(process.argv[1] + ': bad command line.');
  console.error('Usage: ' + process.argv[1] + ' <json file> <top lists size>');
  process.exit(1);
}

const listSize = process.argv[3];
const jsonObj = JSON.parse(fs.readFileSync(process.argv[2]));
const nodes = new BroccoliVizNodes(jsonObj);

console.log('Number of nodes = ' + nodes.getNodeCount());
console.log('Number of types = ' + nodes.getAllNodeNames().length);

var nodeNames = nodes.getAllNodeNames();
nodeNames.sort((a, b) => {
  return nodes.getAllNodesByName(b).length - nodes.getAllNodesByName(a).length;
});

console.log();
console.log('Most nodes grouped by type---- top ' + listSize);
nodeNames.slice(0, listSize).forEach((name) => {
  console.log(nodes.getAllNodesByName(name).length + ': ' + name);
});

var totalSelfTimesByName = {};
nodeNames.forEach((name) => {
  const stats = nodes.getTotalStatByName(name, (node) => { return node.stats.time.self; });
  stats.statCount = (stats.statCount / 1000000).toFixed(3);
  totalSelfTimesByName[name] = stats;
});

nodeNames.sort((a, b) => {
  return totalSelfTimesByName[b].statCount - totalSelfTimesByName[a].statCount;
});

console.log();
console.log('Most self time (ms) by name---- top ' + listSize);
statsListByNames(nodeNames, totalSelfTimesByName, listSize).forEach((str) => { console.log(str); });

var totalIOTimesByName = {};
nodeNames.forEach((name) => {
  const stats = nodes.getTotalStatByName(name, (node) => {
    if (node.stats.fs) {
      return Object.keys(node.stats.fs).reduce((duration, key) => {
        return duration + node.stats.fs[key].time;
      }, 0);
    }
    return 0;
  });
  stats.statCount = (stats.statCount / 1000000).toFixed(3);
  totalIOTimesByName[name] = stats;
});

nodeNames.sort((a, b) => { return totalIOTimesByName[b].statCount - totalIOTimesByName[a].statCount; });

console.log();
console.log('Most IO time (ms) by name---- top ' + listSize);
statsListByNames(nodeNames, totalIOTimesByName, listSize).forEach((str) => { console.log(str); });

var totalIOCountByName = {};
nodeNames.forEach((name) => {
  const stats = nodes.getTotalStatByName(name, (node) => {
    if (node.stats.fs) {
      return Object.keys(node.stats.fs).reduce((duration, key) => {
        return duration + node.stats.fs[key].count;
      }, 0);
    }
    return 0;
  });
  totalIOCountByName[name] = stats;
});

nodeNames.sort((a, b) => { return totalIOCountByName[b].statCount - totalIOCountByName[a].statCount; });

console.log();
console.log('Most IO count by name---- top ' + listSize);
statsListByNames(nodeNames, totalIOCountByName, listSize).forEach((str) => { console.log(str); });

// for the topNode, get the total FS count
nodeNames.slice(0, 1).forEach((topNode) => {
  var FullFSStats = nodes.getFullFSStats(topNode, 'count');
  console.log('');
  console.log('----------------------------');
  console.log('');
  Object.keys(FullFSStats).sort().forEach((key) => {
    console.log(FullFSStats[key] + ',' + key);
  });

  var totalFS = 0;
  Object.keys(FullFSStats).forEach((key) => {
    totalFS += FullFSStats[key];
  });
  console.log('Total FS count: '+totalFS);
});

function statsListByNames(nodeNames, statsByName, listSize) {
  return nodeNames.slice(0, listSize).map((name) => {
    const stats = statsByName[name];
    return stats.statCount + ' (' + nodes.getAllNodesByName(name).length + '/' + stats.nodeCount + '): ' + name;
  });
}
