import type {
  GameSituation,
  PlayPrediction,
  OpponentBreakdown,
  Play,
} from '../types';

// Mock play database
const mockPlays: Play[] = [
  {
    id: '1',
    type: 'run',
    formation: 'I-Formation',
    description: 'Power Run - Right Guard',
    successRate: 68,
    yardsPerPlay: 4.2,
    usageCount: 45,
  },
  {
    id: '2',
    type: 'run',
    formation: 'Shotgun',
    description: 'Zone Read Option',
    successRate: 72,
    yardsPerPlay: 5.1,
    usageCount: 38,
  },
  {
    id: '3',
    type: 'pass',
    formation: 'Shotgun 3WR',
    description: 'Quick Slant - Slot Receiver',
    successRate: 75,
    yardsPerPlay: 6.8,
    usageCount: 52,
  },
  {
    id: '4',
    type: 'pass',
    formation: 'Shotgun 4WR',
    description: 'Deep Post - Outside Receiver',
    successRate: 58,
    yardsPerPlay: 12.3,
    usageCount: 28,
  },
  {
    id: '5',
    type: 'play-action',
    formation: 'I-Formation',
    description: 'Play Action Bootleg - Tight End',
    successRate: 65,
    yardsPerPlay: 8.5,
    usageCount: 22,
  },
  {
    id: '6',
    type: 'screen',
    formation: 'Shotgun 3WR',
    description: 'Screen Pass - Running Back',
    successRate: 70,
    yardsPerPlay: 5.5,
    usageCount: 35,
  },
  {
    id: '7',
    type: 'run',
    formation: 'Pistol',
    description: 'Inside Zone Run',
    successRate: 66,
    yardsPerPlay: 4.0,
    usageCount: 42,
  },
  {
    id: '8',
    type: 'pass',
    formation: 'Shotgun 2TE',
    description: 'Seam Route - Tight End',
    successRate: 62,
    yardsPerPlay: 9.2,
    usageCount: 18,
  },
];

// Mock opponent data
const mockOpponentData: Record<string, Partial<OpponentBreakdown>> = {
  Packers: {
    defensiveTendencies: {
      runDefense: 65,
      passDefense: 72,
      blitzFrequency: 35,
      coverageType: 'zone',
    },
    weaknesses: ['Vulnerable to screen passes', 'Weak against outside runs', 'Struggles with play-action'],
    strengths: ['Strong pass rush', 'Good coverage in middle field', 'Effective against deep passes'],
    recentFormation: '4-3 Base Defense',
  },
  Vikings: {
    defensiveTendencies: {
      runDefense: 78,
      passDefense: 68,
      blitzFrequency: 42,
      coverageType: 'man',
    },
    weaknesses: ['Susceptible to quick passes', 'Weak in red zone', 'Struggles with misdirection'],
    strengths: ['Excellent run defense', 'Strong defensive line', 'Good at stopping short yardage'],
    recentFormation: '4-3 Over Defense',
  },
  Lions: {
    defensiveTendencies: {
      runDefense: 58,
      passDefense: 75,
      blitzFrequency: 28,
      coverageType: 'zone',
    },
    weaknesses: ['Poor run defense', 'Weak against power runs', 'Struggles with tight end routes'],
    strengths: ['Strong secondary', 'Good at preventing big plays', 'Effective pass rush'],
    recentFormation: 'Nickel Defense',
  },
};

export function predictPlay(situation: GameSituation): PlayPrediction {
  const scoreDifference =
    typeof situation.scoreDifference === 'string'
      ? parseInt(situation.scoreDifference, 10) || 0
      : situation.scoreDifference;

  // Simple prediction logic based on situation
  let predictedPlay: Play;
  const factors: string[] = [];

  // Determine play type based on down and distance
  if (situation.down === 1) {
    predictedPlay = situation.distance >= 8 ? mockPlays[2] : mockPlays[0]; // Pass on long 1st, run on short
    factors.push('First down - balanced approach');
  } else if (situation.down === 2) {
    if (situation.distance <= 3) {
      predictedPlay = mockPlays[0]; // Run for short yardage
      factors.push('Short yardage situation');
    } else if (situation.distance >= 8) {
      predictedPlay = mockPlays[3]; // Deep pass
      factors.push('Long yardage - need big play');
    } else {
      predictedPlay = mockPlays[2]; // Quick pass
      factors.push('Medium distance - high percentage play');
    }
  } else if (situation.down === 3) {
    if (situation.distance <= 3) {
      predictedPlay = mockPlays[0]; // Power run
      factors.push('Short yardage conversion attempt');
    } else {
      predictedPlay = mockPlays[2]; // Quick pass
      factors.push('Third down - need conversion');
    }
  } else {
    // 4th down
    predictedPlay = situation.distance <= 2 ? mockPlays[0] : mockPlays[2];
    factors.push('Fourth down - critical play');
  }

  // Adjust based on score and time
  if (scoreDifference < -7) {
    factors.push('Trailing - more aggressive playcalling');
    if (situation.down <= 2) {
      predictedPlay = mockPlays[3]; // Deep pass
    }
  }

  if (situation.quarter === 4 && scoreDifference > 0) {
    factors.push('Leading in 4th quarter - conservative approach');
    predictedPlay = mockPlays[0]; // Run to burn clock
  }

  const confidence = 75 + Math.floor(Math.random() * 20);

  return {
    predictedPlay,
    confidence,
    factors,
  };
}

