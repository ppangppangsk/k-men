import { motion } from 'motion/react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { siteContent } from '../data/siteContent';

const stepColors = [
  { bg: 'bg-kmen-green/10', text: 'text-kmen-green', border: 'border-kmen-green/20' },
  { bg: 'bg-kmen-orange/10', text: 'text-kmen-orange', border: 'border-kmen-orange/20' },
  { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
];

function renderLineWithLinks(line: string) {
  const parts = line.split(/(https?:\/\/\S+|[\w.+-]+@[\w-]+\.[\w.-]+)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-kmen-orange underline break-all"
        >
          {part}
        </a>
      );
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="text-kmen-orange underline break-all">
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Join() {
  const { join } = siteContent;

  return (
    <>
      <section className="pt-32 pb-10 md:pt-44 md:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SectionTitle
              title={join.title}
              subtitle={join.description}
              center={false}
            />
          </motion.div>
        </div>
      </section>

      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {join.steps.map((step, idx) => {
              const colors = stepColors[idx] || stepColors[0];
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 h-full" hover gradientBar>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 ${colors.bg} ${colors.text} rounded-full flex items-center justify-center font-bold text-lg border ${colors.border}`}>
                        {idx + 1}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">{step.title}</h3>
                    </div>
                    {'lines' in step && step.lines ? (
                      <div className="space-y-3 text-slate-600 leading-relaxed break-keep">
                        {step.lines.map((line, i) => {
                          if (typeof line === 'string') {
                            return <p key={i}>{renderLineWithLinks(line)}</p>;
                          }
                          if (line.href.startsWith('http')) {
                            return (
                              <a
                                key={i}
                                href={line.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-kmen-orange text-white font-semibold hover:bg-kmen-orange/90 transition-colors"
                              >
                                {line.label}
                                <ArrowRight className="w-4 h-4" />
                              </a>
                            );
                          }
                          return (
                            <div key={i}>
                              <Button to={line.href} variant="primary" size="md">
                                {line.label}
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-600 leading-relaxed break-keep">{step.content}</p>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-kmen-cream rounded-[2rem] p-10 md:p-14"
          >
            <h3 className="text-2xl font-bold text-slate-900 mb-6">회원 단체가 되면</h3>
            <ul className="space-y-4">
              {[
                'K-MEN 네트워크 행사 및 세미나 참여',
                'MenEngage Alliance 글로벌 네트워크 연결',
                '공동 연구 및 프로젝트 협업 기회',
                '소식 및 행사 정보 게시 권한',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-kmen-green mt-0.5 shrink-0" />
                  <span className="break-keep">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>
    </>
  );
}
