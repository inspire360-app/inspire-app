import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Users, 
  Award, 
  BarChart2, 
  CheckCircle, 
  Play, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  AlertTriangle,
  Lightbulb,
  Target,
  Shield,
  Search,
  Save,
  Download,
  ExternalLink,
  User,
  Lock,
  Flag,
  ClipboardCheck,
  Video,
  Activity,
  MessageSquare,
  LayoutDashboard,
  Printer,
  MousePointer,
  HelpCircle,
  Sparkles,
  Bot,
  ArrowLeft,
  Image as ImageIcon,
  Check,
  Eye,
  EyeOff,
  UploadCloud,
  Folder,
  ArrowRight,
  Edit3,
  Map,
  Rocket,
  Zap,
  Mic,
  Share2,
  Cpu,
  RefreshCw,
  FileCheck,
  Clock,
  Calendar,
  TrendingUp,
  Star
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithCustomToken,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot
} from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Gemini API Configuration ---
const apiKey = ""; // API Key provided by environment

const callGeminiAPI = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "ไม่สามารถสร้างคำตอบได้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `[AI Mock Response]: จากข้อมูล ${prompt.substring(0, 30)}... ขอเสนอแนวทางกลยุทธ์: "พัฒนาศักยภาพบุคลากรเชิงรุกผ่านชุมชนการเรียนรู้ทางวิชาชีพ (PLC) เพื่อยกระดับผลสัมฤทธิ์ทางการเรียน"`;
  }
};

// --- Data Models & Constants ---

const COURSE_INFO = {
  id: 'c1',
  title: 'From Insight to Impact: การขับเคลื่อนนโยบายสู่การปฏิบัติด้วยข้อมูลเชิงลึก',
  subtitle: 'เพื่อยกระดับคุณภาพการศึกษาอย่างรอบด้าน',
  instructor: 'Dr.Sweetchaporn Chanilgul & AI Leader Team',
  description: 'หลักสูตรที่จะพาคุณเจาะลึกปัญหา ค้นหา Insight และสร้างนวัตกรรมเพื่อการศึกษา',
  modules: [
    { id: 'm1', title: 'Module 1: In-Sight', desc: 'วิเคราะห์ปัญหาและเป้าหมาย', badge: 'In-Sight Card' },
    { id: 'm2', title: 'Module 2: S-Design', desc: 'ออกแบบ Roadmap', badge: 'Dream-Maker Card' },
    { id: 'm3', title: 'Module 3: P-Participation', desc: 'สร้างเครือข่าย', badge: 'Network Builder Card' },
    { id: 'm4', title: 'Module 4: I-Innovation', desc: 'สร้างต้นแบบนวัตกรรม', badge: 'Innovation Spark Card' },
    { id: 'm5', title: 'Module 5: RE-Reflection', desc: 'สะท้อนผล', badge: 'Master Teacher Card' },
  ]
};

const NINE_DIMENSIONS = [
  { id: 1, title: 'Man (บุคลากร)', question: 'ครูและบุคลากรของเรามีจำนวนเพียงพอหรือไม่? มีทักษะความเชี่ยวชาญตรงกับงานหรือไม่?' },
  { id: 2, title: 'Money & Budget (งบประมาณ)', question: 'การจัดสรรงบประมาณคล่องตัวและตรงจุดหรือไม่? มีแหล่งเงินทุนอื่นหรือไม่?' },
  { id: 3, title: 'Management (การบริหาร)', question: 'โครงสร้างการบริหารชัดเจน รวดเร็ว หรือซ้ำซ้อนล่าช้า?' },
  { id: 4, title: 'Material (อาคาร/สื่อ)', question: 'อาคารและสื่อการสอนมีความพร้อม ทันสมัย และปลอดภัยหรือไม่?' },
  { id: 5, title: 'Curriculum (หลักสูตร)', question: 'หลักสูตรทันต่อโลกและตอบโจทย์ท้องถิ่นหรือไม่? เน้น Active Learning หรือไม่?' },
  { id: 6, title: 'Student Achievement', question: 'ผลสัมฤทธิ์ (O-NET, NT) และทักษะชีวิตของเด็กเป็นอย่างไร?' },
  { id: 7, title: 'Technology', question: 'มีการนำนวัตกรรม/AI มาช่วยบริหารจัดการมากน้อยแค่ไหน? อินเทอร์เน็ตเสถียรไหม?' },
  { id: 8, title: 'Community', question: 'ผู้ปกครองและชุมชนให้ความร่วมมือในระดับใด (ผู้รับบริการ หรือ หุ้นส่วน)?' },
  { id: 9, title: 'Policy & Trend', question: 'นโยบายเอื้ออำนวยหรือไม่? แนวโน้มสังคมกระทบโรงเรียนอย่างไร?' },
];

const SWOT_TYPES = {
  S: { label: 'Strengths (จุดแข็ง)', color: 'bg-green-100 border-green-500 text-green-800' },
  W: { label: 'Weaknesses (จุดอ่อน)', color: 'bg-red-100 border-red-500 text-red-800' },
  O: { label: 'Opportunities (โอกาส)', color: 'bg-blue-100 border-blue-500 text-blue-800' },
  T: { label: 'Threats (อุปสรรค)', color: 'bg-yellow-100 border-yellow-500 text-yellow-800' },
};

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, icon: Icon, type='button', loading = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg hover:scale-[1.02]",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    success: "bg-green-600 text-white hover:bg-green-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    link: "bg-transparent text-blue-600 hover:underline p-0 justify-start",
    ai: "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : (Icon && <Icon size={18} />)}
      {children}
    </button>
  );
};

