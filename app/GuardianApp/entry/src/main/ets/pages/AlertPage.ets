
import { AlertRecord, AlertType } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';

@Component
export struct AlertPage {
  @State alerts: AlertRecord[] = MockData.alerts;

  build() {
    Column() {
      // 标题栏 + 设置按钮
      Row() {
        Text('消息中心')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1E293B')
        Blank()
        Text('设置')
          .fontSize(14)
          .fontColor('#2563EB')
          .onClick(() => {
            promptAction.showActionMenu({
              title: '报警提醒设置',
              buttons: [
                { text: '开启弹窗通知', color: '#1E293B' },
                { text: '开启短信通知', color: '#1E293B' },
                { text: '取消', color: '#64748B' }
              ]
            });
          })
      }
      .width('100%')
      .padding(20)
      .backgroundColor(Color.White)

      // 报警列表
      List() {
        ForEach(this.alerts, (alert: AlertRecord) => {
          ListItem() {
            Column() {
              Row() {
                // 报警图标
                Text(alert.type === AlertType.SOS || alert.type === AlertType.FALL ? '🚨' : '⚠️')
                  .fontSize(24)
                  .margin({ right: 12 })
                
                Column() {
                  Text(alert.type)
                    .fontSize(16)
                    .fontWeight(FontWeight.Bold)
                    .fontColor(alert.type === AlertType.SOS ? '#EF4444' : '#F59E0B')
                  Text(`${alert.elderlyName} | ${alert.time}`)
                    .fontSize(12)
                    .fontColor('#94A3B8')
                    .margin({ top: 4 })
                }
                .alignItems(HorizontalAlign.Start)
                
                Blank()

                if (!alert.isRead) {
                  Circle({ width: 8, height: 8 })
                    .fill('#EF4444')
                }
              }
              .width('100%')

              Text(alert.description)
                .fontSize(14)
                .fontColor('#334155')
                .margin({ top: 12, left: 40 }) // 对齐文字
                .width('85%')
            }
            .width('100%')
            .padding(16)
            .backgroundColor(Color.White)
            .borderRadius(12)
            .margin({ bottom: 12 })
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
}
