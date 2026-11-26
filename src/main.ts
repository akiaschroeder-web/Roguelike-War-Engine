import './ui/style.css';
import { App } from './ui/app';

import { installClickSounds } from './ui/audio';
import { loadArtPacks } from './ui/media';

installClickSounds(document.body);
void loadArtPacks().finally(() => new App(document.getElementById('app')!));