const Card = ({ children, className = '', title, headerAction }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
    {title && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <div className="font-semibold text-lg text-gray-800">{title}</div>
            {headerAction}
        </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Badge = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [view, setView] = useState('landing'); 
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  
  // Auth & Init
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
        } else {
            if (!auth.currentUser) {
                await signInAnonymously(auth); 
            }
        }
      } catch (err) {
          console.error("Auth init error:", err);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (!currentUser.isAnonymous) {
            try {
                const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
                const snap = await getDoc(userRef);
                if (snap.exists()) {
                  setUserData(snap.data());
                }
            } catch(e) { console.error(e); }
        }
        
        if (view === 'landing' || view === 'login' || view === 'register') {
           setView('dashboard');
        }
      } else {
        setUserData(null);
        setView('landing');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const navigate = (target) => {
      setView(target);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSignOut = async () => {
      try {
          await signOut(auth);
          setUser(null);
          setUserData(null);
          setView('landing');
      } catch (error) {
          console.error("Sign out error", error);
      }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  // --- Layout Selection ---
  
  if (user) {
    return (
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
        {isSidebarOpen && (
             <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        <aside className={`
            fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            <div className="h-16 flex items-center px-6 border-b border-slate-700 bg-slate-950">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg flex-shrink-0">I</div>
                <span className="font-bold text-lg text-white tracking-tight">InSPIRE 360°</span>
            </div>

            <div className="p-4 border-b border-slate-800 bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-slate-700">
                        {userData?.firstName?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{userData?.firstName || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate">{userData?.role === 'admin' ? 'DU Administrator' : 'Teacher'}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => navigate('dashboard')} />
                <SidebarItem icon={BookOpen} label="My Course" active={view === 'course'} onClick={() => navigate('course')} />
                
                {userData?.role === 'admin' && (
                    <>
                        <div className="mt-6 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Administration</div>
                        <SidebarItem icon={Shield} label="DU Command Center" active={view === 'admin'} onClick={() => navigate('admin')} className="text-red-400 hover:text-red-300 hover:bg-red-900/20" />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-slate-800">
                 <button onClick={handleSignOut} className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-950/30 transition-colors">
                    <LogOut size={18} className="mr-3" /> Sign Out
                 </button>
            </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <header className="md:hidden bg-white shadow-sm h-16 flex items-center px-4 justify-between z-30 flex-shrink-0">
                 <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600"><Menu size={24} /></button>
                 <span className="font-bold text-gray-800">InSPIRE 360°</span>
                 <div className="w-6"></div>
            </header>

            <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 scroll-smooth">
                {view === 'dashboard' && <StudentDashboard navigate={navigate} user={user} userData={userData} />}
                {view === 'course' && <CoursePlayer navigate={navigate} user={user} userData={userData} />}
                {view === 'admin' && <AdminPortal navigate={navigate} user={user} />}
            </main>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
        <main>
            {view === 'landing' && <LandingPage navigate={navigate} />}
            {view === 'login' && <AuthPage type="login" navigate={navigate} />}
            {view === 'register' && <AuthPage type="register" navigate={navigate} />}
        </main>
      </div>
  );
}

const SidebarItem = ({ icon: Icon, label, active, onClick, className = '' }) => (
    <div onClick={onClick} className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 mb-1 ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'} ${className}`}>
        <Icon size={20} className={`mr-3 ${active ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
        {label}
        {active && <ChevronRight size={16} className="ml-auto opacity-50" />}
    </div>
);

// --- Pages ---

function LandingPage({ navigate }) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center font-sans text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
            <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-purple-600/10 rounded-full blur-[100px] animate-bounce duration-[20s]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center flex flex-col items-center justify-center h-full py-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-1000 ring-1 ring-white/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-xs font-semibold text-cyan-300 tracking-widest uppercase">Education Reform 2026</span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-none mb-8 drop-shadow-2xl animate-in zoom-in duration-1000">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-400">
                    InSPIRE 360°
                </span>
            </h1>
            
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 mb-12 tracking-tight max-w-4xl leading-snug animate-in slide-in-from-bottom-4 duration-1000 delay-200">
                ปฏิรูปการศึกษาด้วยหน่วยปฏิบัติการเคลื่อนที่เร็ว (DU)
            </p>

            <div className="mt-8 p-8 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 backdrop-blur-xl shadow-2xl w-full max-w-2xl mx-auto transform hover:scale-[1.02] transition-all duration-500 group animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-center gap-4 text-base sm:text-lg text-slate-300 font-medium">
                        <Sparkles size={16} className="text-yellow-400"/>
                        <span className="group-hover:text-white transition-colors">พัฒนาโดย Dr.Sweetchaporn Chanilgul & AI Leader Team</span>
                        <Sparkles size={16} className="text-yellow-400"/>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-2"></div>
                    <p className="text-slate-400 font-light text-sm sm:text-base tracking-wide group-hover:text-slate-300 transition-colors">โรงเรียนชุมชนบ้านพบพระ จังหวัดตาก</p>
                </div>
            </div>

            <div className="mt-16 animate-in slide-in-from-bottom-12 duration-1000 delay-500">
                <button 
                    onClick={() => navigate('login')}
                    className="group relative px-10 py-4 bg-white text-slate-950 rounded-full text-lg font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(56,189,248,0.5)] transition-all duration-300 overflow-hidden"
                >
                    <span className="relative z-10 flex items-center gap-3 group-hover:gap-4 transition-all">
                        เข้าสู่ระบบ <ChevronRight size={20} className="group-hover:text-blue-600 transition-colors"/>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
            </div>

        </div>
        
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

function AuthPage({ type, navigate }) {
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', title: 'นาย', firstName: '', lastName: '', school: '', position: 'ครู' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, formData.email, formData.password);
        } else {
            if(formData.password !== formData.confirmPassword) throw new Error("รหัสผ่านไม่ตรงกัน");
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            await setDoc(doc(db, 'artifacts', appId, 'users', userCredential.user.uid, 'profile', 'data'), {
                uid: userCredential.user.uid, email: userCredential.user.email,
                role: 'teacher', // Hardcoded 'teacher' role for all new users
                firstName: formData.firstName, lastName: formData.lastName,
                school: formData.school, position: formData.position, joinedAt: new Date().toISOString()
            });
        }
        navigate('dashboard');
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[100px]"></div>

      {/* Back Button */}
      <button 
        onClick={() => navigate('landing')}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md"
      >
        <ArrowLeft size={18} />
        <span>ย้อนกลับ (Back)</span>
      </button>

      <div className="relative z-10 max-w-md w-full space-y-8 bg-white/5 p-10 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl animate-in fade-in zoom-in duration-500">
        <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{isLogin ? 'ยินดีต้อนรับกลับมา' : 'เริ่มต้นการใช้งาน'}</h2>
            <p className="mt-2 text-sm text-slate-400">InSPIRE 360° Platform</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm text-center">{error}</div>}
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="grid grid-cols-3 gap-3">
                 <select className="input-field" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}><option>นาย</option><option>นาง</option><option>นางสาว</option></select>
                 <input type="text" required placeholder="ชื่อจริง" className="col-span-2 input-field" value={formData.firstName} onChange={e=>setFormData({...formData, firstName: e.target.value})} />
               </div>
               <input type="text" required placeholder="นามสกุล" className="input-field w-full" value={formData.lastName} onChange={e=>setFormData({...formData, lastName: e.target.value})} />
               <div className="grid grid-cols-2 gap-3">
                  <select className="input-field" value={formData.position} onChange={e=>setFormData({...formData, position: e.target.value})}><option>ครู</option><option>ผู้บริหาร</option><option>ศน.</option></select>
                  <input type="text" required placeholder="โรงเรียน/สังกัด" className="input-field" value={formData.school} onChange={e=>setFormData({...formData, school: e.target.value})} />
               </div>
               {/* Role Selection Removed - Default to Teacher */}
            </div>
          )}
          <div className="space-y-3">
            <input type="email" required placeholder="อีเมล (Email)" className="input-field w-full" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
            <input type="password" required placeholder="รหัสผ่าน (Password)" className="input-field w-full" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
            {!isLogin && <input type="password" required placeholder="ยืนยันรหัสผ่าน" className="input-field w-full" value={formData.confirmPassword} onChange={e=>setFormData({...formData, confirmPassword: e.target.value})} />}
          </div>
          
          <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:scale-[1.02]">
              {isLogin ? 'เข้าสู่ระบบ' : 'ลงทะเบียน'}
          </button>
        </form>
        
        <div className="text-center mt-6">
             <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิก' : 'มีบัญชีแล้ว? เข้าสู่ระบบ'}
             </button>
        </div>
      </div>
      <style>{` 
        .input-field { 
            padding: 0.85rem 1rem; 
            border: 1px solid rgba(255,255,255,0.1); 
            border-radius: 0.75rem; 
            outline: none; 
            background: rgba(0,0,0,0.2); 
            color: white;
            transition: all 0.2s;
        }
        .input-field::placeholder { color: rgba(255,255,255,0.4); }
        .input-field:focus { 
            border-color: #3b82f6; 
            background: rgba(0,0,0,0.4);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); 
        } 
        option { background-color: #0f172a; color: white; }
      `}</style>
    </div>
  );
}

function StudentDashboard({ navigate, userData, user }) {
  const [progress, setProgress] = useState(0);
  const [moduleStatus, setModuleStatus] = useState({});
  
  useEffect(() => {
    if(!user) return;
    const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'modules', 'm1'), (doc) => {
        if(doc.exists()) {
            const data = doc.data();
            setModuleStatus(data);
            let completed = 0;
            if (data.m1_done) completed++;
            if (data.m2_done) completed++;
            if (data.m3_done) completed++;
            if (data.m4_done) completed++;
            if (data.m5_done) completed++;
            if (data.isCompleted) completed++;
            setProgress(Math.round((completed/6)*100));
        }
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header with Stats Row (World-Class) */}
      <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
              <div>
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Welcome back, {userData?.firstName || 'Teacher'} 👋</h1>
                  <p className="text-slate-500 mt-2">Ready to transform your classroom today?</p>
              </div>
              <div className="text-right hidden md:block">
                  <div className="text-3xl font-bold text-blue-600">{new Date().getDate()}</div>
                  <div className="text-sm font-medium text-slate-500 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric'})}</div>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <BookOpen className="text-blue-500 mb-2" size={24}/>
                  <div className="text-2xl font-bold text-slate-800">1</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Active Course</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <CheckCircle className="text-green-500 mb-2" size={24}/>
                  <div className="text-2xl font-bold text-slate-800">{moduleStatus.isCompleted ? '1' : '0'}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Modules Done</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <Award className="text-yellow-500 mb-2" size={24}/>
                  <div className="text-2xl font-bold text-slate-800">{moduleStatus.isCompleted ? '1' : '0'}</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Badges</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                  <Clock className="text-purple-500 mb-2" size={24}/>
                  <div className="text-2xl font-bold text-slate-800">2h</div>
                  <div className="text-xs text-slate-400 uppercase font-bold">Learning Time</div>
              </div>
          </div>
      </div>

      {/* 2. Achievement Banner (Conditional) */}
      {moduleStatus.isCompleted && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex items-center gap-6 z-10">
                   <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                       <Award size={40} className="text-yellow-300 drop-shadow-md"/>
                   </div>
                   <div>
                       <h2 className="text-2xl font-bold mb-1">Congratulations! You've unlocked Module 2</h2>
                       <p className="text-indigo-100">Your "In-Sight Badge" has been added to your profile.</p>
                   </div>
              </div>
              
              <Button onClick={() => navigate('course')} className="bg-white text-indigo-600 hover:bg-indigo-50 border-none font-bold px-8 py-3 shadow-lg z-10 whitespace-nowrap">
                  Start Module 2 <ArrowRight className="ml-2"/>
              </Button>
          </div>
      )}

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
            
            {/* Active Course Card - Enhanced */}
            <div>
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Play size={20} className="text-blue-600"/> Current Learning</h3>
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="h-56 bg-slate-200 relative overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Course" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 text-white max-w-lg">
                            <Badge color="purple" className="mb-2">Module {moduleStatus.isCompleted ? '2' : '1'} in progress</Badge>
                            <h3 className="text-2xl font-bold leading-tight">{COURSE_INFO.title}</h3>
                            <p className="text-slate-300 text-sm mt-2 line-clamp-1">{COURSE_INFO.subtitle}</p>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-3 text-sm font-medium text-slate-600">
                             <span>Course Progress</span>
                             <span className="text-blue-600">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{width: `${progress}%`}}></div>
                        </div>
                        <Button variant="primary" className="w-full py-3.5 text-lg shadow-blue-200" onClick={() => navigate('course')}>
                            {progress > 0 ? 'Continue Learning' : 'Start Course'} <ChevronRight size={20}/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Learning Path Timeline */}
            <div>
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Map size={20} className="text-indigo-600"/> Learning Path</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-slate-100"></div>
                    
                    <div className="space-y-6">
                        {COURSE_INFO.modules.map((m, i) => {
                            const isDone = (i === 0 && moduleStatus.isCompleted); 
                            const isCurrent = (i === 0 && !isDone) || (i === 1 && moduleStatus.isCompleted);
                            const isLocked = !isDone && !isCurrent;
                            
                            return (
                                <div key={i} className={`flex items-start gap-4 relative z-10 ${isLocked ? 'opacity-50' : ''}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 border-2 
                                        ${isDone ? 'bg-green-500 border-green-500 text-white' : isCurrent ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.2)]' : 'bg-white border-slate-300 text-slate-300'}`}>
                                        {isDone ? <Check size={14}/> : isCurrent ? <div className="w-2 h-2 bg-white rounded-full animate-pulse"/> : <div className="w-2 h-2 bg-slate-300 rounded-full"/>}
                                    </div>
                                    <div className={`flex-1 p-4 rounded-xl border ${isCurrent ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100'} transition-all hover:border-slate-300`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Module {i+1}</div>
                                                <h4 className={`font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-800'}`}>{m.title}</h4>
                                                <p className="text-sm text-slate-500 mt-1">{m.desc}</p>
                                            </div>
                                            {isLocked && <Lock size={16} className="text-slate-300"/>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
            {/* Mini Profile */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <div className="relative z-10 mt-8">
                    <div className="w-20 h-20 bg-white p-1 rounded-full mx-auto shadow-lg">
                         <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">
                             {userData?.firstName?.[0] || 'U'}
                         </div>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 mt-3">{userData?.firstName} {userData?.lastName}</h3>
                    <p className="text-sm text-slate-500">{userData?.school || 'School Name'}</p>
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center gap-6">
                        <div className="text-center">
                            <div className="font-bold text-slate-800">{moduleStatus.isCompleted ? '1' : '0'}</div>
                            <div className="text-[10px] text-slate-400 uppercase">Certificates</div>
                        </div>
                         <div className="text-center">
                            <div className="font-bold text-slate-800">12</div>
                            <div className="text-[10px] text-slate-400 uppercase">Points</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Collection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    <span>Your Badges</span>
                    <span className="text-xs font-normal text-blue-500 cursor-pointer">View All</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                     {/* Badge 1 */}
                     <div className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 transition-all ${moduleStatus.isCompleted ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50 border border-slate-100 opacity-50 grayscale'}`}>
                         <Award className={`${moduleStatus.isCompleted ? 'text-yellow-500' : 'text-slate-300'}`} size={28}/>
                         <span className="text-[10px] font-bold mt-2 text-center leading-tight text-slate-600">In-Sight</span>
                     </div>
                     {/* Locked Badges */}
                     {[2,3,4,5].map(i => (
                         <div key={i} className="aspect-square rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center p-2 opacity-40">
                             <Lock size={20} className="text-slate-300 mb-1"/>
                             <span className="text-[10px] font-bold text-slate-400">M{i}</span>
                         </div>
                     ))}
                </div>
            </div>

            {/* Upcoming / Calendar */}
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Calendar size={18} className="text-red-500"/> Upcoming</h3>
                 <div className="space-y-4">
                     <div className="flex gap-3">
                         <div className="bg-red-50 text-red-600 w-12 h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 font-bold border border-red-100">
                             <span className="text-[10px] uppercase">Jan</span>
                             <span className="text-lg leading-none">15</span>
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-800">Action Plan Due</h4>
                             <p className="text-xs text-slate-500">Module 1 Assignment</p>
                         </div>
                     </div>
                 </div>
             </div>

        </div>
      </div>
    </div>
  );
}

// ... existing CoursePlayer, M1Pretest, M1Intro, M1Mission1, M1Mission2, M1Mission3, M1Mission4 code ...
function CoursePlayer({ navigate, user }) {
  const [activeModule, setActiveModule] = useState('m1');
  const [activeMission, setActiveMission] = useState('pretest');
  const [moduleData, setModuleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const moduleRef = useMemo(() => {
    if(!user) return null;
    return doc(db, 'artifacts', appId, 'users', user.uid, 'modules', 'm1');
  }, [user]);

  useEffect(() => {
    if(!moduleRef) return;
    const unsub = onSnapshot(moduleRef, (doc) => {
        if(doc.exists()) { setModuleData(doc.data()); } 
        else { setDoc(moduleRef, { pretest_score: null, nineDimensions: {}, swot: { S:[], W:[], O:[], T:[] }, strategies: [], prioritizedStrategies: [], actionPlan: {}, isCompleted: false }); }
        setLoading(false);
    });
    return () => unsub();
  }, [moduleRef]);

  const updateModuleData = async (key, value) => {
      try { await setDoc(moduleRef, { [key]: value }, { merge: true }); } catch (e) { console.error(e); }
  };

  // --- Helper to check if a mission is locked ---
  const isMissionLocked = (missionId) => {
      const { pretest_score, m1_done, m2_done, m3_done, m4_done, m5_done } = moduleData;
      if (missionId !== 'pretest' && (pretest_score === null || pretest_score === undefined)) return true;
      if (missionId === 'intro') return false; 
      if (missionId === 'mission1') return false; 
      if (missionId === 'mission2') return !m1_done;
      if (missionId === 'mission3') return !m2_done;
      if (missionId === 'mission4') return !m3_done;
      if (missionId === 'mission5') return !m4_done;
      if (missionId === 'mission6') return !m5_done;
      return false;
  };

  const renderContent = () => {
     // M2, M3, M4, M5 routing (Placeholder logic for future expansion)
     if(activeModule === 'm2') {
         if (activeMission === 'm2_intro') return <M2Intro setMission={setActiveMission} />;
         if (activeMission === 'm2_dream') return <M2DreamLab />;
         return <M2Intro setMission={setActiveMission} />;
     }
     if(activeModule === 'm3') return <M3Structure />;
     if(activeModule === 'm4') return <M4Structure />;
     if(activeModule === 'm5') return <M5Structure />;
     if(activeModule === 'posttest') return <PostTestStructure />;
     
     if(activeModule !== 'm1') return <div className="p-20 text-center text-gray-500">Module นี้อยู่ระหว่างการพัฒนา (Under Development)</div>;
     
     // Enforce Lock for M1
     if(isMissionLocked(activeMission) && activeMission !== 'pretest') {
         return (
             <div className="flex flex-col items-center justify-center h-full py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><Lock size={32}/></div>
                 <h2 className="text-xl font-bold text-gray-700">Mission Locked</h2>
                 <p className="text-gray-500">กรุณาทำภารกิจก่อนหน้าให้สำเร็จก่อน</p>
                 <Button variant="secondary" onClick={() => setActiveMission('pretest')}>กลับไปจุดเริ่มต้น</Button>
             </div>
         );
     }

     switch(activeMission) {
         case 'pretest': return <M1Pretest data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'intro': return <M1Intro updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission1': return <M1Mission1 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission2': return <M1Mission2 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission3': return <M1Mission3 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission4': return <M1Mission4 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission5': return <M1Mission5 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} />;
         case 'mission6': return <M1Mission6 data={moduleData} updateData={updateModuleData} setMission={setActiveMission} user={user} goToNextModule={() => { setActiveModule('m2'); setActiveMission('m2_intro'); }} />;
         default: return <div>Select a mission</div>;
     }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className={`bg-gray-50 border-r border-gray-200 flex-shrink-0 transition-all duration-300 flex flex-col ${isMenuOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-gray-200 font-bold text-gray-700 flex justify-between items-center"><span>Course Map</span><button onClick={() => setIsMenuOpen(false)} className="md:hidden"><X size={16}/></button></div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {/* M1 */}
             <div onClick={() => { setActiveModule('m1'); setActiveMission('pretest'); }} className={`nav-item ${activeMission === 'pretest' && activeModule === 'm1' ? 'active' : ''}`}><span className="flex items-center gap-2"><ClipboardCheck size={16}/> Pre-test</span>{moduleData.pretest_score !== null && <CheckCircle size={14} className="text-green-500"/>}</div>
             <div className="mt-4 px-3 text-xs font-bold text-gray-400 uppercase">Module 1: In-Sight</div>
             <div className="space-y-1 mt-1 pl-2">
                {[{id: 'intro', label: 'Overview'}, {id: 'mission1', label: 'M1: 9 Dimensions'}, {id: 'mission2', label: 'M2: SWOT Visualizer'}, {id: 'mission3', label: 'M3: Strategy Fusion'}, {id: 'mission4', label: 'M4: Needs Detective'}, {id: 'mission5', label: 'M5: Action Plan'}, {id: 'mission6', label: 'M6: Report & Badge'}].map(item => {
                    const isLocked = isMissionLocked(item.id);
                    return (
                    <div key={item.id} onClick={() => !isLocked && setActiveModule('m1') & setActiveMission(item.id)} className={`nav-item ${activeMission === item.id && activeModule === 'm1' ? 'active' : ''} ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className="truncate flex items-center gap-2">{isLocked && <Lock size={12}/>} {item.label}</span>
                        {moduleData[`m${item.id.replace('mission','').replace('intro','0')}_done`] && <CheckCircle size={14} className="text-green-500 flex-shrink-0"/>}
                    </div>
                )})}
             </div>
             
             {/* M2 */}
             <div className="mt-4 px-3 text-xs font-bold text-gray-400 uppercase">Module 2: S-Design</div>
             <div onClick={() => moduleData.isCompleted && setActiveModule('m2') & setActiveMission('m2_intro')} className={`nav-item ${activeModule === 'm2' && activeMission === 'm2_intro' ? 'active' : ''} ${!moduleData.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <span className="truncate flex items-center gap-2">{!moduleData.isCompleted && <Lock size={12}/>} Overview (Vision)</span>
             </div>
             <div onClick={() => moduleData.isCompleted && setActiveModule('m2') & setActiveMission('m2_dream')} className={`nav-item ${activeModule === 'm2' && activeMission === 'm2_dream' ? 'active' : ''} ${!moduleData.isCompleted ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <span className="truncate flex items-center gap-2">{!moduleData.isCompleted && <Lock size={12}/>} Dream Lab</span>
             </div>

             {/* M3-M5 & Post-test Placeholders */}
             <div className="mt-4 px-3 text-xs font-bold text-gray-400 uppercase">Next Modules</div>
             <div onClick={() => setActiveModule('m3')} className={`nav-item ${activeModule === 'm3' ? 'active' : ''}`}><span className="truncate">Module 3: P-Participation</span></div>
             <div onClick={() => setActiveModule('m4')} className={`nav-item ${activeModule === 'm4' ? 'active' : ''}`}><span className="truncate">Module 4: I-Innovation</span></div>
             <div onClick={() => setActiveModule('m5')} className={`nav-item ${activeModule === 'm5' ? 'active' : ''}`}><span className="truncate">Module 5: RE-Reflection</span></div>
             
             <div className="mt-4 pt-2 border-t border-gray-200">
                <div onClick={() => setActiveModule('posttest')} className={`nav-item ${activeModule === 'posttest' ? 'active' : ''}`}><span className="flex items-center gap-2"><FileText size={16}/> Post-test</span></div>
             </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
          <div className="h-12 border-b border-gray-100 flex items-center px-4 bg-white">{!isMenuOpen && <button onClick={() => setIsMenuOpen(true)} className="mr-3 text-gray-500"><Menu size={20}/></button>}<div className="text-sm breadcrumbs text-gray-500"><span className="hover:underline cursor-pointer" onClick={() => navigate('dashboard')}>Dashboard</span><span className="mx-2">/</span><span className="font-medium text-gray-800">{activeModule.startsWith('m') ? `Module ${activeModule.replace('m', '')}` : 'Post-test'}</span></div></div>
          <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-white relative">{loading ? <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : <div className="max-w-4xl mx-auto animate-in fade-in duration-500">{renderContent()}</div>}</div>
      </div>
      <style>{` .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; border-radius: 0.375rem; font-size: 0.875rem; color: #4b5563; cursor: pointer; transition: all 0.2s; } .nav-item:hover { background-color: #f3f4f6; } .nav-item.active { background-color: #eff6ff; color: #1d4ed8; font-weight: 500; } `}</style>
    </div>
  );
}

// ... (M1Pretest, M1Intro, M1Mission1, M1Mission2, M1Mission3, M1Mission4 SAME AS BEFORE) ...

const M1Pretest = ({ data, updateData, setMission }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(data?.pretest_score || null);
    
    // Mock Questions
    const questions = [
        { q: "หัวใจสำคัญของ In-Sight คืออะไร?", options: ["การมองเห็นปัญหา", "การวิเคราะห์ข้อมูลเชิงลึก", "การสร้างนวัตกรรม", "การทำงานเป็นทีม"], ans: 1 },
        { q: "ข้อใดไม่ใช่ 3Rs?", options: ["Reading", "Writing", "Running", "Rithmetics"], ans: 2 },
        { q: "SWOT Analysis ส่วนใดคือปัจจัยภายใน?", options: ["O, T", "S, W", "S, O", "W, T"], ans: 1 },
        { q: "ข้อใดคือเป้าหมายของ DU?", options: ["ตรวจสอบ", "จับผิด", "สนับสนุนและช่วยเหลือ", "สั่งการ"], ans: 2 },
        { q: "Red Flag หมายถึงอะไร?", options: ["ธงสีแดง", "สัญญาณเตือนภัยเร่งด่วน", "ความสำเร็จ", "เป้าหมาย"], ans: 1 },
    ];

    const handleAnswer = (idx) => {
        setSelected(idx);
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(currentQ + 1);
                setSelected(null);
            } else {
                const finalScore = Math.floor(Math.random() * 20) + 80; 
                setScore(finalScore);
                updateData('pretest_score', finalScore);
            }
        }, 500);
    };

    if (score !== null) {
        return (
            <div className="text-center space-y-6 py-20 animate-in zoom-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600"><CheckCircle size={48} /></div>
                <h2 className="text-3xl font-bold text-gray-900">Pre-test Completed!</h2>
                <div className="text-5xl font-bold text-blue-600">{score}<span className="text-lg text-gray-400">/100</span></div>
                <Button onClick={() => setMission('intro')} className="px-8 mt-6">เข้าสู่บทเรียน (Start Learning) <ChevronRight size={16}/></Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Pre-test: ข้อที่ {currentQ + 1}/{questions.length}</h2>
                <span className="text-sm text-gray-500">เลือกคำตอบที่ถูกต้องที่สุด</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <h3 className="text-xl font-medium mb-6 text-gray-800">{questions[currentQ].q}</h3>
                <div className="space-y-3">
                    {questions[currentQ].options.map((opt, i) => (
                        <button key={i} onClick={() => handleAnswer(i)} 
                            className={`w-full p-4 text-left rounded-xl border transition-all ${selected === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'}`}>
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const M1Intro = ({ setMission }) => (
    <div className="space-y-8 animate-in fade-in">
        <div>
            <h2 className="text-3xl font-bold text-gray-900">Module 1: In-Sight</h2>
            <p className="text-gray-600 text-lg mt-2">วิเคราะห์ปัญหาและเป้าหมายของตนเอง เพื่อรับ In-Sight Card</p>
        </div>
        
        {/* Video Section */}
        <div className="aspect-video bg-slate-900 rounded-2xl flex items-center justify-center text-white relative group overflow-hidden shadow-xl">
             <Play size={64} className="opacity-80 group-hover:scale-110 transition-transform duration-300 relative z-10"/>
             <span className="absolute bottom-6 left-6 font-medium relative z-10">Video: Introduction to In-Sight Analysis</span>
        </div>

        {/* Added: Blockdit Embed */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen size={18} className="text-blue-600"/> 
                    บทความเรียนรู้เพิ่มเติม (Overview)
                </h3>
                <a href="https://www.blockdit.com/posts/695e01a8bfc99487b4c7282e" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                    เปิดใน Blockdit <ExternalLink size={10} className="inline"/>
                </a>
            </div>
            <div className="h-[500px] w-full bg-gray-100 relative">
                 <iframe 
                    src="https://www.blockdit.com/posts/695e01a8bfc99487b4c7282e" 
                    className="w-full h-full border-none"
                    title="Blockdit Content"
                    allowFullScreen
                 />
                 {/* Fallback overlay in case iframe is refused */}
                 <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-gray-50/50 opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-gray-500 font-medium">Click "Open in Blockdit" if content doesn't load</p>
                 </div>
            </div>
        </div>

        {/* Existing Guide Download */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><FileText size={24}/></div>
            <div>
                <h4 className="font-bold text-gray-900">In-Sight Discovery Guide</h4>
                <p className="text-sm text-gray-500 mb-3">คู่มือการเรียนรู้ประกอบโมดูล (PDF)</p>
                <Button variant="link" icon={Download}>Download Guide</Button>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button onClick={() => setMission('mission1')} className="px-6 py-3 text-lg">Start Mission 1 <ChevronRight size={20}/></Button>
        </div>
    </div>
);

const M1Mission1 = ({ data, updateData, setMission }) => {
    const [answers, setAnswers] = useState({});
    
    useEffect(() => { if(data?.nineDimensions) setAnswers(data.nineDimensions); }, [data]);

    // Validation: Check if all fields have some text
    const isComplete = Object.keys(answers).length === 9 && Object.values(answers).every(val => val && val.trim().length > 0);

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="border-b pb-6"><div className="flex items-center gap-3 mb-2"><span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Mission 1</span></div><h2 className="text-3xl font-bold text-gray-900">The 9 Dimensions</h2><p className="text-gray-500 mt-2">เจาะลึก 9 มิติ ค้นหาความจริง สู่การวางแผนที่ยั่งยืน</p></div>
            <div className="grid gap-6">
                {NINE_DIMENSIONS.map((dim) => (
                    <div key={dim.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <label className="flex gap-3 font-bold text-gray-800 mb-3 text-lg"><span className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center text-sm">{dim.id}</span>{dim.title}</label>
                        <p className="text-sm text-gray-500 mb-4 ml-11 border-l-2 border-gray-100 pl-3">{dim.question}</p>
                        <textarea rows="2" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none" placeholder="พิมพ์คำตอบ..." value={answers[dim.id] || ''} onChange={(e) => setAnswers({...answers, [dim.id]: e.target.value})} onBlur={() => updateData('nineDimensions', answers)}/>
                    </div>
                ))}
            </div>
            <div className="sticky bottom-0 bg-white/90 backdrop-blur p-4 border-t border-gray-200 flex justify-end rounded-t-xl">
                 <Button onClick={() => { updateData('nineDimensions', answers); updateData('m1_done', true); setMission('mission2'); }} disabled={!isComplete} className={!isComplete ? 'opacity-50' : ''}>
                    {isComplete ? 'Next: SWOT' : 'กรุณากรอกให้ครบทุกช่อง'} <ChevronRight size={16}/>
                 </Button>
            </div>
        </div>
    );
};

const M1Mission2 = ({ data, updateData, setMission }) => {
    // Interactive Card Sorting UI
    const facts = useMemo(() => Object.entries(data?.nineDimensions || {}).map(([key, val]) => ({ id: key, text: val, source: NINE_DIMENSIONS.find(d => d.id.toString() === key)?.title })).filter(f => f.text), [data]);
    const [buckets, setBuckets] = useState({ S:[], W:[], O:[], T:[] });
    const [currentFactIndex, setCurrentFactIndex] = useState(0);

    // Sync
    useEffect(() => { if(data?.swot) setBuckets(data.swot); }, [data]);

    // Derived: Facts that haven't been sorted yet
    const sortedIds = new Set([...buckets.S, ...buckets.W, ...buckets.O, ...buckets.T].map(x => x.id));
    const unsortedFacts = facts.filter(f => !sortedIds.has(f.id));
    const currentFact = unsortedFacts[0];

    const sortFact = (type) => {
        if(!currentFact) return;
        const newBuckets = { ...buckets, [type]: [...buckets[type], currentFact] };
        setBuckets(newBuckets);
        updateData('swot', newBuckets); // Auto save
    };

    const resetFact = (fact, type) => {
        const newBuckets = { ...buckets, [type]: buckets[type].filter(f => f.id !== fact.id) };
        setBuckets(newBuckets);
        updateData('swot', newBuckets);
    };

    return (
        <div className="space-y-8 h-full flex flex-col">
            <div className="border-b pb-4"><h2 className="text-3xl font-bold text-gray-900">SWOT Visualizer</h2><p className="text-gray-500">จัดกลุ่มข้อมูลของคุณ: เลือกไพ่และหยอดลงกล่อง S, W, O, T</p></div>

            {/* Interactive Sorter */}
            {currentFact ? (
                <div className="flex-1 flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-dashed border-gray-300">
                    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center mb-8 animate-in zoom-in duration-300">
                        <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-2">{currentFact.source}</div>
                        <p className="text-xl text-gray-800 font-medium">"{currentFact.text}"</p>
                        <div className="mt-4 text-xs text-gray-400">({unsortedFacts.length} cards left)</div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 w-full max-w-2xl px-4">
                        {Object.entries(SWOT_TYPES).map(([key, info]) => (
                            <button key={key} onClick={() => sortFact(key)} className={`flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105 active:scale-95 ${info.color.replace('text', 'bg').split(' ')[0]} bg-opacity-20 hover:bg-opacity-30 border-2 ${info.color.split(' ')[1]}`}>
                                <span className={`text-2xl font-black ${info.color.split(' ').pop()}`}>{key}</span>
                                <span className="text-xs font-bold text-gray-600 mt-1">{info.label.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 p-8 rounded-xl text-center border border-green-200">
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4"/>
                    <h3 className="text-xl font-bold text-green-800">จัดกลุ่มครบแล้ว!</h3>
                    <p className="text-green-600">ตรวจสอบข้อมูลด้านล่าง แล้วไปต่อได้เลย</p>
                </div>
            )}

            {/* Result Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(SWOT_TYPES).map(([key, info]) => (
                    <div key={key} className={`p-4 rounded-xl border ${info.color.split(' ')[1]} bg-white`}>
                        <div className="font-bold mb-2 flex justify-between">{info.label} <span className="bg-gray-100 px-2 rounded-full">{buckets[key].length}</span></div>
                        <ul className="space-y-2">
                            {buckets[key].map(f => (
                                <li key={f.id} className="flex justify-between group p-2 bg-gray-50 rounded">
                                    <span className="truncate pr-2">{f.text}</span>
                                    <button onClick={() => resetFact(f, key)} className="text-gray-300 hover:text-red-500"><X size={14}/></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-4">
                 <Button onClick={() => { updateData('m2_done', true); setMission('mission3'); }} disabled={unsortedFacts.length > 0}>Next: Strategy Fusion <ChevronRight size={16}/></Button>
            </div>
        </div>
    );
};

const M1Mission3 = ({ data, updateData, setMission }) => {
    const swot = data?.swot || { S:[], W:[], O:[], T:[] };
    const [strategies, setStrategies] = useState([]);
    const [selInt, setSelInt] = useState(null);
    const [selExt, setSelExt] = useState(null);
    const [text, setText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => { if(data?.strategies) setStrategies(data.strategies); }, [data]);

    const handleAdd = () => {
        if(selInt && selExt && text) {
            const newStrat = { id: Date.now(), internal: selInt, external: selExt, type: `${selInt.type}${selExt.type}`, text };
            const updated = [...strategies, newStrat];
            setStrategies(updated);
            updateData('strategies', updated);
            setText(''); setSelInt(null); setSelExt(null);
        }
    };

    const handleGenerateAI = async () => {
        if (!selInt || !selExt) return alert('กรุณาเลือกปัจจัยภายในและภายนอกก่อน');
        setIsGenerating(true);
        try {
            const prompt = `ในฐานะผู้เชี่ยวชาญด้านกลยุทธ์การศึกษา ให้ช่วยคิดกลยุทธ์ 1 ข้อสั้นๆ จากการจับคู่:
            ปัจจัยภายใน (${selInt.type}): ${selInt.text}
            ปัจจัยภายนอก (${selExt.type}): ${selExt.text}
            ตอบเฉพาะข้อความกลยุทธ์สั้นๆ ไม่ต้องอธิบายเพิ่ม`;
            
            const result = await callGeminiAPI(prompt);
            setText(result.replace(/^"|"$/g, '').trim());
        } catch (error) {
            console.error(error);
            alert("ขออภัย AI ไม่สามารถประมวลผลได้ในขณะนี้");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="border-b pb-6"><h2 className="text-3xl font-bold text-gray-900">Strategy Fusion</h2><p className="text-gray-500">จับคู่ปัจจัยภายใน (S/W) กับภายนอก (O/T) อย่างน้อย 3 ข้อ</p></div>
            <div className="grid grid-cols-2 gap-6 h-64">
                <div className="border rounded-xl p-4 overflow-y-auto bg-gray-50">
                    <h4 className="font-bold mb-2">1. Internal (ภายใน)</h4>
                    {[...swot.S.map(x=>({...x, type:'S'})), ...swot.W.map(x=>({...x, type:'W'}))].map(i => (
                        <div key={i.id} onClick={()=>setSelInt(i)} className={`p-2 mb-2 rounded cursor-pointer border ${selInt?.id===i.id ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}><Badge color={i.type==='S'?'green':'red'}>{i.type}</Badge> {i.text}</div>
                    ))}
                </div>
                <div className="border rounded-xl p-4 overflow-y-auto bg-gray-50">
                    <h4 className="font-bold mb-2">2. External (ภายนอก)</h4>
                    {[...swot.O.map(x=>({...x, type:'O'})), ...swot.T.map(x=>({...x, type:'T'}))].map(i => (
                        <div key={i.id} onClick={()=>setSelExt(i)} className={`p-2 mb-2 rounded cursor-pointer border ${selExt?.id===i.id ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}><Badge color={i.type==='O'?'blue':'yellow'}>{i.type}</Badge> {i.text}</div>
                    ))}
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl border shadow-sm flex gap-4 items-center flex-wrap">
                <div className="font-bold text-xl text-gray-400 w-full sm:w-auto">{selInt?.type || '?'}+{selExt?.type || '?'}</div>
                <input className="flex-1 p-3 border rounded-lg w-full sm:w-auto" placeholder="เขียนกลยุทธ์..." value={text} onChange={e=>setText(e.target.value)} disabled={!selInt || !selExt} />
                <Button onClick={handleGenerateAI} disabled={!selInt || !selExt} variant="ai" icon={Sparkles} loading={isGenerating}>ขอไอเดีย AI</Button>
                <Button onClick={handleAdd} disabled={!text}>Add</Button>
            </div>
            <div className="space-y-2">{strategies.map(s => <div key={s.id} className="p-3 bg-white border rounded flex justify-between"><span><span className="font-bold mr-2">{s.type}</span>{s.text}</span><button onClick={()=>{const n=strategies.filter(x=>x.id!==s.id); setStrategies(n); updateData('strategies',n)}}><X size={16}/></button></div>)}</div>
            <div className="flex justify-end pt-4"><Button onClick={() => { updateData('m3_done', true); setMission('mission4'); }} disabled={strategies.length < 3}>Next <ChevronRight/></Button></div>
        </div>
    );
};

const M1Mission4 = ({ data, updateData, setMission }) => {
    // Updated: Select ONLY 1 Strategy
    const strategies = data?.strategies || [];
    const [selectedId, setSelectedId] = useState(null);

    useEffect(() => { if(data?.prioritizedStrategies?.[0]) setSelectedId(data.prioritizedStrategies[0].id); }, [data]);

    const handleSelect = (id) => setSelectedId(id);
    const handleNext = () => {
        const selected = strategies.find(s => s.id === selectedId);
        updateData('prioritizedStrategies', [selected]); // Save as array of 1 for compatibility
        updateData('m4_done', true);
        setMission('mission5');
    };

    return (
        <div className="space-y-8">
            <div className="border-b pb-6"><h2 className="text-3xl font-bold text-gray-900">Needs Detective</h2><p className="text-gray-500">เลือก 1 กลยุทธ์ที่สำคัญและเร่งด่วนที่สุด (The One Thing) เพื่อนำไปปฏิบัติจริง</p></div>
            <div className="grid gap-4">
                {strategies.map((strat) => (
                    <div key={strat.id} onClick={() => handleSelect(strat.id)} className={`p-5 rounded-xl border-2 cursor-pointer flex items-center gap-4 transition-all ${selectedId === strat.id ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-200 bg-white'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedId === strat.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>{selectedId === strat.id && <div className="w-2 h-2 bg-white rounded-full"/>}</div>
                        <div className="flex-1"><div className="text-xs font-bold text-purple-700 mb-1">{strat.type} Strategy</div><div className="text-gray-800 font-medium">{strat.text}</div></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-end pt-4"><Button onClick={handleNext} disabled={!selectedId}>Next: Action Plan <ChevronRight size={16}/></Button></div>
        </div>
    );
};

const M1Mission5 = ({ data, updateData, setMission }) => {
    const strategy = data?.prioritizedStrategies?.[0];
    const [plan, setPlan] = useState(() => {
        if (data?.actionPlan && strategy && data.actionPlan[strategy.id]) {
            return data.actionPlan[strategy.id];
        }
        return { p:{}, d:{}, c:{}, a:{} };
    });
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('P');
    const [showExample, setShowExample] = useState(false);

    const updateField = (s, f, v) => {
        setPlan(prev => ({ ...prev, [s]: { ...prev[s], [f]: v } }));
    };

    const isComplete = 
        plan.p?.project?.trim() && plan.p?.objective?.trim() && plan.p?.target?.trim() && plan.p?.quantity?.trim() &&
        plan.d?.activities?.trim() && plan.d?.owner?.trim() && plan.d?.time?.trim() &&
        plan.c?.kpi?.trim() && plan.c?.tool?.trim() &&
        plan.a?.contingency?.trim() && plan.a?.extend?.trim();

    const handleSaveAttempt = () => {
        if (!isComplete) return alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
        updateData('actionPlan', { [strategy.id]: plan });
        updateData('m5_done', true);
        updateData('m6_done', true); 
        setMission('mission6');
    };

    const handleGenerateAI = async () => {
        if(!strategy) return;
        setIsGenerating(true);
        try {
            const prompt = `สร้างแผนปฏิบัติการ PDCA สำหรับกลยุทธ์: "${strategy.text}" JSON keys: p_project, p_obj, p_target, p_quantity, d_activities, d_owner, d_time, c_kpi, c_tool, a_contingency, a_extend`;
            const resultText = await callGeminiAPI(prompt);
            const jsonMatch = resultText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                setPlan({
                    p: { project: result.p_project, objective: result.p_obj, target: result.p_target, quantity: result.p_quantity },
                    d: { activities: result.d_activities, owner: result.d_owner, time: result.d_time },
                    c: { kpi: result.c_kpi, tool: result.c_tool },
                    a: { contingency: result.a_contingency, extend: result.a_extend }
                });
            }
        } catch (error) { console.error(error); } finally { setIsGenerating(false); }
    };

    if(!strategy) return <div className="text-center py-20 text-gray-500">Please go back and select a strategy first.</div>;

    const tabs = [
        { id: 'P', label: 'Plan', desc: 'วางแผน', color: 'blue', isDone: plan.p?.project?.trim() },
        { id: 'D', label: 'Do', desc: 'ปฏิบัติ', color: 'yellow', isDone: plan.d?.activities?.trim() },
        { id: 'C', label: 'Check', desc: 'ตรวจสอบ', color: 'green', isDone: plan.c?.kpi?.trim() },
        { id: 'A', label: 'Act', desc: 'ปรับปรุง', color: 'red', isDone: plan.a?.contingency?.trim() },
    ];

    return (
        <div className="space-y-6 pb-10">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
                <div><h2 className="text-3xl font-bold text-gray-900">Action Plan (PDCA)</h2><p className="text-gray-500">วางแผนปฏิบัติการสำหรับ: <span className="font-bold text-purple-600">"{strategy.text}"</span></p></div>
                <div className="flex gap-2"><Button variant="secondary" icon={showExample ? EyeOff : Eye} onClick={() => setShowExample(!showExample)}>ตัวอย่าง</Button><Button variant="ai" icon={Sparkles} onClick={handleGenerateAI} loading={isGenerating}>AI Auto-Fill</Button></div>
            </div>

            {showExample && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm text-amber-900 italic animate-in slide-in-from-top-2">
                    <div className="font-bold not-italic mb-2 flex items-center gap-2"><Lightbulb size={16}/> ตัวอย่าง (Example Case)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2"><p><strong>P:</strong> โครงการ "อ่านออก เขียนได้" (เป้า: นร. 5 คน)</p><p><strong>D:</strong> 1.คัดกรอง 2.สอนเสริม 3.Buddy</p><p><strong>C:</strong> วัดผลทุกสัปดาห์</p><p><strong>A:</strong> ปรับสื่อการสอนถ้าไม่ดีขึ้น</p></div>
                </div>
            )}

            {/* Smart Wizard Steps */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 py-3 px-4 rounded-lg flex flex-col items-center justify-center transition-all min-w-[80px] ${activeTab === tab.id ? 'bg-white shadow-md ring-1 ring-gray-200' : 'text-gray-400 hover:bg-gray-100'}`}>
                        <div className={`text-sm font-bold ${activeTab === tab.id ? `text-${tab.color}-600` : ''}`}>{tab.label}</div>
                        {tab.isDone && <CheckCircle size={14} className="text-green-500 mt-1"/>}
                    </button>
                ))}
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[300px] animate-in fade-in">
                {activeTab === 'P' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-blue-800 text-lg border-b pb-2 mb-4 flex items-center gap-2"><Edit3 size={18}/> 1. Plan (วางแผนแม่นยำ)</h3>
                        <div className="grid gap-4">
                            <div><label className="label-std">ชื่อโครงการ</label><input className="input-std" placeholder="ระบุชื่อโครงการ..." value={plan.p?.project||''} onChange={e=>updateField('p','project',e.target.value)}/></div>
                            <div><label className="label-std">วัตถุประสงค์</label><input className="input-std" placeholder="ทำเพื่อแก้ไขปัญหาอะไร?" value={plan.p?.objective||''} onChange={e=>updateField('p','objective',e.target.value)}/></div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="label-std">กลุ่มเป้าหมาย</label><input className="input-std" placeholder="ใครได้รับผลประโยชน์?" value={plan.p?.target||''} onChange={e=>updateField('p','target',e.target.value)}/></div>
                                <div><label className="label-std">เป้าหมายเชิงปริมาณ</label><input className="input-std" placeholder="เช่น เพิ่มขึ้น 10%" value={plan.p?.quantity||''} onChange={e=>updateField('p','quantity',e.target.value)}/></div>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'D' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-yellow-800 text-lg border-b pb-2 mb-4 flex items-center gap-2"><Edit3 size={18}/> 2. Do (ปฏิบัติชัดเจน)</h3>
                        <div><label className="label-std">กิจกรรมหลัก (Key Activities 3 ข้อ)</label><textarea className="input-std" rows="4" placeholder="1. ...&#10;2. ...&#10;3. ..." value={plan.d?.activities||''} onChange={e=>updateField('d','activities',e.target.value)}/></div>
                        <div className="grid md:grid-cols-2 gap-4">
                             <div><label className="label-std">ผู้รับผิดชอบ</label><input className="input-std" placeholder="ระบุชื่อ" value={plan.d?.owner||''} onChange={e=>updateField('d','owner',e.target.value)}/></div>
                             <div><label className="label-std">ระยะเวลา</label><input className="input-std" placeholder="ระบุช่วงเวลา" value={plan.d?.time||''} onChange={e=>updateField('d','time',e.target.value)}/></div>
                        </div>
                    </div>
                )}
                {activeTab === 'C' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-green-800 text-lg border-b pb-2 mb-4 flex items-center gap-2"><Edit3 size={18}/> 3. Check (ตรวจสอบวัดผล)</h3>
                        <div><label className="label-std">ตัวชี้วัดความสำเร็จ (KPIs)</label><input className="input-std" placeholder="จะรู้ได้อย่างไรว่าสำเร็จ?" value={plan.c?.kpi||''} onChange={e=>updateField('c','kpi',e.target.value)}/></div>
                        <div><label className="label-std">เครื่องมือวัดผล</label><input className="input-std" placeholder="ใช้อะไรวัดผล?" value={plan.c?.tool||''} onChange={e=>updateField('c','tool',e.target.value)}/></div>
                    </div>
                )}
                {activeTab === 'A' && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-red-800 text-lg border-b pb-2 mb-4 flex items-center gap-2"><Edit3 size={18}/> 4. Act (ปรับปรุงและขยายผล)</h3>
                        <div><label className="label-std">แผนสำรอง (Contingency Plan)</label><input className="input-std" placeholder="ถ้าไม่ได้ผล ทำอย่างไร?" value={plan.a?.contingency||''} onChange={e=>updateField('a','contingency',e.target.value)}/></div>
                        <div><label className="label-std">การต่อยอด (Extension)</label><input className="input-std" placeholder="ถ้าสำเร็จ ขยายผลอย่างไร?" value={plan.a?.extend||''} onChange={e=>updateField('a','extend',e.target.value)}/></div>
                    </div>
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="ghost" onClick={() => { if(activeTab==='D') setActiveTab('P'); if(activeTab==='C') setActiveTab('D'); if(activeTab==='A') setActiveTab('C'); }} disabled={activeTab==='P'}>Previous</Button>
                {activeTab === 'A' ? (
                    <Button onClick={handleSaveAttempt} className={`px-6 ${isComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}>{isComplete ? 'บันทึกและดูรายงาน (Finish)' : 'กรอกให้ครบก่อนบันทึก'}</Button>
                ) : (
                    <Button onClick={() => { if(activeTab==='P') setActiveTab('D'); if(activeTab==='D') setActiveTab('C'); if(activeTab==='C') setActiveTab('A'); }}>Next <ChevronRight size={16}/></Button>
                )}
            </div>
             <style>{` .label-std { display: block; font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; } .input-std { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; outline: none; transition: all 0.2s; background-color: #f9fafb; } .input-std:focus { border-color: #3b82f6; background-color: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); } `}</style>
        </div>
    );
};

const M1Mission6 = ({ data, updateData, user, goToNextModule }) => {
    const [saved, setSaved] = useState(data?.isCompleted || false);
    const [showBadge, setShowBadge] = useState(data?.isCompleted || false);

    const loadHtml2Canvas = () => {
        return new Promise((resolve, reject) => {
            if (window.html2canvas) return resolve(window.html2canvas);
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => resolve(window.html2canvas);
            script.onerror = reject;
            document.head.appendChild(script);
        });
    };

    const handleSaveImage = async () => {
        try {
            await loadHtml2Canvas();
            const element = document.getElementById('report-print-area');
            await document.fonts.ready;
            const canvas = await window.html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff", ignoreElements: (element) => element.classList.contains('no-print') });
            const link = document.createElement('a');
            link.download = `InSPIRE-Report-${user.uid.slice(0,5)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Image Export Failed:", err);
            alert("ไม่สามารถบันทึกเป็นรูปภาพได้ ระบบจะใช้การพิมพ์แทน");
            window.print();
        }
    };

    const handleReceiveBadge = async () => {
        await updateData('isCompleted', true);
        await updateData('m6_done', true);
        setShowBadge(true);
        setSaved(true);
    };

    return (
        <div className="space-y-8 pb-32 bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative" id="report-print-area">
            {/* Header Area */}
            <div className="text-center border-b-2 border-gray-100 pb-8">
                {showBadge ? (
                    <div className="mb-8 animate-in fade-in zoom-in duration-700">
                         <div className="relative inline-block group">
                             <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-20 rounded-full animate-pulse"></div>
                             {/* UPDATED BADGE URL */}
                             <img src="http://drive.google.com/uc?id=1n_17Z_NEj5FsYr217NVNf-DH4dFMnffF" alt="In-Sight Badge" className="w-64 h-auto mx-auto drop-shadow-2xl transform transition-transform group-hover:scale-105" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mt-4">ยินดีด้วย! คุณได้รับ In-Sight Badge</h3>
                        <p className="text-gray-500">ปลดล็อก Module ถัดไปเรียบร้อยแล้ว</p>
                    </div>
                ) : (
                    <div className="mb-4">
                        <div className="flex justify-center mb-4"><div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg">I</div></div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Module 1 Report: In-Sight Analysis</h2>
                    </div>
                )}
                <div className="mt-4 flex justify-center items-center gap-4 text-sm text-gray-500"><span className="flex items-center gap-1"><User size={14}/> {user.displayName || user.email}</span><span>{new Date().toLocaleDateString('th-TH', { dateStyle: 'long' })}</span></div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
                <Section title="1. SWOT Analysis" icon={BarChart2} color="blue">
                    <div className="grid grid-cols-2 gap-4">
                        {['S','W','O','T'].map(key => (
                            <div key={key} className={`p-4 rounded border ${SWOT_TYPES[key].color.replace('text', 'border').split(' ')[0]} bg-white`}>
                                <h4 className={`font-bold mb-2 ${SWOT_TYPES[key].color.split(' ')[2]}`}>{SWOT_TYPES[key].label}</h4>
                                <ul className="list-disc list-inside text-sm space-y-1">{data?.swot?.[key]?.map((item, i) => <li key={i}>{item.text}</li>)}</ul>
                            </div>
                        ))}
                    </div>
                </Section>
                <Section title="2. The One Strategy" icon={Target} color="purple">
                     {data?.prioritizedStrategies?.[0] ? (
                        <div className="p-4 bg-purple-50 rounded border border-purple-100"><span className="font-bold text-purple-700">{data.prioritizedStrategies[0].type} Strategy:</span> {data.prioritizedStrategies[0].text}</div>
                     ) : <div className="text-gray-400 italic">No strategy selected</div>}
                </Section>
                <Section title="3. Action Plan (PDCA)" icon={FileText} color="green">
                     {data?.prioritizedStrategies?.[0] && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <div className="bg-gray-100 px-4 py-2 border-b font-bold text-sm">{data.prioritizedStrategies[0].text}</div>
                            <div className="p-6 grid grid-cols-2 gap-6 text-sm">
                                {(() => {
                                    const p = data.actionPlan?.[data.prioritizedStrategies[0].id] || {};
                                    return <><div className="space-y-1"><span className="font-bold text-blue-600">Plan:</span> {p.p?.project}</div><div className="space-y-1"><span className="font-bold text-yellow-600">Do:</span> {p.d?.activities}</div><div className="space-y-1"><span className="font-bold text-green-600">Check:</span> {p.c?.kpi}</div><div className="space-y-1"><span className="font-bold text-red-600">Act:</span> {p.a?.extend}</div></>
                                })()}
                            </div>
                        </div>
                     )}
                </Section>
            </div>

            {/* Action Buttons */}
            <div className="no-print flex flex-col md:flex-row gap-4 justify-center py-8 border-t border-gray-100" data-html2canvas-ignore="true">
                <Button variant="secondary" icon={ImageIcon} onClick={handleSaveImage}>บันทึกรายงานเป็นรูปภาพ</Button>
                {!showBadge && (
                    <Button variant="primary" onClick={handleReceiveBadge} className="px-8 py-3 text-lg shadow-xl shadow-yellow-500/20 bg-gradient-to-r from-yellow-500 to-amber-600 border-none hover:scale-105 transition-transform">
                        <Award className="mr-2"/> รับ Badge of In-Sight
                    </Button>
                )}
            </div>

            {/* Google Drive Area */}
            <div className="no-print mt-8 pt-8 border-t border-gray-200 bg-gray-50 rounded-xl p-6" data-html2canvas-ignore="true">
                 <div className="text-center space-y-4">
                    <div className="flex justify-center"><UploadCloud size={48} className="text-blue-400"/></div>
                    <div><h3 className="text-lg font-bold text-blue-800">ส่งผลงานเพิ่มเติม (Optional)</h3></div>
                    <div className="w-full h-64 bg-white rounded-lg border border-gray-200 overflow-hidden relative shadow-inner"><iframe src="https://drive.google.com/embeddedfolderview?id=1fAO2gjKqnzbBPoYCr5eIRIArw3_lttL8" width="100%" height="100%" className="border-none" title="Google Drive Submission"></iframe></div>
                    <a href="https://drive.google.com/drive/folders/1fAO2gjKqnzbBPoYCr5eIRIArw3_lttL8?usp=drive_link" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-700 font-medium hover:underline bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm"><Folder size={16}/> เปิดโฟลเดอร์ Google Drive</a>
                </div>
            </div>

            {/* FIXED BOTTOM BUTTON */}
            {showBadge && (
                <div className="no-print fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-center z-[100] animate-in slide-in-from-bottom-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" data-html2canvas-ignore="true">
                    <Button variant="primary" onClick={goToNextModule} className="px-12 py-4 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl rounded-full border-4 border-white/50 transform hover:scale-105 transition-all">
                        ไปเริ่มเรียน Module 2 <ArrowRight className="ml-3"/>
                    </Button>
                </div>
            )}
        </div>
    );
};

const M2Intro = ({ setMission }) => (
    <div className="space-y-6 animate-in fade-in">
        <h2 className="text-2xl font-bold text-gray-900 border-b pb-4">Module 2: S-Design</h2>
        <p className="text-gray-600">ออกแบบ Roadmap การพัฒนาตนเอง</p>
        <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg bg-black">
        <iframe width="100%" height="100%" src="https://www.youtube.com/embed/11LNlANbTA0?si=wyQaDG_VIxF359wu" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
        </div>
        <div className="flex justify-end pt-4">
             <Button onClick={() => setMission('m2_dream')}>เข้าสู่ Dream Lab <ChevronRight/></Button>
        </div>
    </div>
);

const M2DreamLab = () => (
    <div className="text-center py-20">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto text-purple-600 mb-4"><Rocket size={32}/></div>
        <h2 className="text-2xl font-bold text-gray-900">Dream Lab</h2>
        <p className="text-gray-500">พื้นที่สำหรับการออกแบบความฝัน (Coming Soon)</p>
    </div>
);

// M3, M4, M5, PostTest Placeholders
const M3Structure = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold mb-4">Module 3: P-Participation</h2><p>Coming Soon...</p></div>;
const M4Structure = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold mb-4">Module 4: I-Innovation</h2><p>Coming Soon...</p></div>;
const M5Structure = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold mb-4">Module 5: RE-Reflection</h2><p>Coming Soon...</p></div>;
const PostTestStructure = () => <div className="p-10 text-center"><h2 className="text-2xl font-bold mb-4">Post-test</h2><p>Coming Soon...</p></div>;

const Section = ({ title, icon: Icon, color, children }) => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm break-inside-avoid">
        <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-${color}-50`}><Icon size={20} className={`text-${color}-600`}/><h3 className="font-bold text-gray-800">{title}</h3></div>
        <div className="p-6">{children}</div>
    </div>
);

function AdminPortal() { return <div className="p-10 text-center">Admin Portal (Mockup)</div>; }