export function getOpponentBreakdown(opponent: string): OpponentBreakdown {
  const defaultData: OpponentBreakdown = {
    opponent,
    defensiveTendencies: {
      runDefense: 65,
      passDefense: 70,
      blitzFrequency: 30,
      coverageType: 'mixed',
    },
    weaknesses: ['Standard defensive weaknesses'],
    strengths: ['Standard defensive strengths'],
    recentFormation: '4-3 Base Defense',
  };

  return {
    ...defaultData,
    ...(mockOpponentData[opponent] || {}),
  } as OpponentBreakdown;
}

// export function getBestPlayRecommendation(situation: GameSituation): BestPlayRecommendation {
//   const opponentBreakdown = getOpponentBreakdown(situation.opponent);
//   const reasoning: string[] = [];
//   let recommendedPlay: Play;
//   let riskLevel: 'low' | 'medium' | 'high' = 'medium';

//   // Analyze situation and opponent
//   if (situation.down === 1 && situation.distance === 10) {
//     // First and 10 - balanced approach
//     if (opponentBreakdown.defensiveTendencies.runDefense < 65) {
//       recommendedPlay = mockPlays[1]; // Zone read
//       reasoning.push('Opponent has weak run defense');
//       reasoning.push('Zone read has high success rate (72%)');
//       riskLevel = 'low';
//     } else {
//       recommendedPlay = mockPlays[2]; // Quick slant
//       reasoning.push('Opponent has strong run defense');
//       reasoning.push('Quick pass exploits coverage weaknesses');
//       riskLevel = 'low';
//     }
//   } else if (situation.down === 2) {
//     if (situation.distance <= 3) {
//       recommendedPlay = mockPlays[0]; // Power run
//       reasoning.push('Short yardage - power run is most reliable');
//       reasoning.push('68% success rate in similar situations');
//       riskLevel = 'low';
//     } else if (situation.distance >= 8) {
//       recommendedPlay = mockPlays[5]; // Screen pass
//       reasoning.push('Long yardage - screen pass can catch defense off guard');
//       reasoning.push('Effective against aggressive defenses');
//       riskLevel = 'medium';
//     } else {
//       recommendedPlay = mockPlays[2]; // Quick slant
//       reasoning.push('Medium distance - high percentage play');
//       reasoning.push('75% success rate this season');
//       riskLevel = 'low';
//     }
//   } else if (situation.down === 3) {
//     if (situation.distance <= 3) {
//       recommendedPlay = mockPlays[0]; // Power run
//       reasoning.push('Short yardage conversion');
//       reasoning.push('Most successful play in short yardage situations');
//       riskLevel = 'low';
//     } else if (situation.distance <= 7) {
//       recommendedPlay = mockPlays[2]; // Quick slant
//       reasoning.push('Medium distance - need conversion');
//       reasoning.push('High success rate (75%)');
//       riskLevel = 'low';
//     } else {
//       recommendedPlay = mockPlays[3]; // Deep post
//       reasoning.push('Long yardage - need big play');
//       reasoning.push('High yards per play (12.3 avg)');
//       riskLevel = 'high';
//     }
//   } else {
//     // 4th down
//     if (situation.distance <= 2) {
//       recommendedPlay = mockPlays[0]; // Power run
//       reasoning.push('Short yardage - go for it');
//       reasoning.push('Highest success rate for short conversions');
//       riskLevel = 'medium';
//     } else {
//       recommendedPlay = mockPlays[2]; // Quick slant
//       reasoning.push('Medium distance - quick pass for conversion');
//       reasoning.push('High percentage play');
//       riskLevel = 'high';
//     }
//   }

//   // Adjust based on opponent weaknesses
//   if (opponentBreakdown.weaknesses.some((w) => w.toLowerCase().includes('screen'))) {
//     recommendedPlay = mockPlays[5];
//     reasoning.push('Opponent vulnerable to screen passes');
//   }

//   if (opponentBreakdown.weaknesses.some((w) => w.toLowerCase().includes('run'))) {
//     if (situation.distance <= 5) {
//       recommendedPlay = mockPlays[1];
//       reasoning.push('Opponent struggles against outside runs');
//     }
//   }

//   // Adjust based on game situation
//   if (situation.scoreDifference < -7 && situation.quarter >= 3) {
//     recommendedPlay = mockPlays[3]; // Deep pass
//     reasoning.push('Trailing - need big play');
//     riskLevel = 'high';
//   }

//   if (situation.scoreDifference > 0 && situation.quarter === 4 && situation.distance <= 5) {
//     recommendedPlay = mockPlays[0]; // Run
//     reasoning.push('Leading late - run to burn clock');
//     riskLevel = 'low';
//   }

//   // Calculate success probability
//   const baseSuccess = recommendedPlay.successRate;
//   const opponentAdjustment = opponentBreakdown.defensiveTendencies.runDefense < 65 && recommendedPlay.type === 'run' ? 10 : 0;
//   const situationAdjustment = situation.down === 3 || situation.down === 4 ? -5 : 0;
//   const successProbability = Math.min(95, Math.max(40, baseSuccess + opponentAdjustment + situationAdjustment));

//   // Get alternative plays
//   const alternatives = mockPlays
//     .filter((p) => p.id !== recommendedPlay.id && p.type !== recommendedPlay.type)
//     .slice(0, 3);

//   return {
//     recommendedPlay,
//     reasoning,
//     successProbability,
//     expectedYards: recommendedPlay.yardsPerPlay,
//     riskLevel,
//     alternativePlays: alternatives,
//   };
// }

