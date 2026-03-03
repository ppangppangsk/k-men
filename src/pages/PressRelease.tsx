import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Mail, MessageCircle, Globe, ExternalLink } from 'lucide-react';

const events = [
  {
    title: '성평등주간에 함께하는 \'소년과 남성의 날\' 기념 특강',
    org: 'GOMA (Gender Justice Organization for More Action, 더 많은 행동을 위한 젠더정의조직)',
    orgDesc:
      '\'젠더정의행동GOMA\'는 "성평등은 모두에게 이롭다"는 신념으로 젠더정의가 바로 서는 사회를 위해 실천하고 행동하는 사람들의 모임입니다. 국내외 모든 사람 그리고 조직들과 함께 교육, 연구, 문화운동을 통해 성평등한 지구만들기에 기여하고자 설립된 단체입니다.',
    details: [
      { label: '주제', value: '남성과 함께하는 성평등정책의 원칙과 방향 살펴보기 — 독일, 호주, 노르웨이 사례를 통해 남성들이 겪는 도전과제와 쟁점, 정책적 대안을 모색하다.' },
      { label: '강사', value: '이구경숙, 황금명론' },
      { label: '일시', value: '2025년 9월 7일(일) 저녁 7시 (줌)' },
      { label: '참가비', value: '1만원' },
      { label: '문의', value: '0308goma@gmail.com' },
    ],
  },
  {
    title: '성평등에 함께하는 \'소년과 남성의 날\' 온라인 리트릿(Retreat)',
    org: '사회적돌봄센터 봄돌',
    orgDesc:
      '"힘겨운 마음 곁에서, 함께 살아내는 법을 연습하는 곳" — 사회적돌봄센터 봄돌은 심리적 위기와 상실, 차별과 외로움 속에서 살아가는 이들과 그 곁의 사람들을 위한 회복 동행 커뮤니티입니다.',
    details: [
      { label: '주제', value: '『나의 진짜 목소리를 찾아서』' },
      { label: '일시', value: '2025년 9월 7일(일) 오후 4:00~5:30' },
      { label: '장소', value: '비대면 Zoom 온라인' },
      { label: '대상', value: '나답게 살고 싶은 누구나 (종교·성별·나이 무관)' },
      { label: '문의', value: 'bomdolcenter@gmail.com (김하나, 010-7566-7931)' },
    ],
    program: [
      '감정 알아차리기 — 내 몸과 마음의 소리에 귀 기울이기',
      '챌린지 나눔 — \'귀마 넘기\' 사전 실천 공유',
      '내 안의 목소리 탐색 — "~해야 해"라는 고정관념 살펴보기',
      '나의 마음 표현하기',
      '해방 선언식 — 억압의 목소리 찢기 & 해방 선언',
      '축복식',
      '한 줄 소감, 서로에게 응원 보내기',
    ],
  },
  {
    title: '\'소년과 남성의 날\' 기념 성평등 캠페인 진행 — 경상남도 고성군',
    org: '(사)창원여성살림공동체',
    orgDesc:
      '(사)창원여성살림공동체는 성주류화정책의 이행점검 등을 통한 정책 제안과 교육으로 성주류화가 지역공동체에 확산되어 지역공동체가 보다 안전하고 성평등한 민주 복지가 실현될 수 있도록 견인하는 목적으로 활동하는 단체입니다.',
    details: [
      { label: '주제', value: '\'평등으로 만드는 아름다움, 전환의 남성성\'' },
      { label: '장소', value: '경상남도 고성군 학교 일대' },
      { label: '대상', value: '남성 청소년' },
      { label: '일시', value: '2025년 9월 중' },
    ],
  },
  {
    title: '성평등 주간 디지털성범죄 예방 콘텐츠 Faker Chaser(페이커 체이서) 제작 발표 및 배포',
    org: '성평등위야',
    orgDesc:
      '성평등위야는 앞으로도 부산을 비롯한 울산 경남지역의 다양한 성평등 교육·홍보 활동을 통해 성평등 문화 확산을 위한 지속적인 노력을 기울일 예정이다. \'21년 4월 창립한 성평등위야는 다양성, 존중, 연대의 가치로 우리의 일상과 조직 속에 스며있는 편견과 차별을 사전에 제거하고 예방하여 구성원 모두가 행복한 성평등 공동체를 만드는 것을 목표로 활동하는 단체입니다.',
    details: [
      { label: '내용', value: '딥페이크와 관련한 현대 사회의 문제를 배경으로, 한 고등학교에서 벌어지는 긴박한 사건을 통해 집단 심리, 정보 윤리, 그리고 개개인의 선택이 가진 힘을 조명하는 숏츠(shorts) 시리즈 10여편 제작' },
    ],
    link: { label: '자료 배포', url: 'https://www.weahgender.org/' },
  },
  {
    title: '\'소년과 남성의 날\' 기념 『Boys Don\'t Cry』 소개 카드뉴스 배포',
    org: '젠더교육플랫폼효재',
    orgDesc:
      '젠더교육플랫폼효재는 한국사회에 여성학을 처음 소개하면서 세상의 절반인 여성을 민주화와 평화통일의 주체로 세우고자 헌신하신 (고) 이이효재선생님의 창립정신을 계승하면서, 나아가 여성 개인을 넘어 사회전체의 성평등한 인식과 행동변화를 목표로 성평등 교육과 연구를 지원하는 비영리사단법인입니다.',
    details: [
      { label: '내용', value: '캐나다의 공익광고 \'Boys Don\'t Cry\' 영상을 한국어 자막과 함께 공개하고, 교육 현장에서 활용할 수 있는 카드뉴스 4장 제작·배포. \'남자는 울면 안 돼\'와 같은 고정관념이 개인과 사회에 끼치는 해로운 영향을 조명합니다.' },
    ],
    link: { label: '영상 보기 (YouTube)', url: 'https://youtu.be/fjo-hwAKcas' },
  },
];

