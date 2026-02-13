
import { HomePage } from './HomePage';
import { HistoryPage } from './HistoryPage';
import { ProfilePage } from './ProfilePage';

@Entry
@Component
struct Index {
  @State currentIndex: number = 0;
  private controller: TabsController = new TabsController();

  @Builder TabBuilder(title: string, targetIndex: number, icon: Resource) {
    Column() {
      Image(icon)
        .width(24)
        .height(24)
        .fillColor(this.currentIndex === targetIndex ? '#2563EB' : '#94A3B8')
        .margin({ bottom: 4 })
      
      Text(title)
        .fontColor(this.currentIndex === targetIndex ? '#2563EB' : '#94A3B8')
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
      .tabBar(this.TabBuilder(
        '首页', 
        0, 
        $r('app.media.icon_home')
      ))

      TabContent() {
        HistoryPage()
      }
      .tabBar(this.TabBuilder(
        '历史', 
        1, 
        $r('app.media.icon_history')
      ))

      TabContent() {
        ProfilePage()
      }
      .tabBar(this.TabBuilder(
        '我的', 
        2, 
        $r('app.media.icon_setting')
      ))
    }
    .onChange((index: number) => {
      this.currentIndex = index;
    })
    .backgroundColor(Color.White)
    .barHeight(60)
  }
}
