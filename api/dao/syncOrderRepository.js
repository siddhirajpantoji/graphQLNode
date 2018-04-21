const {
    Pool,
    Client
} = require('pg');
var logger = require('log4js').getLogger("syncOrderRepository")

var dbSettings = {
    "user": "postgres",
    "host": "localhost",
    "database": "TechPOC",
    "password": "root",
    "port": 5432
}

const pool = new Pool(dbSettings);

async function query (q) {
    const client = await pool.connect()
    let res
    try {
      await client.query('BEGIN')
      try {
        res = await client.query(q)
        await client.query('COMMIT')
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    } finally {
      client.release()
    }
    return res
  }
  
  async function getAllOrders() {
      let rows;
    try {
      rows = await query('SELECT * FROM fixed_order')
      //console.log(JSON.stringify(rows))
    } catch (err) {
        throw err;
    }
    return rows;
  }