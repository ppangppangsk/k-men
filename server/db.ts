import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kmen',
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initDB() {
  const conn = await pool.getConnection();
  try {
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS organizations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('org', 'admin') DEFAULT 'org',
        approved TINYINT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 기존 테이블에 role 컬럼이 없으면 추가
    try {
      await conn.execute(`ALTER TABLE organizations ADD COLUMN role ENUM('org', 'admin') DEFAULT 'org' AFTER password_hash`);
    } catch {
      // 이미 존재하면 무시
    }

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('news', 'event') NOT NULL,
        org_id INT NOT NULL,
        event_date DATE NULL,
        image_url VARCHAR(500) NULL,
        published TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(id)
      )
    `);

    // 관리자 시드: ADMIN_EMAIL + ADMIN_PASSWORD 환경변수가 있으면 자동 생성
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const [existing] = await conn.execute<mysql.RowDataPacket[]>(
        'SELECT id FROM organizations WHERE email = ?',
        [adminEmail]
      );
      if (existing.length === 0) {
        const hash = await bcrypt.hash(adminPassword, 12);
        await conn.execute(
          'INSERT INTO organizations (name, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)',
          ['K-MEN 관리자', adminEmail, hash, 'admin', 1]
        );
        console.log(`Admin account created: ${adminEmail}`);
      }
    }

    console.log('Database tables initialized');
  } finally {
    conn.release();
  }
}

export default pool;
