import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Activities from './pages/Activities';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import Contact from './pages/Contact';
import Join from './pages/Join';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardNewPost from './pages/DashboardNewPost';
import Admin from './pages/Admin';
import Resources from './pages/Resources';
import PressReleases from './pages/PressReleases';
import PressReleaseDetail from './pages/PressReleaseDetail';
import QnAWrite from './pages/QnAWrite';
import QnADetail from './pages/QnADetail';
import Notice from './pages/Notice';
import NoticeDetail from './pages/NoticeDetail';
import DocumentDetail from './pages/DocumentDetail';
import MemberActivityDetail from './pages/MemberActivityDetail';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/join" element={<Join />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/new" element={<DashboardNewPost />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/qna/write" element={<QnAWrite />} />
            <Route path="/qna/:id" element={<QnADetail />} />
            <Route path="/press-release" element={<PressReleases />} />
            <Route path="/press-release/:id" element={<PressReleaseDetail />} />
            <Route path="/notice" element={<Notice />} />
            <Route path="/notice/:id" element={<NoticeDetail />} />
            <Route path="/resources/document/:id" element={<DocumentDetail />} />
            <Route path="/activities/member/:id" element={<MemberActivityDetail />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
