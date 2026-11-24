import './ui/style.css';
import { App } from './ui/app';

import { installClickSounds } from './ui/audio';

installClickSounds(document.body);
new App(document.getElementById('app')!);
