const { Pool } = require('pg');
const { table } = require('../../config.json');

module.exports = {
  post: async function (account) {
    const pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const isDev = process.env.DEV_ENV === 'true';
    const query = `INSERT INTO ${table}${
      isDev ? '_dev' : ''
    }(username, tagline, rank, tier, server_id, login_name) VALUES($1, $2, $3, $4, $5, $6)`;

    const value = await pgPool.query(query, Object.values(account));
    if (value.code) {
      throw Error(value);
    }
  },
};
