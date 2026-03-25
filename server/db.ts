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

    // posts 타입 ENUM 확장 (notice, document, member_activity 추가)
    try {
      await conn.execute(`ALTER TABLE posts MODIFY COLUMN type ENUM('news', 'event', 'press_release', 'notice', 'document', 'member_activity') NOT NULL`);
    } catch {
      // 이미 적용되었으면 무시
    }

    // posts에 summary 컬럼 추가
    try {
      await conn.execute(`ALTER TABLE posts ADD COLUMN summary TEXT NULL AFTER content`);
    } catch {
      // 이미 존재하면 무시
    }

    // posts에 file_url 컬럼 추가
    try {
      await conn.execute(`ALTER TABLE posts ADD COLUMN file_url VARCHAR(500) NULL AFTER image_url`);
    } catch {
      // 이미 존재하면 무시
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

      // 기존 정적 보도자료 시드: admin 계정이 있고 보도자료가 없으면 삽입
      const adminId = existing.length > 0 ? existing[0].id : (await conn.execute<mysql.RowDataPacket[]>('SELECT id FROM organizations WHERE email = ?', [adminEmail]))[0]?.[0]?.id;
      if (adminId) {
        const [pressRows] = await conn.execute<mysql.RowDataPacket[]>(
          "SELECT id FROM posts WHERE type = 'press_release' LIMIT 1"
        );
        if (pressRows.length === 0) {
          const seedPosts: { title: string; content: string }[] = [
            {
              title: "K-MEN, 성평등주간에 함께하는 '소년과 남성의 날' 선포",
              content: [
                `<p><strong>— 성평등 사회를 향한 소년과 남성의 새로운 동행 —</strong></p>`,
                `<p>'한국맨엔게이지네트워크(K-MEN)'은 소년과 남성을 성평등의 주체로 초대하고, 새로운 남성성을 통해 성평등한 사회를 만들어가는 글로벌 네트워크로, <strong>2025년 7월 9일</strong> 국내 12개 단체가 모여 공식 출범식을 가졌다. 이어 <strong>'K-MEN'</strong>은 소년과 남성이 성평등의 주체로 나아가기 위해, 양성평등주간의 일요일인 <strong>2025년 9월 7일</strong>을 <strong>'소년과 남성의 날'</strong>로 선포하고자 한다.</p>`,
                `<p>'K-MEN'을 함께 결성하고 있는 국내 12개 단체는 &lt;성평등주간에 함께하는 '소년과 남성의 날' 기념 특강&gt;을 비롯해 온라인 리트릿(retreat) 및 성평등 캠페인 등 다양한 콘텐츠와 캠페인 활동을 준비해 '소년과 남성의 날'을 기념하고자 한다.</p>`,
                `<p>'K-MEN'은 이번 '소년과 남성의 날' 선포를 통해, 소년과 남성들이 성평등의 동반자이자 주체로서 스스로의 마음을 살피고, 나답게 살 수 있는 용기를 얻으며, 돌봄과 연대를 실천하고, 미래를 이야기하는 날을 만들고자 한다.</p>`,
                `<div style="background:#f5f3ff;border-radius:1rem;padding:1.5rem 2rem;margin:2rem 0">`,
                `<h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:1rem">[취지문] 성평등주간에 함께하는 '소년과 남성의 날'</h2>`,
                `<p>'한국맨엔게이지네트워크(K-MEN)'은 소년과 남성을 성평등의 주체로 초대하고, 새로운 남성성을 통해 성평등한 사회를 만들어가는 글로벌 네트워크로, 2025년 7월 9일 국내 12개 단체가 모여 출범했습니다. K-MEN은 소년과 남성을 성평등의 주체로 나아가기 위해, 양성평등주간의 일요일인 2025년 9월 7일에 '소년과 남성의 날'을 선포하고자 합니다.</p>`,
                `<p>양성평등주간은 1898년 한국 최초의 여성 인권 선언문인 '여권통문'이 발표된 날을 기념하는 뜻깊은 주간으로, 1996년 여성주간으로 시작해 2015년 양성평등주간으로 확대 시행되어 올해로 제30회를 맞이했습니다. 그간 여권통문의 정신을 계승하며 여성의 권리 신장을 위한 노력을 넘어 남녀가 함께 성평등한 사회를 이루겠다는 약속을 다져왔습니다. 성평등은 모두의 과제이자 공동의 책임이기 때문입니다.</p>`,
                `<p>그러나 여전히 성평등은 여성의 몫이었습니다. 남성은 지지자의 위치에 머물거나, 때로는 성평등을 대립의 구도로 만들며 권리를 주장하였습니다. 이는 성불평등의 해결책이 되지 못했고, 남성의 삶을 변화시킬 대안을 만들어내지 못했습니다. 끊임없는 경쟁 속에서 스스로의 쓸모를 증명해야 한다는 두려움과 좌절은 남성에게 강요된 '남자다움'의 굴레 속에서 스스로를 고립하게 만들거나 조롱과 혐오가 만연한 유해한 남성성으로 귀결되었습니다. 이제는 이러한 현실을 넘어서 대안을 찾아야 합니다.</p>`,
                `<p>이를 넘어서려는 남성들이 있습니다. 성평등한 사회를 만들기 위해 페미니즘을 공부하고, 젠더기반폭력에 맞서며, 사회적 약자와 연대하는 길을 선택한 사람들이었습니다. 그리고 그 곁에는 이들과 함께한 동료들이 있었습니다. 서로 일상을 나누고, 아픔을 공유하며, 돌봄을 실천하는 과정에서 남성의 삶을 새롭게 재정립하며 대안을 만들어 나갔습니다. 대단하지는 않지만 희망을 보았습니다. 그리고 그 희망은 현재 진행 중입니다.</p>`,
                `<p>K-MEN은 이번 '소년과 남성의 날' 선포를 통해, 소년과 남성들이 성평등의 동반자이자 주체로서 스스로의 마음을 살피고, 나답게 살 수 있는 용기를 얻으며, 돌봄과 연대를 실천하고, 미래를 이야기하는 날을 만들고자 합니다. 오늘 우리는 새로운 전환의 출발에 서 있습니다. 각 단체가 준비한 행사에 참여를 통해 이 여정을 함께 만들어 주시기를 바랍니다.</p>`,
                `</div>`,
                `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
                `<h2 style="font-size:1.125rem;font-weight:bold;margin-bottom:1rem">문의</h2>`,
                `<p style="font-size:0.875rem;color:#64748b;margin-bottom:1rem">본 보도자료에 대한 문의: 한국맨엔게이지네트워크(K-MEN) 사무국</p>`,
                `<p>📧 <a href="mailto:koreamenengagenetwork@gmail.com" style="color:#7c3aed">koreamenengagenetwork@gmail.com</a></p>`,
                `<p>💬 <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer" style="color:#7c3aed">오픈카톡방</a></p>`,
                `<p>🌐 <a href="https://bit.ly/45QrG2D" target="_blank" rel="noopener noreferrer" style="color:#7c3aed">가입 및 소개</a></p>`,
                `</div>`,
                `<p style="text-align:center;margin-top:2rem"><a href="/assets/press-release.pdf" download style="display:inline-block;padding:0.75rem 1.5rem;background:#f1f5f9;border-radius:9999px;color:#475569;font-size:0.875rem;font-weight:500;text-decoration:none">원본 PDF 다운로드</a></p>`,
              ].join('\n'),
            },
            {
              title: "[GOMA] 성평등주간에 함께하는 '소년과 남성의 날' 기념 특강",
              content: [
                `<p><strong>주제:</strong> 남성과 함께하는 성평등정책의 원칙과 방향 살펴보기 — 독일, 호주, 노르웨이 사례를 통해 남성들이 겪는 도전과제와 쟁점, 정책적 대안을 모색하다.</p>`,
                `<p><strong>강사:</strong> 이구경숙, 황금명론</p>`,
                `<p><strong>일시:</strong> 2025년 9월 7일(일) 저녁 7시 (줌)</p>`,
                `<p><strong>참가비:</strong> 1만원</p>`,
                `<p><strong>문의:</strong> 0308goma@gmail.com</p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>주최 단체</h3>`,
                `<p><strong>GOMA (Gender Justice Organization for More Action, 더 많은 행동을 위한 젠더정의조직)</strong></p>`,
                `<p>'젠더정의행동GOMA'는 "성평등은 모두에게 이롭다"는 신념으로 젠더정의가 바로 서는 사회를 위해 실천하고 행동하는 사람들의 모임입니다. 국내외 모든 사람 그리고 조직들과 함께 교육, 연구, 문화운동을 통해 성평등한 지구만들기에 기여하고자 설립된 단체입니다.</p>`,
              ].join('\n'),
            },
            {
              title: "[봄돌] 성평등에 함께하는 '소년과 남성의 날' 온라인 리트릿(Retreat)",
              content: [
                `<p><strong>주제:</strong> 『나의 진짜 목소리를 찾아서』</p>`,
                `<p><strong>일시:</strong> 2025년 9월 7일(일) 오후 4:00~5:30</p>`,
                `<p><strong>장소:</strong> 비대면 Zoom 온라인</p>`,
                `<p><strong>대상:</strong> 나답게 살고 싶은 누구나 (종교·성별·나이 무관)</p>`,
                `<p><strong>문의:</strong> bomdolcenter@gmail.com (김하나, 010-7566-7931)</p>`,
                `<h3>프로그램 구성</h3>`,
                `<ol>`,
                `<li>감정 알아차리기 — 내 몸과 마음의 소리에 귀 기울이기</li>`,
                `<li>챌린지 나눔 — '귀마 넘기' 사전 실천 공유</li>`,
                `<li>내 안의 목소리 탐색 — "~해야 해"라는 고정관념 살펴보기</li>`,
                `<li>나의 마음 표현하기</li>`,
                `<li>해방 선언식 — 억압의 목소리 찢기 &amp; 해방 선언</li>`,
                `<li>축복식</li>`,
                `<li>한 줄 소감, 서로에게 응원 보내기</li>`,
                `</ol>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>주최 단체</h3>`,
                `<p><strong>사회적돌봄센터 봄돌</strong></p>`,
                `<p>"힘겨운 마음 곁에서, 함께 살아내는 법을 연습하는 곳" — 사회적돌봄센터 봄돌은 심리적 위기와 상실, 차별과 외로움 속에서 살아가는 이들과 그 곁의 사람들을 위한 회복 동행 커뮤니티입니다.</p>`,
              ].join('\n'),
            },
            {
              title: "[창원여성살림공동체] '소년과 남성의 날' 기념 성평등 캠페인 — 경상남도 고성군",
              content: [
                `<p><strong>주제:</strong> '평등으로 만드는 아름다움, 전환의 남성성'</p>`,
                `<p><strong>장소:</strong> 경상남도 고성군 학교 일대</p>`,
                `<p><strong>대상:</strong> 남성 청소년</p>`,
                `<p><strong>일시:</strong> 2025년 9월 중</p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>주최 단체</h3>`,
                `<p><strong>(사)창원여성살림공동체</strong></p>`,
                `<p>(사)창원여성살림공동체는 성주류화정책의 이행점검 등을 통한 정책 제안과 교육으로 성주류화가 지역공동체에 확산되어 지역공동체가 보다 안전하고 성평등한 민주 복지가 실현될 수 있도록 견인하는 목적으로 활동하는 단체입니다.</p>`,
              ].join('\n'),
            },
            {
              title: "[성평등위야] 디지털성범죄 예방 콘텐츠 Faker Chaser(페이커 체이서) 제작 발표 및 배포",
              content: [
                `<p>딥페이크와 관련한 현대 사회의 문제를 배경으로, 한 고등학교에서 벌어지는 긴박한 사건을 통해 집단 심리, 정보 윤리, 그리고 개개인의 선택이 가진 힘을 조명하는 숏츠(shorts) 시리즈 10여편 제작</p>`,
                `<p><a href="https://www.weahgender.org/" target="_blank" rel="noopener noreferrer">자료 배포 바로가기 →</a></p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>주최 단체</h3>`,
                `<p><strong>성평등위야</strong></p>`,
                `<p>성평등위야는 앞으로도 부산을 비롯한 울산 경남지역의 다양한 성평등 교육·홍보 활동을 통해 성평등 문화 확산을 위한 지속적인 노력을 기울일 예정이다. '21년 4월 창립한 성평등위야는 다양성, 존중, 연대의 가치로 우리의 일상과 조직 속에 스며있는 편견과 차별을 사전에 제거하고 예방하여 구성원 모두가 행복한 성평등 공동체를 만드는 것을 목표로 활동하는 단체입니다.</p>`,
              ].join('\n'),
            },
            {
              title: "[젠더교육플랫폼효재] '소년과 남성의 날' 기념 『Boys Don't Cry』 소개 카드뉴스 배포",
              content: [
                `<p>캐나다의 공익광고 'Boys Don't Cry' 영상을 한국어 자막과 함께 공개하고, 교육 현장에서 활용할 수 있는 카드뉴스 4장 제작·배포. '남자는 울면 안 돼'와 같은 고정관념이 개인과 사회에 끼치는 해로운 영향을 조명합니다.</p>`,
                `<p><a href="https://youtu.be/fjo-hwAKcas" target="_blank" rel="noopener noreferrer">영상 보기 (YouTube) →</a></p>`,
                `<hr style="margin:1.5rem 0;border-color:#e2e8f0">`,
                `<h3>주최 단체</h3>`,
                `<p><strong>젠더교육플랫폼효재</strong></p>`,
                `<p>젠더교육플랫폼효재는 한국사회에 여성학을 처음 소개하면서 세상의 절반인 여성을 민주화와 평화통일의 주체로 세우고자 헌신하신 (고) 이이효재선생님의 창립정신을 계승하면서, 나아가 여성 개인을 넘어 사회전체의 성평등한 인식과 행동변화를 목표로 성평등 교육과 연구를 지원하는 비영리사단법인입니다.</p>`,
              ].join('\n'),
            },
          ];

          for (const post of seedPosts) {
            await conn.execute(
              'INSERT INTO posts (title, content, type, org_id, image_url) VALUES (?, ?, ?, ?, ?)',
              [post.title, post.content, 'press_release', adminId, null]
            );
          }
          console.log(`Seeded ${seedPosts.length} press releases`);
        }

        // 발족식 보도자료 마이그레이션: 없으면 추가
      const pressReleasesMigration: { title: string; content: string }[] = [
        {
          title: '"다시, 한국 남자 — 전환적 남성성을 말하다" 한국맨엔게이지네트워크(K-MEN) 7월 9일 발족',
          content: [
            `<p>한국 사회에서 남성성에 대한 논의가 새로운 국면을 맞고 있는 지금, 전환적 남성성과 성평등을 실현하기 위한 "한국맨엔게이지네트워크(K-MEN)"가 오는 <strong>7월 9일(수) 오후 7시</strong>, 서울가족플라자 스페이스살림에서 공식 발족식을 연다.</p>`,
            `<p>"K-MEN(Korean MenEngage Network)"은 세계 90여 개국이 참여하는 국제 네트워크 MenEngage Alliance의 한국 지부로, 남성과 소년을 성평등의 주체로 초대하고, 성평등한 사회를 함께 실현해 가는 협력 네트워크다. 발족식은 '다시, 한국 남자: K-MEN, 성평등으로 동행!'라는 슬로건 아래, 다양한 세대와 배경을 가진 남성과 여성들이 모여 남성성의 전환과 성평등 실천에 대한 공동의 비전을 나누는 자리로 마련되었다.</p>`,
            `<h3>왜 지금, K-MEN인가?</h3>`,
            `<p>최근 한국 사회는 젠더 갈등, 안티페미니즘 정서의 확산, 보수 극우 담론의 정치화 등으로 젠더 의제가 분열의 상징처럼 여겨지고 있다. 특히 10대~20대 남성들 사이에서는 역차별 프레임, 왜곡된 성 인식, 디지털 성범죄(딥페이크, 불법촬영물 등)가 현실로 드러나며 사회적 우려를 낳고 있다.</p>`,
            `<p>이러한 상황 속에서 K-MEN은 남성을 방관자도 피해자도 아닌, 성찰하고 변화할 수 있는 주체로 세우기 위해 출범했다. 이는 성평등을 여성만의 과제로 한정하는 기존 담론을 넘어, 남성성 그 자체를 재정의하고, 함께 책임지는 연대의 언어를 복원하려는 시도다.</p>`,
            `<h3>K-MEN의 비전과 실천</h3>`,
            `<p>K-MEN은 지난 1월과 5월 네트워크단체 회원들이 모여 워크숍을 가지고 다음과 같은 비전과 미션, 가치를 만들었다.</p>`,
            `<ul>`,
            `<li><strong>비전:</strong> 전환적 남성성 정립을 통한 젠더 정의 실현</li>`,
            `<li><strong>미션:</strong> 남성과 소년을 성평등의 주체로 초대 / 성평등을 실천하는 국내외 단체들과의 연대 및 네트워크 구축</li>`,
            `<li><strong>핵심가치:</strong> 존중, 평등, 자기성찰, 변화, 연대</li>`,
            `</ul>`,
            `<h3>발족식 행사 개요</h3>`,
            `<ul>`,
            `<li><strong>일시:</strong> 2025년 7월 9일(수) 19:00~21:00</li>`,
            `<li><strong>장소:</strong> 서울가족플라자 스페이스살림 (대방역 3번 출구)</li>`,
            `</ul>`,
            `<p><strong>1부 – 발족식</strong></p>`,
            `<ul>`,
            `<li>오프닝 영상 – "내가 생각하는 K-MEN"</li>`,
            `<li>K-MEN, 출발하다 – 단체소개 및 비전 (황금명륜, 젠더교육플랫폼효재 국제협력사업단장)</li>`,
            `<li>축사 – MenEngage 글로벌 멤버(Jens van Tricht, 네덜란드 Emancipator 대표) 및 국내 인사</li>`,
            `</ul>`,
            `<p><strong>2부 – 발족기념 토크쇼 "K-MEN을 말하다"</strong></p>`,
            `<ul>`,
            `<li>진행: 이한 (남성과 함께하는 페미니즘)</li>`,
            `<li>패널: 고상균 (남다른 성교육 연구소), 이호 (페미니즘 동아리 도전한남), 안희제 (『증명과 변명』 저자), 김찬서 (아하청소년성문화센터 청소년운영위원)</li>`,
            `</ul>`,
            `<p><strong>마무리 퍼포먼스 "K-MEN을 엮다"</strong> — 손피켓 포토타임 "다시, 한국 남자 : K-MEN, 성평등으로 동행!"</p>`,
            `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
            `<h3 style="margin-bottom:1rem">문의 및 참여</h3>`,
            `<p>📧 <a href="mailto:koreamenengagenetwork@gmail.com">koreamenengagenetwork@gmail.com</a></p>`,
            `<p>💬 <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer">오픈카톡방</a></p>`,
            `</div>`,
          ].join('\n'),
        },
        {
          title: 'K-MEN 출범, 성평등 사회를 위한 \'새로운 남성성\' 연대 시작',
          content: [
            `<p><strong>— 남성성과 성평등을 함께 논하다... 다양한 세대의 공감과 실천 다짐 —</strong></p>`,
            `<p>성평등한 사회를 함께 만들어갈 한국맨엔게이지네트워크(K-MEN)가 <strong>2025년 7월 9일(화)</strong> 150여명의 시민들이 모여 서울가족플라자 다목적홀에서 공식 출범했다. K-MEN은 남성과 소년을 성평등의 동반자로 초대하고, 새로운 남성성에 대한 사회적 논의를 확산시키기 위한 협력 네트워크다.</p>`,
            `<p>출범식에는 다양한 배경의 참여자들이 함께해 성평등한 일상을 위한 고민과 실천 의지를 나눴다. '성평등은 함께 만드는 것'이라는 메시지 아래, 정체성과 관계에 대한 성찰, 그리고 변화의 가능성을 공유하는 깊은 공감의 시간이 이어졌다.</p>`,
            `<h3>성평등한 사회를 향한 K-MEN의 시작, 함께 만드는 변화의 여정</h3>`,
            `<p>발족식 시작 전, 장내에는 전 세계 각국의 맨앤게이지 회원들이 보낸 축하 메시지가 영상으로 상영되며, K-MEN의 발족에 지구적인 관심과 격려가 있음을 알 수 있었다. 본격적인 발족식 행사는 1부와 2부로 나뉘어 진행됐다.</p>`,
            `<p>1부에서는 황금명륜 공동 코디네이터가 K-MEN의 결성 배경과 비전, 함께하는 회원단체들을 소개하며 문을 열었다. K-MEN은 2024년 2월, 젠더교육플랫폼효재가 한국에서는 처음으로 맨앤게이지 글로벌 얼라이언스의 회원이 된 후, 글로벌 사무국과 국제포럼을 여는 등의 활동을 해오다가 "성평등과 남성성"에 관심을 두고 활동하는 단체들에게 한국 네트워크 결성을 제안하며 시작되었다.</p>`,
            `<p>"전환적 남성성 정립을 통해 젠더정의를 실현한다"는 비전 아래 모인 열두개 단체들은 지난 1년 간 일곱차례의 대표자 회의와 두 번의 회원 워크숍을 거치며, 단체 명칭과 미션, 회원의 약속 등에 합의하였다. 한편 K-MEN 발족을 축하하기 위해 유럽 네덜란드의 Emancipator 대표 Jens van Tricht씨가 참석해 축하인사를 했다.</p>`,
            `<h3>"남자다움에 균열을 내다." — 토크쇼 주요 발언</h3>`,
            `<p>이날 토크쇼에는 다양한 배경의 남성들이 패널로 참여해 성평등과 남성성에 관한 경험과 시각을 공유했다.</p>`,
            `<ul>`,
            `<li><strong>이호</strong>(페미니즘 동아리 '도전한남')는 "'남자다움'은 특히 성의 영역에서 강하게 작동한다"며, "성욕을 증명하지 못하면 조롱받는 왜곡된 문화가 여전히 존재한다"고 비판했다.</li>`,
            `<li><strong>안희제</strong>(『증명과 변명』 저자)는 "'한국 남자'라는 말이 부정적으로 사용될 때, 이는 남성이라는 범주 자체가 당사자들에게도 좌절로 작용하고 있음을 드러낸다"고 지적했다.</li>`,
            `<li><strong>김찬서</strong>(아하센터 청소년운영위원)는 "성평등한 관계를 만들기 위해서는 남성이 자신의 정체성을 윤리적으로 재정의해야 한다"고 강조했다.</li>`,
            `<li><strong>고상균</strong>(남다른 성교육 연구소)은 "남성을 집단적으로 대상화하거나 일반화하는 접근은 위험하다"며, "남성들이 감정을 안전하게 표현할 수 있는 환경이 마련되어야 진정한 해방이 가능하다"고 말했다.</li>`,
            `</ul>`,
            `<h3>K-MEN, 일상 속 성평등 실천을 위한 연대 이어간다</h3>`,
            `<p>참석자들은 이번 출범식을 통해 "성평등은 특정 집단의 과제가 아니라 모두가 함께 실천해야 할 사회적 과제"임을 다시금 확인했다.</p>`,
            `<p>K-MEN은 앞으로도 소년과 남성들이 자신의 정체성과 관계를 되돌아보고, 성평등한 삶을 실천할 수 있도록 교육, 캠페인, 네트워킹 등의 다양한 활동을 전개할 계획이다.</p>`,
            `<p>황금명륜 공동코디네이터는 "이번 K-MEN 출범은 소년과 남성이 성평등의 주체로 함께 설 수 있음을 보여주는 신호탄"이라며, "일상의 관계에서부터 성평등을 실천하는 남성들의 연대를 확산해 나가겠다"고 밝혔다.</p>`,
            `<div style="background:#f8fafc;border-radius:1rem;padding:1.5rem 2rem;margin-top:2.5rem">`,
            `<h3 style="margin-bottom:1rem">문의</h3>`,
            `<p style="font-size:0.875rem;color:#64748b;margin-bottom:1rem">본 보도자료에 대한 문의: 한국맨엔게이지네트워크(K-MEN) 사무국</p>`,
            `<p>📧 <a href="mailto:koreamenengagenetwork@gmail.com">koreamenengagenetwork@gmail.com</a></p>`,
            `<p>💬 <a href="https://open.kakao.com/o/g6G41tmh" target="_blank" rel="noopener noreferrer">오픈카톡방</a></p>`,
            `</div>`,
          ].join('\n'),
        },
      ];

      for (const pr of pressReleasesMigration) {
        const [existingPr] = await conn.execute<mysql.RowDataPacket[]>(
          'SELECT id FROM posts WHERE title = ? LIMIT 1',
          [pr.title]
        );
        if (existingPr.length === 0) {
          await conn.execute(
            'INSERT INTO posts (title, content, type, org_id, image_url) VALUES (?, ?, ?, ?, ?)',
            [pr.title, pr.content, 'press_release', adminId, null]
          );
          console.log(`Added press release: ${pr.title}`);
        }
      }
      }
    }

    // 보도자료 날짜 정렬: 실제 행사 날짜로 created_at 수정
    const dateFixMap: [string, string][] = [
      ['"다시, 한국 남자 — 전환적 남성성을 말하다"%', '2025-06-27 00:00:00'],
      ['K-MEN 출범, 성평등 사회를 위한%', '2025-07-10 00:00:00'],
      ["K-MEN, 성평등주간에 함께하는 '소년과 남성의 날' 선포", '2025-09-01 00:00:00'],
      ['[GOMA]%', '2025-09-01 01:00:00'],
      ['[봄돌]%', '2025-09-01 02:00:00'],
      ['[창원여성살림공동체]%', '2025-09-01 03:00:00'],
      ['[성평등위야]%', '2025-09-01 04:00:00'],
      ['[젠더교육플랫폼효재]%', '2025-09-01 05:00:00'],
    ];
    for (const [titlePattern, date] of dateFixMap) {
      await conn.execute(
        'UPDATE posts SET created_at = ? WHERE title LIKE ? AND type = ?',
        [date, titlePattern, 'press_release']
      );
    }

    console.log('Database tables initialized');
  } finally {
    conn.release();
  }
}

export default pool;
