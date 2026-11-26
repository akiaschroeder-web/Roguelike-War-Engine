// All written support conversations (one file per section of the support doc).
import type { ConvoSet } from './index';
import { CONVOS as OOT } from './convos/oot';
import { CONVOS as MM } from './convos/mm';
import { CONVOS as WW } from './convos/ww';
import { CONVOS as TP1 } from './convos/tp1';
import { CONVOS as TP2 } from './convos/tp2';
import { CONVOS as CROSS1 } from './convos/cross1';
import { CONVOS as CROSS2 } from './convos/cross2';
import { CONVOS as MONSTERS } from './convos/monsters';

export const WRITTEN: Record<string, ConvoSet> = { ...OOT, ...MM, ...WW, ...TP1, ...TP2, ...CROSS1, ...CROSS2, ...MONSTERS };
