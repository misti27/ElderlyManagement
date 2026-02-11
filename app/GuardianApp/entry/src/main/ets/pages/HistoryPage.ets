
import { HistoryRecord, ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';

@Component
export struct HistoryPage {
  @State selectedDate: string = '今天';
  @State records: HistoryRecord[] = MockData.history;
  private dateOptions: string[] = ['今天', '昨天', '近一周'];

  build() {
    Column() {
      // 顶部标题
      Text('活动历史')
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .fontColor('#1E293B')
        .width('100%')
        .textAlign(TextAlign.Center)
        .padding(16)
        .backgroundColor(Color.White)

      // 日期选择 Tab
      Row() {
        ForEach(this.dateOptions, (item: string) => {
          Text(item)
            .fontSize(14)
            .fontColor(this.selectedDate === item ? '#2563EB' : '#64748B')
            .fontWeight(this.selectedDate === item ? FontWeight.Bold : FontWeight.Normal)
            .padding({ top: 8, bottom: 8, left: 16, right: 16 })
            .backgroundColor(this.selectedDate === item ? '#EFF6FF' : 'transparent')
            .borderRadius(20)
            .onClick(() => this.selectedDate = item)
        })
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceAround)
      .padding({ top: 12, bottom: 12 })
      .backgroundColor(Color.White)

      // 历史记录时间轴
      List() {
        ForEach(this.records, (record: HistoryRecord, index: number) => {
          ListItem() {
            Row() {
              // 左侧时间与轴线
              Column() {
                Text(record.startTime)
                  .fontSize(14)
                  .fontColor('#64748B')
                  .margin({ bottom: 4 })
                
                // 轴线绘制 (简单模拟)
                Line()
                  .width(1)
                  .height(40)
                  .backgroundColor('#E2E8F0')
              }
              .width(60)
              .alignItems(HorizontalAlign.End)
              .margin({ right: 16 })

              // 右侧内容卡片
              Row() {
                Column() {
                  Text(record.status)
                    .fontSize(16)
                    .fontWeight(FontWeight.Bold)
                    .fontColor('#1E293B')
                  Text(`持续时长: ${record.duration}`)
                    .fontSize(12)
                    .fontColor('#64748B')
                    .margin({ top: 4 })
                }
                .alignItems(HorizontalAlign.Start)

                Blank()

                // 简单的状态图标
                Circle({ width: 8, height: 8 })
                  .fill(this.getStatusColor(record.status))
              }
              .layoutWeight(1)
              .padding(16)
              .backgroundColor(Color.White)
              .borderRadius(12)
              .shadow({ radius: 4, color: '#05000000', offsetY: 2 })
            }
            .alignItems(VerticalAlign.Top)
            .padding({ bottom: 16 })
          }
        })
      }
      .padding(20)
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }

  getStatusColor(status: ActivityStatus): string {
    switch (status) {
      case ActivityStatus.FALLEN: return '#EF4444';
      case ActivityStatus.RUNNING: return '#F59E0B';
      default: return '#3B82F6';
    }
  }
}
