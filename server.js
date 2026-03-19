// server/index.ts
import express from "express";
import cors from "cors";
import path2 from "path";
import { fileURLToPath } from "url";
import dotenv2 from "dotenv";

// server/db.ts
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
var pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "kmen",
  waitForConnections: true,
  connectionLimit: 10
});
async function initDB() {
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
    try {
      await conn.execute(`ALTER TABLE organizations ADD COLUMN role ENUM('org', 'admin') DEFAULT 'org' AFTER password_hash`);
    } catch {
    }
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('news', 'event', 'press_release') NOT NULL,
        org_id INT NOT NULL,
        event_date DATE NULL,
        image_url VARCHAR(500) NULL,
        published TINYINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (org_id) REFERENCES organizations(id)
      )
    `);
    try {
      await conn.execute(`ALTER TABLE posts MODIFY COLUMN type ENUM('news', 'event', 'press_release', 'notice', 'document', 'member_activity') NOT NULL`);
    } catch {
    }
    try {
      await conn.execute(`ALTER TABLE posts ADD COLUMN summary TEXT NULL AFTER content`);
    } catch {
    }
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(500) NOT NULL,
        answer TEXT NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS qna (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_name VARCHAR(100) NOT NULL,
        author_email VARCHAR(255) NULL,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_private TINYINT DEFAULT 0,
        answer TEXT NULL,
        answered_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(500) NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INT NOT NULL,
        category ENUM('photo', 'video', 'document') NOT NULL DEFAULT 'photo',
        title VARCHAR(500) NULL,
        description TEXT NULL,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES organizations(id)
      )
    `);
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const [existing] = await conn.execute(
        "SELECT id FROM organizations WHERE email = ?",
        [adminEmail]
      );
      if (existing.length === 0) {
        const hash = await bcrypt.hash(adminPassword, 12);
        await conn.execute(
          "INSERT INTO organizations (name, email, password_hash, role, approved) VALUES (?, ?, ?, ?, ?)",
          ["K-MEN \uAD00\uB9AC\uC790", adminEmail, hash, "admin", 1]
        );
        console.log(`Admin account created: ${adminEmail}`);
      }
      const adminId = existing.length > 0 ? existing[0].id : (await conn.execute("SELECT id FROM organizations WHERE email = ?", [adminEmail]))[0]?.[0]?.id;
      if (adminId) {
        const [pressRows] = await conn.execute(
          "SELECT id FROM posts WHERE type = 'press_release' LIMIT 1"
        );
        if (pressRows.length === 0) {
          const seedPosts = [
            {
              title: "K-MEN, \uC131\uD3C9\uB4F1\uC8FC\uAC04\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uC120\uD3EC",
              content: [
                `<p><strong>\u2014 \uC131\uD3C9\uB4F1 \uC0AC\uD68C\uB97C \uD5A5\uD55C \uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uC0C8\uB85C\uC6B4 \uB3D9\uD589 \u2014</strong></p>`,
                `<p>'\uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN)'\uC740 \uC18C\uB144\uACFC \uB0A8\uC131\uC744 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uCD08\uB300\uD558\uACE0, \uC0C8\uB85C\uC6B4 \uB0A8\uC131\uC131\uC744 \uD1B5\uD574 \uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uB9CC\uB4E4\uC5B4\uAC00\uB294 \uAE00\uB85C\uBC8C \uB124\uD2B8\uC6CC\uD06C\uB85C, <strong>2025\uB144 7\uC6D4 9\uC77C</strong> \uAD6D\uB0B4 12\uAC1C \uB2E8\uCCB4\uAC00 \uBAA8\uC5EC \uACF5\uC2DD \uCD9C\uBC94\uC2DD\uC744 \uAC00\uC84C\uB2E4. \uC774\uC5B4 <strong>'K-MEN'</strong>\uC740 \uC18C\uB144\uACFC \uB0A8\uC131\uC774 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uB098\uC544\uAC00\uAE30 \uC704\uD574, \uC591\uC131\uD3C9\uB4F1\uC8FC\uAC04\uC758 \uC77C\uC694\uC77C\uC778 <strong>2025\uB144 9\uC6D4 7\uC77C</strong>\uC744 <strong>'\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0'</strong>\uB85C \uC120\uD3EC\uD558\uACE0\uC790 \uD55C\uB2E4.</p>`,
                `<p>'K-MEN'\uC744 \uD568\uAED8 \uACB0\uC131\uD558\uACE0 \uC788\uB294 \uAD6D\uB0B4 12\uAC1C \uB2E8\uCCB4\uB294 &lt;\uC131\uD3C9\uB4F1\uC8FC\uAC04\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uAE30\uB150 \uD2B9\uAC15&gt;\uC744 \uBE44\uB86F\uD574 \uC628\uB77C\uC778 \uB9AC\uD2B8\uB9BF(retreat) \uBC0F \uC131\uD3C9\uB4F1 \uCEA0\uD398\uC778 \uB4F1 \uB2E4\uC591\uD55C \uCF58\uD150\uCE20\uC640 \uCEA0\uD398\uC778 \uD65C\uB3D9\uC744 \uC900\uBE44\uD574 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0'\uC744 \uAE30\uB150\uD558\uACE0\uC790 \uD55C\uB2E4.</p>`,
                `<p>'K-MEN'\uC740 \uC774\uBC88 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uC120\uD3EC\uB97C \uD1B5\uD574, \uC18C\uB144\uACFC \uB0A8\uC131\uB4E4\uC774 \uC131\uD3C9\uB4F1\uC758 \uB3D9\uBC18\uC790\uC774\uC790 \uC8FC\uCCB4\uB85C\uC11C \uC2A4\uC2A4\uB85C\uC758 \uB9C8\uC74C\uC744 \uC0B4\uD53C\uACE0, \uB098\uB2F5\uAC8C \uC0B4 \uC218 \uC788\uB294 \uC6A9\uAE30\uB97C \uC5BB\uC73C\uBA70, \uB3CC\uBD04\uACFC \uC5F0\uB300\uB97C \uC2E4\uCC9C\uD558\uACE0, \uBBF8\uB798\uB97C \uC774\uC57C\uAE30\uD558\uB294 \uB0A0\uC744 \uB9CC\uB4E4\uACE0\uC790 \uD55C\uB2E4.</p>`,
                `<div style="background:#f5f3ff;border-radius:1rem;padding:1.5rem 2rem;margin:2rem 0">`,
                `<h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:1rem">[\uCDE8\uC9C0\uBB38] \uC131\uD3C9\uB4F1\uC8FC\uAC04\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0'</h2>`,
                `<p>'\uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN)'\uC740 \uC18C\uB144\uACFC \uB0A8\uC131\uC744 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uCD08\uB300\uD558\uACE0, \uC0C8\uB85C\uC6B4 \uB0A8\uC131\uC131\uC744 \uD1B5\uD574 \uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uB9CC\uB4E4\uC5B4\uAC00\uB294 \uAE00\uB85C\uBC8C \uB124\uD2B8\uC6CC\uD06C\uB85C, 2025\uB144 7\uC6D4 9\uC77C \uAD6D\uB0B4 12\uAC1C \uB2E8\uCCB4\uAC00 \uBAA8\uC5EC \uCD9C\uBC94\uD588\uC2B5\uB2C8\uB2E4. K-MEN\uC740 \uC18C\uB144\uACFC \uB0A8\uC131\uC744 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uB098\uC544\uAC00\uAE30 \uC704\uD574, \uC591\uC131\uD3C9\uB4F1\uC8FC\uAC04\uC758 \uC77C\uC694\uC77C\uC778 2025\uB144 9\uC6D4 7\uC77C\uC5D0 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0'\uC744 \uC120\uD3EC\uD558\uACE0\uC790 \uD569\uB2C8\uB2E4.</p>`,
                `<p>\uC591\uC131\uD3C9\uB4F1\uC8FC\uAC04\uC740 1898\uB144 \uD55C\uAD6D \uCD5C\uCD08\uC758 \uC5EC\uC131 \uC778\uAD8C \uC120\uC5B8\uBB38\uC778 '\uC5EC\uAD8C\uD1B5\uBB38'\uC774 \uBC1C\uD45C\uB41C \uB0A0\uC744 \uAE30\uB150\uD558\uB294 \uB73B\uAE4A\uC740 \uC8FC\uAC04\uC73C\uB85C, 1996\uB144 \uC5EC\uC131\uC8FC\uAC04\uC73C\uB85C \uC2DC\uC791\uD574 2015\uB144 \uC591\uC131\uD3C9\uB4F1\uC8FC\uAC04\uC73C\uB85C \uD655\uB300 \uC2DC\uD589\uB418\uC5B4 \uC62C\uD574\uB85C \uC81C30\uD68C\uB97C \uB9DE\uC774\uD588\uC2B5\uB2C8\uB2E4. \uADF8\uAC04 \uC5EC\uAD8C\uD1B5\uBB38\uC758 \uC815\uC2E0\uC744 \uACC4\uC2B9\uD558\uBA70 \uC5EC\uC131\uC758 \uAD8C\uB9AC \uC2E0\uC7A5\uC744 \uC704\uD55C \uB178\uB825\uC744 \uB118\uC5B4 \uB0A8\uB140\uAC00 \uD568\uAED8 \uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uC774\uB8E8\uACA0\uB2E4\uB294 \uC57D\uC18D\uC744 \uB2E4\uC838\uC654\uC2B5\uB2C8\uB2E4. \uC131\uD3C9\uB4F1\uC740 \uBAA8\uB450\uC758 \uACFC\uC81C\uC774\uC790 \uACF5\uB3D9\uC758 \uCC45\uC784\uC774\uAE30 \uB54C\uBB38\uC785\uB2C8\uB2E4.</p>`,
                `<p>\uADF8\uB7EC\uB098 \uC5EC\uC804\uD788 \uC131\uD3C9\uB4F1\uC740 \uC5EC\uC131\uC758 \uBAAB\uC774\uC5C8\uC2B5\uB2C8\uB2E4. \uB0A8\uC131\uC740 \uC9C0\uC9C0\uC790\uC758 \uC704\uCE58\uC5D0 \uBA38\uBB3C\uAC70\uB098, \uB54C\uB85C\uB294 \uC131\uD3C9\uB4F1\uC744 \uB300\uB9BD\uC758 \uAD6C\uB3C4\uB85C \uB9CC\uB4E4\uBA70 \uAD8C\uB9AC\uB97C \uC8FC\uC7A5\uD558\uC600\uC2B5\uB2C8\uB2E4. \uC774\uB294 \uC131\uBD88\uD3C9\uB4F1\uC758 \uD574\uACB0\uCC45\uC774 \uB418\uC9C0 \uBABB\uD588\uACE0, \uB0A8\uC131\uC758 \uC0B6\uC744 \uBCC0\uD654\uC2DC\uD0AC \uB300\uC548\uC744 \uB9CC\uB4E4\uC5B4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uB04A\uC784\uC5C6\uB294 \uACBD\uC7C1 \uC18D\uC5D0\uC11C \uC2A4\uC2A4\uB85C\uC758 \uC4F8\uBAA8\uB97C \uC99D\uBA85\uD574\uC57C \uD55C\uB2E4\uB294 \uB450\uB824\uC6C0\uACFC \uC88C\uC808\uC740 \uB0A8\uC131\uC5D0\uAC8C \uAC15\uC694\uB41C '\uB0A8\uC790\uB2E4\uC6C0'\uC758 \uAD74\uB808 \uC18D\uC5D0\uC11C \uC2A4\uC2A4\uB85C\uB97C \uACE0\uB9BD\uD558\uAC8C \uB9CC\uB4E4\uAC70\uB098 \uC870\uB871\uACFC \uD610\uC624\uAC00 \uB9CC\uC5F0\uD55C \uC720\uD574\uD55C \uB0A8\uC131\uC131\uC73C\uB85C \uADC0\uACB0\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uC774\uC81C\uB294 \uC774\uB7EC\uD55C \uD604\uC2E4\uC744 \uB118\uC5B4\uC11C \uB300\uC548\uC744 \uCC3E\uC544\uC57C \uD569\uB2C8\uB2E4.</p>`,
                `<p>\uC774\uB97C \uB118\uC5B4\uC11C\uB824\uB294 \uB0A8\uC131\uB4E4\uC774 \uC788\uC2B5\uB2C8\uB2E4. \uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uB9CC\uB4E4\uAE30 \uC704\uD574 \uD398\uBBF8\uB2C8\uC998\uC744 \uACF5\uBD80\uD558\uACE0, \uC820\uB354\uAE30\uBC18\uD3ED\uB825\uC5D0 \uB9DE\uC11C\uBA70, \uC0AC\uD68C\uC801 \uC57D\uC790\uC640 \uC5F0\uB300\uD558\uB294 \uAE38\uC744 \uC120\uD0DD\uD55C \uC0AC\uB78C\uB4E4\uC774\uC5C8\uC2B5\uB2C8\uB2E4. \uADF8\uB9AC\uACE0 \uADF8 \uACC1\uC5D0\uB294 \uC774\uB4E4\uACFC \uD568\uAED8\uD55C \uB3D9\uB8CC\uB4E4\uC774 \uC788\uC5C8\uC2B5\uB2C8\uB2E4. \uC11C\uB85C \uC77C\uC0C1\uC744 \uB098\uB204\uACE0, \uC544\uD514\uC744 \uACF5\uC720\uD558\uBA70, \uB3CC\uBD04\uC744 \uC2E4\uCC9C\uD558\uB294 \uACFC\uC815\uC5D0\uC11C \uB0A8\uC131\uC758 \uC0B6\uC744 \uC0C8\uB86D\uAC8C \uC7AC\uC815\uB9BD\uD558\uBA70 \uB300\uC548\uC744 \uB9CC\uB4E4\uC5B4 \uB098\uAC14\uC2B5\uB2C8\uB2E4. \uB300\uB2E8\uD558\uC9C0\uB294 \uC54A\uC9C0\uB9CC \uD76C\uB9DD\uC744 \uBCF4\uC558\uC2B5\uB2C8\uB2E4. \uADF8\uB9AC\uACE0 \uADF8 \uD76C\uB9DD\uC740 \uD604\uC7AC \uC9C4\uD589 \uC911\uC785\uB2C8\uB2E4.</p>`,
                `<p>K-MEN\uC740 \uC774\uBC88 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uC120\uD3EC\uB97C \uD1B5\uD574, \uC18C\uB144\uACFC \uB0A8\uC131\uB4E4\uC774 \uC131\uD3C9\uB4F1\uC758 \uB3D9\uBC18\uC790\uC774\uC790 \uC8FC\uCCB4\uB85C\uC11C \uC2A4\uC2A4\uB85C\uC758 \uB9C8\uC74C\uC744 \uC0B4\uD53C\uACE0, \uB098\uB2F5\uAC8C \uC0B4 \uC218 \uC788\uB294 \uC6A9\uAE30\uB97C \uC5BB\uC73C\uBA70, \uB3CC\uBD04\uACFC \uC5F0\uB300\uB97C \uC2E4\uCC9C\uD558\uACE0, \uBBF8\uB798\uB97C \uC774\uC57C\uAE30\uD558\uB294 \uB0A0\uC744 \uB9CC\uB4E4\uACE0\uC790 \uD569\uB2C8\uB2E4. \uC624\uB298 \uC6B0\uB9AC\uB294 \uC0C8\uB85C\uC6B4 \uC804\uD658\uC758 \uCD9C\uBC1C\uC5D0 \uC11C \uC788\uC2B5\uB2C8\uB2E4. \uAC01 \uB2E8\uCCB4\uAC00 \uC900\uBE44\uD55C \uD589\uC0AC\uC5D0 \uCC38\uC5EC\uB97C \uD1B5\uD574 \uC774 \uC5EC\uC815\uC744 \uD568\uAED8 \uB9CC\uB4E4\uC5B4 \uC8FC\uC2DC\uAE30\uB97C \uBC14\uB78D\uB2C8\uB2E4.</p>`,
                `</div>`,
                `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
                `<h2 style="font-size:1.125rem;font-weight:bold;margin-bottom:1rem">\uBB38\uC758</h2>`,
                `<p style="font-size:0.875rem;color:#64748b;margin-bottom:1rem">\uBCF8 \uBCF4\uB3C4\uC790\uB8CC\uC5D0 \uB300\uD55C \uBB38\uC758: \uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN) \uC0AC\uBB34\uAD6D</p>`,
                `<p>\u{1F4E7} <a href="mailto:koreamenengagenetwork@gmail.com" style="color:#7c3aed">koreamenengagenetwork@gmail.com</a></p>`,
                `<p>\u{1F4AC} <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer" style="color:#7c3aed">\uC624\uD508\uCE74\uD1A1\uBC29</a></p>`,
                `<p>\u{1F310} <a href="https://bit.ly/45QrG2D" target="_blank" rel="noopener noreferrer" style="color:#7c3aed">\uAC00\uC785 \uBC0F \uC18C\uAC1C</a></p>`,
                `</div>`,
                `<p style="text-align:center;margin-top:2rem"><a href="/assets/press-release.pdf" download style="display:inline-block;padding:0.75rem 1.5rem;background:#f1f5f9;border-radius:9999px;color:#475569;font-size:0.875rem;font-weight:500;text-decoration:none">\uC6D0\uBCF8 PDF \uB2E4\uC6B4\uB85C\uB4DC</a></p>`
              ].join("\n")
            },
            {
              title: "[GOMA] \uC131\uD3C9\uB4F1\uC8FC\uAC04\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uAE30\uB150 \uD2B9\uAC15",
              content: [
                `<p><strong>\uC8FC\uC81C:</strong> \uB0A8\uC131\uACFC \uD568\uAED8\uD558\uB294 \uC131\uD3C9\uB4F1\uC815\uCC45\uC758 \uC6D0\uCE59\uACFC \uBC29\uD5A5 \uC0B4\uD3B4\uBCF4\uAE30 \u2014 \uB3C5\uC77C, \uD638\uC8FC, \uB178\uB974\uC6E8\uC774 \uC0AC\uB840\uB97C \uD1B5\uD574 \uB0A8\uC131\uB4E4\uC774 \uACAA\uB294 \uB3C4\uC804\uACFC\uC81C\uC640 \uC7C1\uC810, \uC815\uCC45\uC801 \uB300\uC548\uC744 \uBAA8\uC0C9\uD558\uB2E4.</p>`,
                `<p><strong>\uAC15\uC0AC:</strong> \uC774\uAD6C\uACBD\uC219, \uD669\uAE08\uBA85\uB860</p>`,
                `<p><strong>\uC77C\uC2DC:</strong> 2025\uB144 9\uC6D4 7\uC77C(\uC77C) \uC800\uB141 7\uC2DC (\uC90C)</p>`,
                `<p><strong>\uCC38\uAC00\uBE44:</strong> 1\uB9CC\uC6D0</p>`,
                `<p><strong>\uBB38\uC758:</strong> 0308goma@gmail.com</p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>\uC8FC\uCD5C \uB2E8\uCCB4</h3>`,
                `<p><strong>GOMA (Gender Justice Organization for More Action, \uB354 \uB9CE\uC740 \uD589\uB3D9\uC744 \uC704\uD55C \uC820\uB354\uC815\uC758\uC870\uC9C1)</strong></p>`,
                `<p>'\uC820\uB354\uC815\uC758\uD589\uB3D9GOMA'\uB294 "\uC131\uD3C9\uB4F1\uC740 \uBAA8\uB450\uC5D0\uAC8C \uC774\uB86D\uB2E4"\uB294 \uC2E0\uB150\uC73C\uB85C \uC820\uB354\uC815\uC758\uAC00 \uBC14\uB85C \uC11C\uB294 \uC0AC\uD68C\uB97C \uC704\uD574 \uC2E4\uCC9C\uD558\uACE0 \uD589\uB3D9\uD558\uB294 \uC0AC\uB78C\uB4E4\uC758 \uBAA8\uC784\uC785\uB2C8\uB2E4. \uAD6D\uB0B4\uC678 \uBAA8\uB4E0 \uC0AC\uB78C \uADF8\uB9AC\uACE0 \uC870\uC9C1\uB4E4\uACFC \uD568\uAED8 \uAD50\uC721, \uC5F0\uAD6C, \uBB38\uD654\uC6B4\uB3D9\uC744 \uD1B5\uD574 \uC131\uD3C9\uB4F1\uD55C \uC9C0\uAD6C\uB9CC\uB4E4\uAE30\uC5D0 \uAE30\uC5EC\uD558\uACE0\uC790 \uC124\uB9BD\uB41C \uB2E8\uCCB4\uC785\uB2C8\uB2E4.</p>`
              ].join("\n")
            },
            {
              title: "[\uBD04\uB3CC] \uC131\uD3C9\uB4F1\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uC628\uB77C\uC778 \uB9AC\uD2B8\uB9BF(Retreat)",
              content: [
                `<p><strong>\uC8FC\uC81C:</strong> \u300E\uB098\uC758 \uC9C4\uC9DC \uBAA9\uC18C\uB9AC\uB97C \uCC3E\uC544\uC11C\u300F</p>`,
                `<p><strong>\uC77C\uC2DC:</strong> 2025\uB144 9\uC6D4 7\uC77C(\uC77C) \uC624\uD6C4 4:00~5:30</p>`,
                `<p><strong>\uC7A5\uC18C:</strong> \uBE44\uB300\uBA74 Zoom \uC628\uB77C\uC778</p>`,
                `<p><strong>\uB300\uC0C1:</strong> \uB098\uB2F5\uAC8C \uC0B4\uACE0 \uC2F6\uC740 \uB204\uAD6C\uB098 (\uC885\uAD50\xB7\uC131\uBCC4\xB7\uB098\uC774 \uBB34\uAD00)</p>`,
                `<p><strong>\uBB38\uC758:</strong> bomdolcenter@gmail.com (\uAE40\uD558\uB098, 010-7566-7931)</p>`,
                `<h3>\uD504\uB85C\uADF8\uB7A8 \uAD6C\uC131</h3>`,
                `<ol>`,
                `<li>\uAC10\uC815 \uC54C\uC544\uCC28\uB9AC\uAE30 \u2014 \uB0B4 \uBAB8\uACFC \uB9C8\uC74C\uC758 \uC18C\uB9AC\uC5D0 \uADC0 \uAE30\uC6B8\uC774\uAE30</li>`,
                `<li>\uCC4C\uB9B0\uC9C0 \uB098\uB214 \u2014 '\uADC0\uB9C8 \uB118\uAE30' \uC0AC\uC804 \uC2E4\uCC9C \uACF5\uC720</li>`,
                `<li>\uB0B4 \uC548\uC758 \uBAA9\uC18C\uB9AC \uD0D0\uC0C9 \u2014 "~\uD574\uC57C \uD574"\uB77C\uB294 \uACE0\uC815\uAD00\uB150 \uC0B4\uD3B4\uBCF4\uAE30</li>`,
                `<li>\uB098\uC758 \uB9C8\uC74C \uD45C\uD604\uD558\uAE30</li>`,
                `<li>\uD574\uBC29 \uC120\uC5B8\uC2DD \u2014 \uC5B5\uC555\uC758 \uBAA9\uC18C\uB9AC \uCC22\uAE30 &amp; \uD574\uBC29 \uC120\uC5B8</li>`,
                `<li>\uCD95\uBCF5\uC2DD</li>`,
                `<li>\uD55C \uC904 \uC18C\uAC10, \uC11C\uB85C\uC5D0\uAC8C \uC751\uC6D0 \uBCF4\uB0B4\uAE30</li>`,
                `</ol>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>\uC8FC\uCD5C \uB2E8\uCCB4</h3>`,
                `<p><strong>\uC0AC\uD68C\uC801\uB3CC\uBD04\uC13C\uD130 \uBD04\uB3CC</strong></p>`,
                `<p>"\uD798\uACA8\uC6B4 \uB9C8\uC74C \uACC1\uC5D0\uC11C, \uD568\uAED8 \uC0B4\uC544\uB0B4\uB294 \uBC95\uC744 \uC5F0\uC2B5\uD558\uB294 \uACF3" \u2014 \uC0AC\uD68C\uC801\uB3CC\uBD04\uC13C\uD130 \uBD04\uB3CC\uC740 \uC2EC\uB9AC\uC801 \uC704\uAE30\uC640 \uC0C1\uC2E4, \uCC28\uBCC4\uACFC \uC678\uB85C\uC6C0 \uC18D\uC5D0\uC11C \uC0B4\uC544\uAC00\uB294 \uC774\uB4E4\uACFC \uADF8 \uACC1\uC758 \uC0AC\uB78C\uB4E4\uC744 \uC704\uD55C \uD68C\uBCF5 \uB3D9\uD589 \uCEE4\uBBA4\uB2C8\uD2F0\uC785\uB2C8\uB2E4.</p>`
              ].join("\n")
            },
            {
              title: "[\uCC3D\uC6D0\uC5EC\uC131\uC0B4\uB9BC\uACF5\uB3D9\uCCB4] '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uAE30\uB150 \uC131\uD3C9\uB4F1 \uCEA0\uD398\uC778 \u2014 \uACBD\uC0C1\uB0A8\uB3C4 \uACE0\uC131\uAD70",
              content: [
                `<p><strong>\uC8FC\uC81C:</strong> '\uD3C9\uB4F1\uC73C\uB85C \uB9CC\uB4DC\uB294 \uC544\uB984\uB2E4\uC6C0, \uC804\uD658\uC758 \uB0A8\uC131\uC131'</p>`,
                `<p><strong>\uC7A5\uC18C:</strong> \uACBD\uC0C1\uB0A8\uB3C4 \uACE0\uC131\uAD70 \uD559\uAD50 \uC77C\uB300</p>`,
                `<p><strong>\uB300\uC0C1:</strong> \uB0A8\uC131 \uCCAD\uC18C\uB144</p>`,
                `<p><strong>\uC77C\uC2DC:</strong> 2025\uB144 9\uC6D4 \uC911</p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>\uC8FC\uCD5C \uB2E8\uCCB4</h3>`,
                `<p><strong>(\uC0AC)\uCC3D\uC6D0\uC5EC\uC131\uC0B4\uB9BC\uACF5\uB3D9\uCCB4</strong></p>`,
                `<p>(\uC0AC)\uCC3D\uC6D0\uC5EC\uC131\uC0B4\uB9BC\uACF5\uB3D9\uCCB4\uB294 \uC131\uC8FC\uB958\uD654\uC815\uCC45\uC758 \uC774\uD589\uC810\uAC80 \uB4F1\uC744 \uD1B5\uD55C \uC815\uCC45 \uC81C\uC548\uACFC \uAD50\uC721\uC73C\uB85C \uC131\uC8FC\uB958\uD654\uAC00 \uC9C0\uC5ED\uACF5\uB3D9\uCCB4\uC5D0 \uD655\uC0B0\uB418\uC5B4 \uC9C0\uC5ED\uACF5\uB3D9\uCCB4\uAC00 \uBCF4\uB2E4 \uC548\uC804\uD558\uACE0 \uC131\uD3C9\uB4F1\uD55C \uBBFC\uC8FC \uBCF5\uC9C0\uAC00 \uC2E4\uD604\uB420 \uC218 \uC788\uB3C4\uB85D \uACAC\uC778\uD558\uB294 \uBAA9\uC801\uC73C\uB85C \uD65C\uB3D9\uD558\uB294 \uB2E8\uCCB4\uC785\uB2C8\uB2E4.</p>`
              ].join("\n")
            },
            {
              title: "[\uC131\uD3C9\uB4F1\uC704\uC57C] \uB514\uC9C0\uD138\uC131\uBC94\uC8C4 \uC608\uBC29 \uCF58\uD150\uCE20 Faker Chaser(\uD398\uC774\uCEE4 \uCCB4\uC774\uC11C) \uC81C\uC791 \uBC1C\uD45C \uBC0F \uBC30\uD3EC",
              content: [
                `<p>\uB525\uD398\uC774\uD06C\uC640 \uAD00\uB828\uD55C \uD604\uB300 \uC0AC\uD68C\uC758 \uBB38\uC81C\uB97C \uBC30\uACBD\uC73C\uB85C, \uD55C \uACE0\uB4F1\uD559\uAD50\uC5D0\uC11C \uBC8C\uC5B4\uC9C0\uB294 \uAE34\uBC15\uD55C \uC0AC\uAC74\uC744 \uD1B5\uD574 \uC9D1\uB2E8 \uC2EC\uB9AC, \uC815\uBCF4 \uC724\uB9AC, \uADF8\uB9AC\uACE0 \uAC1C\uAC1C\uC778\uC758 \uC120\uD0DD\uC774 \uAC00\uC9C4 \uD798\uC744 \uC870\uBA85\uD558\uB294 \uC20F\uCE20(shorts) \uC2DC\uB9AC\uC988 10\uC5EC\uD3B8 \uC81C\uC791</p>`,
                `<p><a href="https://www.weahgender.org/" target="_blank" rel="noopener noreferrer">\uC790\uB8CC \uBC30\uD3EC \uBC14\uB85C\uAC00\uAE30 \u2192</a></p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>\uC8FC\uCD5C \uB2E8\uCCB4</h3>`,
                `<p><strong>\uC131\uD3C9\uB4F1\uC704\uC57C</strong></p>`,
                `<p>\uC131\uD3C9\uB4F1\uC704\uC57C\uB294 \uC55E\uC73C\uB85C\uB3C4 \uBD80\uC0B0\uC744 \uBE44\uB86F\uD55C \uC6B8\uC0B0 \uACBD\uB0A8\uC9C0\uC5ED\uC758 \uB2E4\uC591\uD55C \uC131\uD3C9\uB4F1 \uAD50\uC721\xB7\uD64D\uBCF4 \uD65C\uB3D9\uC744 \uD1B5\uD574 \uC131\uD3C9\uB4F1 \uBB38\uD654 \uD655\uC0B0\uC744 \uC704\uD55C \uC9C0\uC18D\uC801\uC778 \uB178\uB825\uC744 \uAE30\uC6B8\uC77C \uC608\uC815\uC774\uB2E4. '21\uB144 4\uC6D4 \uCC3D\uB9BD\uD55C \uC131\uD3C9\uB4F1\uC704\uC57C\uB294 \uB2E4\uC591\uC131, \uC874\uC911, \uC5F0\uB300\uC758 \uAC00\uCE58\uB85C \uC6B0\uB9AC\uC758 \uC77C\uC0C1\uACFC \uC870\uC9C1 \uC18D\uC5D0 \uC2A4\uBA70\uC788\uB294 \uD3B8\uACAC\uACFC \uCC28\uBCC4\uC744 \uC0AC\uC804\uC5D0 \uC81C\uAC70\uD558\uACE0 \uC608\uBC29\uD558\uC5EC \uAD6C\uC131\uC6D0 \uBAA8\uB450\uAC00 \uD589\uBCF5\uD55C \uC131\uD3C9\uB4F1 \uACF5\uB3D9\uCCB4\uB97C \uB9CC\uB4DC\uB294 \uAC83\uC744 \uBAA9\uD45C\uB85C \uD65C\uB3D9\uD558\uB294 \uB2E8\uCCB4\uC785\uB2C8\uB2E4.</p>`
              ].join("\n")
            },
            {
              title: "[\uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC] '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uAE30\uB150 \u300EBoys Don't Cry\u300F \uC18C\uAC1C \uCE74\uB4DC\uB274\uC2A4 \uBC30\uD3EC",
              content: [
                `<p>\uCE90\uB098\uB2E4\uC758 \uACF5\uC775\uAD11\uACE0 'Boys Don't Cry' \uC601\uC0C1\uC744 \uD55C\uAD6D\uC5B4 \uC790\uB9C9\uACFC \uD568\uAED8 \uACF5\uAC1C\uD558\uACE0, \uAD50\uC721 \uD604\uC7A5\uC5D0\uC11C \uD65C\uC6A9\uD560 \uC218 \uC788\uB294 \uCE74\uB4DC\uB274\uC2A4 4\uC7A5 \uC81C\uC791\xB7\uBC30\uD3EC. '\uB0A8\uC790\uB294 \uC6B8\uBA74 \uC548 \uB3FC'\uC640 \uAC19\uC740 \uACE0\uC815\uAD00\uB150\uC774 \uAC1C\uC778\uACFC \uC0AC\uD68C\uC5D0 \uB07C\uCE58\uB294 \uD574\uB85C\uC6B4 \uC601\uD5A5\uC744 \uC870\uBA85\uD569\uB2C8\uB2E4.</p>`,
                `<p><a href="https://youtu.be/fjo-hwAKcas" target="_blank" rel="noopener noreferrer">\uC601\uC0C1 \uBCF4\uAE30 (YouTube) \u2192</a></p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>\uC8FC\uCD5C \uB2E8\uCCB4</h3>`,
                `<p><strong>\uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC</strong></p>`,
                `<p>\uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC\uB294 \uD55C\uAD6D\uC0AC\uD68C\uC5D0 \uC5EC\uC131\uD559\uC744 \uCC98\uC74C \uC18C\uAC1C\uD558\uBA74\uC11C \uC138\uC0C1\uC758 \uC808\uBC18\uC778 \uC5EC\uC131\uC744 \uBBFC\uC8FC\uD654\uC640 \uD3C9\uD654\uD1B5\uC77C\uC758 \uC8FC\uCCB4\uB85C \uC138\uC6B0\uACE0\uC790 \uD5CC\uC2E0\uD558\uC2E0 (\uACE0) \uC774\uC774\uD6A8\uC7AC\uC120\uC0DD\uB2D8\uC758 \uCC3D\uB9BD\uC815\uC2E0\uC744 \uACC4\uC2B9\uD558\uBA74\uC11C, \uB098\uC544\uAC00 \uC5EC\uC131 \uAC1C\uC778\uC744 \uB118\uC5B4 \uC0AC\uD68C\uC804\uCCB4\uC758 \uC131\uD3C9\uB4F1\uD55C \uC778\uC2DD\uACFC \uD589\uB3D9\uBCC0\uD654\uB97C \uBAA9\uD45C\uB85C \uC131\uD3C9\uB4F1 \uAD50\uC721\uACFC \uC5F0\uAD6C\uB97C \uC9C0\uC6D0\uD558\uB294 \uBE44\uC601\uB9AC\uC0AC\uB2E8\uBC95\uC778\uC785\uB2C8\uB2E4.</p>`
              ].join("\n")
            }
          ];
          for (const post of seedPosts) {
            await conn.execute(
              "INSERT INTO posts (title, content, type, org_id, image_url) VALUES (?, ?, ?, ?, ?)",
              [post.title, post.content, "press_release", adminId, null]
            );
          }
          console.log(`Seeded ${seedPosts.length} press releases`);
        }
        const pressReleasesMigration = [
          {
            title: '"\uB2E4\uC2DC, \uD55C\uAD6D \uB0A8\uC790 \u2014 \uC804\uD658\uC801 \uB0A8\uC131\uC131\uC744 \uB9D0\uD558\uB2E4" \uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN) 7\uC6D4 9\uC77C \uBC1C\uC871',
            content: [
              `<p>\uD55C\uAD6D \uC0AC\uD68C\uC5D0\uC11C \uB0A8\uC131\uC131\uC5D0 \uB300\uD55C \uB17C\uC758\uAC00 \uC0C8\uB85C\uC6B4 \uAD6D\uBA74\uC744 \uB9DE\uACE0 \uC788\uB294 \uC9C0\uAE08, \uC804\uD658\uC801 \uB0A8\uC131\uC131\uACFC \uC131\uD3C9\uB4F1\uC744 \uC2E4\uD604\uD558\uAE30 \uC704\uD55C "\uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN)"\uAC00 \uC624\uB294 <strong>7\uC6D4 9\uC77C(\uC218) \uC624\uD6C4 7\uC2DC</strong>, \uC11C\uC6B8\uAC00\uC871\uD50C\uB77C\uC790 \uC2A4\uD398\uC774\uC2A4\uC0B4\uB9BC\uC5D0\uC11C \uACF5\uC2DD \uBC1C\uC871\uC2DD\uC744 \uC5F0\uB2E4.</p>`,
              `<p>"K-MEN(Korean MenEngage Network)"\uC740 \uC138\uACC4 90\uC5EC \uAC1C\uAD6D\uC774 \uCC38\uC5EC\uD558\uB294 \uAD6D\uC81C \uB124\uD2B8\uC6CC\uD06C MenEngage Alliance\uC758 \uD55C\uAD6D \uC9C0\uBD80\uB85C, \uB0A8\uC131\uACFC \uC18C\uB144\uC744 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uCD08\uB300\uD558\uACE0, \uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uD568\uAED8 \uC2E4\uD604\uD574 \uAC00\uB294 \uD611\uB825 \uB124\uD2B8\uC6CC\uD06C\uB2E4. \uBC1C\uC871\uC2DD\uC740 '\uB2E4\uC2DC, \uD55C\uAD6D \uB0A8\uC790: K-MEN, \uC131\uD3C9\uB4F1\uC73C\uB85C \uB3D9\uD589!'\uB77C\uB294 \uC2AC\uB85C\uAC74 \uC544\uB798, \uB2E4\uC591\uD55C \uC138\uB300\uC640 \uBC30\uACBD\uC744 \uAC00\uC9C4 \uB0A8\uC131\uACFC \uC5EC\uC131\uB4E4\uC774 \uBAA8\uC5EC \uB0A8\uC131\uC131\uC758 \uC804\uD658\uACFC \uC131\uD3C9\uB4F1 \uC2E4\uCC9C\uC5D0 \uB300\uD55C \uACF5\uB3D9\uC758 \uBE44\uC804\uC744 \uB098\uB204\uB294 \uC790\uB9AC\uB85C \uB9C8\uB828\uB418\uC5C8\uB2E4.</p>`,
              `<h3>\uC65C \uC9C0\uAE08, K-MEN\uC778\uAC00?</h3>`,
              `<p>\uCD5C\uADFC \uD55C\uAD6D \uC0AC\uD68C\uB294 \uC820\uB354 \uAC08\uB4F1, \uC548\uD2F0\uD398\uBBF8\uB2C8\uC998 \uC815\uC11C\uC758 \uD655\uC0B0, \uBCF4\uC218 \uADF9\uC6B0 \uB2F4\uB860\uC758 \uC815\uCE58\uD654 \uB4F1\uC73C\uB85C \uC820\uB354 \uC758\uC81C\uAC00 \uBD84\uC5F4\uC758 \uC0C1\uC9D5\uCC98\uB7FC \uC5EC\uACA8\uC9C0\uACE0 \uC788\uB2E4. \uD2B9\uD788 10\uB300~20\uB300 \uB0A8\uC131\uB4E4 \uC0AC\uC774\uC5D0\uC11C\uB294 \uC5ED\uCC28\uBCC4 \uD504\uB808\uC784, \uC65C\uACE1\uB41C \uC131 \uC778\uC2DD, \uB514\uC9C0\uD138 \uC131\uBC94\uC8C4(\uB525\uD398\uC774\uD06C, \uBD88\uBC95\uCD2C\uC601\uBB3C \uB4F1)\uAC00 \uD604\uC2E4\uB85C \uB4DC\uB7EC\uB098\uBA70 \uC0AC\uD68C\uC801 \uC6B0\uB824\uB97C \uB0B3\uACE0 \uC788\uB2E4.</p>`,
              `<p>\uC774\uB7EC\uD55C \uC0C1\uD669 \uC18D\uC5D0\uC11C K-MEN\uC740 \uB0A8\uC131\uC744 \uBC29\uAD00\uC790\uB3C4 \uD53C\uD574\uC790\uB3C4 \uC544\uB2CC, \uC131\uCC30\uD558\uACE0 \uBCC0\uD654\uD560 \uC218 \uC788\uB294 \uC8FC\uCCB4\uB85C \uC138\uC6B0\uAE30 \uC704\uD574 \uCD9C\uBC94\uD588\uB2E4. \uC774\uB294 \uC131\uD3C9\uB4F1\uC744 \uC5EC\uC131\uB9CC\uC758 \uACFC\uC81C\uB85C \uD55C\uC815\uD558\uB294 \uAE30\uC874 \uB2F4\uB860\uC744 \uB118\uC5B4, \uB0A8\uC131\uC131 \uADF8 \uC790\uCCB4\uB97C \uC7AC\uC815\uC758\uD558\uACE0, \uD568\uAED8 \uCC45\uC784\uC9C0\uB294 \uC5F0\uB300\uC758 \uC5B8\uC5B4\uB97C \uBCF5\uC6D0\uD558\uB824\uB294 \uC2DC\uB3C4\uB2E4.</p>`,
              `<h3>K-MEN\uC758 \uBE44\uC804\uACFC \uC2E4\uCC9C</h3>`,
              `<p>K-MEN\uC740 \uC9C0\uB09C 1\uC6D4\uACFC 5\uC6D4 \uB124\uD2B8\uC6CC\uD06C\uB2E8\uCCB4 \uD68C\uC6D0\uB4E4\uC774 \uBAA8\uC5EC \uC6CC\uD06C\uC20D\uC744 \uAC00\uC9C0\uACE0 \uB2E4\uC74C\uACFC \uAC19\uC740 \uBE44\uC804\uACFC \uBBF8\uC158, \uAC00\uCE58\uB97C \uB9CC\uB4E4\uC5C8\uB2E4.</p>`,
              `<ul>`,
              `<li><strong>\uBE44\uC804:</strong> \uC804\uD658\uC801 \uB0A8\uC131\uC131 \uC815\uB9BD\uC744 \uD1B5\uD55C \uC820\uB354 \uC815\uC758 \uC2E4\uD604</li>`,
              `<li><strong>\uBBF8\uC158:</strong> \uB0A8\uC131\uACFC \uC18C\uB144\uC744 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uCD08\uB300 / \uC131\uD3C9\uB4F1\uC744 \uC2E4\uCC9C\uD558\uB294 \uAD6D\uB0B4\uC678 \uB2E8\uCCB4\uB4E4\uACFC\uC758 \uC5F0\uB300 \uBC0F \uB124\uD2B8\uC6CC\uD06C \uAD6C\uCD95</li>`,
              `<li><strong>\uD575\uC2EC\uAC00\uCE58:</strong> \uC874\uC911, \uD3C9\uB4F1, \uC790\uAE30\uC131\uCC30, \uBCC0\uD654, \uC5F0\uB300</li>`,
              `</ul>`,
              `<h3>\uBC1C\uC871\uC2DD \uD589\uC0AC \uAC1C\uC694</h3>`,
              `<ul>`,
              `<li><strong>\uC77C\uC2DC:</strong> 2025\uB144 7\uC6D4 9\uC77C(\uC218) 19:00~21:00</li>`,
              `<li><strong>\uC7A5\uC18C:</strong> \uC11C\uC6B8\uAC00\uC871\uD50C\uB77C\uC790 \uC2A4\uD398\uC774\uC2A4\uC0B4\uB9BC (\uB300\uBC29\uC5ED 3\uBC88 \uCD9C\uAD6C)</li>`,
              `</ul>`,
              `<p><strong>1\uBD80 \u2013 \uBC1C\uC871\uC2DD</strong></p>`,
              `<ul>`,
              `<li>\uC624\uD504\uB2DD \uC601\uC0C1 \u2013 "\uB0B4\uAC00 \uC0DD\uAC01\uD558\uB294 K-MEN"</li>`,
              `<li>K-MEN, \uCD9C\uBC1C\uD558\uB2E4 \u2013 \uB2E8\uCCB4\uC18C\uAC1C \uBC0F \uBE44\uC804 (\uD669\uAE08\uBA85\uB95C, \uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC \uAD6D\uC81C\uD611\uB825\uC0AC\uC5C5\uB2E8\uC7A5)</li>`,
              `<li>\uCD95\uC0AC \u2013 MenEngage \uAE00\uB85C\uBC8C \uBA64\uBC84(Jens van Tricht, \uB124\uB35C\uB780\uB4DC Emancipator \uB300\uD45C) \uBC0F \uAD6D\uB0B4 \uC778\uC0AC</li>`,
              `</ul>`,
              `<p><strong>2\uBD80 \u2013 \uBC1C\uC871\uAE30\uB150 \uD1A0\uD06C\uC1FC "K-MEN\uC744 \uB9D0\uD558\uB2E4"</strong></p>`,
              `<ul>`,
              `<li>\uC9C4\uD589: \uC774\uD55C (\uB0A8\uC131\uACFC \uD568\uAED8\uD558\uB294 \uD398\uBBF8\uB2C8\uC998)</li>`,
              `<li>\uD328\uB110: \uACE0\uC0C1\uADE0 (\uB0A8\uB2E4\uB978 \uC131\uAD50\uC721 \uC5F0\uAD6C\uC18C), \uC774\uD638 (\uD398\uBBF8\uB2C8\uC998 \uB3D9\uC544\uB9AC \uB3C4\uC804\uD55C\uB0A8), \uC548\uD76C\uC81C (\u300E\uC99D\uBA85\uACFC \uBCC0\uBA85\u300F \uC800\uC790), \uAE40\uCC2C\uC11C (\uC544\uD558\uCCAD\uC18C\uB144\uC131\uBB38\uD654\uC13C\uD130 \uCCAD\uC18C\uB144\uC6B4\uC601\uC704\uC6D0)</li>`,
              `</ul>`,
              `<p><strong>\uB9C8\uBB34\uB9AC \uD37C\uD3EC\uBA3C\uC2A4 "K-MEN\uC744 \uC5EE\uB2E4"</strong> \u2014 \uC190\uD53C\uCF13 \uD3EC\uD1A0\uD0C0\uC784 "\uB2E4\uC2DC, \uD55C\uAD6D \uB0A8\uC790 : K-MEN, \uC131\uD3C9\uB4F1\uC73C\uB85C \uB3D9\uD589!"</p>`,
              `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
              `<h3 style="margin-bottom:1rem">\uBB38\uC758 \uBC0F \uCC38\uC5EC</h3>`,
              `<p>\u{1F4E7} <a href="mailto:koreamenengagenetwork@gmail.com">koreamenengagenetwork@gmail.com</a></p>`,
              `<p>\u{1F4AC} <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer">\uC624\uD508\uCE74\uD1A1\uBC29</a></p>`,
              `</div>`
            ].join("\n")
          },
          {
            title: "K-MEN \uCD9C\uBC94, \uC131\uD3C9\uB4F1 \uC0AC\uD68C\uB97C \uC704\uD55C '\uC0C8\uB85C\uC6B4 \uB0A8\uC131\uC131' \uC5F0\uB300 \uC2DC\uC791",
            content: [
              `<p><strong>\u2014 \uB0A8\uC131\uC131\uACFC \uC131\uD3C9\uB4F1\uC744 \uD568\uAED8 \uB17C\uD558\uB2E4... \uB2E4\uC591\uD55C \uC138\uB300\uC758 \uACF5\uAC10\uACFC \uC2E4\uCC9C \uB2E4\uC9D0 \u2014</strong></p>`,
              `<p>\uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uD568\uAED8 \uB9CC\uB4E4\uC5B4\uAC08 \uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN)\uAC00 <strong>2025\uB144 7\uC6D4 9\uC77C(\uD654)</strong> 150\uC5EC\uBA85\uC758 \uC2DC\uBBFC\uB4E4\uC774 \uBAA8\uC5EC \uC11C\uC6B8\uAC00\uC871\uD50C\uB77C\uC790 \uB2E4\uBAA9\uC801\uD640\uC5D0\uC11C \uACF5\uC2DD \uCD9C\uBC94\uD588\uB2E4. K-MEN\uC740 \uB0A8\uC131\uACFC \uC18C\uB144\uC744 \uC131\uD3C9\uB4F1\uC758 \uB3D9\uBC18\uC790\uB85C \uCD08\uB300\uD558\uACE0, \uC0C8\uB85C\uC6B4 \uB0A8\uC131\uC131\uC5D0 \uB300\uD55C \uC0AC\uD68C\uC801 \uB17C\uC758\uB97C \uD655\uC0B0\uC2DC\uD0A4\uAE30 \uC704\uD55C \uD611\uB825 \uB124\uD2B8\uC6CC\uD06C\uB2E4.</p>`,
              `<p>\uCD9C\uBC94\uC2DD\uC5D0\uB294 \uB2E4\uC591\uD55C \uBC30\uACBD\uC758 \uCC38\uC5EC\uC790\uB4E4\uC774 \uD568\uAED8\uD574 \uC131\uD3C9\uB4F1\uD55C \uC77C\uC0C1\uC744 \uC704\uD55C \uACE0\uBBFC\uACFC \uC2E4\uCC9C \uC758\uC9C0\uB97C \uB098\uB234\uB2E4. '\uC131\uD3C9\uB4F1\uC740 \uD568\uAED8 \uB9CC\uB4DC\uB294 \uAC83'\uC774\uB77C\uB294 \uBA54\uC2DC\uC9C0 \uC544\uB798, \uC815\uCCB4\uC131\uACFC \uAD00\uACC4\uC5D0 \uB300\uD55C \uC131\uCC30, \uADF8\uB9AC\uACE0 \uBCC0\uD654\uC758 \uAC00\uB2A5\uC131\uC744 \uACF5\uC720\uD558\uB294 \uAE4A\uC740 \uACF5\uAC10\uC758 \uC2DC\uAC04\uC774 \uC774\uC5B4\uC84C\uB2E4.</p>`,
              `<h3>\uC131\uD3C9\uB4F1\uD55C \uC0AC\uD68C\uB97C \uD5A5\uD55C K-MEN\uC758 \uC2DC\uC791, \uD568\uAED8 \uB9CC\uB4DC\uB294 \uBCC0\uD654\uC758 \uC5EC\uC815</h3>`,
              `<p>\uBC1C\uC871\uC2DD \uC2DC\uC791 \uC804, \uC7A5\uB0B4\uC5D0\uB294 \uC804 \uC138\uACC4 \uAC01\uAD6D\uC758 \uB9E8\uC564\uAC8C\uC774\uC9C0 \uD68C\uC6D0\uB4E4\uC774 \uBCF4\uB0B8 \uCD95\uD558 \uBA54\uC2DC\uC9C0\uAC00 \uC601\uC0C1\uC73C\uB85C \uC0C1\uC601\uB418\uBA70, K-MEN\uC758 \uBC1C\uC871\uC5D0 \uC9C0\uAD6C\uC801\uC778 \uAD00\uC2EC\uACFC \uACA9\uB824\uAC00 \uC788\uC74C\uC744 \uC54C \uC218 \uC788\uC5C8\uB2E4. \uBCF8\uACA9\uC801\uC778 \uBC1C\uC871\uC2DD \uD589\uC0AC\uB294 1\uBD80\uC640 2\uBD80\uB85C \uB098\uB258\uC5B4 \uC9C4\uD589\uB410\uB2E4.</p>`,
              `<p>1\uBD80\uC5D0\uC11C\uB294 \uD669\uAE08\uBA85\uB95C \uACF5\uB3D9 \uCF54\uB514\uB124\uC774\uD130\uAC00 K-MEN\uC758 \uACB0\uC131 \uBC30\uACBD\uACFC \uBE44\uC804, \uD568\uAED8\uD558\uB294 \uD68C\uC6D0\uB2E8\uCCB4\uB4E4\uC744 \uC18C\uAC1C\uD558\uBA70 \uBB38\uC744 \uC5F4\uC5C8\uB2E4. K-MEN\uC740 2024\uB144 2\uC6D4, \uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC\uAC00 \uD55C\uAD6D\uC5D0\uC11C\uB294 \uCC98\uC74C\uC73C\uB85C \uB9E8\uC564\uAC8C\uC774\uC9C0 \uAE00\uB85C\uBC8C \uC5BC\uB77C\uC774\uC5B8\uC2A4\uC758 \uD68C\uC6D0\uC774 \uB41C \uD6C4, \uAE00\uB85C\uBC8C \uC0AC\uBB34\uAD6D\uACFC \uAD6D\uC81C\uD3EC\uB7FC\uC744 \uC5EC\uB294 \uB4F1\uC758 \uD65C\uB3D9\uC744 \uD574\uC624\uB2E4\uAC00 "\uC131\uD3C9\uB4F1\uACFC \uB0A8\uC131\uC131"\uC5D0 \uAD00\uC2EC\uC744 \uB450\uACE0 \uD65C\uB3D9\uD558\uB294 \uB2E8\uCCB4\uB4E4\uC5D0\uAC8C \uD55C\uAD6D \uB124\uD2B8\uC6CC\uD06C \uACB0\uC131\uC744 \uC81C\uC548\uD558\uBA70 \uC2DC\uC791\uB418\uC5C8\uB2E4.</p>`,
              `<p>"\uC804\uD658\uC801 \uB0A8\uC131\uC131 \uC815\uB9BD\uC744 \uD1B5\uD574 \uC820\uB354\uC815\uC758\uB97C \uC2E4\uD604\uD55C\uB2E4"\uB294 \uBE44\uC804 \uC544\uB798 \uBAA8\uC778 \uC5F4\uB450\uAC1C \uB2E8\uCCB4\uB4E4\uC740 \uC9C0\uB09C 1\uB144 \uAC04 \uC77C\uACF1\uCC28\uB840\uC758 \uB300\uD45C\uC790 \uD68C\uC758\uC640 \uB450 \uBC88\uC758 \uD68C\uC6D0 \uC6CC\uD06C\uC20D\uC744 \uAC70\uCE58\uBA70, \uB2E8\uCCB4 \uBA85\uCE6D\uACFC \uBBF8\uC158, \uD68C\uC6D0\uC758 \uC57D\uC18D \uB4F1\uC5D0 \uD569\uC758\uD558\uC600\uB2E4. \uD55C\uD3B8 K-MEN \uBC1C\uC871\uC744 \uCD95\uD558\uD558\uAE30 \uC704\uD574 \uC720\uB7FD \uB124\uB35C\uB780\uB4DC\uC758 Emancipator \uB300\uD45C Jens van Tricht\uC528\uAC00 \uCC38\uC11D\uD574 \uCD95\uD558\uC778\uC0AC\uB97C \uD588\uB2E4.</p>`,
              `<h3>"\uB0A8\uC790\uB2E4\uC6C0\uC5D0 \uADE0\uC5F4\uC744 \uB0B4\uB2E4." \u2014 \uD1A0\uD06C\uC1FC \uC8FC\uC694 \uBC1C\uC5B8</h3>`,
              `<p>\uC774\uB0A0 \uD1A0\uD06C\uC1FC\uC5D0\uB294 \uB2E4\uC591\uD55C \uBC30\uACBD\uC758 \uB0A8\uC131\uB4E4\uC774 \uD328\uB110\uB85C \uCC38\uC5EC\uD574 \uC131\uD3C9\uB4F1\uACFC \uB0A8\uC131\uC131\uC5D0 \uAD00\uD55C \uACBD\uD5D8\uACFC \uC2DC\uAC01\uC744 \uACF5\uC720\uD588\uB2E4.</p>`,
              `<ul>`,
              `<li><strong>\uC774\uD638</strong>(\uD398\uBBF8\uB2C8\uC998 \uB3D9\uC544\uB9AC '\uB3C4\uC804\uD55C\uB0A8')\uB294 "'\uB0A8\uC790\uB2E4\uC6C0'\uC740 \uD2B9\uD788 \uC131\uC758 \uC601\uC5ED\uC5D0\uC11C \uAC15\uD558\uAC8C \uC791\uB3D9\uD55C\uB2E4"\uBA70, "\uC131\uC695\uC744 \uC99D\uBA85\uD558\uC9C0 \uBABB\uD558\uBA74 \uC870\uB871\uBC1B\uB294 \uC65C\uACE1\uB41C \uBB38\uD654\uAC00 \uC5EC\uC804\uD788 \uC874\uC7AC\uD55C\uB2E4"\uACE0 \uBE44\uD310\uD588\uB2E4.</li>`,
              `<li><strong>\uC548\uD76C\uC81C</strong>(\u300E\uC99D\uBA85\uACFC \uBCC0\uBA85\u300F \uC800\uC790)\uB294 "'\uD55C\uAD6D \uB0A8\uC790'\uB77C\uB294 \uB9D0\uC774 \uBD80\uC815\uC801\uC73C\uB85C \uC0AC\uC6A9\uB420 \uB54C, \uC774\uB294 \uB0A8\uC131\uC774\uB77C\uB294 \uBC94\uC8FC \uC790\uCCB4\uAC00 \uB2F9\uC0AC\uC790\uB4E4\uC5D0\uAC8C\uB3C4 \uC88C\uC808\uB85C \uC791\uC6A9\uD558\uACE0 \uC788\uC74C\uC744 \uB4DC\uB7EC\uB0B8\uB2E4"\uACE0 \uC9C0\uC801\uD588\uB2E4.</li>`,
              `<li><strong>\uAE40\uCC2C\uC11C</strong>(\uC544\uD558\uC13C\uD130 \uCCAD\uC18C\uB144\uC6B4\uC601\uC704\uC6D0)\uB294 "\uC131\uD3C9\uB4F1\uD55C \uAD00\uACC4\uB97C \uB9CC\uB4E4\uAE30 \uC704\uD574\uC11C\uB294 \uB0A8\uC131\uC774 \uC790\uC2E0\uC758 \uC815\uCCB4\uC131\uC744 \uC724\uB9AC\uC801\uC73C\uB85C \uC7AC\uC815\uC758\uD574\uC57C \uD55C\uB2E4"\uACE0 \uAC15\uC870\uD588\uB2E4.</li>`,
              `<li><strong>\uACE0\uC0C1\uADE0</strong>(\uB0A8\uB2E4\uB978 \uC131\uAD50\uC721 \uC5F0\uAD6C\uC18C)\uC740 "\uB0A8\uC131\uC744 \uC9D1\uB2E8\uC801\uC73C\uB85C \uB300\uC0C1\uD654\uD558\uAC70\uB098 \uC77C\uBC18\uD654\uD558\uB294 \uC811\uADFC\uC740 \uC704\uD5D8\uD558\uB2E4"\uBA70, "\uB0A8\uC131\uB4E4\uC774 \uAC10\uC815\uC744 \uC548\uC804\uD558\uAC8C \uD45C\uD604\uD560 \uC218 \uC788\uB294 \uD658\uACBD\uC774 \uB9C8\uB828\uB418\uC5B4\uC57C \uC9C4\uC815\uD55C \uD574\uBC29\uC774 \uAC00\uB2A5\uD558\uB2E4"\uACE0 \uB9D0\uD588\uB2E4.</li>`,
              `</ul>`,
              `<h3>K-MEN, \uC77C\uC0C1 \uC18D \uC131\uD3C9\uB4F1 \uC2E4\uCC9C\uC744 \uC704\uD55C \uC5F0\uB300 \uC774\uC5B4\uAC04\uB2E4</h3>`,
              `<p>\uCC38\uC11D\uC790\uB4E4\uC740 \uC774\uBC88 \uCD9C\uBC94\uC2DD\uC744 \uD1B5\uD574 "\uC131\uD3C9\uB4F1\uC740 \uD2B9\uC815 \uC9D1\uB2E8\uC758 \uACFC\uC81C\uAC00 \uC544\uB2C8\uB77C \uBAA8\uB450\uAC00 \uD568\uAED8 \uC2E4\uCC9C\uD574\uC57C \uD560 \uC0AC\uD68C\uC801 \uACFC\uC81C"\uC784\uC744 \uB2E4\uC2DC\uAE08 \uD655\uC778\uD588\uB2E4.</p>`,
              `<p>K-MEN\uC740 \uC55E\uC73C\uB85C\uB3C4 \uC18C\uB144\uACFC \uB0A8\uC131\uB4E4\uC774 \uC790\uC2E0\uC758 \uC815\uCCB4\uC131\uACFC \uAD00\uACC4\uB97C \uB418\uB3CC\uC544\uBCF4\uACE0, \uC131\uD3C9\uB4F1\uD55C \uC0B6\uC744 \uC2E4\uCC9C\uD560 \uC218 \uC788\uB3C4\uB85D \uAD50\uC721, \uCEA0\uD398\uC778, \uB124\uD2B8\uC6CC\uD0B9 \uB4F1\uC758 \uB2E4\uC591\uD55C \uD65C\uB3D9\uC744 \uC804\uAC1C\uD560 \uACC4\uD68D\uC774\uB2E4.</p>`,
              `<p>\uD669\uAE08\uBA85\uB95C \uACF5\uB3D9\uCF54\uB514\uB124\uC774\uD130\uB294 "\uC774\uBC88 K-MEN \uCD9C\uBC94\uC740 \uC18C\uB144\uACFC \uB0A8\uC131\uC774 \uC131\uD3C9\uB4F1\uC758 \uC8FC\uCCB4\uB85C \uD568\uAED8 \uC124 \uC218 \uC788\uC74C\uC744 \uBCF4\uC5EC\uC8FC\uB294 \uC2E0\uD638\uD0C4"\uC774\uB77C\uBA70, "\uC77C\uC0C1\uC758 \uAD00\uACC4\uC5D0\uC11C\uBD80\uD130 \uC131\uD3C9\uB4F1\uC744 \uC2E4\uCC9C\uD558\uB294 \uB0A8\uC131\uB4E4\uC758 \uC5F0\uB300\uB97C \uD655\uC0B0\uD574 \uB098\uAC00\uACA0\uB2E4"\uACE0 \uBC1D\uD614\uB2E4.</p>`,
              `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
              `<h3 style="margin-bottom:1rem">\uBB38\uC758</h3>`,
              `<p style="font-size:0.875rem;color:#64748b;margin-bottom:1rem">\uBCF8 \uBCF4\uB3C4\uC790\uB8CC\uC5D0 \uB300\uD55C \uBB38\uC758: \uD55C\uAD6D\uB9E8\uC5D4\uAC8C\uC774\uC9C0\uB124\uD2B8\uC6CC\uD06C(K-MEN) \uC0AC\uBB34\uAD6D</p>`,
              `<p>\u{1F4E7} <a href="mailto:koreamenengagenetwork@gmail.com">koreamenengagenetwork@gmail.com</a></p>`,
              `<p>\u{1F4AC} <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer">\uC624\uD508\uCE74\uD1A1\uBC29</a></p>`,
              `</div>`
            ].join("\n")
          }
        ];
        for (const pr of pressReleasesMigration) {
          const [existingPr] = await conn.execute(
            "SELECT id FROM posts WHERE title = ? LIMIT 1",
            [pr.title]
          );
          if (existingPr.length === 0) {
            await conn.execute(
              "INSERT INTO posts (title, content, type, org_id, image_url) VALUES (?, ?, ?, ?, ?)",
              [pr.title, pr.content, "press_release", adminId, null]
            );
            console.log(`Added press release: ${pr.title}`);
          }
        }
      }
    }
    const dateFixMap = [
      ['"\uB2E4\uC2DC, \uD55C\uAD6D \uB0A8\uC790 \u2014 \uC804\uD658\uC801 \uB0A8\uC131\uC131\uC744 \uB9D0\uD558\uB2E4"%', "2025-06-27 00:00:00"],
      ["K-MEN \uCD9C\uBC94, \uC131\uD3C9\uB4F1 \uC0AC\uD68C\uB97C \uC704\uD55C%", "2025-07-10 00:00:00"],
      ["K-MEN, \uC131\uD3C9\uB4F1\uC8FC\uAC04\uC5D0 \uD568\uAED8\uD558\uB294 '\uC18C\uB144\uACFC \uB0A8\uC131\uC758 \uB0A0' \uC120\uD3EC", "2025-09-01 00:00:00"],
      ["[GOMA]%", "2025-09-01 01:00:00"],
      ["[\uBD04\uB3CC]%", "2025-09-01 02:00:00"],
      ["[\uCC3D\uC6D0\uC5EC\uC131\uC0B4\uB9BC\uACF5\uB3D9\uCCB4]%", "2025-09-01 03:00:00"],
      ["[\uC131\uD3C9\uB4F1\uC704\uC57C]%", "2025-09-01 04:00:00"],
      ["[\uC820\uB354\uAD50\uC721\uD50C\uB7AB\uD3FC\uD6A8\uC7AC]%", "2025-09-01 05:00:00"]
    ];
    for (const [titlePattern, date] of dateFixMap) {
      await conn.execute(
        "UPDATE posts SET created_at = ? WHERE title LIKE ? AND type = ?",
        [date, titlePattern, "press_release"]
      );
    }
    console.log("Database tables initialized");
  } finally {
    conn.release();
  }
}
var db_default = pool;

