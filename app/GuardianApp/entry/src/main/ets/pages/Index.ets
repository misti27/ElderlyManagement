
import { HomePage } from './HomePage';
import { HistoryPage } from './HistoryPage';
import { AlertPage } from './AlertPage';
import { ProfilePage } from './ProfilePage';

@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  private controller: TabsController = new TabsController();

  @Builder TabBuilder(title: string, targetIndex: number, normalIcon: string, selectedIcon: string) {
    Column() {
      Text(targetIndex === this.currentIndex ? selectedIcon : normalIcon)
        .fontSize(24)
        .fontColor(this.currentIndex === targetIndex ? '#2563EB' : '#64748B')
        .margin({ bottom: 4 })
      Text(title)
        .fontColor(this.currentIndex === targetIndex ? '#2563EB' : '#64748B')
        .fontSize(10)
    }
    .width('100%')
    .height(60)
    .justifyContent(FlexAlign.Center)
    .onClick(() => {
      this.currentIndex = targetIndex;
      this.controller.changeIndex(targetIndex);
    })
  }

  build() {
    Tabs({ barPosition: BarPosition.End, controller: this.controller }) {
      TabContent() {
        HomePage()
      }
      .tabBar(this.TabBuilder('首页', 0, '🏠', '🏠'))

      TabContent() {
        HistoryPage()
      }
      .tabBar(this.TabBuilder('历史', 1, '📅', '📅'))

      TabContent() {
        AlertPage()
      }
      .tabBar(this.TabBuilder('报警', 2, '🚨', '🚨'))

      TabContent() {
        ProfilePage()
      }
      .tabBar(this.TabBuilder('我的', 3, '👤', '👤'))
    }
    .onChange((index: number) => {
      this.currentIndex = index;
    })
    .backgroundColor(Color.White)
    .barHeight(60)
  }
}
