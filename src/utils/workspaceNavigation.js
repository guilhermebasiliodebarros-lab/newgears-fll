export const navigationText = (value) => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export function searchWorkspaceTabs(tabs, query) {
  const text = navigationText(query);
  if (!text) return tabs;
  const score = (tab) => { const name = navigationText(tab.label); return name === text ? 0 : name.startsWith(text) ? 1 : name.includes(text) ? 2 : 3; };
  return tabs.filter((tab) => navigationText(`${tab.label} ${tab.description}`).includes(text)).sort((a, b) => score(a) - score(b));
}
