import { useState, useEffect, useMemo } from 'react'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, setDoc, collectionGroup, orderBy, limit } from "firebase/firestore";
import { db } from './firebase'; // Importa a instância já inicializada
import StrategyBoard from './components/StrategyBoard';
import Countdown from './components/Countdown';
import { 
  User, 
  LogOut, 
  Calendar, 
  CheckCircle, 
  X, 
  ChevronRight, 
  Upload, 
  Bot, 
  Cpu, 
  Trophy, 
  Medal, 
  Briefcase, // <--- Ícone que faltava para o modal de especialista
  Star, 
  Shield, 
  Target, 
  BookOpen, 
  Award, 
  Smile, 
  Pencil, 
  Image as ImageIcon, 
  ListTodo, 
  Calculator, 
  Timer, // <--- Agora só tem um aqui!
  ThumbsUp, 
  AlertTriangle, 
  GraduationCap, 
  Gavel, 
  Search,
  Battery, 
  BatteryFull, 
  BatteryMedium, 
  BatteryLow, 
  BatteryWarning, 
  BatteryCharging,
  Wrench, 
  ThermometerSnowflake, 
  RotateCcw, 
  HeartHandshake, 
  BarChart, 
  Zap, 
  Crown,
  FileText,
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CalendarDays,
  Rocket,
  Lightbulb,     
  Brain,          
  LayoutDashboard, 
  Settings,
  Microscope,  // <--- O Culpado de agora (Inovação)
  Gamepad2,    // <--- Provavelmente vai pedir em seguida (Robot Game)
  Megaphone,   // <--- Provavelmente vai pedir em seguida (Marketing/Social)
  Laptop,      // <--- Provavelmente vai pedir em seguida (Programação)
  Code,
  BarChart3,   // <--- O Culpado de agora
  PieChart,    // <--- Provavelmente vai pedir em seguida (Gráfico de Pizza)
  TrendingUp,  // <--- Provavelmente vai pedir em seguida (Tendência de alta)
  Map,         // <--- Provavelmente vai pedir em seguida (Mapa da mesa)
  Flag,
  Tag,
  MessageSquare, // <--- O Culpado de agora (Comentários)
  Share2,        // <--- Provavelmente usado para compartilhar estratégia
  Download,      // <--- Provavelmente usado para baixar PDF
  Plus,          // <--- Botão de "Nova Estratégia" (+)
  Trash2,        // <--- Botão de Lixeira (Apagar estratégia)
  Edit3,
  GitCommit,     // <--- O Culpado de agora
  GitBranch,     // <--- Provavelmente vai pedir em seguida (Versões/Ramos)
  GitPullRequest,// <--- Provavelmente vai pedir em seguida (Solicitação de Mudança)
  GitMerge,
  Users,       // <--- O Culpado de agora (Lista da Equipe)
  UserPlus,    // <--- Provavelmente vai pedir em seguida (Adicionar Aluno)
  UserCheck,   // <--- Provavelmente vai pedir em seguida (Presença/Status)
  UserX,       // <--- Provavelmente vai pedir em seguida (Remover Aluno)
  ClipboardList,
  AlertCircle,   // <--- O Culpado de agora (Erro/Aviso)
  Check,         // <--- Provavelmente vai pedir em seguida (Sucesso/Visto)
  Info,          // <--- Provavelmente vai pedir em seguida (Informação)
  HelpCircle,    // <--- Provavelmente vai pedir em seguida (Ajuda)
  XCircle,
  CheckSquare, // <--- O Culpado de agora (Checkbox marcado)
  Square,
  Loader2,
  Scale,         // <--- O Culpado de agora (Avaliação)
  Crop,          // <--- Ícone de Corte
  CheckCheck,    // <--- Provavelmente vai pedir em seguida (Aprovado Duplo)
  ExternalLink,  // <--- Provavelmente vai pedir em seguida (Abrir Arquivo em outra aba)
  FileWarning,
  Book,          // <--- Ícone do Diário
  Play,          // <--- NOVO: Ícone de Play para o Cronômetro
} from 'lucide-react';


// --- CONFIGURAÇÃO DE NÍVEIS ---

const LEVELS = [

    { name: "Novato", min: 0, max: 499, color: "text-gray-400" },

    { name: "Aprendiz", min: 500, max: 1199, color: "text-blue-400" },

    { name: "Veterano", min: 1200, max: 2399, color: "text-purple-400" },

    { name: "Mestre FLL", min: 2400, max: 10000, color: "text-yellow-400" }

];
// --- LISTA DE TÉCNICOS (ADMINISTRADORES) ---
const ADMIN_USERS = [
  { user: "Guilherme", pass: "dti2@15!!" },
  { user: "Felipe", pass: "dti2@15!!" },
  { user: "admin", pass: "admin123" }
];
// --- SEU LOGO SVG (Componente) ---
const LogoNewGears = () => (
  <svg 
    viewBox="0 0 1883 1717" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className="w-full h-full" // Isso faz ele obedecer o tamanho da div pai
  >
    <path d="M1319.52 0H484.578L643.201 261.487H1461.22L1049.61 979.258L1183.56 1212.84L1599.3 487.874L1319.52 0Z" fill="url(#paint0_linear_302_578)"/>
    <path d="M139.887 852.111L557.36 1580.11L702.975 1311.06L293.964 597.82L1117.18 597.82L1251.13 364.237L419.661 364.237L139.887 852.111Z" fill="url(#paint1_linear_302_578)"/>
    <path d="M1465.53 1473.06L1883 745.067L1578.76 752.627L1169.75 1465.87L758.142 748.096L490.244 748.096L905.979 1473.06L1465.53 1473.06Z" fill="url(#paint2_linear_302_578)"/>
    <defs>
      <linearGradient id="paint0_linear_302_578" x1="548.556" y1="535.528" x2="1568.11" y2="544.977" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6293E9"/>
        <stop offset="0.315399" stopColor="#5D58D3"/>
        <stop offset="0.75" stopColor="#820AAF"/>
        <stop offset="1" stopColor="#D01BF1"/>
      </linearGradient>
      <linearGradient id="paint1_linear_302_578" x1="986.023" y1="1256.56" x2="479.319" y2="365.754" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6293E9"/>
        <stop offset="0.315399" stopColor="#5D58D3"/>
        <stop offset="0.75" stopColor="#820AAF"/>
        <stop offset="1" stopColor="#D01BF1"/>
      </linearGradient>
      <linearGradient id="paint2_linear_302_578" x1="1390.36" y1="533.085" x2="867.125" y2="1414.15" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6293E9"/>
        <stop offset="0.315399" stopColor="#5D58D3"/>
        <stop offset="0.75" stopColor="#820AAF"/>
        <stop offset="1" stopColor="#D01BF1"/>
      </linearGradient>
    </defs>
  </svg>
);

const Header = ({ title, userType, onLogout }) => (
  <>
    <div className="flex justify-between items-center my-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">{title}</h1>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${userType === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {userType.toUpperCase()}
        </span>
      </div>
      <button onClick={onLogout} className="bg-white/10 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2">
        <LogOut size={16}/> Sair
      </button>
    </div>
  </>
);

// --- COMPONENTE: PIT STOP MODAL (Extraído para corrigir erro de Hooks) ---
const PitStopModal = ({ viewAsStudent, pitStopRecords, showNotification }) => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
      let interval;
      if (running) {
          interval = setInterval(() => setTime(Date.now() - startTime), 10);
      }
      return () => clearInterval(interval);
  }, [running, startTime]);

  const handleStartStop = async () => {
      if (running) {
          setRunning(false);
          // Salvar recorde?
          const finalTime = (time / 1000).toFixed(3);
          if (confirm(`Salvar tempo de ${finalTime}s no Ranking?`)) {
              const name = viewAsStudent ? viewAsStudent.name : "Técnico";
              await addDoc(collection(db, "pitstop_records"), {
                  name, time: parseFloat(finalTime), date: new Date().toISOString()
              });
              showNotification(`⏱️ ${finalTime}s registrado!`);
          }
      } else {
          setTime(0);
          setStartTime(Date.now());
          setRunning(true);
      }
  };

  return (
      <div className="text-center">
          <h3 className="text-2xl font-black mb-2 text-white italic">PIT STOP F1</h3>
          <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">Treino de Troca de Garras</p>
          
          <div className="bg-black/50 border border-white/10 rounded-2xl p-8 mb-8">
              <div className={`text-6xl font-mono font-black tabular-nums tracking-tighter ${running ? 'text-yellow-400' : 'text-white'}`}>
                  {(time / 1000).toFixed(3)}<span className="text-lg text-gray-500 ml-1">s</span>
              </div>
          </div>

          <button onClick={handleStartStop} className={`w-full py-6 rounded-xl font-black text-xl uppercase tracking-widest transition-all shadow-lg ${running ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' : 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20'}`}>
              {running ? '🛑 PARAR' : '🚀 INICIAR'}
          </button>

          <div className="mt-8 pt-8 border-t border-white/10 text-left">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><Trophy size={12} className="text-yellow-500"/> Top 5 Mais Rápidos</h4>
              <div className="space-y-2">
                  {pitStopRecords.map((rec, i) => (
                      <div key={rec.id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                          <div className="flex items-center gap-3">
                              <span className={`font-black text-sm w-4 ${i===0?'text-yellow-500':i===1?'text-gray-300':i===2?'text-orange-500':'text-gray-600'}`}>#{i+1}</span>
                              <span className="text-white text-sm font-bold">{rec.name}</span>
                          </div>
                          <span className="font-mono text-blue-400 font-bold">{rec.time.toFixed(3)}s</span>
                      </div>
                  ))}
                  {pitStopRecords.length === 0 && <p className="text-xs text-gray-600 italic text-center">Nenhum recorde ainda. Seja o primeiro!</p>}
              </div>
          </div>
      </div>
  );
}

function App() {

// --- COMPONENTE: RANKING E ZONA DE CORTE ---
  const RankingPanel = ({ students }) => {
    // Organiza os alunos do maior XP para o menor
    const sortedStudents = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0));

    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-[#151520] w-full max-w-5xl p-6 rounded-2xl shadow-2xl border border-white/10 relative flex flex-col max-h-[85vh]">
          
          {/* Botão Fechar */}
          <button 
            onClick={() => setActiveTab('dashboard')}
            className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 bg-white/5 rounded-lg z-10 transition-colors"
          >
            <X size={24}/>
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 pr-12">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
              Ranking da Temporada
            </h2>
            <span className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              Meta Mínima: 420 XP
            </span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sortedStudents.map((student, index) => {
            // A regra implacável: Menos de 420 vai pro vermelho!
            const inRiskZone = (student.xp || 0) < 420;
            
            // Pódio: Ouro, Prata e Bronze
            let positionColor = "text-gray-500";
            if (index === 0) positionColor = "text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]";
            if (index === 1) positionColor = "text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]";
            if (index === 2) positionColor = "text-amber-600 drop-shadow-[0_0_5px_rgba(217,119,6,0.5)]";

            return (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-3 rounded-xl border-l-4 transition-all ${
                  inRiskZone 
                    ? 'bg-red-500/5 border-red-500 hover:bg-red-500/10' 
                    : 'bg-black/40 border-green-500 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`font-black text-lg w-6 shrink-0 ${positionColor}`}>
                    #{index + 1}
                  </div>
                  <div className="overflow-hidden">
                    <p className={`font-bold text-sm truncate ${inRiskZone ? 'text-red-400' : 'text-gray-200'}`}>
                      {student.name}
                    </p>
                    {inRiskZone && (
                      <p className="text-[10px] font-bold text-red-500 flex items-center mt-0.5 truncate">
                        <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                        Abaixo da meta
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-right shrink-0 pl-2">
                  <span className={`text-lg font-black ${inRiskZone ? 'text-red-500' : 'text-green-500'}`}>
                    {student.xp || 0}
                  </span>
                  <span className={`text-[10px] font-bold ml-1 ${inRiskZone ? 'text-red-700' : 'text-green-700'}`}>
                    XP
                  </span>
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>
      </div>
    );
  };

// --- LISTA DE BADGES (VERSÃO FINAL) ---
  const BADGES_LIST = [
    { id: 'pitstop', name: 'Pit Stop F1', icon: <Timer size={20}/>, color: 'text-red-500', desc: 'Troca de anexo em menos de 3s.' },
    { id: 'engineer', name: 'Engenheiro Minimalista', icon: <Wrench size={20}/>, color: 'text-gray-400', desc: 'Solução mecânica simples e genial.' },
    { id: 'ice_blood', name: 'Sangue Frio', icon: <ThermometerSnowflake size={20}/>, color: 'text-blue-400', desc: 'Manteve a calma no erro crítico.' },
    { id: 'repetition', name: 'Rei da Repetição', icon: <RotateCcw size={20}/>, color: 'text-green-500', desc: '10 acertos seguidos na mesa.' },
    { id: 'helper', name: 'Braço Direito', icon: <HeartHandshake size={20}/>, color: 'text-pink-500', desc: 'Ajudou o time em qualquer situação.' },
    { id: 'data_keeper', name: 'Guardião dos Dados', icon: <BarChart size={20}/>, color: 'text-blue-500', desc: 'Trouxe estatísticas reais pro Projeto.' },
    { id: 'legend', name: 'Lenda do XP', icon: <Zap size={20}/>, color: 'text-yellow-400', desc: 'Destaque absoluto no Ranking de XP.' },
    { id: 'ambassador', name: 'Embaixador', icon: <Crown size={20}/>, color: 'text-purple-500', desc: 'Liderou pelo exemplo e uniu a equipe.' },
  ];

  // --- DESAFIO DE INGLÊS: Função do Técnico ---
  const toggleEnglishChallenge = async (student) => {
      if (!isAdmin) return;
      try {
          const studentRef = doc(db, "students", student.id);
          const newState = !student.englishChallengeUnlocked; // Inverte o estado atual
          
          await updateDoc(studentRef, {
              englishChallengeUnlocked: newState
          });

          // Atualiza a tela na hora
          setStudents(prev => prev.map(s => 
              s.id === student.id ? { ...s, englishChallengeUnlocked: newState } : s
          ));
      } catch (error) {
          console.error("Erro ao liberar desafio de inglês:", error);
      }
  };

  // --- DESAFIO DE INGLÊS: Função do Aluno ---
  const claimEnglishXP = async () => {
      if (!viewAsStudent || !viewAsStudent.englishChallengeUnlocked) return;

      try {
          const studentRef = doc(db, "students", viewAsStudent.id);
          const xpBonus = 20; // Quanto de XP ele ganha por falar inglês

          await updateDoc(studentRef, {
              xp: (viewAsStudent.xp || 0) + xpBonus,
              englishChallengeUnlocked: false // Bloqueia o botão de novo automaticamente!
          });

          // Atualiza a tela do aluno
          setViewAsStudent(prev => ({ 
              ...prev, 
              xp: (prev.xp || 0) + xpBonus, 
              englishChallengeUnlocked: false 
          }));
          
          alert("Great job! Mandou bem no inglês! +20 XP 🇺🇸✨");
      } catch (error) {
          console.error("Erro ao resgatar XP de inglês:", error);
      }
  };
 // Função atualizada para o Técnico dar Badges
  const toggleBadge = async (student, badgeId) => {
      if (!isAdmin) return;
      
      const currentBadges = student.badges || [];
      let newBadges;
      let xpBonus = 0;

      // Lógica de Adicionar/Remover
      if (currentBadges.includes(badgeId)) {
          newBadges = currentBadges.filter(b => b !== badgeId);
          // Opcional: Remover XP se tirar a badge? Melhor não, deixa o XP ganho.
      } else {
          newBadges = [...currentBadges, badgeId];
          xpBonus = 100; // Bônus de XP ao ganhar
      }

      // 1. Atualiza no Firebase
      const studentRef = doc(db, "students", student.id);
      await updateDoc(studentRef, {
         badges: newBadges,
         xp: (student.xp || 0) + xpBonus
      });

      // 2. Atualiza o estado local para ver a mudança na hora (sem recarregar)
      const updatedStudent = { ...student, badges: newBadges, xp: (student.xp || 0) + xpBonus };
      
      // Atualiza o aluno selecionado no modal
      setBadgeStudent(updatedStudent);

      // Atualiza a lista geral de alunos na tela
      setStudents(prevStudents => 
        prevStudents.map(s => s.id === student.id ? updatedStudent : s)
      );
  };
  // Adicione esta linha junto com os seus outros useState:
  const [activeTab, setActiveTab] = useState('dashboard');
// Estado para saber qual aluno o técnico está dando badge
  const [badgeStudent, setBadgeStudent] = useState(null);
    // --- VARIÁVEIS DA BATERIA DA EQUIPE ---
  const [showBatteryModal, setShowBatteryModal] = useState(false);
  const [teamMoods, setTeamMoods] = useState([]); // Guarda o humor de todo mundo hoje

  // Função para carregar a bateria de hoje do banco
  useEffect(() => {
      if (!db) return;
      const today = new Date().toISOString().split('T')[0];
      
      // Cria uma "escuta" no banco para ver os humores de hoje em tempo real
      const q = query(collection(db, "dailyMoods"), where("date", "==", today));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const moods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTeamMoods(moods);
      });
      return () => unsubscribe();
  }, [db]);

  // Função para Salvar o Humor
  const handleMoodSubmit = async (level) => {
      if (!viewAsStudent) return;

      // Trava 1: Apenas dias de treino (Segunda=1, Quarta=3)
      const dayOfWeek = new Date().getDay();
      if (dayOfWeek !== 1 && dayOfWeek !== 3) {
          alert("Check-in bloqueado. Votação permitida apenas às segundas e quartas.");
          return;
      }

      // Trava 2: Impedir Farm de XP (apenas um voto por dia)
      const hasVotedToday = teamMoods.some(mood => mood.studentId === viewAsStudent.id);
      if (hasVotedToday) {
          alert("Você já respondeu hoje! Foco no treino.");
          return;
      }

      const today = new Date().toISOString().split('T')[0];
      
      try {
          // Salva no banco
          await addDoc(collection(db, "dailyMoods"), {
              studentId: viewAsStudent.id,
              studentName: viewAsStudent.name,
              level: level, // 100, 75, 50, 25
              date: today,
              timestamp: new Date()
          });
          
          // Ganha 5 XP por participar (Incentivo!)
          // (Aqui reaproveitamos sua função de dar XP se ela existir, ou fazemos direto)
          await updateDoc(doc(db, "students", viewAsStudent.id), {
              xp: (viewAsStudent.xp || 0) + 2
          });

          setShowBatteryModal(false);
          alert(`Obrigado por compartilhar! +5 XP ⚡`);
      } catch (error) {
          console.error("Erro ao salvar bateria:", error);
      }
  };

  // Cálculo da Média da Equipe (Para você ver)
  const teamAverage = teamMoods.length > 0 
      ? Math.round(teamMoods.reduce((acc, curr) => acc + curr.level, 0) / teamMoods.length) 
      : 0;
    // --- LÓGICA DE LOGIN (INSERIDO) ---
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");
    
    // Normaliza (remove espaços e deixa minúsculo) para evitar erros de digitação
    const userClean = loginUser.trim().toLowerCase();
    const passClean = loginPass.trim();

    // 1. Lógica de login de Admin (SIMPLIFICADA)
    // TODO: Substituir por Firebase Auth. Por enquanto, uma verificação simples.
    const adminFound = ADMIN_USERS.find(a => a.user.toLowerCase() === userClean && a.pass === passClean);

    if (adminFound) {
        // Logou com sucesso!
        const userObj = { type: 'admin', name: adminFound.user };
        setCurrentUser(userObj);
        setIsAdmin(true);
        setViewAsStudent(null);
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memória
        return;
    }

    console.log("Tentando logar aluno:", userClean);
    console.log("Alunos carregados no sistema:", students.length);

    // 2. Tenta logar como Aluno (busca no array 'students' que já existe no seu código)
    // Nota: Certifique-se de que o cadastro de aluno salva 'username' e 'password'
    const studentFound = students.find(s => 
        s.username && s.username.toLowerCase().trim() === userClean && s.password === passClean
    );

    if (studentFound) {
        const userObj = { type: 'student', data: studentFound };
        setCurrentUser(userObj);
        setIsAdmin(false); // Remove flag de admin
        setViewAsStudent(studentFound); // Força a visão para este aluno
        localStorage.setItem("roboquest_user", JSON.stringify(userObj)); // Salva na memória
    } else {
        // Log para ajudar a descobrir o erro (veja no F12)
        console.log("Falha no login. Usuários disponíveis:", students.map(s => s.username));
        setLoginError("Usuário ou senha incorretos.");
    }
  };

  

  const handleLogout = () => {
      setCurrentUser(null);
      setIsAdmin(false);
      setViewAsStudent(null);
      setLoginUser("");
      setLoginPass("");
      localStorage.removeItem("roboquest_user"); // Limpa a memória
  };
  // ----------------------------------

  // Recupera estado inicial da memória também
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    return saved ? JSON.parse(saved).type === 'admin' : false;
  });

  const [viewAsStudent, setViewAsStudent] = useState(() => {
    const saved = localStorage.getItem("roboquest_user");
    const parsed = saved ? JSON.parse(saved) : null;
    return parsed?.type === 'student' ? parsed.data : null;
  });

  const [isStudentLink, setIsStudentLink] = useState(false)

  const [currentWeekData, setCurrentWeekData] = useState(null)

  const [adminTab, setAdminTab] = useState('rotation') 

  const [studentTab, setStudentTab] = useState('mission')

  
  const [robotSubTab, setRobotSubTab] = useState('overview'); // 'overview' | 'map'

  // --- DADOS EDITÁVEIS DE MISSÕES (Mestre das Missões) ---

  const [missionsList, setMissionsList] = useState([])



  // --- DADOS DA MATRIZ DE DECISÃO (Estratégia de Campeão) ---

  const [decisionMatrix, setDecisionMatrix] = useState([])



  const [students, setStudents] = useState([])
 
  const [tasks, setTasks] = useState([]) // <--- NOVO ESTADO PARA TAREFAS
  const [logbookEntries, setLogbookEntries] = useState([]) // <--- NOVO ESTADO PARA DIÁRIO

  // --- ESTADOS PARA O EDITOR DE CORTE (CROP) ---
  const [isCropping, setIsCropping] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // --- NOVO: Sincroniza dados do aluno logado com o Firebase em tempo real ---
  useEffect(() => {
    if (currentUser?.type === 'student' && students.length > 0) {
        // Procura a versão mais recente deste aluno na lista que veio do banco
        const freshStudent = students.find(s => s.id === currentUser.data.id);
        if (freshStudent) {
            setViewAsStudent(freshStudent);
        }
    }
  }, [students, currentUser]);

  const [experts, setExperts] = useState([])

  const [robotVersions, setRobotVersions] = useState([])

  const [rounds, setRounds] = useState([])

  const [scoreHistory, setScoreHistory] = useState([]) // <--- NOVO: Histórico de pontuações

  // --- ESTADOS DO CRONÔMETRO ---
  const [activeTimer, setActiveTimer] = useState(null); // { roundId, start, name }
  const [timerDisplay, setTimerDisplay] = useState(0); 
  const [roundFormValues, setRoundFormValues] = useState({}); // { [roundId]: value }
  const [pitStopRecords, setPitStopRecords] = useState([]); // <--- NOVO: Ranking de Pit Stop

  const [compliments, setCompliments] = useState([]) 

  const [innovationRubric, setInnovationRubric] = useState({ identificacao: 1, design: 1, criacao: 1, iteracao: 1, comunicacao: 1 })
  const [robotDesignRubric, setRobotDesignRubric] = useState({ durabilidade: 1, eficiencia: 1, programacao: 1, estrategia: 1 })

  // --- NOVOS ESTADOS NECESSÁRIOS ---
  const [questions, setQuestions] = useState([])
  const [outreachEvents, setOutreachEvents] = useState([])
  const [projectSummary, setProjectSummary] = useState({ 
      title: "Nome do Projeto", 
      problem: "", 
      solution: "", 
      sharing: "", 
      image: null 
  })

  const [modal, setModal] = useState({ type: null, data: null }) 

  const [notification, setNotification] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [submissionText, setSubmissionText] = useState("")

  const [selectedFile, setSelectedFile] = useState(null)

  const [showFullSchedule, setShowFullSchedule] = useState(false) 



  const today = new Date().toISOString().split('T')[0];

  const [missions, setMissions] = useState({

    Engenharia: { text: "Definir estratégia do robô.", deadline: today },

    Inovação: { text: "Pesquisar especialistas.", deadline: today },

    Gestão: { text: "Atualizar o Cronograma.", deadline: today }

  })





