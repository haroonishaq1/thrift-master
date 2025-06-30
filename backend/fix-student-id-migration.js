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

const fixStudentIdConstraint = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Fixing student_id column constraint...');
    
    // Check current constraint on student_id
    const constraintCheck = await client.query(`
      SELECT column_name, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'student_id';
    `);
    
    if (constraintCheck.rows.length > 0) {
      const currentConstraint = constraintCheck.rows[0];
      console.log('📋 Current student_id constraint:', currentConstraint);
      
      if (currentConstraint.is_nullable === 'NO') {
        console.log('🔄 Making student_id nullable...');
        await client.query('ALTER TABLE users ALTER COLUMN student_id DROP NOT NULL;');
        console.log('✅ student_id is now nullable');
      } else {
        console.log('⏭️  student_id is already nullable');
      }
    } else {
      console.log('❌ student_id column not found');
    }
    
    // Show current table structure for users table
    const tableStructure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('student_id', 'username', 'age', 'gender', 'country', 'city')
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Relevant columns in users table:');
    console.table(tableStructure.rows);
    
    console.log('✅ student_id constraint fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('🔍 Error details:', error);
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the migration
fixStudentIdConstraint().catch(console.error);
