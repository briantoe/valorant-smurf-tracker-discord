const { Pool } = require('pg');
const { table } = require('../../config.json');

module.exports = {
  update: async function (account) {
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const isDev = process.env.DEV_ENV === 'true';
    const query = `UPDATE ${table}${
      isDev ? '_dev' : ''
    } SET rank = $1, tier = $2 
    WHERE username = $3 AND tagline = $4 AND server_id = $5 RETURNING *`;

    const value = await pgPool.query(query, [
      account.rank,
      account.tier,
      account.username,
      account.tagline,
      account.serverId,
      account.modified,
    ]);
    if (value.code) {
      throw Error(value);
    }
    return value;
  },
};
