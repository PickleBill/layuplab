import { Achievement } from '@/types/app';

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_workout', title: 'First Steps', description: 'Complete your first workout', icon: '🏀' },
  { id: 'streak_3', title: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '💪' },
  { id: 'streak_30', title: 'Iron Will', description: 'Maintain a 30-day streak', icon: '🏆' },
  { id: 'drills_10', title: 'Getting Started', description: 'Complete 10 drills', icon: '✅' },
  { id: 'drills_50', title: 'Drill Sergeant', description: 'Complete 50 drills', icon: '🎖️' },
  { id: 'drills_100', title: 'Century Club', description: 'Complete 100 drills', icon: '💯' },
  { id: 'drills_500', title: 'Machine', description: 'Complete 500 drills', icon: '🤖' },
  { id: 'level_5', title: 'Rising Star', description: 'Reach Level 5', icon: '⭐' },
  { id: 'level_10', title: 'Varsity', description: 'Reach Level 10', icon: '🌟' },
  { id: 'level_20', title: 'All-Star', description: 'Reach Level 20', icon: '👑' },
  { id: 'challenge_1', title: 'Challenge Accepted', description: 'Complete your first daily challenge', icon: '🎯' },
  { id: 'challenge_10', title: 'Challenge Crusher', description: 'Complete 10 daily challenges', icon: '💎' },
  { id: 'minutes_60', title: 'Hour of Power', description: 'Train for 60 total minutes', icon: '⏱️' },
  { id: 'minutes_300', title: 'Dedicated', description: 'Train for 5 total hours', icon: '🕐' },
  { id: 'minutes_1000', title: 'Gym Rat', description: 'Train for 1000 total minutes', icon: '🐀' },
  { id: 'all_categories', title: 'Well-Rounded', description: 'Complete drills in all 5 categories', icon: '🌈' },
  { id: 'perfect_week', title: 'Perfect Week', description: 'Complete every planned workout in a week', icon: '✨' },
];

export function getAchievementById(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.id === id);
}

export function getUnlockedAchievements(ids: string[]): Achievement[] {
  return ids.map(id => getAchievementById(id)).filter(Boolean) as Achievement[];
}

export function getLockedAchievements(unlockedIds: string[]): Achievement[] {
  return ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));
}
