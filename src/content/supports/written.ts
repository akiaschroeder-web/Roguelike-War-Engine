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
import { CONVOS as WILD1 } from './convos/wild1';
import { CONVOS as WILD2 } from './convos/wild2';
import { CONVOS as WILD3 } from './convos/wild3';
import { CONVOS as WILD4 } from './convos/wild4';
import { CONVOS as ORIGINAL } from './convos/original';
import { CONVOS as AOL } from './convos/aol';
import { CONVOS as LEGEND1 } from './convos/legend1';
import { CONVOS as LEGEND2 } from './convos/legend2';
import { CONVOS as PHANTOM1 } from './convos/phantom1';
import { CONVOS as PHANTOM2 } from './convos/phantom2';
import { CONVOS as SPIRIT1 } from './convos/spirit1';
import { CONVOS as SPIRIT2 } from './convos/spirit2';
import { CONVOS as SPIRIT3 } from './convos/spirit3';

export const WRITTEN: Record<string, ConvoSet> = { ...OOT, ...MM, ...WW, ...TP1, ...TP2, ...CROSS1, ...CROSS2, ...MONSTERS, ...SS1, ...SS2, ...SS3, ...SS4, ...WILD1, ...WILD2, ...WILD3, ...WILD4, ...ORIGINAL, ...AOL, ...LEGEND1, ...LEGEND2, ...PHANTOM1, ...PHANTOM2, ...SPIRIT1, ...SPIRIT2, ...SPIRIT3 };
