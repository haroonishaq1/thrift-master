const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'thrift_hub',
  port: process.env.DB_PORT || 5432,
});

async function addOfferApprovalColumn() {
  let client;
  
  try {
    console.log('🔄 Connecting to database...');
    client = await pool.connect();
    
    // Check if isApproved column already exists
    const columnCheck = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'offers' AND column_name = 'isapproved'
    `);
    
    if (columnCheck.rows.length > 0) {
      console.log('✅ isApproved column already exists in offers table');
      return;
    }
    
    // Add isApproved column to offers table
    await client.query(`
      ALTER TABLE offers 
      ADD COLUMN isApproved BOOLEAN DEFAULT FALSE
    `);
    
    console.log('✅ Successfully added isApproved column to offers table');
    
    // Add approvedAt column for tracking approval time
    await client.query(`
      ALTER TABLE offers 
      ADD COLUMN approvedAt TIMESTAMP NULL
    `);
    
    console.log('✅ Successfully added approvedAt column to offers table');
    
    // Add approvedBy column for tracking who approved (simple text field for now)
    await client.query(`
      ALTER TABLE offers 
      ADD COLUMN approvedBy TEXT NULL
    `);
    
    console.log('✅ Successfully added approvedBy column to offers table');
    
    console.log('🎉 Offer approval migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
      console.log('🔌 Database connection closed');
    }
    await pool.end();
  }
}

// Run migration
if (require.main === module) {
  addOfferApprovalColumn()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addOfferApprovalColumn;
