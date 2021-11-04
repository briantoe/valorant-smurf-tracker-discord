const { Pool } = require('pg');
const { table } = require('../../config.json');

module.exports = {
  deleteAccount: async function (account) {
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const isDev = process.env.DEV_ENV === 'true';
    const query = `DELETE FROM ${table}${
      isDev ? '_dev' : ''
    } WHERE (username = ($1) AND tagline = ($2) AND server_id = ($3)) OR (login_name = ($4) AND server_id = ($3))`;

    const value = await pgPool.query(query, [
      account.username,
      account.tagline,
      account.serverId,
      account.loginName,
    ]);
    return value;
  },
};
