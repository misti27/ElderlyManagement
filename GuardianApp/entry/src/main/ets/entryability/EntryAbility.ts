
import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import Want from '@ohos.app.ability.Want';

import { HttpUtil } from '../utils/HttpUtil';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    PersistentStorage.PersistProp('token', '');
    PersistentStorage.PersistProp('user', {});

    // Initialize HttpUtil with token if exists
    // Note: AppStorage access is safe here in Ability context
    try {
      const token = AppStorage.Get<string>('token');
      if (token) {
        HttpUtil.setToken(token);
      }
    } catch (e) {
      console.error('Failed to init token:', e);
    }
  }

  onDestroy(): void {
    console.info('EntryAbility onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // Main window is created, set main page for this ability
    console.info('EntryAbility onWindowStageCreate');

    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        console.error('Failed to load the content. Cause: ' + JSON.stringify(err) ?? '');
        return;
      }
      console.info('Succeeded in loading the content. Data: ' + JSON.stringify(data) ?? '');
    });
  }

  onWindowStageDestroy(): void {
    console.info('EntryAbility onWindowStageDestroy');
  }

  onForeground(): void {
    console.info('EntryAbility onForeground');
  }

  onBackground(): void {
    console.info('EntryAbility onBackground');
  }
}
