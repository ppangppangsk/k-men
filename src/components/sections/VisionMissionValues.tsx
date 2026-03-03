import { motion } from 'motion/react';
import { Globe, Users, MessageCircle } from 'lucide-react';
import { siteContent } from '../../data/siteContent';

export default function VisionMissionValues() {
  const { vision, mission, values } = siteContent;

  return (
    <section className="py-24 bg-violet-50/50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-violet-600 text-white p-10 rounded-[2rem] shadow-lg flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-xl">
                <Globe className="w-6 h-6" />
              </span>
              {vision.title}
            </h3>
            <p className="text-xl leading-relaxed font-semibold break-keep">{vision.content}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-rose-500 text-white p-10 rounded-[2rem] shadow-lg flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-xl">
                <Users className="w-6 h-6" />
              </span>
              {mission.title}
            </h3>
            <ul className="space-y-4 text-lg font-semibold break-keep">
              {mission.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-amber-500 text-white p-10 rounded-[2rem] shadow-lg md:col-span-3 lg:col-span-1 flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-white/20 rounded-xl">
                <MessageCircle className="w-6 h-6" />
              </span>
              {values.title}
            </h3>
            <p className="text-lg leading-relaxed font-semibold break-keep">
              {values.content}
              <br />
              <strong className="font-extrabold text-xl mt-2 block">
                {values.items.join(' · ')}
              </strong>
              의 가치를 실천합니다.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
