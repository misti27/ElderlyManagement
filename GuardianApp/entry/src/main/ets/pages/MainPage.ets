import { HomePage } from './HomePage';
import { HistoryPage } from './HistoryPage';
import { AlertPage } from './AlertPage';
import { ProfilePage } from './ProfilePage';
import { AlertStatus, AlertRecord } from '../model/Types';
import { HttpUtil } from '../utils/HttpUtil';

@Entry
@Component
export struct MainPage {
  @State currentIndex: number = 0;
  @State hasPendingAlerts: boolean = false;
  private controller: TabsController = new TabsController();

  aboutToAppear() {
    // 页面展示时，检查警报
    this.checkAlerts();
  }

  async checkAlerts() {
    // 游客模式下，不检查服务器警报
    if (AppStorage.Get<boolean>('isGuest')) {
      console.info('[MainPage] Guest mode active, skipping alert check.');
      this.hasPendingAlerts = false;
      return;
    }

    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const alerts = await HttpUtil.get<AlertRecord[]>(`/guardian/alerts?date=${dateStr}`);

      if (Array.isArray(alerts)) {
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

    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(this.currentIndex === targetIndex ? '#EBF2FF' : 'transparent')
    .width(this.currentIndex === targetIndex ? '80%' : '100%')
    .height(this.currentIndex === targetIndex ? '85%' : '100%')
    .backgroundColor(this.currentIndex === targetIndex ? '#EBF2FF' : 'transparent')
    .borderRadius(10)
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
      this.checkAlerts();
    })
    .backgroundColor(Color.White)
    .barHeight(60)
  }
}
