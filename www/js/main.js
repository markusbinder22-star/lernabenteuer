// Spielstart
'use strict';
window.addEventListener('load', () => {
  K.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: K.W, height: K.H,
    backgroundColor: '#0d0818',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 1900 }, debug: false, tileBias: 40 } },
    input: { activePointers: 4 },
    audio: { noAudio: true },
    render: { antialias: true, roundPixels: false, powerPreference: 'high-performance' },
    fps: { target: 60 },
    scene: [BootScene, ProfilesScene, MapScene, CutsceneScene, LevelScene, TaskScene, HortScene, ParentsScene, LevelDoneScene],
  });
  // Android-Zurück-Taste
  try {
    const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (App) App.addListener('backButton', () => K.events.emit('back'));
  } catch (e) {}
});
