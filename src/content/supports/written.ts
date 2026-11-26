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
import { CONVOS as SS1 } from './convos/ss1';
import { CONVOS as SS2 } from './convos/ss2';
import { CONVOS as SS3 } from './convos/ss3';
import { CONVOS as SS4 } from './convos/ss4';

export const WRITTEN: Record<string, ConvoSet> = { ...OOT, ...MM, ...WW, ...TP1, ...TP2, ...CROSS1, ...CROSS2, ...MONSTERS, ...SS1, ...SS2, ...SS3, ...SS4 };
