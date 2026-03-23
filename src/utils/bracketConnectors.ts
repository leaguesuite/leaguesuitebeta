export const drawConnectorLines = (bracketContainer: HTMLDivElement, svg: SVGSVGElement) => {
  svg.innerHTML = '';
  
  const matchCards = bracketContainer.querySelectorAll('[data-match-id]');
  const rounds = bracketContainer.querySelectorAll('[data-round-id]');
  
  if (rounds.length < 2) return;
  
  const rect = bracketContainer.getBoundingClientRect();
  svg.setAttribute('width', rect.width.toString());
  svg.setAttribute('height', rect.height.toString());
  
  const roundGroups: { [key: string]: HTMLElement[] } = {};
  
  matchCards.forEach(card => {
    const roundElement = card.closest('[data-round-id]');
    if (roundElement) {
      const roundId = roundElement.getAttribute('data-round-id');
      if (roundId) {
        if (!roundGroups[roundId]) roundGroups[roundId] = [];
        roundGroups[roundId].push(card as HTMLElement);
      }
    }
  });
  
  const roundIds = Object.keys(roundGroups);
  
  for (let i = 0; i < roundIds.length - 1; i++) {
    const currentMatches = roundGroups[roundIds[i]];
    const nextMatches = roundGroups[roundIds[i + 1]];
    
    if (!currentMatches || !nextMatches) continue;
    
    for (let j = 0; j < nextMatches.length; j++) {
      const nextMatch = nextMatches[j];
      const match1 = currentMatches[j * 2];
      const match2 = currentMatches[j * 2 + 1];
      
      if (match1 && nextMatch) drawConnection(svg, match1, nextMatch, bracketContainer);
      if (match2 && nextMatch) drawConnection(svg, match2, nextMatch, bracketContainer);
    }
  }
};

const drawConnection = (
  svg: SVGSVGElement, 
  fromMatch: HTMLElement, 
  toMatch: HTMLElement, 
  container: HTMLDivElement
) => {
  const containerRect = container.getBoundingClientRect();
  const fromRect = fromMatch.getBoundingClientRect();
  const toRect = toMatch.getBoundingClientRect();
  
  const fromX = fromRect.right - containerRect.left;
  const fromY = fromRect.top + fromRect.height / 2 - containerRect.top;
  const toX = toRect.left - containerRect.left;
  const toY = toRect.top + toRect.height / 2 - containerRect.top;
  
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const midX = (fromX + toX) / 2;
  
  const pathData = `M ${fromX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX} ${toY}`;
  
  path.setAttribute('d', pathData);
  path.setAttribute('stroke', 'hsl(var(--border))');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  
  svg.appendChild(path);
};
