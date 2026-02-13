
import { HistoryRecord, ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';

@Component
export struct HistoryPage {
  @State records: HistoryRecord[] = MockData.history;

  @State batteryLevel: number = 85;
  @State signalStrength: string = '良好';
  @State lastOnline: string = '刚刚';
  @State deviceName: string = '华为 Watch GT 3';

  build() {
    Column() {
      Scroll() {
        Column({ space: 16 }) {
          // --- 1. 设备状态卡片 ---
          Column() {
            Text('设备状态')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .width('100%')
              .margin({ bottom: 20 })

            // 设备名称
            this.InfoRow('设备名称', this.deviceName)

            // 电量
            Row() {
              Text('电量').fontSize(16).fontColor('#333')
              Blank()
              // 进度条还原
              Progress({ value: this.batteryLevel, total: 100, type: ProgressType.Linear })
                .width(80)
                .height(8)
                .color(this.batteryLevel > 20 ? '#67C23A' : '#EF4444') // 电量低变红
                .style({ strokeWidth: 8, enableScanEffect: false })
                .margin({ right: 10 })
              Text(`${this.batteryLevel}%`).fontSize(16).fontWeight(FontWeight.Medium)
            }.width('100%').margin({ bottom: 20 })

            // 信号
            Row() {
              Text('信号').fontSize(16).fontColor('#333')
              Blank()
              Text(this.signalStrength)
                .fontSize(14)
                .fontColor(this.signalStrength === '无信号' ? '#EF4444' : '#52c41a') // 信号差变红
                .backgroundColor(this.signalStrength === '无信号' ? '#FEE2E2' : '#f6ffed')
                .padding({ left: 8, right: 8, top: 2, bottom: 2 })
                .borderRadius(4)
            }.width('100%').margin({ bottom: 20 })

            // 最后在线
            this.InfoRow('最后在线', this.lastOnline)
          }
          .cardStyle()

          // --- 2. 当日运动记录卡片 ---
          Column() {
            Text('当日运动记录')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .width('100%')
              .margin({ bottom: 25 })

            // 循环渲染记录列表
            ForEach(this.records, (item: HistoryRecord) => {
              Row() {
                Text(`${item.startTime} - ${item.endTime}`)
                  .fontSize(16)
                  .fontColor('#999')
                Blank()
                Text(item.status)
                  .fontSize(16)
                  .fontWeight(FontWeight.Bold)
                  .fontColor(this.getStatusColor(item.status))
              }
              .width('100%')
              .margin({ bottom: 25 })
            })
          }
          .cardStyle()
        }
        .padding(16)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F8F8')
  }

  // 通用的信息行组件
  @Builder InfoRow(label: string, value: string) {
    Row() {
      Text(label)
        .fontSize(16)
        .fontColor('#333')
      Blank()
      Text(value)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
    }
    .width('100%')
    .margin({ bottom: 20 })
  }

  getStatusColor(status: ActivityStatus | string): string {
    switch (status) {
      case ActivityStatus.FALLEN:
      case '跌倒':
      case '摔倒': // 兼容旧数据
        return '#EF4444'; // Red

      case ActivityStatus.STILL:
      case '静止':
        return '#2da44e'; // Green

      case ActivityStatus.WALKING:
      case '正常行走':
      case ActivityStatus.SITTING:
      case '坐下':
      case ActivityStatus.STANDING:
      case '站立':
      case ActivityStatus.JOGGING:
      case '慢跑':
      case ActivityStatus.RUNNING:
      case '快跑':
      case ActivityStatus.GOING_UPSTAIRS:
      case '上楼':
      case ActivityStatus.GOING_DOWNSTAIRS:
      case '下楼':
        return '#3b64cc'; // Blue

      default:
        return '#3b64cc'; // Default Blue
    }
  }
}

// 定义卡片样式的装饰器（样式复用）
@Styles function cardStyle() {
  .width('100%')
  .backgroundColor(Color.White)
  .borderRadius(24)
  .padding(20)
  .shadow({ radius: 10, color: '#05000000', offsetX: 0, offsetY: 2 })
}
