/**
 * Generates a bracket structure based on the number of teams.
 * Handles both even and odd numbers with byes.
 */
export function generateBracketStructure(teamCount: number) {
  if (teamCount < 2) throw new Error("Bracket requires at least 2 teams");

  const rounds = Math.ceil(Math.log2(teamCount));
  const perfectSize = Math.pow(2, rounds);
  const byeCount = perfectSize - teamCount;

  const structure: { seeds: number[]; bye?: boolean }[][] = [];

  // First round
  const firstRound: { seeds: number[]; bye?: boolean }[] = [];

  if (isPowerOf2(teamCount)) {
    for (let i = 0; i < teamCount / 2; i++) {
      firstRound.push({ seeds: [i + 1, teamCount - i] });
    }
  } else {
    const seeds = Array.from({ length: teamCount }, (_, i) => i + 1);
    const byes = new Array(perfectSize).fill(false);
    for (let i = 0; i < byeCount; i++) byes[i] = true;

    const matchCount = perfectSize / 2;
    let seedIdx = 0;
    for (let i = 0; i < matchCount; i++) {
      if (byes[i] && byes[perfectSize - i - 1]) continue;
      else if (byes[i] || byes[perfectSize - i - 1]) {
        firstRound.push({ seeds: [seeds[seedIdx++]], bye: true });
      } else {
        firstRound.push({ seeds: [seeds[seedIdx++], seeds[seedIdx++]] });
      }
    }
  }

  structure.push(firstRound);

  let current = firstRound;
  for (let r = 1; r < rounds; r++) {
    const next: { seeds: number[] }[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const m1 = current[i];
      const m2 = i + 1 < current.length ? current[i + 1] : null;
      if (!m2) {
        next.push({ seeds: [...m1.seeds] });
      } else {
        const s1 = m1.seeds.length === 1 || m1.bye ? m1.seeds[0] : Math.min(...m1.seeds);
        const s2 = m2.seeds.length === 1 || (m2 as any).bye ? m2.seeds[0] : Math.min(...m2.seeds);
        next.push({ seeds: [s1, s2] });
      }
    }
    structure.push(next);
    current = next;
  }

  return structure;
}

function isPowerOf2(n: number): boolean {
  return (n & (n - 1)) === 0;
}
