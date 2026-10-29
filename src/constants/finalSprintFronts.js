import { Bot, Lightbulb, Mic, Wrench } from 'lucide-react';

export const FINAL_SPRINT_FRONTS = [
  {
    id: 'innovation_project',
    title: 'Projeto de inovação',
    icon: Lightbulb,
    tone: 'border-purple-400/25 bg-purple-400/10 text-purple-200',
    description: 'Concluir a solução, validar seu impacto e organizar a história do projeto.',
    examples: ['Finalizar protótipo e validação', 'Organizar evidências e impacto', 'Preparar a apresentação do projeto'],
  },
  {
    id: 'robot_design',
    title: 'Design do robô',
    icon: Wrench,
    tone: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    description: 'Explicar as decisões de construção, programação, anexos e testes do robô.',
    examples: ['Ajustar construção e anexos', 'Testar código e sensores', 'Registrar melhorias feitas após os testes'],
  },
  {
    id: 'robot_game',
    title: 'Mesa da FLL',
    icon: Bot,
    tone: 'border-blue-400/25 bg-blue-400/10 text-blue-200',
    description: 'Treinar as saídas, consolidar rounds e melhorar a consistência na mesa.',
    examples: ['Treinar as oito saídas', 'Combinar estratégia e ordem dos rounds', 'Repetir tentativas e acompanhar pontos e tempo'],
  },
  {
    id: 'judges_presentation',
    title: 'Apresentação aos juízes',
    icon: Mic,
    tone: 'border-amber-400/25 bg-amber-400/10 text-amber-200',
    description: 'Praticar explicações e perguntas para que todos participem com segurança.',
    examples: ['Ensaiar falas e transições', 'Treinar respostas a perguntas', 'Ajudar cada integrante a explicar sua contribuição'],
  },
];

