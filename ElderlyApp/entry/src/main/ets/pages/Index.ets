import router from '@ohos.router';
import storage from '@ohos.data.storage';
import { HttpUtil } from '../utils/HttpUtil';

@Entry
@Component
struct Index {

  aboutToAppear() {
    this.checkLogin();
  }

  async checkLogin() {
    // 1. 检查是否为游客模式 (从全局UI状态中获取)
    const isGuest: boolean | undefined = AppStorage.Get<boolean>('isGuest');
    if (isGuest === true) {
      console.info('Guest mode detected, navigating to main page.');
      router.replaceUrl({ url: 'pages/MainPage' });
      return; // 直接进入主页
    }

    // 2. 如果不是游客，则检查持久化存储中的 token
    try {
      const persistentStorage = await storage.getStorage(getContext(this).filesDir + '/ElderlyAppStorage');
      const token = await persistentStorage.get('token', '') as string;

      if (token) {
        console.info('Token found, navigating to main page.');
        HttpUtil.setToken(token);
        router.replaceUrl({ url: 'pages/MainPage' });
      } else {
        console.info('No token found, navigating to login page.');
        router.replaceUrl({ url: 'pages/LoginPage' });
      }
    } catch (e) {
      console.error('Failed to check login status', JSON.stringify(e));
      router.replaceUrl({ url: 'pages/LoginPage' });
    }
  }

  build() {
    Column() {
      Text('加载中...')
        .fontSize(24)
    }.width('100%').height('100%')
  }
}
