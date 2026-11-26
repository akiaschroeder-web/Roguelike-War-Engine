import './ui/style.css';
import { App } from './ui/app';

import { installClickSounds, reloadAudioSettings } from './ui/audio';
import { loadArtPacks } from './ui/media';
import { initCloudSave } from './storage';

installClickSounds(document.body);
// Load the cloud save (if the page has one) alongside the art, then start.
void Promise.all([loadArtPacks(), initCloudSave()]).finally(() => {
  reloadAudioSettings();
  new App(document.getElementById('app')!);
});