// --- FUNÇÃO DE CRONOGRAMA OFICIAL (12 ALUNOS) ---
  // Usamos useMemo para reconectar os dados assim que os alunos carregarem do Firebase
  const rotationSchedule = useMemo(() => { 
      const schedule = []; 
      let currentDate = new Date("2026-03-23"); // Data de Início

      // 1. CAPITÃS (Sempre Fixas em Gestão - Tarde)
      const capitasNames = ["Heloise", "Sofia"];

      // 2. APRENDIZES (Sexto Ano): Antônio, Heloisa, Helena (Rodízio Simplificado)

      // 3. POOL DO RODÍZIO (7 Alunos da Manhã)
      // Estes rodam nas vagas: 3 Eng, 3 Inov, 1 Gestão (Líder da Manhã)
      // Ciclo de 7 semanas para dar a volta completa
      const morningPool = [
          "Enzo", "Mariana", 
          "Lívia", "Arthur Silva", 
          "Benjamim", "Davi Miguel", 
          "Antônio Yamaguchi" 
      ];

      // Função auxiliar para criar objetos visuais (evita o "Vago")
      const getStudentObjects = (namesList) => {
          return namesList.map(nameStr => {
              // Correção: Comparação exata para diferenciar "Antônio" de "Antônio Yamaguchi"
              const found = students.find(s => s.name && s.name.trim().toLowerCase() === nameStr.trim().toLowerCase());
              if (found) return found; 
              // Cria objeto temporário se não achar no banco
              return { id: `fake-${nameStr}-${Math.random()}`, name: nameStr, avatarType: 'robot' };
          });
      };

      for (let i = 1; i <= 35; i++) { 
          const endDate = new Date(currentDate); 
          endDate.setDate(currentDate.getDate() + 4); 
          
          // --- LÓGICA DE ROTAÇÃO (CICLO DE 7) ---
          // A cada semana, giramos a lista dos 7 alunos uma posição
          // Assim, todos passam por Eng -> Inov -> Gestão
          const shift = (i - 1) % 7;
          const currentRotation = [...morningPool];
          
          // Realiza a rotação do array
          for(let k = 0; k < shift; k++) {
              currentRotation.push(currentRotation.shift());
          }

          // DISTRIBUIÇÃO INTERCALADA (EVITA REPETIÇÕES SEGUIDAS)
          // Para alternar e não ficar 3 semanas na mesma área:
          // Eng: Pega índices 0, 3, 5
          // Inov: Pega índices 2, 4, 6
          // Gestão: Pega índice 1
          const engTeam = [currentRotation[0], currentRotation[3], currentRotation[5]];
          const inovTeam = [currentRotation[2], currentRotation[4], currentRotation[6]];
          const morningLeader = [currentRotation[1]];

          // ONDE ENTRAM OS TRAINEES (6º ANO)?
          // Ciclo de 6 semanas: Rotaciona as duplas e as áreas para misturar bem (Todos trabalham com todos)
          const tList = ["Antônio Echenique", "Helena", "Heloisa"];
          const cycle = (i - 1) % 6; 
          
          let pair, solo;
          if (cycle < 2) { pair = [tList[0], tList[1]]; solo = tList[2]; }      // Ant & Hel
          else if (cycle < 4) { pair = [tList[1], tList[2]]; solo = tList[0]; } // Hel & Helo
          else { pair = [tList[2], tList[0]]; solo = tList[1]; }                // Helo & Ant

          if (cycle % 2 === 0) {
             engTeam.push(...pair);
             inovTeam.push(solo);
          } else {
             inovTeam.push(...pair);
             engTeam.push(solo);
          }

          // GESTÃO FINAL = Capitãs (Tarde) + Líder da Manhã
          const gestaoFinal = [...capitasNames, ...morningLeader];

          schedule.push({ 
              id: i, 
              weekName: `Semana ${i}`, 
              startDate: currentDate.toISOString().split('T')[0], 
              endDate: endDate.toISOString().split('T')[0], 
              assignments: { 
                  Engenharia: getStudentObjects(engTeam), 
                  Inovação:   getStudentObjects(inovTeam),
                  Gestão:     getStudentObjects(gestaoFinal) // Capitãs + Alunos
              } 
          }); 
          currentDate.setDate(currentDate.getDate() + 7); 
      } 
      return schedule;
  }, [students]); // <--- A mágica acontece aqui: atualiza quando "students" muda

  // --- 1. CÁLCULO DA SEMANA ATUAL (CÓDIGO NOVO) ---
  useEffect(() => {
    // Se não tiver cronograma, não faz nada
    if (!rotationSchedule || rotationSchedule.length === 0) return;
    
    const now = new Date();
    
    // Procura qual semana engloba o dia de hoje
    const found = rotationSchedule.find(w => {
        const start = new Date(w.startDate);
        const end = new Date(w.endDate);
        end.setHours(23, 59, 59); // Ajuste para pegar o final do dia
        return now >= start && now <= end;
    });

    if (found) {
        setCurrentWeekData(found);
    } else {
        // Fallback: Se hoje não estiver no cronograma, pega a primeira semana
        // Isso evita que o site fique carregando infinitamente nas férias
        console.log("Data fora do cronograma, usando semana 1 como padrão.");
        setCurrentWeekData(rotationSchedule[0]);
    }
  }, [rotationSchedule]);



  const getAttendanceStats = (student) => { const total = student.totalClasses || 1; const attended = student.attendedClasses || 0; const percent = Math.round((attended / total) * 100); const absences = total - attended; return { percent, absences }; }

  

  const getCurrentLevel = (xp) => LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[LEVELS.length - 1];

  const getNextLevel = (xp) => { const current = getCurrentLevel(xp); const next = LEVELS[LEVELS.indexOf(current) + 1]; return next ? next : null; }



 // 1. Sincronização com Firebase (Carrega os dados)
  useEffect(() => {
    if (!db) return;

    // Função auxiliar para criar ouvintes seguros
    const createListener = (colName, setter) => {
        return onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            console.log(`✅ ${colName} carregados com sucesso:`, data.length);
            setter(data);
        }, (error) => {
            console.error(`❌ ERRO CRÍTICO em ${colName}:`, error);
            showNotification(`Erro de conexão: ${error.code}`, "error");
        });
    };

    const unsubStudents = createListener("students", setStudents);
    const unsubExperts = createListener("experts", setExperts);
    const unsubRobot = createListener("robotVersions", setRobotVersions);
    const unsubRounds = createListener("rounds", setRounds);
    const unsubCompliments = createListener("compliments", setCompliments);
    const unsubMatrix = createListener("decisionMatrix", setDecisionMatrix);
    const unsubQuestions = createListener("questions", setQuestions);
    const unsubOutreach = createListener("outreach", setOutreachEvents);
    const unsubTasks = createListener("tasks", setTasks); // <--- GARANTINDO O LISTENER DE TAREFAS
    const unsubScoreHistory = createListener("score_history", setScoreHistory); // <--- LISTENER DO GRÁFICO
    
    // Listener do Diário de Bordo (agora condicional)
    let unsubLogbook;
    
    // Listener do Ranking de Pit Stop (Top 5 Melhores Tempos)
    const pitStopQuery = query(collection(db, "pitstop_records"), orderBy("time", "asc"), limit(5));
    const unsubPitStop = onSnapshot(pitStopQuery, (snap) => {
        setPitStopRecords(snap.docs.map(d => ({...d.data(), id: d.id})));
    });

    if (isAdmin) {
        // Admin: Pega todos os registros de todos os alunos
        // REMOVIDO orderBy('date', 'desc') para evitar erro de índice composto no collectionGroup por enquanto
        const logbookQuery = query(collectionGroup(db, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, refPath: doc.ref.path })); 
            // Ordena no cliente
            setLogbookEntries(entries.sort((a,b) => (b.weekId || 0) - (a.weekId || 0))); // Ordena por semana
        });
    } else if (viewAsStudent?.id) {
        // Aluno: Pega apenas os seus próprios registros
        const logbookQuery = query(collection(db, 'students', viewAsStudent.id, 'logbook'));
        unsubLogbook = onSnapshot(logbookQuery, (snapshot) => {
            const entries = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, refPath: doc.ref.path }));
            setLogbookEntries(entries.sort((a,b) => (b.weekId || 0) - (a.weekId || 0)));
        });
    }

    // ... dentro do useEffect principal ...
    const unsubProject = onSnapshot(collection(db, "project"), (s) => {
        if (!s.empty) {
            // Pega o primeiro documento encontrado
            setProjectSummary({ ...s.docs[0].data(), id: s.docs[0].id });
        }
    });

    // Listeners para as Rubricas
    const unsubInnovationRubric = onSnapshot(doc(db, "settings", "rubric_innovation"), (docSnap) => {
        if (docSnap.exists()) {
            setInnovationRubric(docSnap.data());
        }
    });
    const unsubRobotDesignRubric = onSnapshot(doc(db, "settings", "rubric_robot_design"), (docSnap) => {
        if (docSnap.exists()) {
            setRobotDesignRubric(docSnap.data());
        }
    });

    // ... e não esqueça de adicionar no return para limpar:
    // return () => { ... unsubProject(); };
    
    const unsubMissions = onSnapshot(collection(db, "missions"), (s) => {
        if (!s.empty) setMissionsList(s.docs.map(d => ({...d.data(), id: d.id})));
    });

    return () => {
        unsubStudents(); unsubExperts(); unsubRobot(); unsubRounds();
        unsubCompliments(); unsubMatrix(); unsubQuestions(); unsubScoreHistory();
        unsubOutreach(); unsubMissions(); unsubTasks(); unsubInnovationRubric(); unsubRobotDesignRubric(); if (unsubLogbook) unsubLogbook(); unsubPitStop();
    };
  }, []);

  // --- LÓGICA DO CRONÔMETRO ---
  useEffect(() => {
    let interval;
    if (activeTimer) {
        interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - activeTimer.start) / 1000);
            setTimerDisplay(diff);
        }, 200);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const toggleTimer = (round) => {
    if (activeTimer?.roundId === round.id) {
        // PARAR
        const preciseTime = Math.floor((Date.now() - activeTimer.start) / 1000);
        setRoundFormValues(prev => ({ ...prev, [round.id]: preciseTime })); // Preenche o input
        setActiveTimer(null);
        setTimerDisplay(0);
    } else {
        // INICIAR
        setActiveTimer({ roundId: round.id, start: Date.now(), name: round.name });
        setTimerDisplay(0);
    }
  };


  // --- FIM DOS USE EFFECTS ---

  // Função de notificação (corrigida)
  const showNotification = (msg, type = 'success') => { 
      setNotification({ msg, type }); 
      setTimeout(() => setNotification(null), 3000); 
  }

  const getStationStats = (stationName) => { const activeStudents = students.filter(s => s.station === stationName); const pendingReviews = activeStudents.filter(s => s.submission?.status === 'pending').length; return { totalActive: activeStudents.length, pendingReviews, isCompleted: activeStudents.length === 0 }; }

  const getStudentName = (id) => { const s = students.find(stud => stud.id === id); return s ? s.name : "Vaga"; }

  const convertBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error); });

  // --- FUNÇÃO ESPECÍFICA PARA FOTO DE PERFIL (COM CROP) ---
  const handleProfilePicSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await convertBase64(file);
      setCropImgSrc(base64);
      setCropScale(1);
      setCropPos({ x: 0, y: 0 });
      setIsCropping(true);
      e.target.value = null; // Limpa input
    }
  };

  // --- SALVAR O RECORTE ---
  const handleCropSave = () => {
      const canvas = document.createElement('canvas');
      const size = 200; // Tamanho padrão do avatar
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = cropImgSrc;
      img.onload = () => {
          // Preenche fundo (caso a imagem seja transparente)
          ctx.fillStyle = '#111';
          ctx.fillRect(0, 0, size, size);
          
          // Desenha a imagem com as transformações do usuário
          ctx.drawImage(img, cropPos.x, cropPos.y, img.naturalWidth * cropScale, img.naturalHeight * cropScale);
          
          const resultBase64 = canvas.toDataURL('image/jpeg', 0.9);
          
          // Atualiza o modal de aluno com a nova imagem recortada
          setModal(prev => ({ ...prev, data: { ...prev.data, avatarImage: resultBase64 } }));
          
          setIsCropping(false);
          setCropImgSrc(null);
      };
  };



  // --- ACTIONS ---

  const saveStudent = (newStudentData) => { setStudents(prev => { const exists = prev.find(s => s.id === newStudentData.id); return exists ? prev.map(s => s.id === newStudentData.id ? newStudentData : s) : [...prev, newStudentData]; }); }

  const deleteStudent = (id) => { setStudents(prev => prev.filter(s => s.id !== id)); }

  // --- FUNÇÕES DO KANBAN (TAREFAS) ---
  const handleAddTask = async (e) => {
      e.preventDefault();
      const text = e.target.taskText.value;
      const date = e.target.taskDate.value;
      if(!text) return;
      
      const author = isAdmin ? "Técnico" : (viewAsStudent?.name || "Equipe");

      try {
          await addDoc(collection(db, "tasks"), {
              text,
              status: 'todo', // todo, doing, done
              createdAt: new Date().toISOString(),
              author: author,
              dueDate: date
          });
          e.target.reset();
      } catch (error) {
          console.error("Erro ao criar tarefa:", error);
      }
  }

  const moveTask = async (id, newStatus) => {
      try {
          await updateDoc(doc(db, "tasks", id), { status: newStatus });
      } catch (error) {
          console.error("Erro ao mover tarefa:", error);
      }
  }

  const removeTask = async (id) => {
      if(window.confirm("Excluir tarefa permanentemente?")) {
          await deleteDoc(doc(db, "tasks", id));
      }
  }

  // --- FUNÇÃO PARA SALVAR DIÁRIO DE BORDO ---
  const handleLogbookSubmit = async (e) => {
      e.preventDefault();
      const text = e.target.entry.value;
      // Se não tiver semana definida, pega a atual ou a 1
      const weekId = currentWeekData?.id || 1;
      const weekName = currentWeekData?.weekName || "Semana Inicial";

      if (!text || !viewAsStudent?.id) return; // Apenas alunos podem escrever

      try {
          // O caminho agora é uma subcoleção dentro do documento do aluno
          const logbookRef = collection(db, 'students', viewAsStudent.id, 'logbook');
          
          // Usamos setDoc com um ID específico para evitar duplicatas na mesma semana?
          // Ou addDoc para permitir vários registros na semana?
          // Vamos usar addDoc para permitir vários insights na mesma semana.
          
          const newEntry = {
              // Ainda salvamos o nome para a visualização consolidada do técnico
              studentName: viewAsStudent.name, 
              text: text,
              weekId: weekId,       // Para ordenar
              weekName: weekName,   // Para exibir bonitinho
              date: new Date().toISOString(),
              tags: [] // Futuro: #Mecanica, #Prog
          };

          await addDoc(logbookRef, newEntry);

          e.target.reset();
          showNotification("Diário de Bordo atualizado! 📖");
      } catch (error) {
          console.error("Erro ao salvar diário:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  // --- FUNÇÃO PARA EXCLUIR REGISTRO DO DIÁRIO ---
  const handleDeleteLogbookEntry = async (entry) => {
      if (!window.confirm("Tem certeza que deseja apagar este registro?")) return;

      try {
          // Se temos o caminho completo (refPath), usamos ele. 
          // Senão (caso antigo), tentamos montar o caminho se soubermos o ID do aluno.
          const path = entry.refPath || `students/${viewAsStudent?.id}/logbook/${entry.id}`;
          await deleteDoc(doc(db, path));
          showNotification("Registro apagado.");
      } catch (error) {
          console.error("Erro ao apagar registro:", error);
          showNotification("Erro ao apagar.", "error");
      }
  }

 // 2. A função de excluir:
const handleDeleteStudent = async (studentId) => {
    // Confirmação para o técnico não excluir sem querer esbarrando no botão
    if (window.confirm("Tem certeza que deseja excluir este aluno do banco de dados? A ação não pode ser desfeita.")) {
        try {
            // A. Deleta o documento lá no Firebase
            const studentRef = doc(db, "students", studentId);
            await deleteDoc(studentRef);

            // B. Atualiza a tela (remove da lista local sem precisar atualizar a página)
            setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));

            alert("Aluno excluído com sucesso! 🗑️");
        } catch (error) {
            console.error("Erro ao excluir aluno no Firebase:", error);
            alert("Erro ao excluir. Verifique sua conexão ou regras do Firebase.");
        }
    }
};

const handleDeleteRound = async (id) => {
    console.log("Tentando apagar ID:", id); // Isso vai aparecer no F12 se funcionar

    if (confirm("Tem certeza que quer apagar esse registro?")) {
      try {
        // Tenta apagar com o nome 'strategies'
        await deleteDoc(doc(db, "strategies", id));
        
        // Tenta apagar com o nome 'robot_rounds'
        await deleteDoc(doc(db, "robot_rounds", id));

        // Tenta apagar com o nome 'rounds' (Muito comum!)
        await deleteDoc(doc(db, "rounds", id));

        // Tenta apagar com o nome 'history'
        await deleteDoc(doc(db, "history", id));
        
        // --- NOVO: Apaga também o histórico do gráfico deste round ---
        // Usamos o state 'scoreHistory' que já está carregado para não precisar fazer outra busca
        const historyToDelete = scoreHistory.filter(h => h.roundId === id);
        historyToDelete.forEach(async (h) => await deleteDoc(doc(db, "score_history", h.id)));

        showNotification("Registro apagado do banco!");
      } catch (error) {
        console.error("Erro fatal ao apagar:", error);
        alert("Erro no sistema: Olhe o Console (F12)");
      }
    }
  };
  
  // --- FUNÇÕES DE EXCLUSÃO (MATRIZ, ESPECIALISTAS, ROBÔ) ---
  const handleDeleteMatrix = async (id) => {
      if (window.confirm("Tem certeza que deseja excluir esta ideia da matriz?")) {
          try {
              await deleteDoc(doc(db, "decisionMatrix", id));
              showNotification("Ideia excluída com sucesso!");
          } catch (error) {
              console.error("Erro ao excluir ideia:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteExpert = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualização ao clicar na lixeira
      if (window.confirm("Tem certeza que deseja excluir este especialista?")) {
          try {
              await deleteDoc(doc(db, "experts", id));
              showNotification("Especialista excluído!");
          } catch (error) {
              console.error("Erro ao excluir especialista:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  const handleDeleteRobotVersion = async (e, id) => {
      e.stopPropagation(); // Evita abrir o modal de visualização
      if (window.confirm("Tem certeza que deseja excluir esta versão do robô?")) {
          try {
              await deleteDoc(doc(db, "robotVersions", id));
              showNotification("Versão do robô excluída!");
          } catch (error) {
              console.error("Erro ao excluir versão:", error);
              showNotification("Erro ao excluir.", "error");
          }
      }
  };

  // --- FUNÇÃO CORRIGIDA COM LOGS ---
  const handleRegisterSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      // Verifica se estamos editando ou criando
      const isEditing = modal.data?.id;

      // A imagem agora já vem processada e redimensionada pelo Crop e está em modal.data.avatarImage
      const avatarImage = modal.data?.avatarImage || null;

      // Cria o objeto de dados do aluno
      const studentData = { 
          name: fd.get('name'), 
          turma: fd.get('turma'), 
          username: fd.get('username'), 
          password: fd.get('password'), 
          avatarImage: avatarImage, // Novo campo para a foto
          // Mantém os outros campos se estiver editando
          xp: modal.data?.xp ?? 0,
          totalClasses: modal.data?.totalClasses ?? 0,
          attendedClasses: modal.data?.attendedClasses ?? 0,
          station: modal.data?.station ?? null,
          submission: modal.data?.submission ?? null,
          badges: modal.data?.badges ?? [],
          englishChallengeUnlocked: modal.data?.englishChallengeUnlocked ?? false,
      };

      try {
          if (isEditing) {
              // Atualiza aluno existente
              const studentRef = doc(db, "students", modal.data.id);
              await updateDoc(studentRef, studentData);
              showNotification("Dados do aluno atualizados!");
          } else {
              // Cria novo aluno
              await addDoc(collection(db, "students"), studentData);
              showNotification("Aluno cadastrado com acesso!"); 
          }
          
          closeModal(); 
      } catch (error) {
          console.error("Erro ao salvar aluno:", error);
          showNotification("Erro ao salvar. Veja o console (F12).", "error");
      }
  }

  // --- NOVO: SALVAR PROJETO DE INOVAÇÃO ---
  const handleProjectSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      // Processa a imagem
      let img = projectSummary?.image || null;
      if (selectedFile) img = await convertBase64(selectedFile);

      const projectData = {
          title: fd.get('title'),
          problem: fd.get('problem'),
          solution: fd.get('solution'),
          impact: fd.get('impact'), // Novo campo importante
          sharing: fd.get('sharing'),
          image: img
      };

      try {
          // Vamos salvar sempre com o ID 'main' para ser único
          await api_setDoc(doc(db, "project", "main"), projectData);
          setProjectSummary(projectData); // Atualiza na hora
          closeModal();
          showNotification("Projeto de Inovação atualizado!");
      } catch (error) {
          console.error("Erro ao salvar projeto:", error);
          // Fallback se o setDoc falhar (usa addDoc)
          try {
             await addDoc(collection(db, "project"), projectData);
             closeModal();
             showNotification("Projeto salvo (novo registro)!");
          } catch (e2) {
             showNotification("Erro ao salvar.", "error");
          }
      }
  }

  // --- FUNÇÕES DE OUTREACH (IMPACTO) ---
  const handleOutreachSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      let img = modal.data?.image || null;
      if (selectedFile) img = await convertBase64(selectedFile);

      const outreachData = {
          name: fd.get('name'),
          type: fd.get('type'),
          people: parseInt(fd.get('people')),
          date: fd.get('date'),
          feedback: fd.get('feedback'),
          image: img
      };

      await addDoc(collection(db, "outreach"), outreachData);
      closeModal();
      showNotification("Evento de impacto registrado!");
  }

  const handleAttendanceSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      // Pega todos os IDs marcados no checkbox (agora são strings do Firebase)
      const presentIds = fd.getAll('present').map(id => String(id));

      try {
          // Cria uma lista de "promessas" para atualizar todos ao mesmo tempo
          const updates = students.map(student => {
              const studentRef = doc(db, "students", student.id);
              
              const isPresent = presentIds.includes(String(student.id));
              
              // Calcula os novos valores
              const currentTotal = student.totalClasses || 0;
              const currentAttended = student.attendedClasses || 0;
              
              return updateDoc(studentRef, {
                  totalClasses: currentTotal + 1,
                  attendedClasses: isPresent ? currentAttended + 1 : currentAttended
              });
          });

          // Espera todos serem atualizados
          await Promise.all(updates);
          
          closeModal();
          showNotification("Frequência registrada no Firebase!");
      } catch (error) {
          console.error("Erro na chamada:", error);
          showNotification("Erro ao salvar frequência.", "error");
      }
  }
  const handleExpertSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target);
      
      // Processa a imagem (se houver)
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const expertData = { 
          name: fd.get('name'), 
          role: fd.get('role'), 
          date: fd.get('date'), 
          impact: fd.get('impact'), 
          notes: fd.get('notes'), 
          applied: fd.get('applied') === 'on', 
          image: img 
      };

      try {
          if (modal.data?.id) {
              // Se já tem ID, atualiza (Editar)
              await updateDoc(doc(db, "experts", modal.data.id), expertData);
          } else {
              // Se não tem ID, cria novo (Salvar)
              await addDoc(collection(db, "experts"), expertData);
          }
          closeModal(); 
          showNotification("Especialista salvo no banco!");
      } catch (error) {
          console.error("Erro ao salvar especialista:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleRobotSubmit = async (e) => { 
      e.preventDefault(); 
      const fd = new FormData(e.target); 
      
      let img = modal.data?.image || null; 
      if (selectedFile) img = await convertBase64(selectedFile); 
      
      const robotData = { 
          version: fd.get('version'), 
          name: fd.get('name'), 
          date: fd.get('date'), 
          changes: fd.get('changes'), 
          image: img 
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "robotVersions", modal.data.id), robotData);
          } else {
              await addDoc(collection(db, "robotVersions"), robotData);
          }
          closeModal(); 
          showNotification("Versão do robô salva!");
      } catch (error) {
          console.error("Erro ao salvar robô:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }




  const handleRoundSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const selectedMissions = Array.from(fd.getAll('missions'));
      
      // Calcula pontos somando as missões selecionadas
      const totalPoints = selectedMissions.reduce((acc, mid) => 
          acc + (missionsList.find(m => m.id === mid)?.points || 0), 0);

      const roundData = {
          name: fd.get('name'),
          startBase: fd.get('startBase'), // <--- SALVA A BASE ESCOLHIDA
          estimatedTime: parseInt(fd.get('time')),
          missions: selectedMissions,
          totalPoints
      };

      // --- LÓGICA DE DESENHO AUTOMÁTICO NA ESTRATÉGIA ---
      const pathColor = fd.get('pathColor') || '#ffff00';

      try {
          // 1. Salva o Round
          await addDoc(collection(db, "rounds"), roundData);

          // 2. Tenta criar o desenho automático da rota
          // Coordenadas aproximadas das bases (considerando canvas 800x450)
          let startX = 60; let startY = 225; // Base Esquerda (Padrão)
          if (roundData.startBase === 'Direita') { startX = 740; startY = 225; }

          // Constrói os pontos da linha [x1, y1, x2, y2, ...]
          let points = [startX, startY];
          
          selectedMissions.forEach(mId => {
              const m = missionsList.find(miss => miss.id === mId);
              if (m && m.x > 0 && m.y > 0) {
                  points.push(m.x, m.y);
              }
          });

          // Só cria se tivermos um caminho traçado (Base + pelo menos 1 missão com coordenadas)
          if (points.length > 2) {
              await addDoc(collection(db, "strategies"), {
                  name: `[AUTO] ${roundData.name}`,
                  mapId: 'mapa_padrao_local', // ID fixo usado no StrategyBoard
                  lines: [{ tool: 'pen', color: pathColor, points: points }],
                  createdAt: new Date().toISOString()
              });
              showNotification(`Rota automática criada com ${points.length/2} pontos! 🗺️`);
          } else {
              showNotification("Round salvo! (Sem rota automática)");
          }

          closeModal();
      } catch (error) {
          console.error("Erro ao salvar round:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleComplimentSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      
      const complimentData = {
          from: viewAsStudent.name,
          to: getStudentName(parseInt(fd.get('to'))), // Pega o nome do destinatário
          msg: fd.get('msg'),
          date: new Date().toLocaleDateString().slice(0,5)
      };

      try {
          // 1. Salva o elogio
          await addDoc(collection(db, "compliments"), complimentData);

          // 2. Dá XP para quem enviou (Gamificação!)
          const senderRef = doc(db, "students", viewAsStudent.id);
          // Nota: Para atualizar XP de forma segura, o ideal seria ler o doc atual, 
          // mas para simplificar vamos assumir o dado local:
          await updateDoc(senderRef, { 
              xp: (viewAsStudent.xp || 0) + 1 
          });

          closeModal();
          showNotification("Elogio enviado! (+1 XP)", "success");
      } catch (error) {
          console.error("Erro ao enviar elogio:", error);
          showNotification("Erro ao enviar.", "error");
      }
  }

  const handleMissionSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      let img = modal.data?.image || null;
      if (selectedFile) img = await convertBase64(selectedFile);

      const missionData = {
          code: fd.get('code'),
          name: fd.get('name'),
          points: parseInt(fd.get('points')),
          x: parseInt(fd.get('x')) || 0, // <--- COORDENADA X
          y: parseInt(fd.get('y')) || 0, // <--- COORDENADA Y
          image: img
      };

      try {
          if (modal.data?.id) {
              await updateDoc(doc(db, "missions", modal.data.id), missionData);
          } else {
              await addDoc(collection(db, "missions"), missionData);
          }
          closeModal();
          showNotification("Missão salva!");
      } catch (error) {
          console.error("Erro ao salvar missão:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }

  const handleGradesSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const student = modal.data; // Dados do aluno vindo do modal

      // 1. Calcula o bônus de XP baseado nas notas
      const gradesString = fd.get('grades');
      const grades = gradesString.split(',').map(g => parseFloat(g.trim()));
      let bonusXP = 0;
      
      grades.forEach(grade => {
          if (!isNaN(grade)) {
              if (grade === 10) bonusXP += 10;
              else if (grade >= 9.0) bonusXP += 7;
              else if (grade >= 8.0) bonusXP += 5;
          }
      });

      try {
          // 2. Atualiza apenas o XP do aluno no Firebase
          const studentRef = doc(db, "students", student.id);
          
          await updateDoc(studentRef, {
              xp: (student.xp || 0) + bonusXP
          });

          closeModal();
          showNotification(`Boletim lançado! +${bonusXP} XP salvos.`, "success");
      } catch (error) {
          console.error("Erro ao lançar notas:", error);
          showNotification("Erro ao atualizar XP.", "error");
      }
  }

  


  const handleMatrixSubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);

      const ideaData = {
          name: fd.get('name'),
          impact: parseInt(fd.get('impact')),
          cost: parseInt(fd.get('cost')),
          feasibility: parseInt(fd.get('feasibility')),
          innovation: parseInt(fd.get('innovation'))
      };

      try {
          await addDoc(collection(db, "decisionMatrix"), ideaData);
          closeModal(); 
          showNotification("Ideia salva na matriz!");
      } catch (error) {
          console.error("Erro ao salvar ideia:", error);
          showNotification("Erro ao salvar.", "error");
      }
  }


  const handleCloseStationWeek = async (station) => {
      const stationStudents = students.filter(s => s.station === station);
      if(stationStudents.length === 0) return;

      const approvedCount = stationStudents.filter(s => s.submission?.status === 'approved').length;
      const totalInStation = stationStudents.length;
      const isCompleteTeam = approvedCount === totalInStation;
      const BASE_XP = 50; 
      const PENALTY = 15;

      try {
          // Cria uma lista de atualizações para enviar tudo de uma vez
          const updates = stationStudents.map(student => {
              const studentRef = doc(db, "students", student.id);
              
              // Lógica de XP
              let xpGain = 0;
              if (student.submission?.status === 'approved') {
                  xpGain = isCompleteTeam ? BASE_XP : (BASE_XP - PENALTY);
              }

              // Prepara a atualização: Dá XP, remove a estação e limpa a entrega
              return updateDoc(studentRef, {
                  xp: (student.xp || 0) + xpGain,
                  station: null,
                  submission: null
              });
          });

          // Executa todas as atualizações no banco
          await Promise.all(updates);

          if(isCompleteTeam) showNotification(`Semana ${station} fechada! Sucesso Total!`, "success");
          else showNotification(`Semana ${station} fechada com penalidade.`, "error");

      } catch (error) {
          console.error("Erro ao fechar semana:", error);
          showNotification("Erro ao salvar fechamento.", "error");
      }
  }



  // --- MODAIS ---

  const openNewStudentModal = (data = null) => { setSelectedFile(null); setModal({ type: 'newStudent', data }); }

  const openReviewModal = (student) => setModal({ type: 'review', data: student });

  const openExpertModal = (data = null) => { setSelectedFile(null); setModal({ type: 'expertForm', data }); }

  const openRobotModal = (data = null) => { setSelectedFile(null); setModal({ type: 'robotForm', data }); }

  const openRubricModal = () => setModal({ type: 'rubric' });

  const openNewRoundModal = () => setModal({ type: 'newRound' });

  const openComplimentModal = () => setModal({ type: 'compliment' });

  const openAttendanceModal = () => setModal({ type: 'attendance' });

  const openImageModal = (imgUrl) => setModal({ type: 'imageView', data: imgUrl });

  const openExpertView = (data) => setModal({ type: 'expertView', data });

  const openRobotView = (data) => setModal({ type: 'robotView', data });

  const openGradesModal = (student) => setModal({ type: 'grades', data: student });

  const openProfileModal = (student) => setModal({ type: 'profile', data: student });
  const openPitStopModal = () => setModal({ type: 'pitstop' }); // <--- NOVO MODAL

  // Novos Modais

  const openMissionForm = (data = null) => { setSelectedFile(null); setModal({ type: 'missionForm', data }); }

  const openMatrixForm = () => setModal({ type: 'matrixForm' });
  const openOutreachForm = () => { setSelectedFile(null); setModal({ type: 'outreachForm' }); }


  // --- MODAL DE XP E APROVAÇÃO (CONECTADO) ---
  const openXPModal = (student, context = "manual") => { 
      setModal({ 
          type: 'xp', 
          data: { 
              student: student, 
              onConfirm: async (amount) => { 
                  const val = parseInt(amount); 
                  if (isNaN(val)) return; 
                  
                  try {
                      const studentRef = doc(db, "students", student.id);
                      
                      // Prepara a atualização do XP
                      const updateData = { xp: (student.xp || 0) + val };

                      // Se for contexto de aprovação, muda o status da entrega também
                      if (context === 'approval') {
                          // Mantém os dados da entrega, mas muda status para 'approved'
                          const newSubmission = { ...student.submission, status: 'approved' };
                          updateData.submission = newSubmission;
                      }

                      await updateDoc(studentRef, updateData);
                      
                      closeModal(); 
                      let msg = `XP atualizado: ${val > 0 ? '+' : ''}${val}`;
                      if (context === 'approval') msg = "Atividade Aprovada com Sucesso!";
                      showNotification(msg, "success");

                  } catch (error) {
                      console.error("Erro ao atualizar XP:", error);
                      showNotification("Erro ao salvar.", "error");
                  }
              } 
          } 
      }) 
  }

  const handleDeleteClick = (id) => { setModal({ type: 'confirm', data: { title: "Excluir?", msg: "Irreversível.", onConfirm: () => { deleteStudent(id); closeModal(); showNotification("Removido."); } } }) }

  // --- RECUSAR ATIVIDADE (CONECTADO) ---
  const handleRejectClick = (student) => { 
      setModal({ 
          type: 'confirm', 
          data: { 
              title: "Recusar Entrega?", 
              msg: "O aluno receberá um aviso para refazer.", 
              onConfirm: async () => { 
                  try {
                      const studentRef = doc(db, "students", student.id);
                      
                      // Muda status para 'rejected'
                      const newSubmission = { ...student.submission, status: 'rejected' };
                      
                      await updateDoc(studentRef, { submission: newSubmission });
                      
                      closeModal(); 
                      showNotification("Atividade recusada.", "error");
                  } catch (error) {
                      console.error("Erro ao recusar:", error);
                      showNotification("Erro ao salvar.", "error");
                  }
              } 
          } 
      }) 
  }

  // --- FUNÇÃO CORRIGIDA: MOVER ALUNO (Salva no Firebase) ---
  const moveStudent = async (id, st) => {
      try {
          // Referência ao documento do aluno no banco
          const studentRef = doc(db, "students", id);
          
          // Atualiza o campo 'station' no Firebase
          // Também limpamos a 'submission' anterior para ele começar zerado na nova estação
          await updateDoc(studentRef, { 
              station: st,
              submission: null 
          });

          // Feedback visual
          if (st) showNotification(`Aluno movido para ${st}`);
          else showNotification("Aluno voltou para a Equipe");

      } catch (error) {
          console.error("Erro ao mover aluno:", error);
          showNotification("Erro ao salvar mudança.", "error");
      }
  }
// --- CARREGAR AS METAS DO BANCO (Memória Longa) ---
  useEffect(() => {
    const docRef = doc(db, "settings", "weekly_missions");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setMissions(docSnap.data());
      } else {
        setMissions({ Engenharia: {}, Inovação: {}, Gestão: {} });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- ATUALIZAR NA TELA ENQUANTO DIGITAM (Memória Curta) ---
  const updateMission = (station, field, value) => {
    setMissions(prev => ({
      ...prev,
      [station]: { ...prev[station], [field]: value }
    }));
  };

  // --- FUNÇÃO PARA SALVAR A AUTO-AVALIAÇÃO DA RUBRICA ---
  const handleRubricUpdate = async (rubricType, category, value) => {
      const isInnovation = rubricType === 'innovation';
      const currentRubric = isInnovation ? innovationRubric : robotDesignRubric;
      const setRubricState = isInnovation ? setInnovationRubric : setRobotDesignRubric;
      const docId = isInnovation ? 'rubric_innovation' : 'rubric_robot_design';
 
      const newRubric = { ...currentRubric, [category]: parseInt(value) };
      setRubricState(newRubric); // Atualiza na tela imediatamente
      try {
          // Salva no banco de dados sem precisar de botão "Salvar"
          await setDoc(doc(db, "settings", docId), newRubric, { merge: true });
      } catch (error) {
          console.error(`Erro ao salvar rubrica de ${rubricType}:`, error);
          showNotification("Erro ao salvar auto-avaliação.", "error");
      }
  };

  // --- SALVAR NO BANCO QUANDO CLICAR FORA DA CAIXA (O Pulo do Gato) ---
  const saveMissionToFirebase = async (station) => {
    try {
      const docRef = doc(db, "settings", "weekly_missions");
      await setDoc(docRef, {
        [station]: missions[station]
      }, { merge: true });
      console.log(`Meta de ${station} salva no banco com sucesso!`); 
    } catch (error) {
      console.error("Erro ao salvar a meta da semana:", error);
    }
  };

  const closeModal = () => { setModal({ type: null, data: null }); setSelectedFile(null); }

// --- FUNÇÃO AUXILIAR PARA TRANSFORMAR O ARQUIVO EM TEXTO ---
  const convertToBase64 = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = (error) => reject(error);
      });
  };
const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleSubmitActivity = async (e) => { 
      e.preventDefault(); 
      setIsSubmitting(true);

      try {
          const submissionData = { 
              text: submissionText, // Apenas se houver campo de texto para o aluno responder
              fileName: "Enviado por email/externo", 
              fileUrl: "", // Removendo links
              date: new Date().toLocaleString(), 
              status: "pending" 
          };

          const studentRef = doc(db, "students", viewAsStudent.id);
          await updateDoc(studentRef, { 
              submission: submissionData 
          });

          setSubmissionText(""); 
          showNotification("Aviso de atividade enviado para validação pelo Técnico!");
      
      } catch (error) {
          console.error("Erro ao enviar:", error);
          showNotification("Erro ao sinalizar o Técnico.", "error");
      } finally {
          setIsSubmitting(false);
      }
  };
// ATENÇÃO: COLOQUE ISSO NO SEU CÓDIGO DO TÉCNICO
// --- FUNÇÃO DO BOTÃO 'BAIXAR ARQUIVO' NO PAINEL DO TÉCNICO ---
  const handleDownloadFile = (sub) => { 
      if (sub && sub.fileData) {
          // O navegador recria o arquivo a partir do texto e força o download
          const link = document.createElement("a");
          link.href = sub.fileData;
          link.download = sub.fileName || "atividade_baixada.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else {
          showNotification("Não há arquivo anexado ou o link está quebrado.", "error");
      }
  };
  // --- UI COMPONENTS ---

  const Notification = () => { if (!notification) return null; const isError = notification.type === 'error'; const isDownload = notification.type === 'download'; return (<div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300 border ${isError ? 'bg-red-500/10 border-red-500 text-red-500' : isDownload ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-green-500/10 border-green-500 text-green-500'}`}>{isError ? <AlertCircle size={24}/> : isDownload ? <Download size={24}/> : <CheckCircle size={24}/>}<span className="font-bold text-sm">{notification.msg}</span></div>) }



  // --- MODAL DE CRONOGRAMA (CORRIGIDO E ROBUSTO) ---
  const ScheduleModal = () => { 
    if(!showFullSchedule) return null; 

    // Função interna inteligente para resolver o nome
    // Aceita: ID, Objeto {name: "Ana"} ou String "Ana"
    const resolveName = (item) => {
        if (!item) return "Vago";
        
        // 1. Se for um objeto com nome (nosso fix anterior)
        if (typeof item === 'object' && item.name) return item.name;
        
        // 2. Se for um ID, tenta achar na lista de alunos
        const found = students.find(s => s.id === item);
        if (found) return found.name;

        // 3. Se não achou ID, assume que o próprio item é o nome (Texto)
        return item; 
    };

    return ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in backdrop-blur-sm"> 
            <div className="bg-[#151520] border border-white/10 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col relative shadow-2xl overflow-hidden"> 
                
                {/* Cabeçalho */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0a0a0f]">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                        <CalendarDays className="text-blue-500"/> Cronograma Completo (36 Semanas)
                    </h3>
                    <button onClick={() => setShowFullSchedule(false)} className="text-gray-400 hover:text-white p-2 bg-white/5 rounded-lg">
                        <X size={24}/>
                    </button>
                </div> 

                {/* Conteúdo com Scroll */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    <div className="min-w-[800px]"> 
                        {rotationSchedule.map((week, idx) => (
                            <div key={week.id || idx} className="mb-8 last:mb-0">
                                {/* Barra da Data */}
                                <div className="flex items-center gap-4 mb-4 sticky left-0">
                                    <div className="bg-white/5 px-4 py-1 rounded-full border border-white/10 text-yellow-400 font-bold text-sm">
                                        {week.weekName}
                                    </div>
                                    <div className="text-gray-500 text-xs font-mono">
                                        {week.startDate.split('-').reverse().join('/')} - {week.endDate.split('-').reverse().join('/')}
                                    </div>
                                    <div className="flex-1 border-b border-white/5 ml-4"></div>
                                </div>

                                {/* Grid das Estações */}
                                <div className="grid grid-cols-3 gap-4">
                                    
                                    {/* 1. Engenharia */}
                                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                        <h4 className="text-blue-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Rocket size={14}/> Engenharia</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Engenharia.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Inovação */}
                                    <div className="bg-pink-500/5 border border-pink-500/20 rounded-xl p-4">
                                        <h4 className="text-pink-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><Microscope size={14}/> Inovação</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Inovação.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] text-pink-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 3. Gestão (CORRIGIDO) */}
                                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                                        <h4 className="text-purple-500 font-bold text-xs uppercase mb-3 flex items-center gap-2"><BookOpen size={14}/> Gestão</h4>
                                        <div className="space-y-2">
                                            {week.assignments.Gestão.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-500 font-bold"><UserCircle size={14}/></div>
                                                    <span className="text-sm text-gray-300">{resolveName(item)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div> 
            </div> 
        </div> 
    ) 
  }



  // --- MODAL GERAL ---

  const renderModal = () => {

    if (!modal.type) return null;

    return (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">

        <div className={`bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full relative animate-in zoom-in-95 z-60 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar ${modal.type === 'imageView' ? 'max-w-4xl h-auto' : 'max-w-md max-h-[90vh]'}`}>

          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 z-50"><X size={20}/></button>



          {modal.type === 'imageView' && <img src={modal.data} className="w-full h-auto rounded-lg" alt="Evidência" />}

          {/* --- MODAL DE RECORTE (CROP) --- */}
          {isCropping && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
                <div className="bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm flex flex-col items-center">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Crop size={20}/> Ajustar Foto</h3>
                    
                    {/* Área de Visualização e Arrastar */}
                    <div 
                        className="relative w-[200px] h-[200px] bg-black overflow-hidden rounded-full border-4 border-purple-500 shadow-2xl mb-6 cursor-move touch-none"
                        onMouseDown={(e) => { setIsDragging(true); setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y }); }}
                        onMouseMove={(e) => { if(isDragging) setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); }}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        // Suporte a toque (celular)
                        onTouchStart={(e) => { setIsDragging(true); setDragStart({ x: e.touches[0].clientX - cropPos.x, y: e.touches[0].clientY - cropPos.y }); }}
                        onTouchMove={(e) => { if(isDragging) setCropPos({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y }); }}
                        onTouchEnd={() => setIsDragging(false)}
                    >
                        {cropImgSrc && (
                            <img 
                                src={cropImgSrc} 
                                alt="Crop" 
                                draggable={false}
                                style={{ 
                                    transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`, 
                                    transformOrigin: 'top left',
                                    maxWidth: 'none', maxHeight: 'none' // Permite zoom livre
                                }}
                                onLoad={(e) => {
                                    // Centraliza automaticamente ao carregar
                                    const img = e.target;
                                    const initialScale = Math.max(200 / img.naturalWidth, 200 / img.naturalHeight);
                                    setCropScale(initialScale); 
                                    setCropPos({ x: (200 - img.naturalWidth * initialScale) / 2, y: (200 - img.naturalHeight * initialScale) / 2 });
                                }}
                            />
                        )}
                    </div>

                    {/* Controle de Zoom */}
                    <div className="w-full mb-6 px-2">
                        <div className="flex justify-between text-xs text-gray-400 font-bold uppercase mb-2"><span>Zoom</span><span>{Math.round(cropScale * 100)}%</span></div>
                        <input type="range" min="0.1" max="3" step="0.05" value={cropScale} onChange={(e) => setCropScale(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button onClick={() => { setIsCropping(false); setCropImgSrc(null); }} className="flex-1 py-3 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10 font-bold">Cancelar</button>
                        <button onClick={handleCropSave} className="flex-1 py-3 rounded-lg bg-purple-600 text-white hover:bg-purple-500 font-bold shadow-lg shadow-purple-900/20">Confirmar</button>
                    </div>
                </div>
            </div>
          )}

          {/* --- NOVO MODAL: PERFIL DO ALUNO DETALHADO --- */}
          {modal.type === 'profile' && (
            <div className="animate-in zoom-in-95">
                {/* Header com Gradiente */}
                <div className="relative mb-8 text-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full opacity-50"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-4">
     {modal.data.avatarImage ? (
         <img src={modal.data.avatarImage} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-purple-500 shadow-lg mx-auto" />
     ) : (
         <div className="w-28 h-28 rounded-full bg-black/50 flex items-center justify-center border-4 border-gray-600 mx-auto">
             <UserCircle size={80} className="text-gray-500" />
         </div>
     )}
 </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-wider">{modal.data.name}</h2>
                        <p className="text-gray-400 font-mono text-sm bg-white/5 px-3 py-1 rounded-full mt-2 border border-white/10">{modal.data.turma} • {modal.data.station || "Membro da Equipe"}</p>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#151520] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getCurrentLevel(modal.data.xp).color.replace('text-', 'bg-')}`}></div>
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Nível Atual</span>
                        <span className={`text-xl font-black ${getCurrentLevel(modal.data.xp).color}`}>{getCurrentLevel(modal.data.xp).name}</span>
                        <span className="text-xs text-gray-400">{modal.data.xp} XP Totais</span>
                    </div>
                    <div className="bg-[#151520] p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-1 h-full ${getAttendanceStats(modal.data).percent > 75 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-gray-500 text-xs font-bold uppercase mb-1">Frequência</span>
                        <span className={`text-xl font-black ${getAttendanceStats(modal.data).percent > 75 ? 'text-green-500' : 'text-red-500'}`}>{getAttendanceStats(modal.data).percent}%</span>
                        <span className="text-xs text-gray-400">{getAttendanceStats(modal.data).absences} Faltas</span>
                    </div>
                </div>

                {/* Badges Collection */}
                <div className="mb-8">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
                        <Medal className="text-yellow-500"/> Coleção de Badges
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {BADGES_LIST.map(badge => {
                            const hasBadge = modal.data.badges?.includes(badge.id);
                            return (
                                <div key={badge.id} className={`relative p-3 rounded-xl border flex flex-col items-center text-center transition-all group ${hasBadge ? 'bg-gradient-to-br from-white/5 to-transparent border-yellow-500/30' : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}>
                                    <div className={`mb-2 ${hasBadge ? badge.color : 'text-gray-500'}`}>{badge.icon}</div>
                                    <span className="text-[10px] font-bold text-white leading-tight">{badge.name}</span>
                                    {hasBadge && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,1)]"></div>}
                                    
                                    {/* Tooltip Simples */}
                                    <div className="absolute bottom-full mb-2 bg-black border border-white/20 p-2 rounded text-[10px] text-gray-300 w-32 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 hidden sm:block">
                                        {badge.desc}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    {/* Botão de Editar (só aparece para o próprio aluno) */}
                    {viewAsStudent?.id === modal.data.id && (
                        <button 
                            onClick={() => {
                                closeModal(); // Fecha o modal de perfil
                                openNewStudentModal(modal.data); // Abre o modal de edição
                            }} 
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            Editar Perfil
                        </button>
                    )}
                    <button onClick={closeModal} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
          )}

          {modal.type === 'confirm' && <><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-gray-400 mb-6">{modal.data.msg}</p><div className="flex gap-3"><button onClick={closeModal} className="flex-1 py-3 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10">Cancelar</button><button onClick={modal.data.onConfirm} className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirmar</button></div></>}

          

          {/* ... MODAIS EXISTENTES (newStudent, expertForm, robotForm, rubric, xp, review, expertView, robotView, newRound, compliment, attendance, grades) MANTIDOS IGUAIS ... */}

{modal.type === 'newStudent' && (
  <form onSubmit={handleRegisterSubmit}>
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
      <UserPlus className="text-green-500"/> {modal.data ? 'Editar' : 'Novo'} Aluno
    </h3>
    
    {/* DADOS BÁSICOS */}
    <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label>
            <input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Ana Silva" />
        </div>
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Turma</label>
            <input name="turma" defaultValue={modal.data?.turma} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: 8º A" />
        </div>
    </div>

    {/* DADOS DE LOGIN (COM FUNDO CINZA PARA ORGANIZAR) */}
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 mb-6">
        <div className="flex items-center gap-2 mb-3 text-yellow-500">
            <Lock size={14} />
            <span className="text-xs font-bold uppercase">Acesso do Aluno</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Usuário</label>
                <input name="username" defaultValue={modal.data?.username} required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="ana.fll" />
            </div>
            <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Senha</label>
                <input name="password" defaultValue={modal.data?.password} required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="1234" />
            </div>
        </div>
    </div>

    {/* UPLOAD DE FOTO */}
    <div className="mb-6">
        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto de Perfil</label>
        <div className="flex items-center gap-4 bg-black/30 p-3 rounded-lg border border-white/10">
            {modal.data?.avatarImage ? ( <img src={modal.data.avatarImage} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 shadow-lg"/> ) : ( <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center border-2 border-dashed border-gray-600"> <UserCircle size={32} className="text-gray-500" /> </div> )}
            <input type="file" onChange={handleProfilePicSelect} accept="image/*" className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer"/>
        </div>
    </div>
    
    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all">
        {modal.data ? 'Salvar Alterações' : 'Cadastrar Aluno'}
    </button>
  </form>
)}
          {modal.type === 'expertForm' && (<form onSubmit={handleExpertSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Briefcase className="text-purple-500"/> {modal.data ? 'Editar' : 'Novo'} Especialista</h3><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Cargo</label><input name="role" defaultValue={modal.data?.role} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Anotações</label><textarea name="notes" defaultValue={modal.data?.notes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" /></div><div className="mb-4 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-500/10 file:text-purple-500 hover:file:bg-purple-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><div className="mb-6 flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10"><div><span className="text-sm font-bold text-white">Impactou?</span></div><select name="impact" defaultValue={modal.data?.impact} className="bg-black/50 border border-white/20 text-white p-2 rounded text-sm"><option value="Baixo">Baixo</option><option value="Médio">Médio</option><option value="Alto">Alto</option></select><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" name="applied" defaultChecked={modal.data?.applied} className="w-5 h-5 accent-green-500" /><span className="text-xs text-white">Aplicado</span></label></div><button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Salvar Registro</button></form>)}

          {modal.type === 'robotForm' && (<form onSubmit={handleRobotSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GitCommit className="text-blue-500"/> {modal.data ? 'Editar' : 'Novo'} Versão</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Versão</label><input name="version" defaultValue={modal.data?.version} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: V2.0" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Data</label><input name="date" type="date" defaultValue={modal.data?.date} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Apelido</label><input name="name" defaultValue={modal.data?.name} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div><div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">O que mudou?</label><textarea name="changes" defaultValue={modal.data?.changes} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" /></div><div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência (Foto)</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado: {selectedFile.name}</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Versão</button></form>)}

        

          {modal.type === 'xp' && (<form onSubmit={(e) => { e.preventDefault(); modal.data.onConfirm(e.target[0].value); }}><div className="flex items-center gap-3 mb-6"><div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-500"><Scale size={24}/></div><div><h3 className="text-xl font-bold text-white">Gerenciar XP</h3><p className="text-xs text-gray-400">Aluno: {modal.data.student.name}</p></div></div><input type="number" autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white mb-6 font-mono text-lg focus:border-yellow-500 outline-none" placeholder="Ex: 50 ou -20" /><div className="grid grid-cols-4 gap-2 mb-6"><button type="button" onClick={()=>modal.data.onConfirm(10)} className="bg-green-500/10 text-green-500 text-xs py-2 rounded border border-green-500/20 hover:bg-green-500 hover:text-black">+10</button><button type="button" onClick={()=>modal.data.onConfirm(50)} className="bg-green-500/10 text-green-500 text-xs py-2 rounded border border-green-500/20 hover:bg-green-500 hover:text-black">+50</button><button type="button" onClick={()=>modal.data.onConfirm(-10)} className="bg-red-500/10 text-red-500 text-xs py-2 rounded border border-red-500/20 hover:bg-red-500 hover:text-white">-10</button><button type="button" onClick={()=>modal.data.onConfirm(-50)} className="bg-red-500/10 text-red-500 text-xs py-2 rounded border border-red-500/20 hover:bg-red-500 hover:text-white">-50</button></div><button className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg">Confirmar</button></form>)}

          {modal.type === 'review' && (
  <div className="animate-in fade-in">
    <h3 className="text-xl font-bold text-white mb-1">Revisar Entrega</h3>
    <p className="text-sm text-gray-400 mb-4">{modal.data.name} - {modal.data.turma}</p>
    
    <div className="bg-black/50 p-4 rounded-xl mb-6 border border-white/5">
      <p className="text-gray-200 text-sm mb-4 leading-relaxed">"{modal.data.submission.text}"</p>
      
      {/* --- BOTÃO DE DOWNLOAD (VERSÃO BASE64) --- */}
      <button 
        onClick={(e) => {
           e.stopPropagation();
           const fileData = modal.data.submission.fileData;
           const fileName = modal.data.submission.fileName || "arquivo_download";

           if (fileData) {
             // Truque para baixar arquivo Base64
             const link = document.createElement("a");
             link.href = fileData;
             link.download = fileName; // O segredo está aqui: força o download com o nome certo
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
           } else {
             alert("⚠️ Erro: O conteúdo do arquivo não foi encontrado.");
           }
        }} 
        className="text-xs bg-white/10 px-3 py-2 rounded text-white flex items-center gap-2 hover:bg-white/20 transition-colors w-full justify-center font-bold border border-white/10"
      >
        <Download size={14}/> 
        {modal.data.submission.fileName || "Baixar Arquivo"}
      </button>
      {/* ----------------------------------------- */}

    </div>

    <div className="flex gap-3">
      <button onClick={() => handleRejectClick(modal.data)} className="flex-1 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">Recusar</button>
      <button onClick={() => openXPModal(modal.data, 'approval')} className="flex-1 py-3 bg-green-500 text-black font-bold rounded-xl hover:bg-green-400 transition-colors shadow-lg shadow-green-900/20">Aprovar (+XP)</button>
    </div>
  </div>
)}
          {modal.type === 'expertView' && (<div><h3 className="text-xl font-bold text-white mb-1">{modal.data.name}</h3><p className="text-sm text-purple-400 mb-4">{modal.data.role} • {modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-4"><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">"{modal.data.notes}"</p></div><div className="flex gap-4 mb-6"><div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><span className="text-[10px] text-gray-400 uppercase font-bold">Impacto</span><span className={`text-xs font-bold ${modal.data.impact==='Alto'?'text-green-500':modal.data.impact==='Médio'?'text-yellow-500':'text-gray-500'}`}>{modal.data.impact}</span></div>{modal.data.applied && <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20"><CheckCircle size={12} className="text-green-500"/><span className="text-xs font-bold text-green-500">Sugestão Aplicada</span></div>}</div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Evidência Anexada</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="Evidência" /></div>)}</div>)}

          {modal.type === 'robotView' && (<div><div className="flex justify-between items-start mb-2"><h3 className="text-xl font-bold text-white">{modal.data.name}</h3><span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-mono font-bold">{modal.data.version}</span></div><p className="text-xs text-gray-500 mb-6">{modal.data.date}</p><div className="bg-black/50 border border-white/10 p-4 rounded-xl mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Mudanças e Testes</label><p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{modal.data.changes}</p></div>{modal.data.image && (<div className="mt-4"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do Protótipo</label><img src={modal.data.image} className="w-full rounded-lg border border-white/10" alt="Robô" /></div>)}</div>)}

          {modal.type === 'newRound' && (<form onSubmit={handleRoundSubmit}>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-blue-500"/> Planejar Saída</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Saída</label><input name="name" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Saída 1" /></div>
                  <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tempo Estimado (s)</label><input name="time" type="number" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="30" /></div>
              </div>

              {/* SELEÇÃO DE BASE */}
              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Base de Saída</label>
                  <div className="flex gap-4">
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-blue-500 transition-colors"><input type="radio" name="startBase" value="Esquerda" defaultChecked className="accent-blue-500"/><span className="text-sm text-white">Esquerda (Vermelho)</span></label>
                      <label className="flex items-center gap-2 bg-black/50 p-3 rounded-lg border border-white/20 flex-1 cursor-pointer hover:border-red-500 transition-colors"><input type="radio" name="startBase" value="Direita" className="accent-red-500"/><span className="text-sm text-white">Direita (Azul)</span></label>
                  </div>
              </div>

              {/* SELEÇÃO DE COR DA ROTA (NOVO) */}
              <div className="mb-4">
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Cor da Rota (Desenho Automático)</label>
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                      {['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316', '#ffffff'].map(c => (
                          <label key={c} className="cursor-pointer">
                              <input type="radio" name="pathColor" value={c} className="peer sr-only" defaultChecked={c==='#eab308'}/>
                              <div className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-white peer-checked:scale-110 transition-all shadow-lg" style={{backgroundColor: c}}></div>
                          </label>
                      ))}
                  </div>
                  <p className="text-[10px] text-gray-500">Se as missões tiverem coordenadas X/Y configuradas, o sistema desenhará o caminho na mesa.</p>
              </div>

              <div className="mb-6 max-h-40 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg p-2"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block sticky top-0 bg-[#151520] pb-2">Missões (Selecione)</label>{missionsList.map(m => (<label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"><input type="checkbox" name="missions" value={m.id} className="accent-blue-500 w-4 h-4"/><div className="flex items-center gap-2 flex-1">{m.image && <img src={m.image} className="w-6 h-6 rounded object-cover" alt="M" />}<span className="text-sm text-gray-300">{m.code} - {m.name}</span></div><span className="text-xs font-bold text-blue-500">+{m.points}pts</span></label>))}</div><button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Saída</button></form>)}

    

          {modal.type === 'attendance' && (<form onSubmit={handleAttendanceSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-green-500"/> Chamada do Dia</h3><div className="mb-6 max-h-60 overflow-y-auto custom-scrollbar">{students.map(s => { const stats = getAttendanceStats(s); return ( <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg border-b border-white/5 cursor-pointer"><input type="checkbox" name="present" value={s.id} defaultChecked className="accent-green-500 w-5 h-5"/><div className="flex-1"><span className="text-white font-bold block">{s.name}</span><span className="text-xs text-gray-500">{s.turma} • Presença: <span className={stats.percent < 75 ? 'text-red-500' : 'text-green-500'}>{stats.percent}%</span> • Faltas: {stats.absences}</span></div></label>) })}</div><button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">Confirmar Presença</button></form>)}

          {modal.type === 'grades' && (<form onSubmit={handleGradesSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GraduationCap className="text-yellow-500"/> Lançar Notas SESI</h3><p className="text-xs text-gray-400 mb-6">Digite as notas da etapa separadas por vírgula (Ex: 10, 9.5, 8.0).</p><div className="mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Notas do Aluno: {modal.data.name}</label><input name="grades" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" placeholder="Ex: 10, 9.5, 8.0" /></div><div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 mb-6 space-y-1"><p className="font-bold text-white mb-2">Regra de Pontuação:</p><p>• Nota 10 = <span className="text-green-500 font-bold">+10 XP</span></p><p>• Nota 9.0 a 9.9 = <span className="text-cyan-500 font-bold">+7 XP</span></p><p>• Nota 8.0 a 8.9 = <span className="text-purple-500 font-bold">+5 XP</span></p><p>• Abaixo de 8.0 = +0 XP</p></div><button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg">Processar Boletim</button></form>)}

          
          {/* --- NOVO MODAL: TREINO DE PIT STOP --- */}
          {modal.type === 'pitstop' && <PitStopModal viewAsStudent={viewAsStudent} pitStopRecords={pitStopRecords} showNotification={showNotification} />}

          {/* NOVO MODAL: EDITOR DE MISSÕES */}

          {modal.type === 'missionForm' && (

             <form onSubmit={handleMissionSubmit}>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Settings className="text-blue-500"/> {modal.data ? 'Editar' : 'Nova'} Missão</h3>

                <div className="grid grid-cols-3 gap-4 mb-4">

                    <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Código</label><input name="code" defaultValue={modal.data?.code} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="M01" /></div>

                    <div className="col-span-2"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Coral Nursery" /></div>

                </div>

                <div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pontos (Máx)</label><input name="points" type="number" defaultValue={modal.data?.points} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Missão</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-500 hover:file:bg-blue-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div>

                <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg">Salvar Missão</button>

             </form>
             

          )}



          {/* NOVO MODAL: MATRIZ DE DECISÃO */}

          {modal.type === 'matrixForm' && (

             <form onSubmit={handleMatrixSubmit}>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><BarChart3 className="text-purple-500"/> Nova Ideia</h3>

                <div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome da Ideia / Solução</label><input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="Ex: Filtro de Carvão" /></div>

                <p className="text-xs text-gray-400 font-bold mb-2 uppercase">Pontuação (1 = Ruim, 5 = Excelente)</p>

                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div><label className="text-[10px] text-gray-500 block mb-1">Impacto (Peso x3)</label><input name="impact" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Custo (Peso x2)</label><input name="cost" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Facilidade (Peso x1)</label><input name="feasibility" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                    <div><label className="text-[10px] text-gray-500 block mb-1">Inovação (Peso x2)</label><input name="innovation" type="number" min="1" max="5" required className="w-full bg-black/50 border border-white/20 p-2 rounded text-white"/></div>

                </div>

                <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg">Adicionar à Matriz</button>

             </form>

          )}

          {/* NOVO MODAL: EDITOR DO PROJETO */}
          {modal.type === 'projectForm' && (
             <form onSubmit={handleProjectSubmit}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                    <Lightbulb className="text-yellow-500"/> Editar Projeto de Inovação
                </h3>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Projeto / Solução</label>
                    <input name="title" defaultValue={projectSummary?.title} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-yellow-500 outline-none font-bold text-lg" placeholder="Ex: Filtro Bio-Sintético" />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-red-400">O Problema</label>
                        <textarea name="problem" defaultValue={projectSummary?.problem} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-red-500 outline-none resize-none" placeholder="Qual problema vocês resolveram?" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-green-400">A Solução</label>
                        <textarea name="solution" defaultValue={projectSummary?.solution} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-32 focus:border-green-500 outline-none resize-none" placeholder="Como funciona a invenção?" />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-1 block text-blue-400">Impacto (Para os Juízes)</label>
                    <textarea name="impact" defaultValue={projectSummary?.impact} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white h-20 focus:border-blue-500 outline-none" placeholder="Quem isso ajuda? Qual o benefício real?" />
                </div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto do Protótipo / Desenho</label>
                    <input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-500/10 file:text-yellow-500 hover:file:bg-yellow-500/20 cursor-pointer" />
                    {projectSummary?.image && !selectedFile && <div className="mt-2 text-xs text-green-500">Imagem atual já salva.</div>}
                </div>

                <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg">Salvar Projeto Oficial</button>
             </form>
          )}

        </div>

      </div>

    )

  }



  // --- COMPONENTE DE ESTRATÉGIA ---

  const StrategyView = () => (

      <div className="animate-in fade-in duration-300 space-y-8">

          

          {/* MATRIZ DE DECISÃO (NOVO) */}

          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">

              <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="text-purple-500"/> Matriz de Decisão (Pugh Matrix)</h3><button onClick={openMatrixForm} className="text-xs bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500 hover:text-white font-bold">+ Nova Ideia</button></div>

              <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-xs text-gray-500 uppercase border-b border-white/10"><tr><th className="p-3">Ideia</th><th className="p-3 text-center">Impacto (x3)</th><th className="p-3 text-center">Custo (x2)</th><th className="p-3 text-center">Fácil (x1)</th><th className="p-3 text-center">Inovação (x2)</th><th className="p-3 text-right text-white">Total</th><th className="p-3"></th></tr></thead><tbody>

                  {decisionMatrix.sort((a,b) => (b.impact*3 + b.cost*2 + b.feasibility + b.innovation*2) - (a.impact*3 + a.cost*2 + a.feasibility + a.innovation*2)).map(item => {

                      const total = (item.impact*3) + (item.cost*2) + (item.feasibility) + (item.innovation*2);

                      return (<tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="p-3 font-bold text-white">{item.name}</td><td className="p-3 text-center text-gray-400">{item.impact}</td><td className="p-3 text-center text-gray-400">{item.cost}</td><td className="p-3 text-center text-gray-400">{item.feasibility}</td><td className="p-3 text-center text-gray-400">{item.innovation}</td><td className="p-3 text-right font-black text-purple-400 text-lg">{total}</td><td className="p-3 text-right"><button onClick={() => handleDeleteMatrix(item.id)} className="text-gray-600 hover:text-red-500 p-1 transition-colors"><Trash2 size={16}/></button></td></tr>)

                  })}

              </tbody></table></div>

          </div>



          <div className="grid lg:grid-cols-3 gap-6">

            <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">

                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="text-pink-500"/> Especialistas</h3><button onClick={() => openExpertModal()} className="text-xs bg-pink-500/10 text-pink-500 border border-pink-500/20 px-3 py-1.5 rounded-lg hover:bg-pink-500 hover:text-white font-bold">+ Novo</button></div>

                <div className="space-y-4">{experts.map(exp => (<div key={exp.id} onClick={() => openExpertView(exp)} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative group cursor-pointer hover:bg-white/5 transition-colors">
                    {/* Botões de Ação (Editar e Excluir) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => { e.stopPropagation(); openExpertModal(exp); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                        <button onClick={(e) => handleDeleteExpert(e, exp.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex justify-between items-start pr-6"><div><span className="text-white font-bold block text-sm">{exp.name}</span><span className="text-xs text-gray-400">{exp.role}</span></div>{exp.applied ? <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-1 rounded">APLICADO</span> : <span className="bg-gray-500/20 text-gray-500 text-[9px] px-2 py-1 rounded">CONSULTA</span>}</div><p className="text-xs text-gray-300 italic line-clamp-3">"{exp.notes}"</p>{exp.image && <div className="text-[10px] text-pink-400 flex items-center gap-1 mt-1"><ImageIcon size={10}/> Tem evidência</div>}<div className="h-1 rounded-full bg-gray-700 mt-1"><div className={`h-1 rounded-full ${exp.impact==='Alto'?'bg-green-500 w-full':exp.impact==='Médio'?'bg-yellow-500 w-1/2':'bg-gray-500 w-1/4'}`}></div></div></div>))}</div>

            </div>

            <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">

                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><GitCommit className="text-blue-500"/> Diário do Robô</h3><button onClick={() => openRobotModal()} className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold">+ Versão</button></div>

                <div className="relative pl-4 border-l border-white/10 space-y-8">{robotVersions.map((ver, idx) => (<div key={ver.id} onClick={() => openRobotView(ver)} className="relative group cursor-pointer"><div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151520]"></div><div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">
                    {/* Botões de Ação (Editar e Excluir) */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button onClick={(e) => { e.stopPropagation(); openRobotModal(ver); }} className="text-gray-400 hover:text-white p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Pencil size={14}/></button>
                        <button onClick={(e) => handleDeleteRobotVersion(e, ver.id)} className="text-gray-400 hover:text-red-500 p-1.5 bg-black/60 rounded-lg backdrop-blur-sm"><Trash2 size={14}/></button>
                    </div>
                    <div className="flex justify-between mb-2"><span className="text-blue-400 font-mono font-bold text-xs">{ver.version}</span><span className="text-[10px] text-gray-500">{ver.date.split('-').reverse().slice(0,2).join('/')}</span></div><h4 className="text-white font-bold mb-1 text-sm">{ver.name}</h4><p className="text-xs text-gray-400 line-clamp-2">{ver.changes}</p>{ver.image && <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-2"><ImageIcon size={10}/> Tem foto</div>}</div></div>))}</div>

            </div>


          </div>

      </div>

  )

  // --- GRÁFICO DE EVOLUÇÃO (SVG PURO) ---
  const ScoreEvolutionChart = () => {
      // Estado local para filtrar o gráfico
      const [chartFilter, setChartFilter] = useState('score_total'); // 'score_total' ou ID do round
      
      // Prepara os dados baseado no filtro
      let rawData = [];
      let yLabel = "pts";
      let color = "#22c55e"; // Verde para pontos
      const isGeneral = chartFilter === 'score_total';

      if (isGeneral) {
          // Pega apenas históricos de pontuação total
          rawData = scoreHistory.filter(h => !h.roundId);
      } else {
          // Pega histórico de TEMPO de um round específico
          rawData = scoreHistory.filter(h => h.roundId === chartFilter);
          yLabel = "seg";
          color = "#3b82f6"; // Azul para tempo
      }

      // --- FUNÇÃO PARA LIMPAR O GRÁFICO ATUAL ---
      const handleClearChart = async () => {
        const confirmMsg = isGeneral 
            ? "ZERAR o gráfico geral de Pontos/Tempo? Isso apaga todo o histórico da equipe." 
            : "Limpar o histórico de tempos deste round?";
            
        if (!window.confirm(confirmMsg)) return;
        
        // Apaga apenas os documentos que estão sendo mostrados no gráfico agora
        try {
            const deletePromises = rawData.map(d => deleteDoc(doc(db, "score_history", d.id)));
            await Promise.all(deletePromises);
            showNotification("Histórico do gráfico limpo!", "success");
        } catch (error) {
            console.error("Erro ao limpar gráfico:", error);
            showNotification("Erro ao limpar.", "error");
        }
      };

      const data = [...rawData].sort((a,b) => new Date(a.date) - new Date(b.date));

      if (data.length < 2 && isGeneral) return (
        <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8 text-center text-gray-500 text-sm flex flex-col items-center justify-center h-48">
            <TrendingUp size={32} className="mb-2 opacity-50"/>
            <p>Registre pelo menos 2 treinos para ver o gráfico de evolução.</p>
        </div>
      );

      const width = 800;
      const height = 200;
      const padding = 20;
      
      // Se for tempo, queremos ver cair (mas gráfico svg padrão sobe valores, então tratamos visualmente)
      const valKey = chartFilter === 'score_total' ? 'score' : 'time';
      
      // ESCALAS (Máximos)
      const maxScore = Math.max(...data.map(d => d.score || 0), 100);
      const maxTime = Math.max(...data.map(d => d.time || 0), isGeneral ? 150 : 60); // 150s para geral, 60s para round

      const minVal = 0; // Sempre base zero para facilitar leitura

      // Função para converter dados em coordenadas X,Y
      const getX = (index) => padding + (index / (data.length - 1)) * (width - 2 * padding);
      
      // Y dinâmico (Pontos ou Tempo)
      const getY = (val, type = 'score') => {
          const max = type === 'time' ? maxTime : maxScore;
          return height - padding - ((val || 0) / max) * (height - 2 * padding);
      };

      // Cria o caminho da linha (path d)
      const pathDataMain = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[valKey], isGeneral ? 'score' : 'time')}`).join(' ');
      
      // Linha secundária (Tempo) apenas se for Geral
      const pathDataTime = isGeneral ? data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.time || 0, 'time')}`).join(' ') : "";

      // Cria o caminho para o preenchimento (area fill)
      const fillPathData = `${pathDataMain} L ${width - padding} ${height} L ${padding} ${height} Z`;

      return (
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white font-bold flex items-center gap-2">
                      <TrendingUp style={{ color }}/> {isGeneral ? 'Evolução (Pontos vs Tempo)' : 'Melhoria de Tempo (Segundos)'}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                  {/* Botão de Limpar Histórico */}
                  {data.length > 0 && (
                      <button onClick={handleClearChart} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-lg transition-colors" title="Zerar este gráfico">
                          <Trash2 size={16}/>
                      </button>
                  )}

                  {/* SELETOR DE GRÁFICO */}
                  <select 
                    className="bg-black/40 border border-white/20 text-xs text-white rounded-lg p-2 outline-none focus:border-blue-500"
                    value={chartFilter}
                    onChange={(e) => setChartFilter(e.target.value)}
                  >
                      <option value="score_total">📊 Pontuação Geral</option>
                      {rounds.map(r => (
                          <option key={r.id} value={r.id}>⏱️ Tempo: {r.name}</option>
                      ))}
                  </select>
                  </div>
              </div>

              {data.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-gray-500 text-xs italic border border-dashed border-white/10 rounded-xl">
                      Sem dados registrados para este gráfico ainda.
                  </div>
              ) : (
              <div className="w-full overflow-hidden relative">
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto drop-shadow-2xl">
                      {/* Gradiente de Fundo */}
                      <defs>
                          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
                              <stop offset="100%" stopColor={color} stopOpacity="0"/>
                          </linearGradient>
                      </defs>

                      {/* Linhas de Grade Horizontal (Baseadas na escala principal) */}
                      {[0, 0.25, 0.5, 0.75, 1].map(p => {
                          const y = height - padding - (p * (height - 2 * padding));
                          return <line key={p} x1={padding} y1={y} x2={width-padding} y2={y} stroke="#333" strokeDasharray="4 4" strokeWidth="1"/>
                      })}

                      {/* Área Preenchida (Apenas Principal) */}
                      <path d={fillPathData} fill={isGeneral ? "url(#scoreGradient)" : "none"} />

                      {/* SEGUNDA LINHA: TEMPO (AZUL) - Só no Geral */}
                      {isGeneral && (
                        <>
                            <path d={pathDataTime} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
                            {data.map((d, i) => (
                                <circle key={`t-${d.id}`} cx={getX(i)} cy={getY(d.time || 0, 'time')} r="3" fill="#151520" stroke="#3b82f6" strokeWidth="2" />
                            ))}
                        </>
                      )}

                      {/* LINHA PRINCIPAL (VERDE ou AZUL) */}
                      <path d={pathDataMain} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Pontos */}
                      {data.map((d, i) => (
                          (() => {
                            const yPos = getY(d[valKey], isGeneral ? 'score' : 'time');
                            const dateText = new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

                            return (
                                <g key={d.id} className="group">
                                    <circle cx={getX(i)} cy={yPos} r="4" fill="#151520" stroke={color} strokeWidth="2" />
                                    
                                    {/* Tooltip Aprimorado */}
                                    <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <rect 
                                            x={getX(i) - 45} 
                                            y={yPos - (isGeneral ? 60 : 48)} 
                                            width="90" 
                                            height={isGeneral ? 55 : 40} 
                                            rx="5" 
                                            fill="black" 
                                            fillOpacity="0.9"
                                            stroke="#555"
                                            strokeWidth="1"
                                        />
                                        
                                        {isGeneral ? (
                                            <>
                                                <text x={getX(i)} y={yPos - 45} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.score} pts</text>
                                                <text x={getX(i)} y={yPos - 30} textAnchor="middle" fill="#3b82f6" fontSize="10" fontWeight="bold">{d.time ? `${d.time}s` : '--'}</text>
                                                <text x={getX(i)} y={yPos - 15} textAnchor="middle" fill="#9ca3af" fontSize="10">{dateText}</text>
                                            </>
                                        ) : (
                                            <>
                                                <text x={getX(i)} y={yPos - 35} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{d.time} seg</text>
                                                <text x={getX(i)} y={yPos - 20} textAnchor="middle" fill="#9ca3af" fontSize="10">{dateText}</text>
                                            </>
                                        )}
                                    </g>
                                </g>
                            )
                          })()
                      ))}
                  </svg>
                  
                  {/* Legenda X (Datas) */}
                  <div className="flex justify-between px-4 mt-2 text-[10px] text-gray-500 uppercase font-mono select-none">
                      <span>{new Date(data[0].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                      {data.length > 3 && (<span>{new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>)}
                      <span>{new Date(data[data.length-1].date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}</span>
                  </div>
              </div>
              )}
          </div>
      );
  };

  // Função para salvar pontuação no histórico
  const handleSavePracticeScore = async (totalPoints, totalTime) => {
      if (!window.confirm(`Registrar treino oficial?\nPontos: ${totalPoints}\nTempo: ${totalTime}s`)) return;
      
      try {
          await addDoc(collection(db, "score_history"), {
              score: totalPoints,
              time: totalTime, // Salva o tempo junto!
              date: new Date().toISOString(),
              author: isAdmin ? 'Técnico' : viewAsStudent?.name || 'Equipe'
          });
          showNotification("Pontuação registrada no gráfico! 📈");
      } catch (error) {
          console.error("Erro ao salvar histórico:", error);
          showNotification("Erro ao salvar.", "error");
      }
  };

  // --- NOVA FUNÇÃO: SALVAR EXECUÇÃO DE UM ROUND ESPECÍFICO ---
  const handleSaveRoundRun = async (e, round) => {
    e.preventDefault();
    const timeVal = parseInt(e.target.time.value);
    if(!timeVal || isNaN(timeVal)) return;

    // --- CÁLCULO DE TENDÊNCIA VS MÉDIA DOS ÚLTIMOS 3 TREINOS ---
    const previousRuns = scoreHistory
        .filter(h => h.roundId === round.id && h.time)
        .sort((a,b) => new Date(b.date) - new Date(a.date)) // Ordena do mais recente
        .slice(0, 3); // Pega os 3 últimos

    let trendMsg = "";
    if (previousRuns.length > 0) {
        const avg = previousRuns.reduce((acc, curr) => acc + curr.time, 0) / previousRuns.length;
        const diff = timeVal - avg;

        // Tempo menor = Melhor (Verde)
        if (diff < 0) {
            trendMsg = ` 🟢 ⬇️ ${(Math.abs(diff)).toFixed(1)}s mais rápido que a média!`;
        } else if (diff > 0) {
            trendMsg = ` 🔴 ⬆️ ${(Math.abs(diff)).toFixed(1)}s mais lento que a média.`;
        }
    }

    try {
        // 1. Salva no histórico para o gráfico
        await addDoc(collection(db, "score_history"), {
            roundId: round.id,
            roundName: round.name,
            time: timeVal, // O tempo que levou
            date: new Date().toISOString(),
            author: viewAsStudent?.name || "Técnico"
        });

        // 2. Atualiza o tempo estimado do round (para ficar real)
        await updateDoc(doc(db, "rounds", round.id), {
            estimatedTime: timeVal
        });

        showNotification(`Treino de "${round.name}" registrado: ${timeVal}s ${trendMsg}`);
        
        // Limpa o valor do formulário local (estado controlado)
        setRoundFormValues(prev => {
            const next = { ...prev };
            delete next[round.id];
            return next;
        });
        e.target.reset();
    } catch (error) {
        console.error("Erro round run:", error);
        showNotification("Erro ao salvar.", "error");
    }
  };


  // --- COMPONENTE DE ROUNDS ---

  const RoundsView = ({ readonly = false }) => {

      const totalPoints = rounds.reduce((acc, r) => acc + r.totalPoints, 0);

      const totalTime = rounds.reduce((acc, r) => acc + r.estimatedTime, 0);

      const isOverTime = totalTime > 150; 

      const timePercent = Math.min(100, (totalTime / 150) * 100);



      return (

      <div className="animate-in fade-in duration-300 space-y-6">

          {/* --- NAVEGAÇÃO DA ÁREA DO ROBÔ --- */}
          <div className="flex justify-center bg-black/20 p-1 rounded-xl w-fit mx-auto border border-white/10 mb-4">
              <button 
                  onClick={() => setRobotSubTab('overview')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${robotSubTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                  <LayoutDashboard size={16}/> Painel de Rounds
              </button>
              <button 
                  onClick={() => setRobotSubTab('map')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${robotSubTab === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                  <Map size={16}/> Mesa de Estratégia
              </button>
          </div>

          {/* --- WIDGET FLUTUANTE DO CRONÔMETRO --- */}
          {activeTimer && (
            <div className="fixed bottom-6 right-6 z-[100] bg-red-600 text-white px-6 py-4 rounded-full shadow-[0_0_40px_rgba(220,38,38,0.8)] flex items-center gap-6 animate-in slide-in-from-bottom-20 border-4 border-[#151520] hover:scale-105 transition-transform cursor-pointer" onClick={() => toggleTimer({ id: activeTimer.roundId })}>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Rodando</span>
                    <span className="text-sm font-black">{activeTimer.name}</span>
                </div>
                <div className="text-4xl font-black font-mono w-24 text-center tabular-nums">
                    {timerDisplay}s
                </div>
                <div className="bg-white text-red-600 p-2 rounded-full animate-pulse">
                    <Square size={24} fill="currentColor" />
                </div>
            </div>
          )}

          {robotSubTab === 'overview' && (
            <>
          {/* 1. BARRA DE STATUS E BOTÕES */}
          <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 flex flex-col xl:flex-row justify-between items-center gap-6 shadow-xl">
              
              {/* Barra de Progresso do Tempo */}
              <div className="flex-1 w-full xl:border-r border-white/10 xl:pr-6">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="text-sm text-gray-400 font-bold uppercase flex items-center gap-2">
                        <Timer size={16} className="text-blue-500"/> Tempo Total (2:30)
                    </h3>
                  </div>
                  <div className="flex justify-between text-xs mb-1"><span className={isOverTime ? 'text-red-500 font-bold' : 'text-white'}>{totalTime}s usados</span><span className="text-gray-500">{150 - totalTime}s restantes</span></div>

                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-white/5"><div className={`h-full transition-all duration-1000 ${isOverTime ? 'bg-red-500' : 'bg-blue-500'}`} style={{width: `${timePercent}%`}}></div></div>

                  {isOverTime && <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold animate-pulse"><AlertTriangle size={12}/> Atenção! O tempo estourou o limite da regra.</p>}

              </div>
              
              {/* Placar Rápido */}
              <div className="flex items-center gap-6 px-4">
                  <div className="text-right"><p className="text-[10px] text-gray-400 font-bold uppercase">Total</p><p className="text-3xl font-black text-white">{totalPoints} <span className="text-xs text-gray-600">pts</span></p></div>
                  <div className="h-12 w-px bg-white/10"></div>
                  <div className="text-right"><p className="text-[10px] text-gray-400 font-bold uppercase">Saídas</p><p className="text-3xl font-black text-blue-500">{rounds.length}</p></div>
              </div>

              {/* Barra de Ferramentas (Botões) */}
              <div className="flex flex-wrap justify-center gap-2 xl:pl-6 w-full xl:w-auto">
                {!readonly && (
                    <>
                    <button onClick={openNewRoundModal} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"><Plus size={16}/> Criar Saída</button>
                    <button onClick={() => openMissionForm()} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"><Settings size={16}/> Missões</button>
                    <button onClick={openPitStopModal} className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"><Timer size={16}/> Pit Stop</button>
                    {/* Botão de Registrar Treino (Salva no Gráfico) */}
                    <button onClick={() => handleSavePracticeScore(totalPoints, totalTime)} className="bg-green-600/10 border border-green-500/20 text-green-500 hover:bg-green-600 hover:text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all" title="Salvar pontuação atual no histórico"><Trophy size={16}/> Salvar Treino</button>
                    </>
                )}
              </div>
          </div>

         {/* 2. CONTEÚDO PRINCIPAL (GRID) */}
         <div className="grid lg:grid-cols-3 gap-6">
            
            {/* COLUNA DA ESQUERDA: LISTA DE ROUNDS (Ocupa 2/3) */}
            <div className="lg:col-span-2 space-y-4">
                <h4 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2 mb-2"><ListTodo size={14}/> Estratégia de Saídas</h4>
                <div className="grid md:grid-cols-2 gap-4">
  {rounds.map(round => (
    <div key={round.id} className="bg-[#151520] border border-white/10 rounded-xl p-4 relative group hover:border-cyan-500/30 transition-colors">
      
      {/* --- AQUI ESTÁ A MUDANÇA: BOTÃO DE APAGAR REAL --- */}
      {!readonly && (
        <button 
          onClick={() => handleDeleteRound(round.id)} 
          className="absolute top-2 right-2 text-gray-600 hover:text-red-500 p-1 transition-colors z-10"
          title="Apagar permanentemente"
        >
          <Trash2 size={16}/>
        </button>
      )}

      {/* Título e Ícone */}
      <h3 className="text-white font-bold mb-2 flex items-center gap-2">
        <ListTodo size={16} className="text-blue-500"/> 
        <span className="flex-1 truncate">{round.name}</span>
        {/* Exibe a Base (Etiqueta Visual) */}
        {round.startBase && (
            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${round.startBase === 'Direita' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>{round.startBase}</span>
        )}
      </h3>

      {/* Pontos e Tempo (Display) */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2 bg-black/40 p-2 rounded border border-white/5">
        <span className="flex items-center gap-1 font-bold text-green-400" title="Pontos deste round">
          <Calculator size={12} className="text-blue-500"/> {round.totalPoints} pts
        </span>
        <span className="flex items-center gap-1 font-bold text-white" title="Tempo estimado atual">
          <Timer size={12} className="text-blue-500"/> {round.estimatedTime}s
        </span>
      </div>

      {/* Lista de Missões */}
      <div className="space-y-1">
        {round.missions.map(mid => { 
          const mission = missionsList.find(m => m.id === mid); 
          return (
            <div key={mid} className="text-[10px] text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/5 flex items-center gap-2">
              {mission?.image && <img src={mission.image} className="w-4 h-4 rounded object-cover" alt="img" />}
              <span className="truncate flex-1">{mission?.code} - {mission?.name}</span>
              <span className="font-bold text-blue-500 whitespace-nowrap">+{mission?.points}</span>
            </div>
          ) 
        })}
      </div>

      {/* --- ÁREA DE REGISTRO RÁPIDO (NOVO) --- */}
      {!readonly && (
        <form onSubmit={(e) => handleSaveRoundRun(e, round)} className="mt-4 pt-3 border-t border-white/5 flex gap-2 items-center">
            <div className="relative flex-1">
                {/* Input Controlado pelo Cronômetro */}
                <input 
                    name="time" 
                    type="number" 
                    placeholder={round.estimatedTime} 
                    value={roundFormValues[round.id] !== undefined ? roundFormValues[round.id] : ''}
                    onChange={(e) => setRoundFormValues(prev => ({ ...prev, [round.id]: e.target.value }))}
                    className={`w-full bg-black/30 border rounded-lg py-1.5 px-2 text-xs text-white focus:border-blue-500 outline-none text-center transition-colors ${activeTimer?.roundId === round.id ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-white/10'}`} 
                />
                <span className="absolute right-2 top-1.5 text-[10px] text-gray-500">seg</span>
            </div>
            
            {/* Botão de Cronômetro */}
            <button type="button" onClick={() => toggleTimer(round)} className={`p-1.5 rounded-lg transition-all ${activeTimer?.roundId === round.id ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 text-gray-400 hover:text-white'}`} title="Cronômetro">
                {activeTimer?.roundId === round.id ? <Square size={14} fill="currentColor"/> : <Play size={14} fill="currentColor"/>}
            </button>

            {/* Botão de Salvar */}
            <button className="bg-blue-600 hover:bg-blue-500 text-white p-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-900/20" title="Salvar Tempo"><Check size={14}/></button>
        </form>
      )}
    </div>
  ))}
  {rounds.length === 0 && (
      <div className="col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-xl text-gray-500">
          <p>Nenhuma saída planejada ainda.</p>
          <p className="text-xs mt-1">Clique em "Criar Saída" para começar.</p>
      </div>
  )}
</div>
            </div>

            {/* COLUNA DA DIREITA: GRÁFICO (Ocupa 1/3) */}
            <div className="lg:col-span-1">
                <h4 className="text-gray-400 font-bold uppercase text-xs flex items-center gap-2 mb-4"><TrendingUp size={14}/> Performance da Equipe</h4>
                <ScoreEvolutionChart />
            </div>
         </div>
         </>
          )}

      {robotSubTab === 'map' && (
        <div className="bg-[#151520] p-1 rounded-2xl border border-white/10">
            <StrategyBoard />
        </div>
      )}

      </div>

  )}

  // --- COMPONENTE KANBAN (REUTILIZÁVEL) ---
  const KanbanView = () => {
      
      const getDeadlineStatus = (date) => {
          if (!date) return null;
          const today = new Date();
          today.setHours(0,0,0,0);
          const due = new Date(date);
          due.setHours(23,59,59);
          const diffTime = due - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 0) return { color: 'text-red-500', border: 'border-red-500', icon: <AlertTriangle size={12}/>, text: 'Atrasado' };
          if (diffDays <= 2) return { color: 'text-yellow-500', border: 'border-yellow-500', icon: <Timer size={12}/>, text: 'Prazo Curto' };
          return { color: 'text-gray-500', border: 'border-white/5', icon: <Calendar size={12}/>, text: new Date(date).toLocaleDateString() };
      };

      const TaskCard = ({ t, showMoveRight, showDelete }) => {
          const status = getDeadlineStatus(t.dueDate);
          return (
              <div className={`bg-black/40 p-3 rounded-xl border flex flex-col gap-2 group hover:border-white/20 transition-all ${status ? status.border : 'border-white/5'}`}>
                  <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase bg-white/10 px-2 py-0.5 rounded text-gray-300 flex items-center gap-1">
                          <UserCircle size={10}/> {t.author || "Equipe"}
                      </span>
                      {status && <span className={`text-[10px] font-bold flex items-center gap-1 ${status.color}`}>{status.icon} {status.text}</span>}
                  </div>
                  <p className="text-sm text-gray-200">{t.text}</p>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end pt-2 border-t border-white/5">
                      {showMoveRight && <button onClick={() => moveTask(t.id, showMoveRight)} className="text-blue-500 hover:bg-blue-500/20 p-1.5 rounded" title="Avançar"><ChevronRight size={16}/></button>}
                      {showDelete && <button onClick={() => removeTask(t.id)} className="text-red-500 hover:bg-red-500/20 p-1.5 rounded" title="Excluir"><Trash2 size={16}/></button>}
                  </div>
              </div>
          );
      };

      return (
      <div className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[600px]">
              
              {/* COLUNA 1: A FAZER */}
              <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 flex flex-col">
                  <h3 className="text-gray-400 font-bold uppercase mb-4 flex items-center gap-2 border-b border-white/5 pb-2"><ListTodo size={16}/> A Fazer ({tasks.filter(t=>t.status==='todo').length})</h3>
                  <form onSubmit={handleAddTask} className="mb-4 space-y-2">
                      <input name="taskText" placeholder="+ Nova Tarefa..." className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-orange-500 outline-none transition-all" />
                      <div className="flex gap-2">
                          <input type="date" name="taskDate" className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-gray-400 focus:border-orange-500 outline-none" title="Prazo"/>
                          <button className="flex-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold uppercase">Adicionar</button>
                      </div>
                  </form>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {tasks.filter(t => t.status === 'todo').map(t => <TaskCard key={t.id} t={t} showMoveRight="doing" showDelete={true} />)}
                  </div>
              </div>

              {/* COLUNA 2: FAZENDO */}
              <div className="bg-[#151520] border border-blue-500/20 rounded-2xl p-4 flex flex-col bg-blue-500/5">
                  <h3 className="text-blue-400 font-bold uppercase mb-4 flex items-center gap-2 border-b border-blue-500/10 pb-2"><Loader2 size={16} className="animate-spin"/> Fazendo ({tasks.filter(t=>t.status==='doing').length})</h3>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {tasks.filter(t => t.status === 'doing').map(t => <TaskCard key={t.id} t={t} showMoveRight="done" showDelete={true} />)}
                  </div>
              </div>

              {/* COLUNA 3: FEITO */}
              <div className="bg-[#151520] border border-green-500/20 rounded-2xl p-4 flex flex-col bg-green-500/5">
                  <h3 className="text-green-500 font-bold uppercase mb-4 flex items-center gap-2 border-b border-green-500/10 pb-2"><CheckCircle size={16}/> Feito ({tasks.filter(t=>t.status==='done').length})</h3>
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                      {tasks.filter(t => t.status === 'done').map(t => <TaskCard key={t.id} t={t} showMoveRight={null} showDelete={true} />)}
                  </div>
              </div>
          </div>
      </div>
  )}

  // --- COMPONENTE DE AUTO-AVALIAÇÃO (RUBRICAS) ---
  const RubricView = () => {
      // --- DADOS DA RUBRICA: PROJETO DE INOVAÇÃO ---
      const innovationRubricItems = [
          { key: 'identificacao', name: 'Identificação', icon: <Search size={16} />, color: 'text-blue-400' },
          { key: 'design', name: 'Design', icon: <Lightbulb size={16} />, color: 'text-yellow-400' },
          { key: 'criacao', name: 'Criação', icon: <Wrench size={16} />, color: 'text-pink-400' },
          { key: 'iteracao', name: 'Iteração', icon: <RotateCcw size={16} />, color: 'text-green-400' },
          { key: 'comunicacao', name: 'Comunicação', icon: <Megaphone size={16} />, color: 'text-purple-400' },
      ];
  
      // --- LÓGICA DO GRÁFICO DE INOVAÇÃO ---
      const innovationSize = 300;
      const innovationCenter = innovationSize / 2;
      const innovationRadius = (innovationSize / 2) - 60;
      const innovationMaxVal = 4;
      const innovationAngleSlice = (Math.PI * 2) / innovationRubricItems.length;
  
      const getInnovationCoords = (value, index) => {
          const angle = index * innovationAngleSlice - (Math.PI / 2);
          const r = (value / innovationMaxVal) * innovationRadius;
          return {
              x: innovationCenter + Math.cos(angle) * r,
              y: innovationCenter + Math.sin(angle) * r
          };
      };
  
      const innovationPoints = innovationRubricItems.map((item, i) => {
          const val = innovationRubric[item.key] || 1;
          const { x, y } = getInnovationCoords(val, i);
          return `${x},${y}`;
      }).join(' ');

      // --- DADOS DA RUBRICA: DESIGN DO ROBÔ ---
      const robotDesignRubricItems = [
          { key: 'durabilidade', name: 'Durabilidade', icon: <Shield size={16} />, color: 'text-gray-400' },
          { key: 'eficiencia', name: 'Eficiência Mecânica', icon: <Settings size={16} />, color: 'text-blue-400' },
          { key: 'programacao', name: 'Qualidade da Prog.', icon: <Code size={16} />, color: 'text-green-400' },
          { key: 'estrategia', name: 'Estratégia & Inovação', icon: <Brain size={16} />, color: 'text-purple-400' },
      ];

      // --- LÓGICA DO GRÁFICO DO ROBÔ ---
      const robotSize = 300;
      const robotCenter = robotSize / 2;
      const robotRadius = (robotSize / 2) - 60;
      const robotMaxVal = 4;
      const robotAngleSlice = (Math.PI * 2) / robotDesignRubricItems.length;

      const getRobotCoords = (value, index) => {
          const angle = index * robotAngleSlice - (Math.PI / 2);
          const r = (value / robotMaxVal) * robotRadius;
          return {
              x: robotCenter + Math.cos(angle) * r,
              y: robotCenter + Math.sin(angle) * r
          };
      };

      const robotPoints = robotDesignRubricItems.map((item, i) => {
          const val = robotDesignRubric[item.key] || 1;
          const { x, y } = getRobotCoords(val, i);
          return `${x},${y}`;
      }).join(' ');

      return (
          <div className="space-y-8 animate-in fade-in duration-500">
              {/* Card do Projeto de Inovação */}
              <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Lightbulb className="text-yellow-500"/> Rubrica: Projeto de Inovação</h3>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative flex-shrink-0">
                          <svg width={innovationSize} height={innovationSize} className="mx-auto bg-black/20 rounded-full border border-white/5">
                              {[1, 2, 3, 4].map(level => <circle key={level} cx={innovationCenter} cy={innovationCenter} r={(level / innovationMaxVal) * innovationRadius} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />)}
                              {innovationRubricItems.map((_, i) => { const { x, y } = getInnovationCoords(innovationMaxVal, i); return <line key={i} x1={innovationCenter} y1={innovationCenter} x2={x} y2={y} stroke="#333" strokeWidth="1" />; })}
                              <polygon points={innovationPoints} fill="rgba(234, 179, 8, 0.3)" stroke="#eab308" strokeWidth="2" />
                              {innovationRubricItems.map((item, i) => { const val = innovationRubric[item.key] || 1; const { x, y } = getInnovationCoords(val, i); return <circle key={i} cx={x} cy={y} r="4" fill="#eab308" />; })}
                              {innovationRubricItems.map((item, i) => { const { x, y } = getInnovationCoords(innovationMaxVal + 1.2, i); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">{item.name}</text>; })}
                          </svg>
                      </div>
                      <div className="flex-1 w-full grid grid-cols-1 gap-6">
                          {innovationRubricItems.map(item => (
                              <div key={item.key}>
                                  <div className="flex justify-between items-center mb-2">
                                      <label className={`font-bold text-sm flex items-center gap-2 ${item.color}`}>{item.icon} {item.name}</label>
                                      <span className="text-white font-black text-lg bg-black/30 px-2 rounded">{innovationRubric[item.key] || 1}</span>
                                  </div>
                                  <input type="range" min="1" max="4" value={innovationRubric[item.key] || 1} onChange={(e) => handleRubricUpdate('innovation', item.key, e.target.value)} className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${item.key} bg-gray-700`} />
                                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1"><span>Iniciante</span><span>Em Desenv.</span><span>Praticante</span><span>Exemplar</span></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Card do Design do Robô */}
              <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6"><Wrench className="text-blue-500"/> Rubrica: Design do Robô</h3>
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                      <div className="relative flex-shrink-0">
                          <svg width={robotSize} height={robotSize} className="mx-auto bg-black/20 rounded-full border border-white/5">
                              {[1, 2, 3, 4].map(level => <circle key={level} cx={robotCenter} cy={robotCenter} r={(level / robotMaxVal) * robotRadius} fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 4" />)}
                              {robotDesignRubricItems.map((_, i) => { const { x, y } = getRobotCoords(robotMaxVal, i); return <line key={i} x1={robotCenter} y1={robotCenter} x2={x} y2={y} stroke="#333" strokeWidth="1" />; })}
                              <polygon points={robotPoints} fill="rgba(59, 130, 246, 0.3)" stroke="#3b82f6" strokeWidth="2" />
                              {robotDesignRubricItems.map((item, i) => { const val = robotDesignRubric[item.key] || 1; const { x, y } = getRobotCoords(val, i); return <circle key={i} cx={x} cy={y} r="4" fill="#3b82f6" />; })}
                              {robotDesignRubricItems.map((item, i) => { const { x, y } = getRobotCoords(robotMaxVal + 1.2, i); return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold">{item.name}</text>; })}
                          </svg>
                      </div>
                      <div className="flex-1 w-full grid grid-cols-1 gap-6">
                          {robotDesignRubricItems.map(item => (
                              <div key={item.key}>
                                  <div className="flex justify-between items-center mb-2">
                                      <label className={`font-bold text-sm flex items-center gap-2 ${item.color}`}>{item.icon} {item.name}</label>
                                      <span className="text-white font-black text-lg bg-black/30 px-2 rounded">{robotDesignRubric[item.key] || 1}</span>
                                  </div>
                                  <input type="range" min="1" max="4" value={robotDesignRubric[item.key] || 1} onChange={(e) => handleRubricUpdate('robot_design', item.key, e.target.value)} className={`w-full h-2 rounded-lg appearance-none cursor-pointer slider-${item.key} bg-gray-700`} />
                                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1"><span>Iniciante</span><span>Em Desenv.</span><span>Praticante</span><span>Exemplar</span></div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  // --- COMPONENTE DIÁRIO DE BORDO ---
  const LogbookView = () => {
      // State para o admin selecionar um aluno e para a busca
      const [selectedStudentId, setSelectedStudentId] = useState(null);
      const [searchTerm, setSearchTerm] = useState("");

      // --- VISÃO DO TÉCNICO ---
      if (isAdmin) {
          const entriesForSelectedStudent = selectedStudentId
              ? logbookEntries.filter(entry => {
                  const pathParts = entry.refPath.split('/');
                  // O caminho é students/STUDENT_ID/logbook/ENTRY_ID
                  return pathParts.length > 1 && pathParts[1] === selectedStudentId;
              })
              : [];
          
          const filteredEntries = searchTerm
              ? entriesForSelectedStudent.filter(entry => 
                  entry.text.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : entriesForSelectedStudent;
          
          const selectedStudent = students.find(s => s.id === selectedStudentId);

          return (
              <div className="animate-in fade-in duration-500 grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                  {/* Lista de Alunos */}
                  <div className="lg:col-span-1 bg-[#151520] border border-white/10 rounded-2xl p-4 h-fit">
                      <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                          <Users size={16}/> Diários da Equipe
                      </h3>
                      <div className="space-y-2">
                          {students.map(student => (
                              <button 
                                  key={student.id} 
                                  onClick={() => setSelectedStudentId(student.id)}
                                  className={`w-full text-left p-3 rounded-lg transition-colors text-sm flex items-center gap-3 ${selectedStudentId === student.id ? 'bg-yellow-500 text-black font-bold' : 'bg-black/40 hover:bg-white/10 text-white'}`}
                              >
                                  <div className={`p-1 rounded-full border ${student.avatarType === 'mech2' ? 'border-fuchsia-500' : 'border-orange-500'}`}>
                                      {student.avatarImage ? (
                                         <img src={student.avatarImage} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                                     ) : (
                                         <UserCircle size={20} className="text-gray-500" />
                                     )}
                                  </div>
                                  {student.name}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Linha do Tempo do Aluno Selecionado */}
                  <div className="lg:col-span-3">
                      {/* Barra de Busca (só aparece se um aluno for selecionado) */}
                      {selectedStudentId && (
                          <div className="relative mb-6">
                              <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                              <input 
                                  type="text"
                                  placeholder={`Buscar no diário de ${selectedStudent?.name}...`}
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-[#151520] border border-white/10 rounded-xl p-3 pl-12 text-white focus:border-yellow-500 outline-none"
                              />
                          </div>
                      )}
                      {!selectedStudentId ? (
                          <div className="h-full min-h-[400px] flex items-center justify-center bg-[#151520] border-2 border-dashed border-white/10 rounded-2xl p-6 text-center">
                              <div>
                                  <BookOpen size={48} className="text-gray-600 mx-auto mb-4"/>
                                  <p className="text-gray-400 font-bold">Selecione um aluno à esquerda</p>
                                  <p className="text-sm text-gray-500">para visualizar seu diário de bordo individual.</p>
                              </div>
                          </div>
                      ) : (
                          <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8">
                              {filteredEntries.length === 0 && (
                                  <div className="text-gray-500 italic">
                                      Nenhum registro para <span className="font-bold">{selectedStudent?.name}</span> ainda.
                                  </div>
                              )}
                              {filteredEntries.map(entry => (
                                  <div key={entry.id} className="relative group">
                                      <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-[#151520] border-2 border-yellow-500 flex items-center justify-center"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div></div>
                                      <div className="bg-black/40 border border-white/5 p-6 rounded-xl hover:bg-white/5 transition-all">
                                          <div className="flex justify-between items-start mb-3">
                                              <div className="flex items-center gap-3">
                                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white`}>{entry.studentName.charAt(0)}</div>
                                                  <div>
                                                      <span className="text-white font-bold text-sm block">{entry.studentName}</span>
                                                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10}/> {entry.weekName || "Semana Geral"}<span className="mx-1">•</span><Timer size={10}/> {new Date(entry.date).toLocaleDateString()}</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <button onClick={() => handleDeleteLogbookEntry(entry)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 transition-colors" title="Excluir Registro"><Trash2 size={16} /></button>
                                          <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          );
      }

      // --- Lógica de filtro para o aluno ---
      const filteredEntries = searchTerm
          ? logbookEntries.filter(entry => 
              entry.text.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : logbookEntries;

      // --- VISÃO DO ALUNO (Permanece a mesma) ---
      return (
          <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
              <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Book className="text-yellow-500"/> Diário de Bordo Semanal</h3>
                  <p className="text-gray-400 text-sm mb-4">Registrando aprendizados da <strong className="text-yellow-500">{currentWeekData?.weekName || "Semana Atual"}</strong></p>
                  <form onSubmit={handleLogbookSubmit}>
                      <textarea name="entry" className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white focus:border-yellow-500 outline-none h-32 resize-none mb-4" placeholder="O que aprendemos nesta semana? O que deu errado e como resolvemos?"></textarea>
                      <button className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-yellow-900/20"><Plus size={18}/> Salvar Registro da Semana</button>
                  </form>
              </div>
              {/* Barra de Busca do Aluno */}
              <div className="relative mb-6">
                  <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
                  <input 
                      type="text"
                      placeholder="Buscar nos meus registros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#151520] border border-white/10 rounded-xl p-3 pl-12 text-white focus:border-yellow-500 outline-none"
                  />
              </div>
              <div className="relative border-l border-white/10 ml-4 space-y-8 pl-8">
                  {filteredEntries.length === 0 && <p className="text-gray-500 italic">{searchTerm ? 'Nenhum registro encontrado.' : 'Nenhum registro ainda. Comece o diário!'}</p>}
                  {filteredEntries.map(entry => (
                      <div key={entry.id} className="relative group">
                          <div className="absolute -left-[39px] top-0 w-5 h-5 rounded-full bg-[#151520] border-2 border-yellow-500 flex items-center justify-center"><div className="w-2 h-2 bg-yellow-500 rounded-full"></div></div>
                          <div className="bg-black/40 border border-white/5 p-6 rounded-xl hover:bg-white/5 transition-all">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white`}>{entry.studentName.charAt(0)}</div>
                                      <div>
                                          <span className="text-white font-bold text-sm block">{entry.studentName}</span>
                                          <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={10}/> {entry.weekName || "Semana Geral"}<span className="mx-1">•</span><Timer size={10}/> {new Date(entry.date).toLocaleDateString()}</span>
                                      </div>
                                  </div>
                              </div>
                              <button onClick={() => handleDeleteLogbookEntry(entry)} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 p-2 transition-colors" title="Excluir Registro"><Trash2 size={16} /></button>
                              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }


// --- TELA DE LOGIN (Se não tiver usuário logado) ---
  if (!currentUser) {
      return (
          <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
              {/* Fundo decorativo */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500"></div>
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

              <div className="bg-[#151520] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                  <div className="text-center mb-8 mt-2">
 <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
    <LogoNewGears />
</div>
                      <h1 className="text-2xl font-black italic tracking-tighter">GESTÃO NEW GEARS</h1>
                      <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mt-2 font-bold">Acesso Restrito 2026</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                      <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 block tracking-wider">Usuário de Acesso</label>
                          <div className="relative">
                              <UserCircle className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                              <input 
                                  type="text" 
                                  value={loginUser} 
                                  onChange={(e) => setLoginUser(e.target.value)} 
                                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-purple-500 focus:bg-black/60 outline-none transition-all placeholder:text-gray-700 font-medium" 
                                  placeholder="Ex: tecnico ou ana.fll" 
                                  autoFocus 
                              />
                          </div>
                      </div>
                      <div>
                          <label className="text-[10px] text-gray-500 uppercase font-bold mb-1.5 block tracking-wider">Senha</label>
                          <div className="relative">
                              <Lock className="absolute left-3 top-3.5 text-gray-500" size={18}/>
                              <input 
                                  type="password" 
                                  value={loginPass} 
                                  onChange={(e) => setLoginPass(e.target.value)} 
                                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:border-purple-500 focus:bg-black/60 outline-none transition-all placeholder:text-gray-700 font-medium" 
                                  placeholder="••••••" 
                              />
                          </div>
                      </div>

                      {loginError && (
                          <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                              <AlertCircle size={16} className="text-red-500 shrink-0"/>
                              <p className="text-red-400 text-xs font-bold">{loginError}</p>
                          </div>
                      )}

                      <button className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 text-white font-black py-4 rounded-xl hover:opacity-90 transition-all shadow-[0_0_20px_rgba(150,150,255,0.2)] hover:shadow-[0_0_30px_rgba(150,150,255,0.3)] mt-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                          <LogOut size={18} className="rotate-180"/> Entrar no Sistema
                      </button>
                  </form>
                  
                  <div className="mt-8 pt-6 border-t border-white/5 text-center">
                      <p className="text-[10px] text-gray-600">Sistema desenvolvido para a equipe de FLL SESI Vinhedo</p>
                  </div>
              </div>
          </div>
      )
  }

  // --- PROTEÇÃO DE CARREGAMENTO (LOADING) ---
  // Só aparece DEPOIS que logou, enquanto baixa os dados
  if (currentUser && !currentWeekData) {
      return (
          <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white gap-4">
              <Loader2 className="animate-spin text-blue-500" size={48} />
              <p className="animate-pulse text-sm font-bold uppercase tracking-widest text-gray-500">Sincronizando Banco de Dados...</p>
          </div>
      )
  }

  // --- RENDER PRINCIPAL (SÓ CHEGA AQUI SE ESTIVER LOGADO) ---
  return (
    <div className="min-h-screen bg-[#111118] text-white font-sans selection:bg-purple-500 selection:text-white pb-20 relative">
      {/* Estilo da Animação de Fundo */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.03; transform: scale(0.98); filter: brightness(1); }
          50% { opacity: 0.08; transform: scale(1.02); filter: brightness(1.5) drop-shadow(0 0 15px rgba(59, 130, 246, 0.2)); }
        }
      `}</style>

      {/* Fundo com o Logo */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/vite.svg)',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'contain',
          animation: 'pulse-glow 6s infinite ease-in-out'
        }}
      ></div>

      {/* Conteúdo fica por cima */}
      <div className="relative z-10">
        <Notification />
        {renderModal()}
        <ScheduleModal />

{/* --- MODAL DO TÉCNICO: ENTREGAR BADGES --- */}
      {isAdmin && badgeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1a1a24] rounded-2xl border border-white/10 p-6 w-full max-w-2xl shadow-2xl relative">
            
            {/* Botão Fechar */}
            <button 
              onClick={() => setBadgeStudent(null)}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-white" />
            </button>

            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
                <Trophy size={32} className="text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-white">Sala de Troféus</h2>
              <p className="text-gray-400">Gerenciando conquistas de <span className="text-white font-bold">{badgeStudent.name}</span></p>
            </div>

            {/* Grid de Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BADGES_LIST.map(badge => {
                const hasBadge = badgeStudent.badges?.includes(badge.id);
                return (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badgeStudent, badge.id)}
                    /* 👇 MUDANÇA 1: Adicionei a palavra 'group' no começo desta linha 👇 */
                    className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
                      hasBadge 
                      ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-105' 
                      : 'bg-black/40 border-white/5 hover:bg-white/5 hover:border-white/20 opacity-60 grayscale'
                    }`}
                  >
                    <div className={`mb-3 ${hasBadge ? badge.color : 'text-gray-500'}`}>
                      {badge.icon}
                    </div>
                    <span className={`text-xs font-bold text-center leading-tight ${hasBadge ? 'text-white' : 'text-gray-500'}`}>
                      {badge.name}
                    </span>
                    {hasBadge && (
                       <div className="absolute top-2 right-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                       </div>
                    )}

                    {/* 👇 MUDANÇA 2: Balãozinho de descrição (Tooltip) 👇 */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 bg-gray-900/95 text-gray-200 text-xs text-center p-2 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none border border-gray-700 shadow-xl backdrop-blur-md">
                        {badge.desc}
                        {/* Triângulo (setinha) apontando para baixo */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
                    </div>
                    {/* ☝️ FIM DO BALÃOZINHO ☝️ */}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* --- MODAL DE BATERIA DA EQUIPE --- */}
      {showBatteryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in backdrop-blur-sm">
            <div className="bg-[#151520] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                
                <button onClick={() => setShowBatteryModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                    <X size={24}/>
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                        <BatteryCharging size={32} className="text-white animate-pulse"/>
                    </div>
                    <h3 className="text-2xl font-black text-white italic">COMO ESTÁ SUA BATERIA?</h3>
                    <p className="text-gray-400 text-sm mt-2">Sua honestidade ajuda a equipe a treinar melhor. <br/>(Vale +2 XP!)</p>
                </div>

                {/* LÓGICA DE EXIBIÇÃO: TRAVAS DA BATERIA */}
                {(() => {
                    const dayOfWeek = new Date().getDay();
                    const isTrainingDay = dayOfWeek === 1 || dayOfWeek === 3; // 1 = Seg, 3 = Qua
                    const hasVotedToday = viewAsStudent && teamMoods.some(mood => mood.studentId === viewAsStudent.id);

                    if (viewAsStudent && !isTrainingDay) {
                        return (
                            <div className="text-center bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-xl mb-6">
                                <p className="font-bold text-yellow-500 text-lg">Fora de Treino 🛑</p>
                                <p className="text-xs text-gray-400 mt-2">A carga da bateria da equipe só pode ser checada nas <strong className="text-gray-300">Segundas</strong> e <strong className="text-gray-300">Quartas</strong>.</p>
                            </div>
                        );
                    }

                    if (viewAsStudent && hasVotedToday) {
                        return (
                            <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-xl mb-6 flex flex-col items-center">
                                <CheckCircle size={32} className="text-green-500 mb-2"/>
                                <p className="font-bold text-green-500 text-lg">Check-in Concluído!</p>
                                <p className="text-xs text-gray-400 mt-2">Seus +2 XP já foram creditados. Foco na missão de hoje!</p>
                            </div>
                        );
                    }

                    if (!viewAsStudent) {
                        return (
                            <div className="text-center bg-white/5 border border-white/10 p-4 rounded-xl mb-6">
                                <p className="text-sm text-gray-400">Modo Técnico: Acompanhe os registros da equipe abaixo.</p>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 gap-3">
                            {/* Opção 100% */}
                            <button onClick={() => handleMoodSubmit(100)} className="flex items-center gap-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-black transition-all group text-left">
                                <div className="p-2 bg-green-500/20 rounded-full group-hover:bg-black/20"><BatteryFull size={24} className="text-green-500 group-hover:text-black"/></div>
                                <div>
                                    <span className="block font-bold text-green-500 group-hover:text-black">100% - Turbo Mode</span>
                                    <span className="text-xs text-gray-400 group-hover:text-black/70">Tô pronto pra tudo!</span>
                                </div>
                            </button>

                            {/* Opção 75% */}
                            <button onClick={() => handleMoodSubmit(75)} className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all group text-left">
                                <div className="p-2 bg-blue-500/20 rounded-full group-hover:bg-white/20"><BatteryMedium size={24} className="text-blue-500 group-hover:text-white"/></div>
                                <div>
                                    <span className="block font-bold text-blue-500 group-hover:text-white">75% - Focado</span>
                                    <span className="text-xs text-gray-400 group-hover:text-white/80">Estou bem, vamos nessa.</span>
                                </div>
                            </button>

                            {/* Opção 50% */}
                            <button onClick={() => handleMoodSubmit(50)} className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black transition-all group text-left">
                                <div className="p-2 bg-yellow-500/20 rounded-full group-hover:bg-black/20"><BatteryLow size={24} className="text-yellow-500 group-hover:text-black"/></div>
                                <div>
                                    <span className="block font-bold text-yellow-500 group-hover:text-black">50% - Economia de Energia</span>
                                    <span className="text-xs text-gray-400 group-hover:text-black/70">Cansado, mas aguento.</span>
                                </div>
                            </button>

                            {/* Opção 25% */}
                            <button onClick={() => handleMoodSubmit(25)} className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all group text-left">
                                <div className="p-2 bg-red-500/20 rounded-full group-hover:bg-white/20"><BatteryWarning size={24} className="text-red-500 group-hover:text-white"/></div>
                                <div>
                                    <span className="block font-bold text-red-500 group-hover:text-white">25% - Bateria Arriada</span>
                                    <span className="text-xs text-gray-400 group-hover:text-white/80">Preciso de ajuda ou pausa.</span>
                                </div>
                            </button>
                        </div>
                    );
                })()}
                
                {/* Quem já votou (Transparência) */}
                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 font-bold uppercase mb-3">Quem já fez check-in hoje:</p>
                    <div className="flex flex-wrap gap-2">
                        {teamMoods.map((mood, idx) => (
                            <div key={idx} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-[10px] text-gray-300 border border-white/5">
                                <div className={`w-2 h-2 rounded-full ${mood.level > 75 ? 'bg-green-500' : mood.level > 50 ? 'bg-blue-500' : mood.level > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                {mood.studentName.split(' ')[0]}
                            </div>
                        ))}
                        {teamMoods.length === 0 && <span className="text-xs text-gray-600 italic">Ninguém ainda... seja o primeiro!</span>}
                    </div>
                </div>

            </div>
        </div>
      )}

 {/* HEADER DO SISTEMA (COMPLETO) */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
          <div className="w-28 h-auto">
              <LogoNewGears />
          </div>

          <div className="flex items-center gap-3 md:gap-4">
              
              {/* --- CONTADOR COMPACTO --- */}
              <Countdown 
                  targetDate="2026-12-01T08:00:00" 
                  title="TORNEIO" 
                  compact={true} 
              />

              {/* 1. BOTÃO CRONOGRAMA (VOLTOU!) */}
              {/* Só aparece se o modal de cronograma não estiver aberto */}
              <button onClick={() => setShowFullSchedule(true)} className="bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2">
                  <CalendarDays size={18} /> <span className="hidden md:inline text-xs font-bold">Cronograma</span>
              </button>
              {/* 👇 COLE O BOTÃO DO RANKING AQUI 👇 */}
              {!viewAsStudent && (
                <button 
                  onClick={() => setActiveTab('ranking')} 
                  className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2 rounded-full hover:bg-yellow-500/20 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2"
                >
                  <Trophy size={18} /> <span className="hidden md:inline text-xs font-bold">Ranking XP</span>
                </button>
              )}
              {/* ☝️ FIM DO BOTÃO DO RANKING ☝️ */}
{/* --- BOTÃO DA BATERIA (NOVO) --- */}
              <button 
                onClick={() => setShowBatteryModal(true)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all border ${
                    // Muda a cor dependendo da média da equipe
                    teamAverage > 75 ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    teamAverage > 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                    teamAverage > 0  ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-white/5 border-white/10 text-gray-400'
                }`}
                title="Como está a energia da equipe?"
              >
                  {/* Ícone muda conforme a carga */}
                  {teamAverage > 90 ? <BatteryFull size={18}/> : 
                   teamAverage > 50 ? <BatteryMedium size={18}/> : 
                   <BatteryWarning size={18}/>}
                  
                  {/* Mostra a porcentagem média para o Técnico */}
                  <span className="font-bold text-xs">
                      {teamMoods.length > 0 ? `${teamAverage}%` : 'Check-in'}
                  </span>
              </button>
              {/* 2. BOTÃO MÁGICO DAS CAPITÃS (Sofia e Heloise) */}
              {viewAsStudent && (viewAsStudent.name === 'Sofia' || viewAsStudent.name === 'Heloise') && (
                  <button 
                    onClick={() => setIsAdmin(!isAdmin)} 
                    className={`px-3 py-2 rounded-lg font-bold text-[10px] md:text-xs uppercase transition-all flex items-center gap-2 ${isAdmin ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'bg-white/10 text-white border border-white/20'}`}
                  >
                      {isAdmin ? '👤 Voltar pro XP' : '👑 Modo Capitã'}
                  </button>
                  
              )}
{/* ÁREA DO DESAFIO DE INGLÊS (Visão do Aluno) */}
{viewAsStudent && (
    <div className="bg-[#151520] border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="text-3xl">🇺🇸</div>
            <div>
                <h3 className="text-white font-bold text-sm">English Challenge</h3>
                <p className="text-gray-400 text-xs">Fale 10 min em inglês.</p>
            </div>
        </div>

        {/* 👇 O PULO DO GATO ESTÁ AQUI: viewAsStudent?.englishChallengeUnlocked 👇 */}
        {viewAsStudent?.englishChallengeUnlocked ? (
            <button 
                onClick={claimEnglishXP}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.4)] animate-bounce"
            >
                Resgatar +5 XP
            </button>
        ) : (
            <button 
                disabled
                className="bg-gray-800 text-gray-500 font-bold py-2 px-4 rounded-xl border border-gray-700 cursor-not-allowed"
            >
                Aguardando Técnico...
            </button>
        )}
    </div>
)}

              {/* 3. BOTÃO DE SAIR */}
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Sair">
                  <LogOut size={18} />
              </button>
          </div>
      </header>

      {/* --- ÁREA DO TÉCNICO (ADMIN) --- */}
      {isAdmin && (
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">

            {/* Dentro do seu <main> ou área de conteúdo central, junto com os outros 'ifs' de abas */}
{activeTab === 'ranking' && (
  <RankingPanel students={students} />
)}
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
              <button onClick={() => setAdminTab('rotation')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'rotation' ? 'bg-white text-black' : 'text-gray-500 hover:bg-white/10'}`}><LayoutDashboard size={18}/> Rodízio & Equipe</button>
              <button onClick={() => setAdminTab('strategy')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'strategy' ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-purple-400'}`}><Lightbulb size={18}/> Estratégia & Inovação</button>
              <button onClick={() => setAdminTab('rounds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'rounds' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-blue-400'}`}><ListTodo size={18}/> Mesa do Robô</button>
              <button onClick={() => setAdminTab('rubrics')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'rubrics' ? 'bg-gray-400 text-black shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:text-gray-400'}`}><Scale size={18}/> Rubricas</button>
              <button onClick={() => setAdminTab('kanban')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'kanban' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-gray-500 hover:text-orange-400'}`}><ClipboardList size={18}/> Tarefas (Kanban)</button>
              <button onClick={() => setAdminTab('logbook')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'logbook' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'text-gray-500 hover:text-yellow-400'}`}><Book size={18}/> Diário</button>
          </div>

          {adminTab === 'rotation' && (
            <>
              {/* CABEÇALHO DA SEMANA */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                  <div className="flex items-center gap-3 text-gray-400">
                      <div>
                          <h2 className="text-lg font-bold uppercase tracking-widest text-white">Painel da Semana</h2>
                          <div className="flex items-center gap-2 mt-1">
                              <span className="text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded text-xs border border-yellow-500/20">
                                  {currentWeekData ? currentWeekData.weekName : "Carregando..."}
                              </span>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar size={10}/> 
                                  {currentWeekData ? `${currentWeekData.startDate.split('-').reverse().join('/')} até ${currentWeekData.endDate.split('-').reverse().join('/')}` : "..."}
                              </span>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={openAttendanceModal} className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all"><ListTodo size={18} /> Chamada</button>
                      <button onClick={() => openNewStudentModal()} className="bg-green-600 hover:bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-green-900/20"><Plus size={18} /> Novo Aluno</button>
                  </div>
              </div>

              {/* GRID DE COLUNAS */}
              <div className="grid lg:grid-cols-4 gap-6">
                  
                  {/* COLUNA 1: EQUIPE (SEM ESTAÇÃO) */}
                  <div className="bg-[#0a0a0f] border border-white/5 rounded-2xl p-4 flex flex-col h-full min-h-[500px]">
                      <h3 className="text-gray-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase border-b border-white/5 pb-2">
                          <Users size={16} /> Equipe {students.length === 0 && <span className="text-[10px] text-red-500 ml-2">(Vazio)</span>}
                      </h3>
                      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                          {students.filter(s => s.station === null).map(s => {
                              const level = getCurrentLevel(s.xp);
                              return (
                                  <div key={s.id} className="border border-white/10 p-3 rounded-xl bg-[#151520] flex flex-col gap-3 group hover:border-white/30 transition-all">
                                      <div className="flex items-center gap-3">
                                          {s.avatarImage ? (
     <img src={s.avatarImage} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
 ) : (
     <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
         <UserCircle size={24} className="text-gray-500" />
     </div>
 )}
                                          <div className="flex-1 overflow-hidden">
                                              <span className="text-white font-bold text-sm block truncate">{s.name}</span>
                                              <div className="flex items-center mt-1 gap-2">
                                                  <span className={`text-[9px] font-bold uppercase px-1.5 rounded bg-white/5 ${level.color}`}>{level.name}</span>
                                                  <button onClick={() => openXPModal(s)} className="text-yellow-500 text-[10px] font-bold hover:underline flex items-center gap-1"><Trophy size={10}/> {s.xp}</button>
                                              </div>
                                              <button onClick={() => openGradesModal(s)} className="text-gray-500 hover:text-yellow-400 text-[10px] mt-1 flex items-center gap-1"><GraduationCap size={10}/> Lançar Notas</button>
                                          </div>
                                          <div className="flex flex-col gap-2">
                                              <button onClick={() => openProfileModal(s)} className="text-gray-500 hover:text-green-400" title="Ver Perfil Completo"><UserCircle size={16}/></button>
                                              <button onClick={() => openNewStudentModal(s)} className="text-gray-500 hover:text-blue-400"><Pencil size={16}/></button>
                                              {/* BOTÃO DE TROFÉU 🏆 */}
                          <button 
                            onClick={() => setBadgeStudent(s)} 
                            className="text-gray-600 hover:text-yellow-500 mr-3 transition-colors"
                            title="Entregar Conquista"
                          >
                            <Trophy size={16}/>
                          </button>
                        {/* --- BOTÃO DE LIBERAR INGLÊS --- */}
                                              <button 
                                                  onClick={() => toggleEnglishChallenge(s)} 
                                                  className={`transition-colors ${s.englishChallengeUnlocked ? 'text-green-500 animate-pulse drop-shadow-[0_0_5px_rgba(34,197,94,0.8)]' : 'text-gray-600 hover:text-blue-400'}`}
                                                  title={s.englishChallengeUnlocked ? "Desativar Inglês" : "Ativar Inglês"}
                                              >
                                                  <span className="font-bold font-mono text-[10px] border border-current rounded px-1">EN</span>
                                              </button>

                                              {/* Lixeira original */}
                                              <button onClick={() => handleDeleteStudent(s.id)} className="text-gray-600 hover:text-red-500"><Trash2 size={16}/></button>
                                          </div>
                                      </div>
                                      <div className="flex gap-2 border-t border-white/5 pt-2">
                                          <button onClick={() => moveStudent(s.id, 'Engenharia')} className="flex-1 py-1.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">ENG</button>
                                          <button onClick={() => moveStudent(s.id, 'Inovação')} className="flex-1 py-1.5 rounded text-[10px] font-bold bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-500 hover:text-white transition-all">INO</button>
                                          <button onClick={() => moveStudent(s.id, 'Gestão')} className="flex-1 py-1.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all">GES</button>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>

{/* COLUNAS 2, 3 e 4: ESTAÇÕES */}
  {['Engenharia', 'Inovação', 'Gestão'].map(st => {
      const stats = getStationStats(st);
      return (
          <div key={st} className={`border rounded-2xl p-4 flex flex-col h-full relative overflow-hidden ${st==='Engenharia'?'bg-blue-500/5 border-blue-500/20':st==='Inovação'?'bg-pink-500/5 border-pink-500/20':'bg-purple-500/5 border-purple-500/20'}`}>
              <div className="flex justify-between items-start mb-2 border-b border-white/10 pb-2">
                  <h3 className={`font-black flex items-center gap-2 text-sm uppercase tracking-wider ${st==='Engenharia'?'text-blue-500':st==='Inovação'?'text-pink-500':'text-purple-500'}`}>
                      {st==='Engenharia'?<Rocket size={16}/>:st==='Inovação'?<Microscope size={16}/>:<BookOpen size={16}/>} {st}
                  </h3>
                  <button onClick={() => handleCloseStationWeek(st)} className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded font-bold flex items-center gap-1 transition-all"><Gavel size={10}/> Fechar Semana</button>
              </div>
              
              <div className="bg-black/40 rounded-xl p-3 mb-4 border border-white/5">
                  <label className="text-[10px] text-gray-500 font-bold uppercase block mb-2">Meta da Semana:</label>
                  
                  {/* Campo de Texto da Meta */}
                  <textarea 
                    value={missions[st]?.text || ""} 
                    onChange={(e) => updateMission(st, 'text', e.target.value)} 
                    className="w-full bg-transparent border-b border-white/10 text-xs text-gray-300 focus:border-white/50 outline-none mb-4 min-h-[60px] resize-y" 
                  />
                  
                  {/* Campo de Data */}
                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 mb-3">
                      <Calendar size={14} className="text-blue-500"/>
                      <input 
                        type="date" 
                        value={missions[st]?.deadline || ""} 
                        onChange={(e) => updateMission(st, 'deadline', e.target.value)} 
                        className="bg-transparent text-xs text-white font-bold outline-none w-full cursor-pointer" 
                      />
                  </div>

                  {/* 👇 O BOTÃO DE SALVAR NOVO ESTÁ AQUI 👇 */}
                  <button 
                      onClick={() => {
                          saveMissionToFirebase(st);
                          showNotification(`Meta de ${st} salva com sucesso!`, 'success');
                      }}
                      className="w-full bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white border border-green-500/30 text-[10px] uppercase tracking-wider font-bold py-2 rounded-lg transition-all flex justify-center items-center gap-2"
                  >
                      <Check size={14} /> Salvar Meta
                  </button>
                  {/* ☝️ FIM DO BOTÃO ☝️ */}
                  
              </div>

                              <div className="space-y-3 flex-1">
                                  {stats.isCompleted && <div className="h-full flex flex-col items-center justify-center text-center opacity-50 mt-10"><CheckSquare size={48} className="text-green-500 mb-2"/><p className="text-sm font-bold text-green-500">Semana Concluída!</p></div>}
                                  {students.filter(s => s.station === st).map(s => (
                                      <div key={s.id} className="border border-white/10 p-3 rounded-xl bg-[#151520] relative group animate-in slide-in-from-bottom-2">
                                          <div className="flex justify-between items-start mb-2">
                                              <div><span className="text-white font-bold text-sm block">{s.name}</span><span className="text-gray-500 text-[10px] font-mono bg-white/5 px-1.5 rounded inline-block mt-0.5">{s.turma}</span></div>
                                              <button onClick={() => moveStudent(s.id, null)} className="text-gray-500 hover:text-white bg-black/20 p-1 rounded"><X size={12}/></button>
                                          </div>
                                          {s.submission?.status === 'pending' && <AlertCircle size={16} className="text-yellow-500 absolute top-2 right-8 animate-bounce"/>}
                                          <div className="flex items-center justify-between mt-2">
                                              <button onClick={() => openXPModal(s)} className="text-yellow-500 text-xs font-bold hover:text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded flex items-center gap-1 transition-colors"><Trophy size={12}/> {s.xp} XP</button>
                                          </div>
                                          {s.submission?.status === 'pending' && <button onClick={() => openReviewModal(s)} className="w-full mt-2 bg-yellow-500 text-black text-xs font-bold py-1 rounded hover:bg-yellow-400 flex items-center justify-center gap-2"><Eye size={12}/> Revisar Entrega</button>}
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )
                  })}
              </div>
            </>
          )}

          {adminTab === 'strategy' && <StrategyView />}
          {adminTab === 'rounds' && <RoundsView />} {/* StrategyBoard agora mora dentro de RoundsView */}
          {adminTab === 'rubrics' && <RubricView />}
          
          {/* --- VISUALIZAÇÃO KANBAN --- */}
          {adminTab === 'kanban' && <KanbanView />}
          {adminTab === 'logbook' && <LogbookView />}
        </main>
      )}

      {/* --- ÁREA DO ALUNO --- */}
      {!isAdmin && viewAsStudent && (
        <main className="p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8">

    {/* ALERTA DE LÍDER DE GESTÃO */}
    {currentWeekData?.assignments?.Gestão?.some(s => s.id === viewAsStudent.id) && !["Heloise", "Sofia"].includes(viewAsStudent.name) && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl border border-purple-400/30 shadow-lg mb-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <Crown size={24} className="text-yellow-300" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">Você é o Líder de Gestão esta semana!</h3>
                    <p className="text-purple-100 text-xs">Sua missão: Cobrar tarefas e manter a equipe focada.</p>
                </div>
            </div>
        </div>
    )}

           <div onClick={() => openProfileModal(viewAsStudent)} className="text-center py-6 bg-[#151520] rounded-2xl border border-white/10 shadow-xl mb-8 cursor-pointer hover:bg-[#1a1a24] transition-colors group relative">
                <div className="absolute top-4 right-4 text-gray-600 group-hover:text-white transition-colors">
                    <UserCircle size={24} />
                </div>
                <div className="flex items-center justify-center gap-4">
                    {viewAsStudent.avatarImage ? (
     <img src={viewAsStudent.avatarImage} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
 ) : (
     <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
         <UserCircle size={32} className="text-gray-500" />
     </div>
 )}
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white leading-none">{viewAsStudent.name}</h2>
                        <p className="text-gray-400 text-sm font-mono mt-1">{viewAsStudent.turma}</p>
                    </div>
                </div>
           </div>
{/* --- SALA DE TROFÉUS (BADGES) --- */}
           <div className="mb-8">
               <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                   <Trophy className="text-yellow-500" size={20}/> 
                   Sala de Troféus
                   <span className="text-xs font-normal text-gray-500 ml-auto">
                       {viewAsStudent.badges?.length || 0}/{BADGES_LIST.length} Conquistados
                   </span>
               </h3>
               
               <div className="grid grid-cols-4 gap-2 md:gap-4 bg-[#151520] p-4 rounded-2xl border border-white/10">
                   {BADGES_LIST.map(badge => {
                       const hasBadge = viewAsStudent.badges?.includes(badge.id);
                       
                       return (
                           <div 
                             key={badge.id} 
                             onClick={() => isAdmin && toggleBadge(viewAsStudent, badge.id)} // Só Admin clica para dar
                             className={`relative group flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-300 ${
                                 hasBadge 
                                 ? 'bg-gradient-to-br from-white/10 to-transparent border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' 
                                 : 'bg-black/40 border-white/5 opacity-40 grayscale cursor-help'
                             } ${isAdmin ? 'cursor-pointer hover:bg-white/10' : ''}`}
                           >
                               {/* Ícone da Badge */}
                               <div className={`mb-2 transform transition-transform ${hasBadge ? 'scale-110 group-hover:scale-125' : 'scale-90'} ${badge.color}`}>
                                   {badge.icon}
                               </div>

                               {/* BOTÃO DE LIBERAR INGLÊS (Visão do Técnico) */}

                               
                               {/* Nome (Só aparece em telas maiores ou se tiver a badge) */}
                               <span className={`text-[10px] md:text-xs text-center font-bold leading-tight ${hasBadge ? 'text-white' : 'text-gray-600'}`}>
                                   {badge.name}
                               </span>

                               {/* Tooltip (Descrição ao passar o mouse) */}
                               <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-black border border-white/20 p-2 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl hidden md:block">
                                   <p className="font-bold text-white mb-1">{badge.name}</p>
                                   {badge.desc}
                                   {!hasBadge && <p className="text-yellow-500 mt-1 font-bold text-[10px] uppercase">Bloqueado</p>}
                               </div>
                           </div>
                       );
                   })}
               </div>
               
               {/* Mensagem motivacional se não tiver nenhuma */}
               {(!viewAsStudent.badges || viewAsStudent.badges.length === 0) && (
                   <p className="text-center text-xs text-gray-500 mt-2 italic">
                       Você ainda não tem badges lendárias. Trabalhe duro para o Técnico liberar!
                   </p>
               )}
           </div>
           {/* Lógica de Nível e XP */}
           {(() => {
                const currentLevel = getCurrentLevel(viewAsStudent.xp);
                const nextLevel = getNextLevel(viewAsStudent.xp);
                const progress = nextLevel ? ((viewAsStudent.xp - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100 : 100;

                return (
                    <div className="mb-8 px-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-lg font-black uppercase ${currentLevel.color}`}>{currentLevel.name}</span>
                            <span className="text-yellow-500 font-bold bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20 flex items-center gap-2"><Trophy size={14}/> {viewAsStudent.xp} XP</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 mb-2 overflow-hidden border border-white/5">
                            <div className={`h-full transition-all duration-1000 ${currentLevel.name === 'Mestre FLL' ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`} style={{width: `${Math.min(100, progress)}%`}}></div>
                        </div>
                        {nextLevel ? 
                            <p className="text-xs text-right text-gray-500">Próximo: <span className="text-white font-bold">{nextLevel.name}</span> (Faltam {nextLevel.min - viewAsStudent.xp} XP)</p> : 
                            <p className="text-xs text-right text-yellow-500 font-bold">Nível Máximo Atingido!</p>
                        }
                    </div>
                )
           })()}

            <div className="flex gap-2 justify-center mb-8 border-b border-white/10 pb-4 overflow-x-auto">
                <button onClick={() => setStudentTab('mission')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'mission' ? 'bg-white text-black' : 'text-gray-500 hover:bg-white/10'}`}><Rocket size={18}/> Minha Missão</button>
                <button onClick={() => setStudentTab('strategy')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'strategy' ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-purple-400'}`}><Lightbulb size={18}/> Estratégia</button>
                <button onClick={() => setStudentTab('rubrics')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'rubrics' ? 'bg-gray-400 text-black shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:text-gray-400'}`}><Scale size={18}/> Rubricas</button>
                <button onClick={() => setStudentTab('rounds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'rounds' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-blue-400'}`}><ListTodo size={18}/> Robô</button>
                <button onClick={() => setStudentTab('kanban')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'kanban' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-gray-500 hover:text-orange-400'}`}><ClipboardList size={18}/> Tarefas</button>
                <button onClick={() => setStudentTab('logbook')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'logbook' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' : 'text-gray-500 hover:text-yellow-400'}`}><Book size={18}/> Diário</button>
            </div>

            {studentTab === 'mission' && (
                <>
                {/* CABEÇALHO DO ALUNO + ELOGIOS */}
                <div className="mb-8 p-4 bg-white/5 rounded-xl border border-white/5 text-left flex justify-between items-center">
                    <div>
                        <h4 className="text-gray-400 text-xs font-bold uppercase mb-1">Mural de Equipe</h4>
                        <p className="text-xs text-gray-500">Reconheça seus colegas!</p>
                    </div>

                </div>

                {/* ESTAÇÃO ATUAL */}
                <p className="text-xl text-white mb-6">Estação Atual: <strong className={`uppercase ${viewAsStudent.station==='Engenharia'?'text-blue-500':viewAsStudent.station==='Inovação'?'text-pink-500':viewAsStudent.station==='Gestão'?'text-purple-500':'text-gray-400'}`}>{viewAsStudent.station || "Aguardando..."}</strong></p>
                
                {viewAsStudent.station && (
                    <div className="mt-6 p-8 bg-black/40 rounded-2xl border border-white/10 max-w-lg mx-auto relative overflow-hidden text-left">
                        
                        {/* FAIXAS DE STATUS (Aprovado/Pendente/Recusado) */}
                        {viewAsStudent.submission?.status === 'pending' && <div className="bg-yellow-500/90 text-black font-bold p-2 text-sm absolute top-0 left-0 w-full flex items-center justify-center gap-2"><AlertCircle size={16}/> Atividade em análise pelo técnico.</div>}
                        {viewAsStudent.submission?.status === 'approved' && <div className="bg-green-500/90 text-black font-bold p-2 text-sm absolute top-0 left-0 w-full flex items-center justify-center gap-2"><CheckCircle size={16}/> Atividade Aprovada!</div>}
                        {viewAsStudent.submission?.status === 'rejected' && <div className="bg-red-500/90 text-white font-bold p-2 text-sm absolute top-0 left-0 w-full flex items-center justify-center gap-2"><AlertTriangle size={16}/> Atividade Recusada. Refaça.</div>}

                        {/* TEXTO DA MISSÃO */}
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2 text-center mt-6">Missão Prioritária</p>
                        <p className="italic text-gray-300 mb-8 text-lg text-center border-b border-white/10 pb-6">"{missions[viewAsStudent.station]?.text || "Aguarde orientação..."}"</p>

                        {/* FORMULÁRIO DE ENVIO (Só aparece se não enviou ou se foi recusado) */}
                        {(!viewAsStudent.submission || viewAsStudent.submission.status === 'rejected') && (
                            <form onSubmit={handleSubmitActivity}>
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Relatório da Missão</label>
                                <textarea required value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white mb-4 focus:border-blue-500 outline-none min-h-[100px]" placeholder="Descreva aqui o que foi feito..." />
                                
        
                                
                                <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3 rounded-lg uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Upload size={20} /> Entregar Atividade</>}
                                </button>
                            </form>
                        )}
                        {/* VISUALIZAÇÃO DO ENVIO REALIZADO */}
                        {viewAsStudent.submission && viewAsStudent.submission.status !== 'rejected' && (
                            <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                                <p className="text-gray-400 text-sm mb-2">Último envio: {viewAsStudent.submission.date}</p>
                                <p className="text-white font-bold">"{viewAsStudent.submission.text}"</p>
                                {viewAsStudent.submission.fileName !== "Sem arquivo" && <p className="text-blue-400 text-xs mt-2 flex items-center justify-center gap-1"><FileText size={10}/> {viewAsStudent.submission.fileName}</p>}
                            </div>
                        )}
                    </div>
                )}
                </>
            )}

            {studentTab === 'strategy' && <div className="text-left"><StrategyView /></div>}
            {studentTab === 'rounds' && <div className="text-left"><RoundsView readonly={true} /></div>}
            {studentTab === 'rubrics' && <div className="text-left"><RubricView /></div>}
            {studentTab === 'kanban' && <div className="text-left"><KanbanView /></div>}
            {studentTab === 'logbook' && <div className="text-left"><LogbookView /></div>}
        </main>
      )}
    </div>
    </div>
        )
      }
      
      export default App
      