export default function PressRelease() {
  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[800px] mx-auto">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back link */}
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-violet-600 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            자료실로 돌아가기
          </Link>

          {/* Header */}
          <header className="mb-10">
            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-medium mb-4">
              보도자료
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
              K-MEN, 성평등주간에 함께하는
              <br />
              '소년과 남성의 날' 선포
            </h1>
            <p className="text-lg text-violet-600 font-medium mb-4">
              — 성평등 사회를 향한 소년과 남성의 새로운 동행 —
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                2025년 9월 5일 (금)
              </span>
              <span>한국맨엔게이지네트워크(K-MEN)</span>
            </div>
          </header>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-violet-500 via-pink-500 via-amber-400 to-teal-400 mb-10" />

          {/* Body */}
          <div className="prose-article space-y-6 text-slate-700 leading-relaxed">
            <p>
              '한국맨엔게이지네트워크(K-MEN)'은 소년과 남성을 성평등의 주체로 초대하고, 새로운 남성성을 통해 성평등한 사회를 만들어가는 글로벌 네트워크로,{' '}
              <strong>2025년 7월 9일</strong> 국내 12개 단체가 모여 공식 출범식을 가졌다. 이어{' '}
              <strong>'K-MEN'</strong>은 소년과 남성이 성평등의 주체로 나아가기 위해, 양성평등주간의 일요일인{' '}
              <strong>2025년 9월 7일</strong>을 <strong>'소년과 남성의 날'</strong>로 선포하고자 한다.
            </p>

            <p>
              'K-MEN'을 함께 결성하고 있는 국내 12개 단체는 &lt;성평등주간에 함께하는 '소년과 남성의 날' 기념 특강&gt;을 비롯해 온라인 리트릿(retreat) 및 성평등 캠페인 등 다양한 콘텐츠와 캠페인 활동을 준비해 '소년과 남성의 날'을 기념하고자 한다.
            </p>

            <p>
              'K-MEN'은 이번 '소년과 남성의 날' 선포를 통해, 소년과 남성들이 성평등의 동반자이자 주체로서 스스로의 마음을 살피고, 나답게 살 수 있는 용기를 얻으며, 돌봄과 연대를 실천하고, 미래를 이야기하는 날을 만들고자 한다.
            </p>

            {/* 취지문 */}
            <div className="bg-violet-50 rounded-2xl p-6 md:p-8 my-8">
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                [취지문] 성평등주간에 함께하는 '소년과 남성의 날'
              </h2>

              <div className="space-y-4 text-slate-700">
                <p>
                  '한국맨엔게이지네트워크(K-MEN)'은 소년과 남성을 성평등의 주체로 초대하고, 새로운 남성성을 통해 성평등한 사회를 만들어가는 글로벌 네트워크로, 2025년 7월 9일 국내 12개 단체가 모여 출범했습니다. K-MEN은 소년과 남성을 성평등의 주체로 나아가기 위해, 양성평등주간의 일요일인 2025년 9월 7일에 '소년과 남성의 날'을 선포하고자 합니다.
                </p>

                <p>
                  양성평등주간은 1898년 한국 최초의 여성 인권 선언문인 '여권통문'이 발표된 날을 기념하는 뜻깊은 주간으로, 1996년 여성주간으로 시작해 2015년 양성평등주간으로 확대 시행되어 올해로 제30회를 맞이했습니다. 그간 여권통문의 정신을 계승하며 여성의 권리 신장을 위한 노력을 넘어 남녀가 함께 성평등한 사회를 이루겠다는 약속을 다져왔습니다. 성평등은 모두의 과제이자 공동의 책임이기 때문입니다.
                </p>

                <p>
                  그러나 여전히 성평등은 여성의 몫이었습니다. 남성은 지지자의 위치에 머물거나, 때로는 성평등을 대립의 구도로 만들며 권리를 주장하였습니다. 이는 성불평등의 해결책이 되지 못했고, 남성의 삶을 변화시킬 대안을 만들어내지 못했습니다. 끊임없는 경쟁 속에서 스스로의 쓸모를 증명해야 한다는 두려움과 좌절은 남성에게 강요된 '남자다움'의 굴레 속에서 스스로를 고립하게 만들거나 조롱과 혐오가 만연한 유해한 남성성으로 귀결되었습니다. 이제는 이러한 현실을 넘어서 대안을 찾아야 합니다.
                </p>

                <p>
                  이를 넘어서려는 남성들이 있습니다. 성평등한 사회를 만들기 위해 페미니즘을 공부하고, 젠더기반폭력에 맞서며, 사회적 약자와 연대하는 길을 선택한 사람들이었습니다. 그리고 그 곁에는 이들과 함께한 동료들이 있었습니다. 서로 일상을 나누고, 아픔을 공유하며, 돌봄을 실천하는 과정에서 남성의 삶을 새롭게 재정립하며 대안을 만들어 나갔습니다. 대단하지는 않지만 희망을 보았습니다. 그리고 그 희망은 현재 진행 중입니다.
                </p>

                <p>
                  K-MEN은 이번 '소년과 남성의 날' 선포를 통해, 소년과 남성들이 성평등의 동반자이자 주체로서 스스로의 마음을 살피고, 나답게 살 수 있는 용기를 얻으며, 돌봄과 연대를 실천하고, 미래를 이야기하는 날을 만들고자 합니다. 오늘 우리는 새로운 전환의 출발에 서 있습니다. 각 단체가 준비한 행사에 참여를 통해 이 여정을 함께 만들어 주시기를 바랍니다.
                </p>
              </div>
            </div>

            {/* Events */}
            <h2 className="text-2xl font-bold text-slate-900 pt-4">
              단체별 행사 및 캠페인 안내
            </h2>

            <div className="space-y-8">
              {events.map((event, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8"
                >
                  <h3 className="text-lg font-bold text-slate-900 mb-4 leading-snug">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-5">
                    {event.details.map((d) => (
                      <div key={d.label} className="flex gap-3 text-sm">
                        <span className="shrink-0 w-14 font-medium text-slate-500">{d.label}</span>
                        <span className="text-slate-700">{d.value}</span>
                      </div>
                    ))}
                  </div>

                  {event.program && (
                    <div className="mb-5">
                      <p className="text-sm font-medium text-slate-500 mb-2">프로그램 구성</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700">
                        {event.program.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {event.link && (
                    <a
                      href={event.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {event.link.label}
                    </a>
                  )}

                  {/* Org info */}
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-400 mb-1">주최 단체</p>
                    <p className="text-sm font-semibold text-slate-700">{event.org}</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{event.orgDesc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact */}
            <div className="bg-slate-50 rounded-2xl p-6 md:p-8 mt-10">
              <h2 className="text-lg font-bold text-slate-900 mb-4">문의</h2>
              <p className="text-sm text-slate-500 mb-4">
                본 보도자료에 대한 문의: 한국맨엔게이지네트워크(K-MEN) 사무국
              </p>
              <div className="space-y-3">
                <a
                  href="mailto:koreamenengagenetwork@gmail.com"
                  className="flex items-center gap-3 text-sm text-slate-700 hover:text-violet-600 transition-colors"
                >
                  <Mail className="w-4 h-4 text-slate-400" />
                  koreamenengagenetwork@gmail.com
                </a>
                <a
                  href="https://open.kakao.com/o/g6G41tmh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-700 hover:text-violet-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-slate-400" />
                  오픈카톡방
                </a>
                <a
                  href="https://bit.ly/45QrG2D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-700 hover:text-violet-600 transition-colors"
                >
                  <Globe className="w-4 h-4 text-slate-400" />
                  가입 및 소개
                </a>
              </div>
            </div>

            {/* PDF Download */}
            <div className="text-center mt-8">
              <a
                href="/assets/press-release.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-full text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                원본 PDF 다운로드
              </a>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
