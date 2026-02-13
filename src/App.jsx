import { useState, useEffect } from 'react'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
  CheckCheck,    // <--- Provavelmente vai pedir em seguida (Aprovado Duplo)
  ExternalLink,  // <--- Provavelmente vai pedir em seguida (Abrir Arquivo em outra aba)
  FileWarning,
} from 'lucide-react';

// --- CONFIGURAÇÃO DO FIREBASE (COLE AQUI) ---
const firebaseConfig = {
  apiKey: "AIzaSyAeHmw9cMxzhu-nbXDIU21DxkcwZU0kKtM", // Suas chaves reais
  authDomain: "gestao-new-gears.firebaseapp.com",
  projectId: "gestao-new-gears",
  storageBucket: "gestao-new-gears.firebasestorage.app",
  messagingSenderId: "230026094824",
  appId: "1:230026094824:web:fbc826414e299dba89815d"
};

// --- LISTA DE TÉCNICOS (ADMINISTRADORES) ---
const ADMIN_USERS = [
  { user: "Guilherme", pass: "dti2@15!!" },
  { user: "Felipe", pass: "dti2@15!!" } 
  // Pode adicionar quantos quiser separando por vírgula
];

// Inicializa Firebase
let db, storage;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) { console.error("Erro Firebase", e); }


// --- CONFIGURAÇÃO DE NÍVEIS ---

