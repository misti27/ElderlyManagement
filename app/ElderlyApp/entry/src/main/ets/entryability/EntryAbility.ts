
import UIAbility from '@ohos.app.ability.UIAbility';
import window from '@ohos.window';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import Want from '@ohos.app.ability.Want';

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    console.info('EntryAbility onCreate');
  }

  onDestroy(): void {
    console.info('EntryAbility onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // Main window is created, set main page for this ability
    console.info('EntryAbility onWindowStageCreate');

    // 加载 Index 页面 (登录逻辑通常在 Index 内部判断或单独作为启动页，这里简化为直接加载)
    // 实际应用中可能先加载 SplashPage 或根据 token 判断跳转 LoginPage/Index
    windowStage.loadContent('pages/LoginPage', (err, data) => {
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
