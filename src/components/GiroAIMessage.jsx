import { safeGiroURL } from '../utils/giroAI';

function inline(text) {
  const pattern = /(\[[^\]\n]+\]\([^\s)]+\)|`[^`\n]+`|\*\*[^*\n]+\*\*)/g;
  return text.split(pattern).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link && safeGiroURL(link[2])) return <a key={index} href={safeGiroURL(link[2])} target="_blank" rel="noopener noreferrer">{link[1]}</a>;
    if (part.startsWith('`') && part.endsWith('`')) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}

export default function GiroAIMessage({ text }) {
  return <div className="giro-ai-markdown">{text.split(/(```[\s\S]*?```)/g).map((block, blockIndex) => {
    if (block.startsWith('```')) {
      const content = block.slice(3, -3);
      const firstBreak = content.indexOf('\n');
      return <figure key={blockIndex} className="giro-ai-code"><figcaption>{firstBreak >= 0 ? content.slice(0, firstBreak).trim() || 'Código' : 'Código'}</figcaption><pre><code>{firstBreak >= 0 ? content.slice(firstBreak + 1) : content}</code></pre></figure>;
    }
    return block.replace(/(^|\n)(#{1,6}\s[^\n]+)/g, '$1\n\n$2\n\n').split(/\n\s*\n/).filter((part) => part.trim()).map((paragraph, index) => {
      const lines = paragraph.split('\n');
      const key = `${blockIndex}-${index}`;
      if (lines.every((line) => /^\s*([-*]|\d+[.)])\s/.test(line))) {
        const List = /^\s*\d+[.)]\s/.test(lines[0]) ? 'ol' : 'ul';
        return <List key={key}>{lines.map((line, item) => <li key={item}>{inline(line.replace(/^\s*([-*]|\d+[.)])\s+/, ''))}</li>)}</List>;
      }
      if (/^#{1,6}\s/.test(paragraph) && !paragraph.includes('\n')) return <h4 key={key}>{inline(paragraph.replace(/^#{1,6}\s+/, ''))}</h4>;
      return <p key={key}>{lines.map((line, item) => <span key={item}>{item > 0 && <br />}{inline(line)}</span>)}</p>;
    });
  })}</div>;
}
