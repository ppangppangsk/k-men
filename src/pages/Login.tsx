import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Button from '../components/ui/Button';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegister) {
        await api.register(name, email, password);
        setSuccess('회원가입이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.');
        setIsRegister(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        const res = await api.login(email, password);
        login(res.token, res.organization);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center">
            {isRegister ? '단체 회원가입' : '단체 로그인'}
          </h1>
          <p className="text-slate-500 text-center mb-8">
            {isRegister
              ? '승인된 회원 단체는 소식과 행사를 직접 게시할 수 있습니다.'
              : 'K-MEN 회원 단체 계정으로 로그인하세요.'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-xl text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">단체명</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none"
                  placeholder="단체명을 입력하세요"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">이메일</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none"
                placeholder="이메일을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">비밀번호</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-colors outline-none"
                placeholder="비밀번호를 입력하세요"
                minLength={6}
              />
            </div>

            <div className="[&>button]:w-full">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? '처리 중...' : isRegister ? '회원가입' : '로그인'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
                setSuccess('');
              }}
              className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
            >
              {isRegister ? '이미 계정이 있으신가요? 로그인' : '회원가입하기'}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
