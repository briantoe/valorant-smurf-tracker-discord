const { Pool } = require('pg');
const { table } = require('../../config.json');

module.exports = {
  getAllByServerId: async function (serverId) {
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const isDev = process.env.DEV_ENV === 'true';
    const query = `SELECT username, tagline, rank, tier, login_name, modified FROM ${table}${
      isDev ? '_dev' : ''
    } WHERE server_id = '${serverId}' LIMIT 1000`;
    const value = await pgPool.query(query);
    if (value.code) {
      throw Error(value);
    }
    return value;
  },
};
