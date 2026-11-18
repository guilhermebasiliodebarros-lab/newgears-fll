import { Children, cloneElement, isValidElement, useId, useState } from 'react';
import { Check, Save } from 'lucide-react';
import { DialogSurface, InterfaceButton } from './InterfacePrimitives';
import { COMPETITION_CRITERION_STATUSES, COMPETITION_PIT_GROUPS, COMPETITION_SLOT_TYPES } from '../utils/competition';

const titles = { event: 'Próximo desafio da equipe', pit: 'Organizar um item do pit', schedule: 'Programar um compromisso', criteria: 'Definir um critério interno' };
const Field = ({ label, children, wide = false }) => {
  const id = useId();
  return <div className={wide ? 'ng-competition-editor__wide' : ''}><label htmlFor={id}><span>{label}</span></label>{Children.map(children, (child) => isValidElement(child) && ['input', 'select', 'textarea'].includes(child.type) ? cloneElement(child, { id }) : child)}</div>;
};

export default function CompetitionEditor({ kind, item, members, onCommit, onClose }) {
  const [error, setError] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const next = kind === 'event' ? { ...data, matchSeconds: data.matchSeconds.trim() ? Number(data.matchSeconds) : null }
        : kind === 'pit' ? { ...item, ...data }
          : kind === 'criteria' ? { ...item, ...data, weight: Number(data.weight) }
            : { ...item, ...data };
      onCommit(next);
    } catch (reason) { setError(reason.message); }
  };
  return <DialogSurface onClose={onClose} label={titles[kind]} closeButton className="ng-competition-editor">
    <p className="ng-eyebrow">Planejamento da temporada</p><h2>{titles[kind]}</h2><p>Adapte à competição escolhida. As alterações vão para o rascunho antes de salvar para a equipe.</p>
    <form onSubmit={submit}>
      <div className="ng-competition-editor__fields">
        {kind === 'event' ? <>
          <Field label="Nome da competição" wide><input name="name" defaultValue={item.name} required minLength={3} maxLength={120} /></Field>
          <Field label="Programa ou modalidade"><input name="program" defaultValue={item.program} placeholder="A definir" maxLength={100} /></Field>
          <Field label="Categoria"><input name="category" defaultValue={item.category} placeholder="A definir" maxLength={80} /></Field>
          <Field label="Data do evento"><input name="date" type="date" defaultValue={item.date} /></Field>
          <Field label="Tempo do round em segundos"><input name="matchSeconds" type="number" min="10" max="3600" step="1" defaultValue={item.matchSeconds ?? ''} placeholder="A definir pelo regulamento" /></Field>
          <Field label="Local" wide><input name="location" defaultValue={item.location} maxLength={180} placeholder="Cidade, espaço ou endereço do evento" /></Field>
          <Field label="Link do regulamento" wide><input name="rulebookUrl" type="url" defaultValue={item.rulebookUrl} maxLength={1600} placeholder="https://..." /></Field>
          <Field label="Versão do regulamento" wide><input name="rulebookVersion" defaultValue={item.rulebookVersion} maxLength={80} placeholder="Ex.: revisão publicada em 15/11" /></Field>
        </> : <>
          <Field label={kind === 'pit' ? 'O que precisa ser conferido?' : kind === 'schedule' ? 'Nome do compromisso' : 'Nome do critério'} wide><input name="title" defaultValue={item.title} required minLength={3} maxLength={140} /></Field>
          <Field label="Responsável" wide><input name="owner" defaultValue={item.owner} maxLength={80} list="competition-member-names" placeholder="Nome do integrante ou da dupla" /><datalist id="competition-member-names">{members.map((member) => <option key={member.id} value={member.name} />)}</datalist></Field>
          {kind === 'pit' && <Field label="Grupo" wide><select name="group" defaultValue={item.group}>{Object.entries(COMPETITION_PIT_GROUPS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>}
          {kind === 'schedule' && <><Field label="Data e horário"><input name="at" type="datetime-local" defaultValue={item.at} required /></Field><Field label="Tipo de compromisso"><select name="type" defaultValue={item.type}>{Object.entries(COMPETITION_SLOT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Local ou mesa" wide><input name="location" defaultValue={item.location} maxLength={120} placeholder="Ex.: sala de avaliação ou mesa 2" /></Field></>}
          {kind === 'criteria' && <><Field label="Situação"><select name="status" defaultValue={item.status}>{Object.entries(COMPETITION_CRITERION_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Peso interno (1 a 5)"><input name="weight" type="number" min="1" max="5" step="1" defaultValue={item.weight} required /></Field><Field label="Evidência ou resultado observado" wide><textarea name="evidence" defaultValue={item.evidence} maxLength={1200} placeholder="O que foi testado ou validado? Quando? Qual foi o resultado?" /></Field><Field label="Link da evidência (opcional)" wide><input name="evidenceUrl" type="url" defaultValue={item.evidenceUrl} maxLength={1600} placeholder="https://..." /></Field><p className="ng-competition-editor__wide ng-status-note"><Check size={16} />Para concluir, registre uma descrição de pelo menos 8 caracteres ou um link. Esse acompanhamento é interno; não calcula nota de jurados.</p></>}
        </>}
      </div>
      {error && <p role="alert" className="ng-error">{error}</p>}
      <div className="ng-competition-editor__actions"><InterfaceButton onClick={onClose}>Cancelar</InterfaceButton><InterfaceButton type="submit" variant="primary"><Save size={16} />Aplicar ao rascunho</InterfaceButton></div>
    </form>
  </DialogSurface>;
}
