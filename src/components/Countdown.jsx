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
        <span key={interval} className="flex items-baseline">
          <span className="font-mono font-bold text-white text-sm">{timeLeft[interval]}</span>
          <span className="text-[10px] text-gray-500 mr-1">{labels[interval] || interval.charAt(0)}</span>
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
      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hidden xl:flex">
        <span className="text-[10px] font-bold uppercase text-yellow-500 tracking-wider mr-1">{title}:</span>
        <div className="flex items-center">
          {timerComponents.length ? timerComponents : <span className="text-xs font-bold text-green-500">Hoje!</span>}
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