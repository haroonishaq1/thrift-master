const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'thrift_db',
  password: process.env.DB_PASSWORD || 'adminshifa123', 
  port: process.env.DB_PORT || 5432,
});

const addUserFields = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting user fields migration...');
    
    // Check if columns already exist
    const checkColumns = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('username', 'age', 'gender', 'country', 'city', 'graduation_year');
    `);
    
    const existingColumns = checkColumns.rows.map(row => row.column_name);
    console.log('📋 Existing columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'username', sql: 'ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;' },
      { name: 'age', sql: 'ALTER TABLE users ADD COLUMN age INTEGER;' },
      { name: 'gender', sql: 'ALTER TABLE users ADD COLUMN gender VARCHAR(20);' },
      { name: 'country', sql: 'ALTER TABLE users ADD COLUMN country VARCHAR(100);' },
      { name: 'city', sql: 'ALTER TABLE users ADD COLUMN city VARCHAR(100);' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumns.includes(column.name)) {
        console.log(`➕ Adding column: ${column.name}`);
        await client.query(column.sql);
        console.log(`✅ Added column: ${column.name}`);
      } else {
        console.log(`⏭️  Column ${column.name} already exists, skipping...`);
      }
    }
    
    // Check if graduation_year needs to be modified (make it nullable since we're adding age)
    const graduationYearCheck = await client.query(`
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'graduation_year';
    `);
    
    if (graduationYearCheck.rows.length > 0 && graduationYearCheck.rows[0].is_nullable === 'NO') {
      console.log('🔄 Making graduation_year nullable...');
      await client.query('ALTER TABLE users ALTER COLUMN graduation_year DROP NOT NULL;');
      console.log('✅ graduation_year is now nullable');
    }
    
    console.log('✅ User fields migration completed successfully!');
    
    // Show current table structure
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Current users table structure:');
    console.table(tableStructure.rows);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the migration
addUserFields().catch(console.error);
