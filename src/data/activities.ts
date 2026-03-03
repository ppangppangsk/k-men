import type { Activity } from '../types';

export const activities: Activity[] = [
  {
    id: 'education',
    title: '교육과 연구',
    description: '소년과 남성을 성평등의 주체로 초대하는 교육 프로그램과 연구를 수행합니다.',
    icon: 'BookOpen',
    color: 'teal',
    details: [
      '전환적 남성성 교육 프로그램 개발 및 운영',
      '성평등 인식 개선을 위한 연구 및 조사',
      '교육자 양성 워크숍 및 세미나',
      '교육 자료 및 가이드라인 제작',
    ],
  },
  {
    id: 'network',
    title: '네트워크 구축',
    description: '성평등을 지향하는 모두와 연대하고 국내외 네트워크를 구축합니다.',
    icon: 'Network',
    color: 'sky',
    details: [
      'MenEngage Alliance 글로벌 네트워크 참여',
      '국내 시민사회단체 간 협력 강화',
      '아시아-태평양 지역 네트워크 교류',
      '국제 컨퍼런스 및 심포지엄 참가',
    ],
  },
  {
    id: 'advocacy',
    title: '정책 제안과 캠페인',
    description: '젠더 정의 실현을 위한 정책 제안과 사회적 인식 캠페인을 진행합니다.',
    icon: 'Megaphone',
    color: 'fuchsia',
    details: [
      '성평등 관련 정책 연구 및 제안',
      '사회적 인식 개선 캠페인 기획 및 실행',
      '젠더 폭력 예방 활동',
      '남성의 돌봄 참여 촉진 캠페인',
    ],
  },
];
