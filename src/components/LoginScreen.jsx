import { useState } from 'react';
import { ArrowRight, Bot, Check, ChevronDown, Code2, Eye, EyeOff, Globe2, HeartHandshake, Lightbulb, Loader2, LockKeyhole, Palette, UserRound } from 'lucide-react';
import LogoNewGears from './LogoNewGears';
import RoboticsFieldIllustration from './RoboticsFieldIllustration';
import './LoginScreen.css';

export default function LoginScreen({ emailAccess, username, password, onUsernameChange, onPasswordChange, onSubmit, busy, error, onPublicView, theme, onToggleTheme }) {
  const [showPassword, setShowPassword] = useState(false);
  return <main className="newgears-login-shell ng-entry">
    <a className="ng-entry__skip" href="#team-access">Ir para o acesso da equipe</a>
    <header className="ng-entry__header">
      <a className="ng-entry__brand" href="#" aria-label="New Gears, início"><span><LogoNewGears /></span><span><strong>NEW GEARS<span className="ng-entry__brand-dot">.</span></strong><small>ROBÓTICA · INOVAÇÃO · EQUIPE</small></span></a>
      <nav aria-label="Acesso rápido"><button type="button" className="ng-entry__public" aria-label="Conhecer a equipe" onClick={onPublicView}><Globe2 size={16} /><span>Conheça a equipe</span><ArrowRight size={15} /></button><button type="button" className="ng-entry__theme" aria-label={theme === 'gold' ? 'Ativar tema clássico' : 'Ativar tema dourado'} aria-pressed={theme === 'gold'} title="Alternar tema" onClick={onToggleTheme}><Palette size={18} /></button></nav>
    </header>
    <div className="ng-entry__layout">
      <section className="ng-entry__story" aria-labelledby="entry-title">
        <p className="ng-entry__eyebrow"><span />Pequenas peças. Grandes possibilidades.</p>
        <h1 id="entry-title">Ideias que movem.<br />Uma equipe que<br />{' '}<em>constrói o futuro.</em></h1>
        <p className="ng-entry__description">Entre um teste e uma descoberta, a gente aprende junto. Esta é a base da New Gears para transformar curiosidade em robótica.</p>
        <div className="ng-entry__field"><div className="ng-entry__field-heading"><span><span className="ng-entry__signal" />NOSSO JEITO DE APRENDER</span><span>NEW GEARS · LAB</span></div><RoboticsFieldIllustration /><div className="ng-entry__field-caption"><span><Check size={14} /> Planejar</span><span><Check size={14} /> Testar</span><span><Check size={14} /> Evoluir</span><span className="ng-entry__field-line" /></div></div>
      </section>
      <section id="team-access" className="newgears-login-card ng-access" aria-labelledby="access-title" tabIndex={-1}>
        <span className="ng-access__icon"><LockKeyhole size={23} /></span>
        <p className="ng-entry__eyebrow">ÁREA DA EQUIPE</p>
        <h2 id="access-title">Bom ter você na base.</h2>
        <p className="ng-access__intro">Seu próximo desafio começa aqui. Vamos nessa?</p>
        <form onSubmit={onSubmit} aria-busy={busy}>
          <label htmlFor="team-username">{emailAccess ? 'Seu e-mail' : 'Seu usuário'}</label>
          <div className="ng-access__field"><UserRound size={18} aria-hidden="true" /><input id="team-username" name="username" className="newgears-login-input" type={emailAccess ? 'email' : 'text'} value={username} onChange={(event) => onUsernameChange(event.target.value)} placeholder={emailAccess ? 'seu@email.com' : 'Ex.: ana.fll'} disabled={busy} required autoComplete="username" autoCapitalize="none" spellCheck={false} aria-invalid={Boolean(error)} aria-describedby={error ? 'team-login-error' : undefined} /></div>
          <label htmlFor="team-password">Sua senha</label>
          <div className="ng-access__field"><LockKeyhole size={18} aria-hidden="true" /><input id="team-password" name="password" className="newgears-login-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => onPasswordChange(event.target.value)} placeholder="Digite sua senha" disabled={busy} required autoComplete="current-password" aria-invalid={Boolean(error)} aria-describedby={error ? 'team-login-error' : undefined} /><button type="button" className="ng-access__reveal" disabled={busy} onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          {error && <p id="team-login-error" className="ng-access__error" role="alert">{error}</p>}
          <button type="submit" className="newgears-login-button ng-access__submit" disabled={busy}>{busy ? <><Loader2 size={18} className="animate-spin" />Validando acesso…</> : <>Entrar na base<ArrowRight size={18} /></>}</button>
        </form>
        <details className="ng-access__help"><summary>É seu primeiro acesso?<ChevronDown size={15} /></summary><p>Peça seu {emailAccess ? 'e-mail de acesso' : 'usuário'} e sua senha ao técnico da equipe. Use os mesmos dados em todos os seus dispositivos.</p></details>
        <div className="ng-access__divider"><span />A curiosidade é para todos<span /></div>
        <button type="button" className="ng-access__guest" onClick={onPublicView}><Globe2 size={17} />Conhecer a equipe<ArrowRight size={15} /></button>
        <p className="ng-access__guest-note">Explore nossos projetos. Sem precisar entrar.</p>
      </section>
    </div>
    <footer className="ng-entry__footer"><p>Construir. Aprender. Compartilhar.</p><div>{[{ label: 'Robótica', icon: Bot }, { label: 'Programação', icon: Code2 }, { label: 'Inovação', icon: Lightbulb }, { label: 'Trabalho em equipe', icon: HeartHandshake }].map(({ label, icon: Icon }) => <span key={label}><Icon size={15} />{label}</span>)}</div><small>NEW GEARS · ALÉM DA TEMPORADA</small></footer>
  </main>;
}
