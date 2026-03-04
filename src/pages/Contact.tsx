import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Lock, MessageSquare, CheckCircle, HelpCircle, Phone } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { siteContent } from '../data/siteContent';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import type { FAQ, QnA } from '../types';

type Tab = 'faq' | 'qna' | 'contact';

export default function Contact() {
  const { contact } = siteContent;
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'faq';
  const [tab, setTab] = useState<Tab>(initialTab);

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [qnas, setQnas] = useState<QnA[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [faqData, qnaData] = await Promise.all([
        api.faq.getAll(),
        api.qna.getAll(),
      ]);
      setFaqs(faqData);
      setQnas(qnaData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setSearchParams(newTab === 'faq' ? {} : { tab: newTab });
  };

  const tabs = [
    { key: 'faq' as Tab, icon: HelpCircle, label: 'FAQ' },
    { key: 'qna' as Tab, icon: MessageSquare, label: 'Q&A' },
    { key: 'contact' as Tab, icon: Phone, label: '연락처' },
  ];

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle title="문의하기" subtitle="FAQ, Q&A 게시판, 또는 직접 연락을 통해 문의해주세요." />

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-slate-200 justify-center">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-kmen-orange text-kmen-orange'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">불러오는 중...</div>
          ) : tab === 'faq' ? (
            <FAQTab faqs={faqs} openId={openFaqId} onToggle={(id) => setOpenFaqId(openFaqId === id ? null : id)} />
          ) : tab === 'qna' ? (
            <QnATab qnas={qnas} isAdmin={isAdmin} />
          ) : (
            <ContactTab contact={contact} />
          )}
        </motion.div>
      </div>
    </section>
  );
}

/* ===== FAQ Tab ===== */
function FAQTab({ faqs, openId, onToggle }: { faqs: FAQ[]; openId: number | null; onToggle: (id: number) => void }) {
  if (faqs.length === 0) {
    return (
      <div className="text-center py-20">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-400">등록된 FAQ가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-3">
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <button
            onClick={() => onToggle(faq.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="text-kmen-orange font-bold text-sm mt-0.5">Q</span>
              <span className="font-medium text-slate-900 text-sm">{faq.question}</span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 shrink-0 ml-4 transition-transform duration-200 ${
                openId === faq.id ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {openId === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-4 border-t border-slate-100">
                  <div className="flex items-start gap-3 pt-4">
                    <span className="text-kmen-green font-bold text-sm mt-0.5">A</span>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ===== Q&A Tab ===== */
function QnATab({ qnas, isAdmin }: { qnas: QnA[]; isAdmin: boolean }) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Write button */}
      <div className="flex justify-end mb-4">
        <Link
          to="/qna/write"
          className="flex items-center gap-2 px-5 py-2.5 bg-kmen-orange text-white rounded-full text-sm font-medium hover:bg-[#D47A28] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          질문하기
        </Link>
      </div>

      {qnas.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400">등록된 Q&A가 없습니다.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_100px_100px_80px] gap-2 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
            <span>제목</span>
            <span className="text-center">작성자</span>
            <span className="text-center">날짜</span>
            <span className="text-center">상태</span>
          </div>
          {/* Rows */}
          {qnas.map((qna) => (
            <Link
              key={qna.id}
              to={`/qna/${qna.id}`}
              className="grid grid-cols-[1fr_100px_100px_80px] gap-2 px-6 py-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors items-center"
            >
              <div className="flex items-center gap-2 min-w-0">
                {qna.is_private && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                <span className={`text-sm truncate ${qna.is_private && !isAdmin ? 'text-slate-400' : 'text-slate-900'}`}>
                  {qna.title}
                </span>
              </div>
              <span className="text-xs text-slate-500 text-center truncate">{qna.author_name}</span>
              <span className="text-xs text-slate-400 text-center">
                {new Date(qna.created_at).toLocaleDateString('ko-KR')}
              </span>
              <span className="text-center">
                {qna.answer ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    답변
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                    대기
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Contact Tab ===== */
function ContactTab({ contact }: { contact: typeof siteContent.contact }) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg, #E8882F, #D47A28)' }}>
        <div className="flex flex-wrap justify-center gap-6">
          <a
            href={`mailto:${contact.email}`}
            className="group flex flex-col items-center justify-center gap-4 p-7 px-9 bg-white/15 backdrop-blur-xl rounded-2xl hover:bg-white/25 hover:-translate-y-1 transition-all duration-300 border border-white/20 min-w-[260px]"
          >
            <span className="text-3xl">✉️</span>
            <div className="text-center">
              <div className="text-sm text-white font-bold mb-1.5">이메일</div>
              <div className="text-[13px] text-white/80 break-all">{contact.email}</div>
            </div>
          </a>

          <a
            href={contact.kakaoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center justify-center gap-4 p-7 px-9 bg-white/15 backdrop-blur-xl rounded-2xl hover:bg-white/25 hover:-translate-y-1 transition-all duration-300 border border-white/20 min-w-[260px]"
          >
            <span className="text-3xl">💬</span>
            <div className="text-center">
              <div className="text-sm text-white font-bold mb-1.5">오픈카카오톡</div>
              <div className="text-[13px] text-white/80">카카오톡 오픈채팅방 참여하기</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
