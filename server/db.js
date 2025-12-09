const { Pool } = require('pg');

// Kolon isimlerini camelCase'e çevir
const camelize = (str) => {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
};

// Row'ları camelCase'e çevir
const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(item => camelizeKeys(item));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[camelize(key)] = obj[key];
      return result;
    }, {});
  }
  return obj;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Query wrapper - sonuçları camelCase'e çevir
const query = async (text, params) => {
  const result = await pool.query(text, params);
  result.rows = camelizeKeys(result.rows);
  return result;
};

module.exports = { query, pool };