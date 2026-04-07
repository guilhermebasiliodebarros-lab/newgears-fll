import React, { useState, useEffect } from 'react';
import './Countdown.css';

const Countdown = ({ targetDate, title, compact = false }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    if (compact) {
      // Modo Compacto (para o Header)
      const labels = { dias: 'd', horas: 'h', minutos: 'm', segundos: 's' };
      timerComponents.push(
        <span key={interval} className="flex items-center gap-1 rounded-[14px] border border-white/10 bg-black/20 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <span className="font-mono font-black text-white text-sm">{timeLeft[interval]}</span>
          <span className="text-[10px] uppercase text-cyan-200/80">{labels[interval] || interval.charAt(0)}</span>
        </span>
      );
    } else {
      // Modo Padrão (Caixas grandes)
      timerComponents.push(
        <div className="time-box" key={interval}>
          <span className="time-number">{timeLeft[interval]}</span>
          <span className="time-label">{interval}</span>
        </div>
      );
    }
  });

  if (compact) {
    return (
      <div className="hidden xl:flex items-center gap-2 rounded-[20px] border border-white/12 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-3 py-2 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
        <span className="rounded-full border border-yellow-300/20 bg-yellow-300/10 px-2.5 py-1 text-[10px] font-black uppercase text-yellow-100 tracking-[0.18em]">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {timerComponents.length ? timerComponents : <span className="rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1 text-xs font-black text-green-200">Chegou!</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <h3>{title}</h3>
      <div className="timer-wrapper">
        {timerComponents.length ? timerComponents : <span>Chegou o dia! 🚀</span>}
      </div>
    </div>
  );
};

export default Countdown;
