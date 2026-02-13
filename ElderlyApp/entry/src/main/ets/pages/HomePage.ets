
import { ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';

@Component
export struct HomePage {
  @State batteryLevel: number = 85;
  @State location: string = '上海市徐汇区幸福路101号';
  @State isAutoMonitor: boolean = true;
  @State currentStatus: string = '正常行走';

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

  build() {
    Column() {
      // 1. 顶部卡片区域
      Column({ space: 16 }) {
        // 当前状态卡片
        Row() {
          Text('当前状态：')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1E293B')
          Text(this.currentStatus)
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor(this.getStatusColor(this.currentStatus)) // 动态颜色
        }
        .width('100%')
        .height(80)
        .backgroundColor(Color.White) // 白色卡片背景
        .borderRadius(12)
        .padding({ left: 24, right: 24 })
        .shadow({ radius: 4, color: '#05000000', offsetY: 2 })

        // 实时位置卡片
        Row() {
          Text('实时位置：')
            .fontSize(22)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1E293B')
          Text(this.location)
            .fontSize(18)
            .layoutWeight(1) // 自动换行或占满剩余空间
        }
        .width('100%')
        .height(100)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .padding({ left: 24, right: 24 })
        .shadow({ radius: 4, color: '#05000000', offsetY: 2 })

        // 自动监护开关卡片
        Row() {
          Column({ space: 4 }) {
            Text('自动监护')
              .fontSize(22)
              .fontWeight(FontWeight.Bold)
              .fontColor('#1E293B')
            Text(this.isAutoMonitor ? '全天候守护中' : '监护已暂停')
              .fontSize(16)
              .fontColor('#64748B')
          }
          .alignItems(HorizontalAlign.Start)

          Blank() // 撑开中间空间

          Toggle({ type: ToggleType.Switch, isOn: this.isAutoMonitor })
            .selectedColor('#2563EB') // 开关开启时的颜色
            .width(50)
            .height(30)
            .onChange((isOn: boolean) => {
              this.isAutoMonitor = isOn;
              promptAction.showToast({ message: isOn ? '监护已开启' : '监护已关闭' });
            })
        }
        .width('100%')
        .height(140)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .padding({ left: 24, right: 24 })
        .shadow({ radius: 4, color: '#05000000', offsetY: 2 })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 24 })

      // 2. 底部 SOS 按钮区域
      Column() {
        // 使用 Stack 实现 SOS 按钮的多层感（或直接用 Column + Shadow）
        Column() {
          Text('SOS')
            .fontSize(45)
            .fontColor(Color.White)
            .fontWeight(FontWeight.Bolder)
          Text('一键报警')
            .fontSize(16)
            .fontColor(Color.White)
            .margin({ top: 8 })
        }
        .justifyContent(FlexAlign.Center)
        .width(200)
        .height(200)
        .backgroundColor('#EF4444') // 红色背景
        .borderRadius(100) // 圆形
        .shadow({
          radius: 20,
          color: '#4DEF4444', // 带红色的阴影
          offsetX: 0,
          offsetY: 10
        })
        .onClick(() => {
          promptAction.showDialog({
            title: '紧急报警',
            message: '是否立即拨打紧急联系电话并发送位置？',
            buttons: [
              { text: '取消', color: '#64748B' },
              { text: '确定', color: '#EF4444' }
            ]
          });
        })
      }
      .width('100%')
      .layoutWeight(1) // 占据剩余所有空间
      .justifyContent(FlexAlign.Center) // 在垂直方向居中
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC') // 页面整体浅灰色背景
  }
}
