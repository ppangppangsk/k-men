import { motion } from 'motion/react';
import { Mail, MessageCircle } from 'lucide-react';
import SectionTitle from '../components/ui/SectionTitle';
import { siteContent } from '../data/siteContent';

export default function Contact() {
  const { contact } = siteContent;

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SectionTitle title={contact.title} subtitle={contact.description} />
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.a
            href={`mailto:${contact.email}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group flex flex-col items-center justify-center gap-6 p-10 bg-violet-50 rounded-[2rem] hover:bg-violet-100 transition-all duration-300 border border-violet-100"
          >
            <div className="w-20 h-20 bg-violet-200 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-10 h-10 text-violet-600" />
            </div>
            <div className="text-center">
              <div className="text-violet-500 font-medium mb-2">이메일 문의</div>
              <div className="text-lg font-bold text-slate-900 break-all">{contact.email}</div>
            </div>
          </motion.a>

          <motion.a
            href={contact.kakaoLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="group flex flex-col items-center justify-center gap-6 p-10 bg-[#FEE500]/10 rounded-[2rem] hover:bg-[#FEE500]/20 transition-all duration-300 border border-[#FEE500]/30"
          >
            <div className="w-20 h-20 bg-[#FEE500] text-black rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div className="text-center">
              <div className="text-amber-600 font-medium mb-2">오픈카톡방 참여</div>
              <div className="text-lg font-bold text-slate-900">K-MEN 소통방 입장하기</div>
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  );
}
