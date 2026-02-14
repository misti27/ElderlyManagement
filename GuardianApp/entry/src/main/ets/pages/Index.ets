
import { HomePage } from './HomePage';
import { HistoryPage } from './HistoryPage';
import { AlertPage } from './AlertPage';
import { ProfilePage } from './ProfilePage';
import { AlertStatus, AlertRecord } from '../model/Types';
import { HttpUtil } from '../utils/HttpUtil';
import router from '@ohos.router';

@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  @State hasPendingAlerts: boolean = false;
  private controller: TabsController = new TabsController();

  onPageShow() {
    this.checkLogin();
  }

  aboutToAppear() {
    this.checkLogin();
  }

  checkLogin() {
    const token = AppStorage.Get<string>('token');
    console.info('Index Page checkLogin, token:', token);
    if (!token || token === '') {
      console.warn('Token missing in Index, redirecting to Login');
      router.replaceUrl({ url: 'pages/LoginPage' });
      return;
    }
    this.checkAlerts();
  }

  async checkAlerts() {
    try {
      // Fetch alerts from server to check for unprocessed ones
      // We fetch "all" to check everything. In a real app, we might have a dedicated endpoint for "unread count".
      // For now, fetching today's alerts or recent ones is a proxy. 
      // Ideally, we should fetch *all* unprocessed alerts regardless of date, but let's stick to the current API.
      // The current API filters by date. We might miss unprocessed alerts from previous days if we only check today.
      // However, for this demo, let's just fetch "today" or maybe modify the API to allow fetching all unprocessed.
      // Let's try fetching with a wide range or just relying on the API behavior.
      
      // Hack: The current API requires 'date'. Let's just fetch today for now.
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const alerts = await HttpUtil.get<AlertRecord[]>(`/guardian/alerts?date=${dateStr}`);
      
      if (Array.isArray(alerts)) {
        // Check if any alert is unprocessed
        this.hasPendingAlerts = alerts.some(alert => alert.status === AlertStatus.UNPROCESSED);
      } else {
        this.hasPendingAlerts = false;
      }
    } catch (err) {
      console.error('Check alerts failed:', JSON.stringify(err));
      this.hasPendingAlerts = false;
    }
  }

  @Builder TabBuilder(title: string, targetIndex: number, icon: Resource) {
    Column() {
      Image(icon)
        .width(24)
        .height(24)
        .fillColor(
          (targetIndex === 2 && this.hasPendingAlerts) 
            ? '#EF4444' // 有未读报警显示红色
            : (this.currentIndex === targetIndex ? '#2563EB' : '#94A3B8')
        )
        .margin({ bottom: 4 })
      
      Text(title)
        .fontColor(
          (targetIndex === 2 && this.hasPendingAlerts)
            ? '#EF4444' // 文字同步显示红色
            : (this.currentIndex === targetIndex ? '#2563EB' : '#94A3B8')
        )
        .fontSize(14)
        .fontWeight(this.currentIndex === targetIndex ? FontWeight.Bold : FontWeight.Normal)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(this.currentIndex === targetIndex ? '#EBF2FF' : 'transparent')
  }

  build() {
    Tabs({ barPosition: BarPosition.End, controller: this.controller }) {
      TabContent() {
        HomePage()
      }
      .tabBar(this.TabBuilder('首页', 0, $r('app.media.icon_home')))

      TabContent() {
        HistoryPage()
      }
      .tabBar(this.TabBuilder('历史', 1, $r('app.media.icon_history')))

      TabContent() {
        AlertPage()
      }
      .tabBar(this.TabBuilder('消息', 2, $r('app.media.icon_alert')))

      TabContent() {
        ProfilePage()
      }
      .tabBar(this.TabBuilder('设置', 3, $r('app.media.icon_setting')))
    }
    .onChange((index: number) => {
      this.currentIndex = index;
      // Re-check alerts when switching tabs, especially if coming back from AlertPage (where we might have processed them)
      this.checkAlerts();
    })
    .backgroundColor(Color.White)
    .barHeight(60)
  }
}
