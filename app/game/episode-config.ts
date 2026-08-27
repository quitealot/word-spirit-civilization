/**
 * Machine-facing episode metadata.
 *
 * This file intentionally contains keys and rules only. Narrative copy belongs
 * in app/narrative and is resolved by scene id at render time.
 */

export type EpisodeId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type EpisodeTier = 'main' | 'optional';
export type MasteryLayer = 'L1' | 'L2' | 'L3';

export type UnlockCondition = {
  previousEpisode?: EpisodeId;
  explorationAtLeast?: number;
  sightingsAtLeast?: number;
  requiredCompanion?: string;
};

export type EpisodeCompletionEffects = {
  sightingsAtLeast?: number;
  companionId?: string;
  teamSizeAtLeast?: number;
  codexEntryIds?: readonly string[];
  mapNodeId?: string;
  unlockEpisode?: EpisodeId;
};

export type EpisodeConfig = {
  id: EpisodeId;
  titleKey: string;
  placeKey: string;
  tier: EpisodeTier;
  unlock: UnlockCondition;
  narrativeSceneIds: readonly string[];
  interactionIds: readonly string[];
  battleId?: string;
  hasBattle: boolean;
  hasBoss: boolean;
  optionalArena?: boolean;
  completionEffects: EpisodeCompletionEffects;
};

export type EpisodeBattleConfig = {
  battleId: string;
  requiresSwap?: boolean;
  boss?: {
    phaseCount: 3;
    phaseCaps: readonly MasteryLayer[];
    masteryCeilingPolicy: readonly [
      'phaseCap',
      'playerMasteryCeiling',
      'approvedContentCeiling',
    ];
  };
  defeat: {
    retryAvailable: true;
    preserveLearningEvidence: true;
    resetBattleState: true;
  };
};

/**
 * The only values here are stable content/configuration keys. K3 can replace
 * the scene content behind these ids without touching progression code.
 */
