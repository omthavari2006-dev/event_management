const neo4j = require('neo4j-driver');

/**
 * Normalizes a single Neo4j value into standard JavaScript primitive or object
 */
function normalizeValue(val) {
  if (val === null || val === undefined) {
    return null;
  }

  // Handle Neo4j Integer
  if (neo4j.isInt(val)) {
    return val.inSafeRange() ? val.toNumber() : val.toString();
  }

  // Handle Neo4j DateTime / Date / Time
  if (val.year && val.month && val.day) {
    return val.toString();
  }

  // Handle Neo4j Node
  if (val.labels && val.properties) {
    return {
      _id: val.elementId || val.identity?.toString(),
      _labels: val.labels,
      ...normalizeValue(val.properties)
    };
  }

  // Handle Neo4j Relationship
  if (val.type && val.properties) {
    return {
      _id: val.elementId || val.identity?.toString(),
      _type: val.type,
      ...normalizeValue(val.properties)
    };
  }

  // Handle Array
  if (Array.isArray(val)) {
    return val.map(normalizeValue);
  }

  // Handle Plain Object
  if (typeof val === 'object') {
    const res = {};
    for (const key of Object.keys(val)) {
      res[key] = normalizeValue(val[key]);
    }
    return res;
  }

  return val;
}

/**
 * Converts a Neo4j query result record into a plain JS object
 */
function recordToObject(record) {
  const obj = {};
  record.keys.forEach(key => {
    obj[key] = normalizeValue(record.get(key));
  });
  return obj;
}

/**
 * Converts Neo4j Query Result records into an array of plain JS objects
 */
function recordsToObjects(records) {
  if (!records) return [];
  return records.map(recordToObject);
}

module.exports = {
  normalizeValue,
  recordToObject,
  recordsToObjects
};
