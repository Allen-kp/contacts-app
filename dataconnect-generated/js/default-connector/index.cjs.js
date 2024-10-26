const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'vue-data-pdf-app',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