export const EPISODE_CONFIG: Readonly<Record<EpisodeId, EpisodeConfig>> = {
  1: {
    id: 1,
    titleKey: 'episode.01.title',
    placeKey: 'place.spirit_station',
    tier: 'main',
    unlock: {},
    narrativeSceneIds: [
      'ep01.morning',
      'ep01.north_view',
      'ep01.qiaoyi',
      'ep01.link_test_pre',
      'ep01.link_test_result',
      'ep01.spirit_choice',
      'ep01.spirit_reselect',
      'ep01.partner.yayu',
      'ep01.partner.jinwei',
      'ep01.partner.lange',
      'ep01.first_guide',
      'ep01.departure',
    ],
    interactionIds: ['ep01.initial_bond_test', 'ep01.first_learning_pack'],
    hasBattle: false,
    hasBoss: false,
    completionEffects: { mapNodeId: 'map.harbor_old_road', unlockEpisode: 2 },
  },
  2: {
    id: 2,
    titleKey: 'episode.02.title',
    placeKey: 'place.harbor_old_road',
    tier: 'main',
    unlock: { previousEpisode: 1, explorationAtLeast: 3 },
    narrativeSceneIds: ['ep02.leaving_harbor', 'ep02.old_road', 'ep02.old_post', 'ep02.spirit_pause', 'ep02.new_rope', 'ep02.footprints', 'ep02.alo_reaction', 'ep02.over_the_rise'],
    interactionIds: ['ep02.inspect_post', 'ep02.inspect_rope', 'ep02.inspect_mud'],
    hasBattle: false,
    hasBoss: false,
    completionEffects: { mapNodeId: 'map.awakening_gate', unlockEpisode: 3 },
  },
  3: {
    id: 3,
    titleKey: 'episode.03.title',
    placeKey: 'place.awakening_gate',
    tier: 'main',
    unlock: { previousEpisode: 2, explorationAtLeast: 6 },
    narrativeSceneIds: ['ep03.over_the_rise', 'ep03.spirit_alert', 'ep03.sound_in_fog', 'ep03.encounter', 'ep03.first_stand', 'ep03.victory', 'ep03.retreat', 'ep03.stone_gate'],
    interactionIds: [],
    battleId: 'battle.ep03.ink_shadow',
    hasBattle: true,
    hasBoss: false,
    completionEffects: { mapNodeId: 'map.residual_page_corridor', unlockEpisode: 4 },
  },
  4: {
    id: 4,
    titleKey: 'episode.04.title',
    placeKey: 'place.residual_page_corridor',
    tier: 'main',
    unlock: { previousEpisode: 3, explorationAtLeast: 12 },
    narrativeSceneIds: ['ep04.first_sighting'],
    interactionIds: ['ep04.observe_tail'],
    hasBattle: false,
    hasBoss: false,
    completionEffects: {
      sightingsAtLeast: 2,
      codexEntryIds: ['MIST_PORT_SPIRIT_01'],
      mapNodeId: 'map.silent_square',
      unlockEpisode: 5,
    },
  },
  5: {
    id: 5,
    titleKey: 'episode.05.title',
    placeKey: 'place.silent_square',
    tier: 'main',
    unlock: { previousEpisode: 4, explorationAtLeast: 22 },
    narrativeSceneIds: ['ep05.silent_square'],
    interactionIds: ['ep05.wild_spirit_display', 'ep05.sighting_three'],
    battleId: 'battle.ep05.ink_shadow',
    hasBattle: true,
    hasBoss: false,
    completionEffects: {
      sightingsAtLeast: 3,
      mapNodeId: 'map.corridor_exit',
      unlockEpisode: 6,
    },
  },
  6: {
    id: 6,
    titleKey: 'episode.06.title',
    placeKey: 'place.corridor_exit',
    tier: 'main',
    unlock: {
      previousEpisode: 5,
      sightingsAtLeast: 3,
    },
    narrativeSceneIds: ['ep06.companion_approach', 'ep06.resonance'],
    interactionIds: [
      'ep06.approach.player',
      'ep06.approach.starter',
      'ep06.approach.wait',
      'ep06.companion_confirm',
    ],
    hasBattle: false,
    hasBoss: false,
    completionEffects: {
      companionId: 'MIST_PORT_SPIRIT_01',
      teamSizeAtLeast: 2,
      codexEntryIds: ['MIST_PORT_SPIRIT_01'],
      mapNodeId: 'map.silent_square_north_road',
      unlockEpisode: 7,
    },
  },
  7: {
    id: 7,
    titleKey: 'episode.07.title',
    placeKey: 'place.silent_square_north_road',
    tier: 'main',
    unlock: {
      previousEpisode: 6,
      explorationAtLeast: 34,
      requiredCompanion: 'MIST_PORT_SPIRIT_01',
    },
    narrativeSceneIds: ['ep07.first_team_battle'],
    interactionIds: ['ep07.partner_swap'],
    battleId: 'battle.ep07.team_test',
    hasBattle: true,
    hasBoss: false,
    completionEffects: { mapNodeId: 'map.unnamed_monument', unlockEpisode: 8 },
  },
  8: {
    id: 8,
    titleKey: 'episode.08.title',
    placeKey: 'place.unnamed_monument',
    tier: 'main',
    unlock: { previousEpisode: 7, explorationAtLeast: 45 },
    narrativeSceneIds: ['ep08.unnamed_monument'],
    interactionIds: [
      'ep08.monument.front',
      'ep08.monument.back',
      'ep08.clue.record',
      'ep08.arena.entry',
    ],
    hasBattle: false,
    hasBoss: false,
    optionalArena: true,
    completionEffects: { mapNodeId: 'map.fog_slope', unlockEpisode: 9 },
  },
  9: {
    id: 9,
    titleKey: 'episode.09.title',
    placeKey: 'place.fog_slope',
    tier: 'main',
    unlock: { previousEpisode: 8, explorationAtLeast: 58 },
    narrativeSceneIds: ['ep09.rare_tracking', 'ep09.sky_silhouette'],
    interactionIds: [
      'ep09.tracking.01',
      'ep09.tracking.02',
      'ep09.tracking.03',
      'ep09.sky_silhouette',
    ],
    battleId: 'battle.ep09.rare_spirit_probe',
    hasBattle: true,
    hasBoss: false,
    completionEffects: {
      codexEntryIds: ['MIST_PORT_RARE_01', 'SKY_LEGEND_01'],
      mapNodeId: 'map.gatekeeper',
      unlockEpisode: 10,
    },
  },
  10: {
    id: 10,
    titleKey: 'episode.10.title',
    placeKey: 'place.gatekeeper_threshold',
    tier: 'main',
    unlock: { previousEpisode: 9, explorationAtLeast: 72 },
    narrativeSceneIds: ['ep10.gatekeeper'],
    interactionIds: ['ep10.chapter_map'],
    battleId: 'battle.ep10.gatekeeper',
    hasBattle: true,
    hasBoss: true,
    completionEffects: { mapNodeId: 'map.chapter_end' },
  },
};

export const EPISODE_BATTLE_CONFIG: Readonly<Record<string, EpisodeBattleConfig>> = {
  'battle.ep03.ink_shadow': {
    battleId: 'battle.ep03.ink_shadow',
    defeat: { retryAvailable: true, preserveLearningEvidence: true, resetBattleState: true },
  },
  'battle.ep05.ink_shadow': {
    battleId: 'battle.ep05.ink_shadow',
    defeat: { retryAvailable: true, preserveLearningEvidence: true, resetBattleState: true },
  },
  'battle.ep07.team_test': {
    battleId: 'battle.ep07.team_test',
    requiresSwap: true,
    defeat: { retryAvailable: true, preserveLearningEvidence: true, resetBattleState: true },
  },
  'battle.ep09.rare_spirit_probe': {
    battleId: 'battle.ep09.rare_spirit_probe',
    defeat: { retryAvailable: true, preserveLearningEvidence: true, resetBattleState: true },
  },
  'battle.ep10.gatekeeper': {
    battleId: 'battle.ep10.gatekeeper',
    boss: {
      phaseCount: 3,
      phaseCaps: ['L1', 'L2', 'L3'],
      masteryCeilingPolicy: ['phaseCap', 'playerMasteryCeiling', 'approvedContentCeiling'],
    },
    defeat: { retryAvailable: true, preserveLearningEvidence: true, resetBattleState: true },
  },
};

export function getEpisodeConfig(episode: EpisodeId): EpisodeConfig {
  return EPISODE_CONFIG[episode];
}
