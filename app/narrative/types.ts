export type Starter = '芽语' | '烬尾' | '澜歌';

export type Episode = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type NarrativePresentation = 'portrait' | 'sfx' | 'light_fx' | 'scene';

export type NarrativeBeat =
  | {
      id: string;
      type: 'dialogue';
      speaker: string;
      text: string;
    }
  | {
      id: string;
      type: 'narration';
      text: string;
    }
  | {
      id: string;
      type: 'action';
      actor?: string;
      text: string;
      presentation?: NarrativePresentation;
    }
  | {
      id: string;
      type: 'choice';
      choices: readonly {
        id: string;
        text: string;
      }[];
    }
  | {
      id: string;
      type: 'interaction';
      interactionId: string;
      prompt: string;
      resultText: string;
    };

export interface NarrativeScene {
  sceneId: string;
  beats: readonly NarrativeBeat[];
}

/** Existing page.tsx dialogue shape retained for temporary content compatibility. */
export type TemporaryLine = readonly [speaker: string, text: string];

export interface TemporaryStarterBehavior {
  starter: Starter;
  text: string;
  detail: string;
}
