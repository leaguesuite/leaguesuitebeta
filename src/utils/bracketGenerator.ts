interface Match {
  seeds: (number | null)[];
  bye: boolean;
}

export function generateSeedOrder(numTeams: number): number[] {
  if (numTeams < 2) return [1];
  if (numTeams === 2) return [1, 2];
  
  let order = [1, 2];
  
  while (order.length < numTeams) {
    const newOrder: number[] = [];
    const nextRoundSize = order.length * 2;
    
    for (let i = 0; i < order.length; i++) {
      newOrder.push(order[i]);
      newOrder.push(nextRoundSize + 1 - order[i]);
    }
    
    order = newOrder;
  }
  
  return order;
}

export function generateBracketStructure(participantCount: number, bracketSides: number = 1): Match[][] {
  if (participantCount < 2) {
    throw new Error("Need at least 2 participants for a bracket");
  }

  if (bracketSides > 1) {
    return generateMultiSidedBracket(participantCount, bracketSides);
  }

  const structure: Match[][] = [];
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const rounds = Math.ceil(Math.log2(nextPowerOfTwo));
  const seedOrder = generateSeedOrder(nextPowerOfTwo);

  const firstRound: Match[] = [];
  
  for (let i = 0; i < seedOrder.length; i += 2) {
    const seed1 = seedOrder[i];
    const seed2 = seedOrder[i + 1];
    
    const s1 = seed1 <= participantCount ? seed1 : null;
    const s2 = seed2 <= participantCount ? seed2 : null;
    const seeds = [s1, s2] as (number | null)[];
    const bye = (s1 === null) !== (s2 === null);
    firstRound.push({ seeds, bye });
  }

  structure.push(firstRound);

  for (let round = 1; round < rounds; round++) {
    const matchesInRound = Math.pow(2, rounds - round - 1);
    const roundMatches: Match[] = [];
    for (let m = 0; m < matchesInRound; m++) {
      roundMatches.push({ seeds: [0], bye: false });
    }
    structure.push(roundMatches);
  }

  return structure;
}

function generateMultiSidedBracket(participantCount: number, bracketSides: number): Match[][] {
  const teamsPerSide = Math.ceil(participantCount / bracketSides);
  const nextPowerOfTwoPerSide = Math.pow(2, Math.ceil(Math.log2(teamsPerSide)));
  const roundsPerSide = Math.ceil(Math.log2(nextPowerOfTwoPerSide));
  const seedOrderPerSide = generateSeedOrder(nextPowerOfTwoPerSide);
  
  const structure: Match[][] = [];
  
  for (let round = 0; round < roundsPerSide; round++) {
    const roundMatches: Match[] = [];
    
    for (let side = 0; side < bracketSides; side++) {
      const sideStartSeed = side * teamsPerSide;
      const teamsOnThisSide = Math.min(teamsPerSide, participantCount - sideStartSeed);
      
      if (round === 0) {
        const matchesInFirstRound = nextPowerOfTwoPerSide / 2;
        
        for (let i = 0; i < matchesInFirstRound; i++) {
          const localSeed1 = seedOrderPerSide[i * 2];
          const localSeed2 = seedOrderPerSide[i * 2 + 1];
          const globalSeed1 = sideStartSeed + localSeed1;
          const globalSeed2 = sideStartSeed + localSeed2;
          
          const match: Match = { seeds: [], bye: false };
          
          if (localSeed1 <= teamsOnThisSide) match.seeds.push(globalSeed1);
          if (localSeed2 <= teamsOnThisSide) match.seeds.push(globalSeed2);
          if (match.seeds.length === 1) match.bye = true;
          
          roundMatches.push(match);
        }
      } else {
        const matchesInRound = Math.pow(2, roundsPerSide - round - 1);
        for (let i = 0; i < matchesInRound; i++) {
          roundMatches.push({ seeds: [0], bye: false });
        }
      }
    }
    
    if (roundMatches.length > 0) structure.push(roundMatches);
  }
  
  if (bracketSides === 2) {
    structure.push([{ seeds: [0], bye: false }]);
  } else if (bracketSides === 4) {
    structure.push([{ seeds: [0], bye: false }, { seeds: [0], bye: false }]);
    structure.push([{ seeds: [0], bye: false }]);
  }
  
  return structure;
}