// server/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "kmen-dev-secret-change-in-production";
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." });
    return;
  }
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, JWT_SECRET);
    req.orgId = payload.id;
    req.orgName = payload.name;
    req.orgRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uD1A0\uD070\uC785\uB2C8\uB2E4." });
  }
}
function adminMiddleware(req, res, next) {
  if (req.orgRole !== "admin") {
    res.status(403).json({ error: "\uAD00\uB9AC\uC790 \uAD8C\uD55C\uC774 \uD544\uC694\uD569\uB2C8\uB2E4." });
    return;
  }
  next();
}
function signToken(id, name, role) {
  return jwt.sign({ id, name, role }, JWT_SECRET, { expiresIn: "7d" });
}

// server/routes/auth.ts
var router = Router();
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "\uB2E8\uCCB4\uBA85, \uC774\uBA54\uC77C, \uBE44\uBC00\uBC88\uD638\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "\uBE44\uBC00\uBC88\uD638\uB294 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4." });
    return;
  }
  try {
    const [existing] = await db_default.execute(
      "SELECT id FROM organizations WHERE email = ? OR name = ?",
      [email, name]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "\uC774\uBBF8 \uB4F1\uB85D\uB41C \uB2E8\uCCB4\uBA85 \uB610\uB294 \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4." });
      return;
    }
    const passwordHash = await bcrypt2.hash(password, 12);
    await db_default.execute(
      "INSERT INTO organizations (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );
    res.status(201).json({ message: "\uD68C\uC6D0\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uAD00\uB9AC\uC790 \uC2B9\uC778 \uD6C4 \uB85C\uADF8\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "\uC774\uBA54\uC77C\uACFC \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
    return;
  }
  try {
    const [rows] = await db_default.execute(
      "SELECT id, name, email, password_hash, role, approved FROM organizations WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      res.status(401).json({ error: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const org = rows[0];
    const valid = await bcrypt2.compare(password, org.password_hash);
    if (!valid) {
      res.status(401).json({ error: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
      return;
    }
    if (!org.approved) {
      res.status(403).json({ error: "\uAD00\uB9AC\uC790 \uC2B9\uC778 \uB300\uAE30 \uC911\uC785\uB2C8\uB2E4. \uC2B9\uC778 \uD6C4 \uB85C\uADF8\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const token = signToken(org.id, org.name, org.role);
    res.json({
      token,
      organization: { id: org.id, name: org.name, email: org.email, role: org.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var auth_default = router;

// server/routes/posts.ts
import { Router as Router2 } from "express";
var router2 = Router2();
router2.get("/", async (req, res) => {
  const { type } = req.query;
  try {
    let query = `
      SELECT p.*, o.name as org_name
      FROM posts p
      JOIN organizations o ON p.org_id = o.id
      WHERE p.published = 1
    `;
    const params = [];
    const validTypes = ["news", "event", "press_release", "notice", "document", "member_activity"];
    if (typeof type === "string" && validTypes.includes(type)) {
      query += " AND p.type = ?";
      params.push(type);
    }
    query += " ORDER BY p.created_at DESC";
    const [rows] = await db_default.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Get posts error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router2.get("/my", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT * FROM posts WHERE org_id = ? ORDER BY created_at DESC",
      [req.orgId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get my posts error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const [rows] = await db_default.execute(
      `SELECT p.*, o.name as org_name
       FROM posts p
       JOIN organizations o ON p.org_id = o.id
       WHERE p.id = ? AND p.published = 1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Get post error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router2.post("/", authMiddleware, async (req, res) => {
  const { title, content, type, event_date, image_url, summary } = req.body;
  if (!title || !content || !type) {
    res.status(400).json({ error: "\uC81C\uBAA9, \uB0B4\uC6A9, \uC720\uD615\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
    return;
  }
  const validTypes = ["news", "event", "press_release", "notice", "document", "member_activity"];
  if (!validTypes.includes(type)) {
    res.status(400).json({ error: `\uC720\uD615\uC740 ${validTypes.join(", ")}\uB9CC \uAC00\uB2A5\uD569\uB2C8\uB2E4.` });
    return;
  }
  if ((type === "notice" || type === "document") && req.orgRole !== "admin") {
    res.status(403).json({ error: "\uAD00\uB9AC\uC790\uB9CC \uC791\uC131\uD560 \uC218 \uC788\uB294 \uC720\uD615\uC785\uB2C8\uB2E4." });
    return;
  }
  try {
    const [result] = await db_default.execute(
      "INSERT INTO posts (title, content, summary, type, org_id, event_date, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, content, summary || null, type, req.orgId, event_date || null, image_url || null]
    );
    const [rows] = await db_default.execute(
      "SELECT * FROM posts WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router2.put("/:id", authMiddleware, async (req, res) => {
  const { title, content, event_date, image_url, summary } = req.body;
  try {
    const [existing] = await db_default.execute(
      "SELECT org_id FROM posts WHERE id = ?",
      [req.params.id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    if (existing[0].org_id !== req.orgId && req.orgRole !== "admin") {
      res.status(403).json({ error: "\uBCF8\uC778\uC758 \uAE00\uB9CC \uC218\uC815\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute(
      "UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), summary = ?, event_date = ?, image_url = ? WHERE id = ?",
      [title, content, summary !== void 0 ? summary : null, event_date || null, image_url || null, req.params.id]
    );
    const [rows] = await db_default.execute(
      "SELECT * FROM posts WHERE id = ?",
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Update post error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router2.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const [existing] = await db_default.execute(
      "SELECT org_id FROM posts WHERE id = ?",
      [req.params.id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    if (existing[0].org_id !== req.orgId) {
      res.status(403).json({ error: "\uBCF8\uC778\uC758 \uAE00\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "\uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Delete post error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var posts_default = router2;

// server/routes/admin.ts
import { Router as Router3 } from "express";
var router3 = Router3();
router3.use(authMiddleware, adminMiddleware);
router3.get("/organizations", async (_req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT id, name, email, role, approved, created_at FROM organizations ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get orgs error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router3.patch("/organizations/:id/approve", async (req, res) => {
  try {
    await db_default.execute(
      "UPDATE organizations SET approved = 1 WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: "\uC2B9\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Admin approve error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router3.patch("/organizations/:id/revoke", async (req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT role FROM organizations WHERE id = ?",
      [req.params.id]
    );
    if (rows.length > 0 && rows[0].role === "admin") {
      res.status(400).json({ error: "\uAD00\uB9AC\uC790 \uACC4\uC815\uC758 \uC2B9\uC778\uC740 \uCDE8\uC18C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute(
      "UPDATE organizations SET approved = 0 WHERE id = ?",
      [req.params.id]
    );
    res.json({ message: "\uC2B9\uC778\uC774 \uCDE8\uC18C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Admin revoke error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router3.delete("/organizations/:id", async (req, res) => {
  try {
    const orgId = Number(req.params.id);
    if (orgId === req.orgId) {
      res.status(400).json({ error: "\uC790\uC2E0\uC758 \uACC4\uC815\uC740 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute("DELETE FROM posts WHERE org_id = ?", [orgId]);
    await db_default.execute("DELETE FROM organizations WHERE id = ?", [orgId]);
    res.json({ message: "\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Admin delete org error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router3.get("/posts", async (_req, res) => {
  try {
    const [rows] = await db_default.execute(
      `SELECT p.*, o.name as org_name
       FROM posts p
       JOIN organizations o ON p.org_id = o.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Admin get posts error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router3.delete("/posts/:id", async (req, res) => {
  try {
    await db_default.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: "\uAC8C\uC2DC\uAE00\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Admin delete post error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var admin_default = router3;

// server/routes/upload.ts
import { Router as Router4 } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
var uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, name);
  }
});
var upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "application/pdf"
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("\uC9C0\uC6D0\uD558\uC9C0 \uC54A\uB294 \uD30C\uC77C \uD615\uC2DD\uC785\uB2C8\uB2E4."));
    }
  }
});
var router4 = Router4();
router4.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "\uD30C\uC77C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const { title, description, category } = req.body;
    const cat = ["photo", "video", "document"].includes(category) ? category : "photo";
    try {
      const [result] = await db_default.execute(
        "INSERT INTO media (filename, original_name, mime_type, size, category, title, description, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          req.file.filename,
          req.file.originalname,
          req.file.mimetype,
          req.file.size,
          cat,
          title || req.file.originalname,
          description || null,
          req.orgId
        ]
      );
      res.status(201).json({
        id: result.insertId,
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        original_name: req.file.originalname
      });
    } catch (err) {
      console.error("Upload save error:", err);
      res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
    }
  }
);
router4.get("/", async (req, res) => {
  const { category } = req.query;
  try {
    let query = "SELECT id, filename, original_name, mime_type, size, category, title, description, created_at FROM media";
    const params = [];
    if (category === "photo" || category === "video" || category === "document") {
      query += " WHERE category = ?";
      params.push(category);
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await db_default.execute(query, params);
    const media = rows.map((row) => ({
      ...row,
      url: `/uploads/${row.filename}`
    }));
    res.json(media);
  } catch (err) {
    console.error("Get media error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router4.patch("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description } = req.body;
  try {
    const [existing] = await db_default.execute(
      "SELECT id FROM media WHERE id = ?",
      [req.params.id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute(
      "UPDATE media SET title = COALESCE(?, title), description = COALESCE(?, description) WHERE id = ?",
      [title || null, description || null, req.params.id]
    );
    const [rows] = await db_default.execute(
      "SELECT id, filename, original_name, mime_type, size, category, title, description, created_at FROM media WHERE id = ?",
      [req.params.id]
    );
    const row = rows[0];
    res.json({ ...row, url: `/uploads/${row.filename}` });
  } catch (err) {
    console.error("Update media error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router4.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT filename FROM media WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "\uD30C\uC77C\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const filePath = path.join(uploadDir, rows[0].filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await db_default.execute("DELETE FROM media WHERE id = ?", [req.params.id]);
    res.json({ message: "\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("Delete media error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var upload_default = router4;

// server/routes/faq.ts
import { Router as Router5 } from "express";
var router5 = Router5();
router5.get("/", async (_req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT * FROM faqs ORDER BY sort_order ASC, id ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("FAQ list error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router5.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      res.status(400).json({ error: "\uC9C8\uBB38\uACFC \uB2F5\uBCC0\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const [result] = await db_default.execute(
      "INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)",
      [question.trim(), answer.trim(), sort_order ?? 0]
    );
    const insertId = result.insertId;
    const [rows] = await db_default.execute("SELECT * FROM faqs WHERE id = ?", [insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("FAQ create error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router5.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { question, answer, sort_order } = req.body;
    if (!question?.trim() || !answer?.trim()) {
      res.status(400).json({ error: "\uC9C8\uBB38\uACFC \uB2F5\uBCC0\uC744 \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    await db_default.execute(
      "UPDATE faqs SET question = ?, answer = ?, sort_order = ? WHERE id = ?",
      [question.trim(), answer.trim(), sort_order ?? 0, req.params.id]
    );
    const [rows] = await db_default.execute("SELECT * FROM faqs WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      res.status(404).json({ error: "FAQ\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("FAQ update error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router5.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await db_default.execute("DELETE FROM faqs WHERE id = ?", [req.params.id]);
    res.json({ message: "FAQ\uAC00 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("FAQ delete error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var faq_default = router5;

// server/routes/qna.ts
import { Router as Router6 } from "express";
import bcrypt3 from "bcryptjs";
var router6 = Router6();
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next();
    return;
  }
  authMiddleware(req, res, next);
}
router6.get("/", optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.orgRole === "admin";
    const [rows] = await db_default.execute(
      "SELECT id, author_name, title, is_private, answer, answered_at, created_at FROM qna ORDER BY created_at DESC"
    );
    const result = rows.map((row) => ({
      ...row,
      title: row.is_private && !isAdmin ? "\uBE44\uBC00\uAE00\uC785\uB2C8\uB2E4" : row.title
    }));
    res.json(result);
  } catch (err) {
    console.error("QnA list error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.get("/:id", optionalAuth, async (req, res) => {
  try {
    const [rows] = await db_default.execute(
      "SELECT id, author_name, author_email, title, content, is_private, answer, answered_at, created_at FROM qna WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const post = rows[0];
    const isAdmin = req.orgRole === "admin";
    if (post.is_private && !isAdmin) {
      res.json({
        id: post.id,
        author_name: post.author_name,
        title: "\uBE44\uBC00\uAE00\uC785\uB2C8\uB2E4",
        content: null,
        is_private: true,
        answer: null,
        answered_at: null,
        created_at: post.created_at
      });
      return;
    }
    res.json(post);
  } catch (err) {
    console.error("QnA detail error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.post("/:id/verify", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      res.status(400).json({ error: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const [rows] = await db_default.execute(
      "SELECT * FROM qna WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const post = rows[0];
    const match = await bcrypt3.compare(password, post.password);
    if (!match) {
      res.status(403).json({ error: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const { password: _, ...safePost } = post;
    res.json(safePost);
  } catch (err) {
    console.error("QnA verify error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.post("/", async (req, res) => {
  try {
    const { author_name, author_email, title, content, password, is_private } = req.body;
    if (!author_name?.trim() || !title?.trim() || !content?.trim() || !password) {
      res.status(400).json({ error: "\uC791\uC131\uC790, \uC81C\uBAA9, \uB0B4\uC6A9, \uBE44\uBC00\uBC88\uD638\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const hashedPassword = await bcrypt3.hash(password, 12);
    const [result] = await db_default.execute(
      "INSERT INTO qna (author_name, author_email, title, content, password, is_private) VALUES (?, ?, ?, ?, ?, ?)",
      [author_name.trim(), author_email?.trim() || null, title.trim(), content.trim(), hashedPassword, is_private ? 1 : 0]
    );
    const insertId = result.insertId;
    const [rows] = await db_default.execute(
      "SELECT id, author_name, title, content, is_private, answer, answered_at, created_at FROM qna WHERE id = ?",
      [insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("QnA create error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.put("/:id", async (req, res) => {
  try {
    const { title, content, password } = req.body;
    if (!password) {
      res.status(400).json({ error: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    const [rows] = await db_default.execute(
      "SELECT password FROM qna WHERE id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
      return;
    }
    const match = await bcrypt3.compare(password, rows[0].password);
    if (!match) {
      res.status(403).json({ error: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
      return;
    }
    await db_default.execute(
      "UPDATE qna SET title = ?, content = ? WHERE id = ?",
      [title.trim(), content.trim(), req.params.id]
    );
    res.json({ message: "\uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("QnA update error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.delete("/:id", optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.orgRole === "admin";
    if (!isAdmin) {
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ error: "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694." });
        return;
      }
      const [rows] = await db_default.execute(
        "SELECT password FROM qna WHERE id = ?",
        [req.params.id]
      );
      if (rows.length === 0) {
        res.status(404).json({ error: "\uAC8C\uC2DC\uAE00\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4." });
        return;
      }
      const match = await bcrypt3.compare(password, rows[0].password);
      if (!match) {
        res.status(403).json({ error: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4." });
        return;
      }
    }
    await db_default.execute("DELETE FROM qna WHERE id = ?", [req.params.id]);
    res.json({ message: "\uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("QnA delete error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
router6.patch("/:id/answer", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { answer } = req.body;
    if (!answer?.trim()) {
      res.status(400).json({ error: "\uB2F5\uBCC0\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694." });
      return;
    }
    await db_default.execute(
      "UPDATE qna SET answer = ?, answered_at = NOW() WHERE id = ?",
      [answer.trim(), req.params.id]
    );
    res.json({ message: "\uB2F5\uBCC0\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4." });
  } catch (err) {
    console.error("QnA answer error:", err);
    res.status(500).json({ error: "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4." });
  }
});
var qna_default = router6;

// server/index.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3001;
app.use(cors());
app.use(express.json());
app.use("/api/auth", auth_default);
app.use("/api/posts", posts_default);
app.use("/api/admin", admin_default);
app.use("/api/media", upload_default);
app.use("/api/faq", faq_default);
app.use("/api/qna", qna_default);
app.use("/uploads", express.static(path2.join(process.cwd(), "uploads")));
var distPath = path2.join(process.cwd(), "dist");
app.use(express.static(distPath));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path2.join(distPath, "index.html"));
});
async function start() {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  try {
    await initDB();
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
}
start();
