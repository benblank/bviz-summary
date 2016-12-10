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
  totalSelfTimesByName[name] = nodes.getTotalStatByName(name, (node) => {
    return node.stats.time.self;
  });
});

nodeNames.sort((a, b) => {
  return totalSelfTimesByName[b] - totalSelfTimesByName[a];
});

console.log();
console.log('Most self time by name---- top ' + listSize);
nodeNames.slice(0, listSize).forEach((name) => {
  console.log((totalSelfTimesByName[name] / 1000000) + 'ms (' + nodes.getAllNodesByName(name).length + '): ' + name);
});

var totalIOTimesByName = {};
nodeNames.forEach((name) => {
  totalIOTimesByName[name] = nodes.getTotalStatByName(name, (node) => {
    if (node.stats.fs) {
      return Object.keys(node.stats.fs).reduce((duration, key) => {
        return duration + node.stats.fs[key].time;
      }, 0);
    }
    return 0;
  });
});

nodeNames.sort((a, b) => {
  return totalIOTimesByName[b] - totalIOTimesByName[a];
});

console.log();
console.log('Most IO time by name---- top ' + listSize);
nodeNames.slice(0, listSize).forEach((name) => {
  console.log((totalIOTimesByName[name] / 1000000) + 'ms (' + nodes.getAllNodesByName(name).length + '): ' + name);
});

var totalIOCountByName = {};
nodeNames.forEach((name) => {
  totalIOCountByName[name] = nodes.getTotalStatByName(name, (node) => {
    if (node.stats.fs) {
      return Object.keys(node.stats.fs).reduce((duration, key) => {
        return duration + node.stats.fs[key].count;
      }, 0);
    }
    return 0;
  });
});

nodeNames.sort((a, b) => {
  return totalIOCountByName[b] - totalIOCountByName[a];
});

console.log();
console.log('Most IO count by name---- top ' + listSize);
nodeNames.slice(0, listSize).forEach((name) => {
  console.log((totalIOCountByName[name]) + ' (' + nodes.getAllNodesByName(name).length + '): ' + name);
});

console.log();
console.log('EyeglassCompiler = ' + nodes.getTotalStatByName('EyeglassCompiler', (node) => {
    return node.stats.time.self;
  }) / 1000000);