const LEVELS = [

    { name: "Novato", min: 0, max: 499, color: "text-gray-400" },

    { name: "Aprendiz", min: 500, max: 1199, color: "text-cyan-400" },

    { name: "Veterano", min: 1200, max: 2399, color: "text-purple-400" },

    { name: "Mestre FLL", min: 2400, max: 10000, color: "text-yellow-400" }

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


function App() {

// --- LISTA DE BADGES (VERSÃO FINAL) ---
  const BADGES_LIST = [
    { id: 'pitstop', name: 'Pit Stop F1', icon: <Timer size={20}/>, color: 'text-red-500', desc: 'Troca de anexo em menos de 3s.' },
    { id: 'engineer', name: 'Engenheiro Minimalista', icon: <Wrench size={20}/>, color: 'text-gray-300', desc: 'Solução mecânica simples e genial.' },
    { id: 'ice_blood', name: 'Sangue Frio', icon: <ThermometerSnowflake size={20}/>, color: 'text-cyan-400', desc: 'Manteve a calma no erro crítico.' },
    { id: 'repetition', name: 'Rei da Repetição', icon: <RotateCcw size={20}/>, color: 'text-green-500', desc: '10 acertos seguidos na mesa.' },
    { id: 'helper', name: 'Braço Direito', icon: <HeartHandshake size={20}/>, color: 'text-pink-500', desc: 'Ajudou o time em qualquer situação.' },
    { id: 'data_keeper', name: 'Guardião dos Dados', icon: <BarChart size={20}/>, color: 'text-blue-500', desc: 'Trouxe estatísticas reais pro Projeto.' },
    { id: 'legend', name: 'Lenda do XP', icon: <Zap size={20}/>, color: 'text-yellow-400', desc: 'Destaque absoluto no Ranking de XP.' },
    { id: 'ambassador', name: 'Embaixador', icon: <Crown size={20}/>, color: 'text-purple-500', desc: 'Liderou pelo exemplo e uniu a equipe.' },
  ];

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
  const [currentUser, setCurrentUser] = useState(null); // Se null, mostra tela de login
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError("");

    // 1. Tenta logar como Técnico (Procura na lista de ADMINs)
    const adminFound = ADMIN_USERS.find(a => a.user === loginUser && a.pass === loginPass);

    if (adminFound) {
        // Logou com sucesso!
        setCurrentUser({ type: 'admin', name: adminFound.user }); // Salva o nome de quem entrou
        setIsAdmin(true);
        setViewAsStudent(null);
        return;
    }

    // ... (o resto do código que verifica aluno continua igual)
    // 2. Tenta logar como Aluno...

    // 2. Tenta logar como Aluno (busca no array 'students' que já existe no seu código)
    // Nota: Certifique-se de que o cadastro de aluno salva 'username' e 'password'
    const studentFound = students.find(s => 
        s.username && s.username.toLowerCase() === loginUser.toLowerCase() && s.password === loginPass
    );

    if (studentFound) {
        setCurrentUser({ type: 'student', data: studentFound });
        setIsAdmin(false); // Remove flag de admin
        setViewAsStudent(studentFound); // Força a visão para este aluno
    } else {
        setLoginError("Usuário ou senha incorretos.");
    }
  };

  

  const handleLogout = () => {
      setCurrentUser(null);
      setIsAdmin(false);
      setViewAsStudent(null);
      setLoginUser("");
      setLoginPass("");
  };
  // ----------------------------------

  const [isAdmin, setIsAdmin] = useState(true) 

  const [viewAsStudent, setViewAsStudent] = useState(null)

  const [isStudentLink, setIsStudentLink] = useState(false)

  const [currentWeekData, setCurrentWeekData] = useState(null)

  const [adminTab, setAdminTab] = useState('rotation') 

  const [studentTab, setStudentTab] = useState('mission')

  

  // --- DADOS EDITÁVEIS DE MISSÕES (Mestre das Missões) ---

  const [missionsList, setMissionsList] = useState([])



  // --- DADOS DA MATRIZ DE DECISÃO (Estratégia de Campeão) ---

  const [decisionMatrix, setDecisionMatrix] = useState([])



  const [students, setStudents] = useState([])
 

  const [experts, setExperts] = useState([])

  const [robotVersions, setRobotVersions] = useState([])

  const [rounds, setRounds] = useState([])

  const [compliments, setCompliments] = useState([])

  const [rubric, setRubric] = useState({ discovery: 3, innovation: 2, impact: 3, inclusion: 4, teamwork: 3, fun: 4 })

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





// --- FUNÇÃO DE CRONOGRAMA (11 ALUNOS: 2 FIXOS + 9 NO RODÍZIO TRIPLO) ---
  const generateSchedule = () => { 
      const schedule = []; 
      let currentDate = new Date("2026-03-02"); // Data de Início

      // 1. CAPITÃS (Sempre Fixas em Gestão)
      const capitasNames = ["Heloise", "Sofia"];

      // 2. LISTA DOS 9 ALUNOS DO RODÍZIO
      // (Adicione os nomes reais aqui conforme entrarem)
      const poolDeAlunos = [
          "Enzo", "Mariana", 
          "Aluno 3", "Aluno 4", 
          "Aluno 5", "Aluno 6", 
          "Aluno 7", "Aluno 8", 
          "Aluno 9"
      ];

      // Função auxiliar para criar objetos visuais (evita o "Vago")
      const getStudentObjects = (namesList) => {
          return namesList.map(nameStr => {
              const found = students.find(s => s.name.toLowerCase().includes(nameStr.toLowerCase()));
              if (found) return found; 
              // Cria objeto temporário se não achar no banco
              return { id: `fake-${nameStr}-${Math.random()}`, name: nameStr, avatarType: 'robot' };
          });
      };

      for (let i = 1; i <= 35; i++) { 
          const endDate = new Date(currentDate); 
          endDate.setDate(currentDate.getDate() + 4); 
          
          // --- ALGORITMO DE MISTURA (O "LIQUIDIFICADOR") ---
          // Gira a lista toda semana para mudar as duplas
          const step = i - 1; 
          const misturados = [
              ...poolDeAlunos.slice(step % poolDeAlunos.length),
              ...poolDeAlunos.slice(0, step % poolDeAlunos.length)
          ];

          // Divide os 9 alunos em 3 grupos de 3
          const grupo1 = misturados.slice(0, 3);
          const grupo2 = misturados.slice(3, 6);
          const grupo3 = misturados.slice(6, 9);

          let engTeam = [];
          let inovTeam = [];
          let gestTeam = [];

          // --- RODÍZIO TRIPLO (A dança das cadeiras) ---
          const resto = i % 3; // 1, 2 ou 0

          if (resto === 1) {       // SEMANA 1, 4, 7...
              engTeam = grupo1;
              inovTeam = grupo2;
              gestTeam = grupo3;
          } else if (resto === 2) { // SEMANA 2, 5, 8...
              engTeam = grupo3;
              inovTeam = grupo1;
              gestTeam = grupo2;
          } else {                 // SEMANA 3, 6, 9...
              engTeam = grupo2;
              inovTeam = grupo3;
              gestTeam = grupo1;
          }

          // Adiciona as Capitãs ao time de Gestão da semana
          // O "..." espalha os alunos do rodízio junto com as capitãs
          const gestaoFinal = [...capitasNames, ...gestTeam];

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
  }
  const [rotationSchedule] = useState(generateSchedule());

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
            setter(data);
        }, (error) => console.error(`Erro em ${colName}:`, error));
    };

    const unsubStudents = createListener("students", setStudents);
    const unsubExperts = createListener("experts", setExperts);
    const unsubRobot = createListener("robotVersions", setRobotVersions);
    const unsubRounds = createListener("rounds", setRounds);
    const unsubCompliments = createListener("compliments", setCompliments);
    const unsubMatrix = createListener("decisionMatrix", setDecisionMatrix);
    const unsubQuestions = createListener("questions", setQuestions);
    const unsubOutreach = createListener("outreach", setOutreachEvents);
    // ... dentro do useEffect principal ...
    const unsubProject = onSnapshot(collection(db, "project"), (s) => {
        if (!s.empty) {
            // Pega o primeiro documento encontrado
            setProjectSummary({ ...s.docs[0].data(), id: s.docs[0].id });
        }
    });

    // ... e não esqueça de adicionar no return para limpar:
    // return () => { ... unsubProject(); };
    
    const unsubMissions = onSnapshot(collection(db, "missions"), (s) => {
        if (!s.empty) setMissionsList(s.docs.map(d => ({...d.data(), id: d.id})));
    });

    return () => {
        unsubStudents(); unsubExperts(); unsubRobot(); unsubRounds();
        unsubCompliments(); unsubMatrix(); unsubQuestions(); 
        unsubOutreach(); unsubMissions();
    };
  }, []);



  // --- FIM DOS USE EFFECTS ---

  // Função de notificação (corrigida)
  const showNotification = (msg, type = 'success') => { 
      setNotification({ msg, type }); 
      setTimeout(() => setNotification(null), 3000); 
  }

  const getStationStats = (stationName) => { const activeStudents = students.filter(s => s.station === stationName); const pendingReviews = activeStudents.filter(s => s.submission?.status === 'pending').length; return { totalActive: activeStudents.length, pendingReviews, isCompleted: activeStudents.length === 0 }; }

  const getStudentName = (id) => { const s = students.find(stud => stud.id === id); return s ? s.name : "Vaga"; }

  const convertBase64 = (file) => new Promise((resolve, reject) => { const reader = new FileReader(); reader.readAsDataURL(file); reader.onload = () => resolve(reader.result); reader.onerror = error => reject(error); });



  // --- ACTIONS ---

  const saveStudent = (newStudentData) => { setStudents(prev => { const exists = prev.find(s => s.id === newStudentData.id); return exists ? prev.map(s => s.id === newStudentData.id ? newStudentData : s) : [...prev, newStudentData]; }); }

  const deleteStudent = (id) => { setStudents(prev => prev.filter(s => s.id !== id)); }

  // Função EXCLUSIVA para apagar Aluno
  const handleDeleteStudent = async (id) => {
    if (confirm("Certeza que quer remover este aluno?")) {
      await deleteDoc(doc(db, "students", id));
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
        
        showNotification("Registro apagado do banco!");
      } catch (error) {
        console.error("Erro fatal ao apagar:", error);
        alert("Erro no sistema: Olhe o Console (F12)");
      }
    }
  };
  
  // --- FUNÇÃO CORRIGIDA COM LOGS ---
  const handleRegisterSubmit = async (e) => { 
      e.preventDefault(); 
      console.log("Botão cadastrar clicado!"); // Log 1

      const fd = new FormData(e.target); 
      
      // Cria o objeto do aluno
      const newStudentData = { 
          name: fd.get('name'), 
          turma: fd.get('turma'), 
          username: fd.get('username'), 
          password: fd.get('password'), 
          avatarType: fd.get('avatarType'), 
          xp: 0, 
          totalClasses: 0, 
          attendedClasses: 0, 
          station: null, 
          submission: null 
      };

      console.log("Dados do formulário:", newStudentData); // Log 2

      try {
          // Tenta salvar no Firebase
          await addDoc(collection(db, "students"), newStudentData);
          console.log("Salvo no Firebase com sucesso!"); // Log 3
          
          closeModal(); 
          showNotification("Aluno cadastrado com acesso!"); 
      } catch (error) {
          console.error("Erro ao salvar no Firebase:", error); // Log de Erro
          showNotification("Erro ao cadastrar. Veja o console (F12).", "error");
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
          estimatedTime: parseInt(fd.get('time')),
          missions: selectedMissions,
          totalPoints
      };

      try {
          await addDoc(collection(db, "rounds"), roundData);
          closeModal();
          showNotification("Round salvo no Firebase!");
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

  const openNewStudentModal = () => { setSelectedFile(null); setModal({ type: 'newStudent' }); }

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

  // Novos Modais

  const openMissionForm = (data = null) => { setSelectedFile(null); setModal({ type: 'missionForm', data }); }

  const openMatrixForm = () => setModal({ type: 'matrixForm' });



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
// --- ROBÔ ARRUMADOR: Força os alunos para as estações certas ---
  // (Cole isso LOGO ABAIXO da função moveStudent)
  
  useEffect(() => {
    // 1. Só roda se tivermos a semana definida e alunos carregados
    if (!currentWeekData || students.length === 0) return;

    console.log("Verificando se todos estão nos lugares certos...");

    // Função interna para verificar e mover
    const checkAndMove = (stationName, assignedList) => {
        // Se a lista for vazia ou texto de aviso, ignora
        if (!Array.isArray(assignedList)) return; 

        assignedList.forEach(identifier => {
            // Tenta achar o aluno pelo ID (preferência) ou pelo Nome (texto)
            const student = students.find(s => 
                s.id === identifier || 
                s.name.toLowerCase().includes(identifier.toString().toLowerCase())
            );

            // Se achou o aluno E ele NÃO está na estação certa...
            if (student && student.station !== stationName) {
                console.log(`MOVENDO ${student.name} para ${stationName}...`);
                moveStudent(student.id, stationName); // <--- A MÁGICA ACONTECE AQUI
            }
        });
    };

    // Verifica as 3 estações
    if (currentWeekData.assignments) {
        checkAndMove('Gestão', currentWeekData.assignments.Gestão);
        checkAndMove('Engenharia', currentWeekData.assignments.Engenharia);
        checkAndMove('Inovação', currentWeekData.assignments.Inovação);
    }

  }, [currentWeekData, students.length]); // Roda sempre que mudar a semana ou entrarem alunos
  const updateMission = (st, f, v) => setMissions({ ...missions, [st]: { ...missions[st], [f]: v } })

  const closeModal = () => { setModal({ type: null, data: null }); setSelectedFile(null); }

  // --- ENVIO DE ATIVIDADE DO ALUNO (CONECTADO) ---
  const handleSubmitActivity = async (e) => { 
      e.preventDefault(); 
      setIsSubmitting(true);

      try {
          // 1. Processa o arquivo (se tiver)
          let fileData = null;
          let fileName = "Sem arquivo";
          if (selectedFile) {
              fileData = await convertBase64(selectedFile);
              fileName = selectedFile.name;
          }

          // 2. Cria o objeto da entrega
          const submissionData = { 
              text: submissionText, 
              fileName: fileName, 
              fileData: fileData, 
              date: new Date().toLocaleString(), 
              status: "pending" // Importante: 'pending' faz aparecer para o técnico
          };

          // 3. Salva no Firebase (Atualiza o aluno)
          const studentRef = doc(db, "students", viewAsStudent.id);
          await updateDoc(studentRef, { 
              submission: submissionData 
          });

          // 4. Limpa o formulário
          setSubmissionText(""); 
          setSelectedFile(null); 
          showNotification("Atividade enviada para o Técnico!");
      
      } catch (error) {
          console.error("Erro ao enviar:", error);
          showNotification("Erro ao enviar. Tente novamente.", "error");
      } finally {
          setIsSubmitting(false);
      }
  }

  const copyStudentLink = () => { navigator.clipboard.writeText(`${window.location.href.split('?')[0]}?mode=student`); showNotification("Link copiado!"); }

  const handleFileSelect = (e) => { const file = e.target.files[0]; if (file) setSelectedFile(file); }

  const handleDownloadFile = (sub) => { showNotification(`Baixando: ${sub.fileName}`, "download"); }



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

  const Modal = () => {

    if (!modal.type) return null;

    return (

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">

        <div className={`bg-zinc-800 border border-white/10 rounded-2xl p-6 w-full relative animate-in zoom-in-95 z-60 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar ${modal.type === 'imageView' ? 'max-w-4xl h-auto' : 'max-w-md max-h-[90vh]'}`}>

          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-white p-2 z-50"><X size={20}/></button>



          {modal.type === 'imageView' && <img src={modal.data} className="w-full h-auto rounded-lg" alt="Evidência" />}

          {modal.type === 'confirm' && <><h3 className="text-xl font-bold text-white mb-2">{modal.data.title}</h3><p className="text-gray-400 mb-6">{modal.data.msg}</p><div className="flex gap-3"><button onClick={closeModal} className="flex-1 py-3 rounded-lg text-gray-400 bg-white/5 hover:bg-white/10">Cancelar</button><button onClick={modal.data.onConfirm} className="flex-1 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600">Confirmar</button></div></>}

          

          {/* ... MODAIS EXISTENTES (newStudent, expertForm, robotForm, rubric, xp, review, expertView, robotView, newRound, compliment, attendance, grades) MANTIDOS IGUAIS ... */}

{modal.type === 'newStudent' && (
  <form onSubmit={handleRegisterSubmit}>
    <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
      <Plus className="text-green-500"/> Novo Aluno
    </h3>
    
    {/* DADOS BÁSICOS */}
    <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label>
            <input name="name" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: Ana Silva" />
        </div>
        <div>
            <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Turma</label>
            <input name="turma" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Ex: 8º A" />
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
                <input name="username" required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="ana.fll" />
            </div>
            <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Senha</label>
                <input name="password" required className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:border-yellow-500 outline-none" placeholder="1234" />
            </div>
        </div>
    </div>

    {/* AVATAR */}
    <div className="mb-6">
        <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Avatar</label>
        <div className="grid grid-cols-2 gap-4">
            <label className="cursor-pointer">
                <input type="radio" name="avatarType" value="mech1" defaultChecked className="hidden peer" />
                <div className="bg-black/50 border border-white/20 rounded-xl p-4 flex flex-col items-center hover:bg-white/5 peer-checked:border-orange-500 peer-checked:bg-orange-500/10 transition-all">
                    <Bot className="text-orange-500 mb-2" size={32} />
                    <span className="text-[10px] text-white font-bold mt-1">Laranja</span>
                </div>
            </label>
            <label className="cursor-pointer">
                <input type="radio" name="avatarType" value="mech2" className="hidden peer" />
                <div className="bg-black/50 border border-white/20 rounded-xl p-4 flex flex-col items-center hover:bg-white/5 peer-checked:border-cyan-500 peer-checked:bg-cyan-500/10 transition-all">
                    <Bot className="text-cyan-500 mb-2" size={32} />
                    <span className="text-[10px] text-white font-bold mt-1">Ciano</span>
                </div>
            </label>
        </div>
    </div>
    
    <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-900/20 transition-all">
        Cadastrar Aluno
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

          {modal.type === 'newRound' && (<form onSubmit={handleRoundSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-cyan-500"/> Planejar Round</h3><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome do Round</label><input name="name" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="Ex: Saída 1" /></div><div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Tempo (segundos)</label><input name="time" type="number" required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="30" /></div></div><div className="mb-6 max-h-40 overflow-y-auto custom-scrollbar border border-white/10 rounded-lg p-2"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block sticky top-0 bg-[#151520] pb-2">Missões (Selecione)</label>{missionsList.map(m => (<label key={m.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"><input type="checkbox" name="missions" value={m.id} className="accent-cyan-500 w-4 h-4"/><div className="flex items-center gap-2 flex-1">{m.image && <img src={m.image} className="w-6 h-6 rounded object-cover" alt="M" />}<span className="text-sm text-gray-300">{m.code} - {m.name}</span></div><span className="text-xs font-bold text-cyan-500">+{m.points}pts</span></label>))}</div><button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg">Salvar Round</button></form>)}

    

          {modal.type === 'attendance' && (<form onSubmit={handleAttendanceSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><ListTodo className="text-green-500"/> Chamada do Dia</h3><div className="mb-6 max-h-60 overflow-y-auto custom-scrollbar">{students.map(s => { const stats = getAttendanceStats(s); return ( <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg border-b border-white/5 cursor-pointer"><input type="checkbox" name="present" value={s.id} defaultChecked className="accent-green-500 w-5 h-5"/><div className="flex-1"><span className="text-white font-bold block">{s.name}</span><span className="text-xs text-gray-500">{s.turma} • Presença: <span className={stats.percent < 75 ? 'text-red-500' : 'text-green-500'}>{stats.percent}%</span> • Faltas: {stats.absences}</span></div></label>) })}</div><button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg">Confirmar Presença</button></form>)}

          {modal.type === 'grades' && (<form onSubmit={handleGradesSubmit}><h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><GraduationCap className="text-yellow-500"/> Lançar Notas SESI</h3><p className="text-xs text-gray-400 mb-6">Digite as notas da etapa separadas por vírgula (Ex: 10, 9.5, 8.0).</p><div className="mb-6"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Notas do Aluno: {modal.data.name}</label><input name="grades" required autoFocus className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" placeholder="Ex: 10, 9.5, 8.0" /></div><div className="bg-white/5 p-4 rounded-xl text-xs text-gray-400 mb-6 space-y-1"><p className="font-bold text-white mb-2">Regra de Pontuação:</p><p>• Nota 10 = <span className="text-green-500 font-bold">+10 XP</span></p><p>• Nota 9.0 a 9.9 = <span className="text-cyan-500 font-bold">+7 XP</span></p><p>• Nota 8.0 a 8.9 = <span className="text-purple-500 font-bold">+5 XP</span></p><p>• Abaixo de 8.0 = +0 XP</p></div><button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 rounded-lg">Processar Boletim</button></form>)}

          

          {/* NOVO MODAL: EDITOR DE MISSÕES */}

          {modal.type === 'missionForm' && (

             <form onSubmit={handleMissionSubmit}>

                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Settings className="text-cyan-500"/> {modal.data ? 'Editar' : 'Nova'} Missão</h3>

                <div className="grid grid-cols-3 gap-4 mb-4">

                    <div><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Código</label><input name="code" defaultValue={modal.data?.code} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="M01" /></div>

                    <div className="col-span-2"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Nome</label><input name="name" defaultValue={modal.data?.name} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="Coral Nursery" /></div>

                </div>

                <div className="mb-4"><label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Pontos (Máx)</label><input name="points" type="number" defaultValue={modal.data?.points} required className="w-full bg-black/50 border border-white/20 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" /></div>

                <div className="mb-6 bg-white/5 p-3 rounded-lg border border-white/10"><label className="text-xs text-gray-400 uppercase font-bold mb-2 block">Foto da Missão</label><input type="file" onChange={handleFileSelect} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-500 hover:file:bg-cyan-500/20 cursor-pointer" />{selectedFile ? <span className="text-xs text-green-500 block mt-2 font-bold flex items-center gap-1"><CheckCircle size={10}/> Selecionado</span> : modal.data?.image && <div className="mt-2 text-xs text-blue-500 flex items-center gap-1"><CheckCircle size={10}/> Imagem já salva</div>}</div>

                <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg">Salvar Missão</button>

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

        </div>

      </div>

    )

  }



  // --- COMPONENTE DE ESTRATÉGIA ---

  const StrategyView = ({ readonly = false }) => (

      <div className="animate-in fade-in duration-300 space-y-8">

          

          {/* MATRIZ DE DECISÃO (NOVO) */}

          <div className="bg-[#151520] border border-white/10 rounded-2xl p-6">

              <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><BarChart3 className="text-purple-500"/> Matriz de Decisão (Pugh Matrix)</h3>{!readonly && <button onClick={openMatrixForm} className="text-xs bg-purple-500/10 text-purple-500 border border-purple-500/20 px-3 py-1.5 rounded-lg hover:bg-purple-500 hover:text-white font-bold">+ Nova Ideia</button>}</div>

              <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="text-xs text-gray-500 uppercase border-b border-white/10"><tr><th className="p-3">Ideia</th><th className="p-3 text-center">Impacto (x3)</th><th className="p-3 text-center">Custo (x2)</th><th className="p-3 text-center">Fácil (x1)</th><th className="p-3 text-center">Inovação (x2)</th><th className="p-3 text-right text-white">Total</th></tr></thead><tbody>

                  {decisionMatrix.sort((a,b) => (b.impact*3 + b.cost*2 + b.feasibility + b.innovation*2) - (a.impact*3 + a.cost*2 + a.feasibility + a.innovation*2)).map(item => {

                      const total = (item.impact*3) + (item.cost*2) + (item.feasibility) + (item.innovation*2);

                      return (<tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors"><td className="p-3 font-bold text-white">{item.name}</td><td className="p-3 text-center text-gray-400">{item.impact}</td><td className="p-3 text-center text-gray-400">{item.cost}</td><td className="p-3 text-center text-gray-400">{item.feasibility}</td><td className="p-3 text-center text-gray-400">{item.innovation}</td><td className="p-3 text-right font-black text-purple-400 text-lg">{total}</td></tr>)

                  })}

              </tbody></table></div>

          </div>



          <div className="grid lg:grid-cols-3 gap-6">

            <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">

                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare className="text-pink-500"/> Especialistas</h3>{!readonly && <button onClick={() => openExpertModal()} className="text-xs bg-pink-500/10 text-pink-500 border border-pink-500/20 px-3 py-1.5 rounded-lg hover:bg-pink-500 hover:text-white font-bold">+ Novo</button>}</div>

                <div className="space-y-4">{experts.map(exp => (<div key={exp.id} onClick={() => openExpertView(exp)} className="bg-black/40 border border-white/5 p-4 rounded-xl flex flex-col gap-2 relative group cursor-pointer hover:bg-white/5 transition-colors">{!readonly && <button onClick={(e) => { e.stopPropagation(); openExpertModal(exp); }} className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><Pencil size={12}/></button>}<div className="flex justify-between items-start pr-6"><div><span className="text-white font-bold block text-sm">{exp.name}</span><span className="text-xs text-gray-400">{exp.role}</span></div>{exp.applied ? <span className="bg-green-500/20 text-green-500 text-[9px] px-2 py-1 rounded">APLICADO</span> : <span className="bg-gray-500/20 text-gray-500 text-[9px] px-2 py-1 rounded">CONSULTA</span>}</div><p className="text-xs text-gray-300 italic line-clamp-3">"{exp.notes}"</p>{exp.image && <div className="text-[10px] text-pink-400 flex items-center gap-1 mt-1"><ImageIcon size={10}/> Tem evidência</div>}<div className="h-1 rounded-full bg-gray-700 mt-1"><div className={`h-1 rounded-full ${exp.impact==='Alto'?'bg-green-500 w-full':exp.impact==='Médio'?'bg-yellow-500 w-1/2':'bg-gray-500 w-1/4'}`}></div></div></div>))}</div>

            </div>

            <div className="bg-[#151520] border border-white/10 rounded-2xl p-6 h-fit">

                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><GitCommit className="text-blue-500"/> Diário do Robô</h3>{!readonly && <button onClick={() => openRobotModal()} className="text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1.5 rounded-lg hover:bg-blue-500 hover:text-white font-bold">+ Versão</button>}</div>

                <div className="relative pl-4 border-l border-white/10 space-y-8">{robotVersions.map((ver, idx) => (<div key={ver.id} onClick={() => openRobotView(ver)} className="relative group cursor-pointer"><div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-[#151520]"></div><div className="bg-black/40 border border-white/5 p-4 rounded-xl relative hover:bg-white/5 transition-colors">{!readonly && <button onClick={(e) => { e.stopPropagation(); openRobotModal(ver); }} className="absolute top-2 right-2 text-gray-500 hover:text-white p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"><Pencil size={12}/></button>}<div className="flex justify-between mb-2"><span className="text-blue-400 font-mono font-bold text-xs">{ver.version}</span><span className="text-[10px] text-gray-500">{ver.date.split('-').reverse().slice(0,2).join('/')}</span></div><h4 className="text-white font-bold mb-1 text-sm">{ver.name}</h4><p className="text-xs text-gray-400 line-clamp-2">{ver.changes}</p>{ver.image && <div className="text-[10px] text-blue-400 flex items-center gap-1 mt-2"><ImageIcon size={10}/> Tem foto</div>}</div></div>))}</div>

            </div>


          </div>

      </div>

  )



  // --- COMPONENTE DE ROUNDS ---

  const RoundsView = ({ readonly = false }) => {

      const totalPoints = rounds.reduce((acc, r) => acc + r.totalPoints, 0);

      const totalTime = rounds.reduce((acc, r) => acc + r.estimatedTime, 0);

      const isOverTime = totalTime > 150; 

      const timePercent = Math.min(100, (totalTime / 150) * 100);



      return (

      <div className="animate-in fade-in duration-300">

          <div className="bg-gradient-to-r from-[#151520] to-[#0a0a0f] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">

              <div className="flex-1 w-full">

                  <h3 className="text-sm text-gray-400 font-bold uppercase mb-2">Tempo de Mesa (Máx 150s)</h3>

                  <div className="flex justify-between text-xs mb-1"><span className={isOverTime ? 'text-red-500 font-bold' : 'text-white'}>{totalTime}s usados</span><span className="text-gray-500">{150 - totalTime}s restantes</span></div>

                  <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border border-white/5"><div className={`h-full transition-all duration-1000 ${isOverTime ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${timePercent}%`}}></div></div>

                  {isOverTime && <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-bold animate-pulse"><AlertTriangle size={12}/> Atenção! O tempo estourou o limite da regra.</p>}

              </div>

              <div className="flex items-center gap-6">

                  <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">Pontuação Projetada</p><p className="text-4xl font-black text-white">{totalPoints} <span className="text-sm text-gray-600">pts</span></p></div>

                  <div className="h-12 w-px bg-white/10"></div>

                  <div className="text-right"><p className="text-xs text-gray-400 font-bold uppercase">Saídas</p><p className="text-4xl font-black text-cyan-500">{rounds.length}</p></div>

              </div>

          </div>

          <div className="flex gap-2 mb-6">

            {!readonly && <button onClick={openNewRoundModal} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/20"><Plus size={16}/> Criar Novo Round</button>}

            {!readonly && <button onClick={() => openMissionForm()} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><Settings size={16}/> Gerenciar Missões</button>}

          </div>

          

         <div className="grid lg:grid-cols-4 gap-4">
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
        <ListTodo size={16} className="text-cyan-500"/> {round.name}
      </h3>

      {/* Pontos e Tempo */}
      <div className="flex items-center justify-between text-xs text-gray-400 mb-4 bg-black/40 p-2 rounded border border-white/5">
        <span className="flex items-center gap-1 font-bold text-white">
          <Calculator size={12} className="text-cyan-500"/> {round.totalPoints} pts
        </span>
        <span className="flex items-center gap-1 font-bold text-white">
          <Timer size={12} className="text-cyan-500"/> {round.estimatedTime}s
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
              <span className="font-bold text-cyan-500 whitespace-nowrap">+{mission?.points}</span>
            </div>
          ) 
        })}
      </div>
    </div>
  ))}
</div>

      </div>

  )}



// --- TELA DE LOGIN (Se não tiver usuário logado) ---
  if (!currentUser) {
      return (
          <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
              {/* Fundo decorativo */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-orange-500"></div>
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

                      <button className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] mt-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2">
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
    <div className="min-h-screen bg-zinc-900 text-white font-sans selection:bg-blue-500 selection:text-black pb-20 relative">
      <Notification />
      <Modal />
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
                    className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 ${
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
          <div className="font-black italic text-xl tracking-tighter">NEW GEARS</div>
          
          <div className="flex items-center gap-3 md:gap-4">
              
              {/* 1. BOTÃO CRONOGRAMA (VOLTOU!) */}
              {/* Só aparece se o modal de cronograma não estiver aberto */}
              <button onClick={() => setShowFullSchedule(true)} className="bg-white/5 border border-white/10 text-white p-2 rounded-full hover:bg-white/10 transition-colors md:px-4 md:py-2 md:rounded-lg flex items-center gap-2">
                  <CalendarDays size={18} /> <span className="hidden md:inline text-xs font-bold">Cronograma</span>
              </button>
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

              {/* 3. BOTÃO DE SAIR */}
              <button onClick={handleLogout} className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-full hover:bg-red-500 hover:text-white transition-all" title="Sair">
                  <LogOut size={18} />
              </button>
          </div>
      </header>

      {/* --- ÁREA DO TÉCNICO (ADMIN) --- */}
      {isAdmin && (
        <main className="p-4 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
          <div className="flex gap-4 mb-8 border-b border-white/10 pb-4 overflow-x-auto">
              <button onClick={() => setAdminTab('rotation')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'rotation' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><LayoutDashboard size={18}/> Rodízio & Equipe</button>
              <button onClick={() => setAdminTab('strategy')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'strategy' ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-purple-400'}`}><Lightbulb size={18}/> Estratégia & Inovação</button>
              <button onClick={() => setAdminTab('rounds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${adminTab === 'rounds' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-500 hover:text-cyan-400'}`}><ListTodo size={18}/> Mesa do Robô</button>
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
                                          <div className={`p-2 rounded-full border-2 ${s.avatarType === 'mech2' ? 'border-cyan-500 bg-cyan-500/10' : 'border-orange-500 bg-orange-500/10'}`}>
                                              <Bot size={20} className={s.avatarType === 'mech2' ? 'text-cyan-500' : 'text-orange-500'}/>
                                          </div>
                                          <div className="flex-1 overflow-hidden">
                                              <span className="text-white font-bold text-sm block truncate">{s.name}</span>
                                              <div className="flex items-center mt-1 gap-2">
                                                  <span className={`text-[9px] font-bold uppercase px-1.5 rounded bg-white/5 ${level.color}`}>{level.name}</span>
                                                  <button onClick={() => openXPModal(s)} className="text-yellow-500 text-[10px] font-bold hover:underline flex items-center gap-1"><Trophy size={10}/> {s.xp}</button>
                                              </div>
                                              <button onClick={() => openGradesModal(s)} className="text-gray-500 hover:text-yellow-400 text-[10px] mt-1 flex items-center gap-1"><GraduationCap size={10}/> Lançar Notas</button>
                                          </div>
                                          <div className="flex flex-col gap-2">
                                              <button onClick={() => openNewStudentModal(s)} className="text-gray-500 hover:text-blue-400"><Pencil size={16}/></button>
                                              {/* BOTÃO DE TROFÉU 🏆 */}
                          <button 
                            onClick={() => setBadgeStudent(s)} 
                            className="text-gray-600 hover:text-yellow-500 mr-3 transition-colors"
                            title="Entregar Conquista"
                          >
                            <Trophy size={16}/>
                          </button>
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
                                  <textarea value={missions[st]?.text || ""} onChange={(e) => updateMission(st, 'text', e.target.value)} className="w-full bg-transparent border-b border-white/10 text-xs text-gray-300 focus:border-white/50 outline-none mb-4 min-h-[60px] resize-y" />
                                  <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
                                      <Calendar size={14} className="text-blue-500"/>
                                      <input type="date" value={missions[st]?.deadline || ""} onChange={(e) => updateMission(st, 'deadline', e.target.value)} className="bg-transparent text-xs text-white font-bold outline-none w-full cursor-pointer" />
                                  </div>
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
          {adminTab === 'rounds' && <RoundsView />}
        </main>
      )}

      {/* --- ÁREA DO ALUNO --- */}
      {!isAdmin && viewAsStudent && (
        <main className="p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-bottom-8">
           <div className="text-center py-6 bg-[#151520] rounded-2xl border border-white/10 shadow-xl mb-8">
                <div className="flex items-center justify-center gap-4">
                    <div className={`p-3 rounded-full border-2 ${viewAsStudent.avatarType === 'mech2' ? 'border-cyan-500 bg-cyan-500/10' : 'border-orange-500 bg-orange-500/10'}`}>
                        <Bot size={32} className={viewAsStudent.avatarType === 'mech2' ? 'text-cyan-500' : 'text-orange-500'}/>
                    </div>
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
                <button onClick={() => setStudentTab('mission')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'mission' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><Rocket size={18}/> Minha Missão</button>
                <button onClick={() => setStudentTab('strategy')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'strategy' ? 'bg-purple-500 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-purple-400'}`}><Lightbulb size={18}/> Estratégia</button>
                <button onClick={() => setStudentTab('rounds')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${studentTab === 'rounds' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-500 hover:text-cyan-400'}`}><ListTodo size={18}/> Robô</button>
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
                                
                                <label className="text-xs text-gray-400 uppercase font-bold mb-1 block">Anexar Arquivo (opcional)</label>
                                <div className="relative border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors mb-6 cursor-pointer">
                                    <input type="file" onChange={handleFileSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    <div className="flex flex-col items-center pointer-events-none">
                                        <Upload size={24} className={selectedFile ? "text-green-500" : "text-gray-500"} />
                                        <span className={`text-sm mt-2 font-bold ${selectedFile ? "text-green-500" : "text-gray-400"}`}>{selectedFile ? selectedFile.name : "Clique para escolher arquivo"}</span>
                                    </div>
                                </div>
                                
                                <button disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3 rounded-lg uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Upload size={20} /> Entregar Atividade</>}
                                </button>
                            </form>
                        )}
{/* --- NOVO MODAL: EDITOR DO PROJETO --- */}
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

            {studentTab === 'strategy' && <div className="text-left"><StrategyView readonly={true} /></div>}
            {studentTab === 'rounds' && <div className="text-left"><RoundsView readonly={true} /></div>}
        </main>
      )}

    </div>
  )
}
export default App