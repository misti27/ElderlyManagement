import router from '@ohos.router';

@Entry
@Component
struct Index {

  aboutToAppear() {
    this.checkLogin();
  }

  checkLogin() {
    const token = AppStorage.Get<string>('token');
    const isGuest = AppStorage.Get<boolean>('isGuest');

    console.info('[Index Dispatcher] checkLogin, token:', token, 'isGuest:', isGuest);

    // 如果是游客模式，或者存在token，则进入主页
    if (isGuest || (token && token !== '')) {
      console.info('[Index Dispatcher] Token found or in guest mode, navigating to MainPage.');
      router.replaceUrl({ url: 'pages/MainPage' });
    } else {
      // 否则，跳转到登录页
      console.warn('[Index Dispatcher] Token missing and not in guest mode, redirecting to Login.');
      router.replaceUrl({ url: 'pages/LoginPage' });
    }
  }

  build() {
    // 简单的加载UI
    Column() {
      Text('加载中...')
        .fontSize(24)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
