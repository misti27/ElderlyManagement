
import { ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';

@Component
export struct HomePage {
  @State greeting: string = '';
  @State batteryLevel: number = 85;
  @State isCharging: boolean = false;
  @State currentActivity: ActivityStatus = ActivityStatus.WALKING;
  @State location: string = '北京市朝阳区幸福养老社区';

  aboutToAppear() {
    this.updateGreeting();
  }

  updateGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      this.greeting = '早上好';
    } else if (hour >= 12 && hour < 18) {
      this.greeting = '下午好';
    } else {
      this.greeting = '晚上好';
    }
  }

  handleEmergencyCall() {
    // 实际开发中会调用系统拨号
    promptAction.showDialog({
      title: '紧急呼叫',
      message: '正在呼叫紧急联系人 (13900139000)...',
      buttons: [
        { text: '取消', color: '#64748B' },
      ]
    });
  }

  build() {
    Column() {
      // 头部信息卡片
      Column() {
        Row() {
          Column() {
            Text(this.greeting)
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.White)
            Text(MockData.currentUser.name)
              .fontSize(18)
              .fontColor(Color.White)
              .opacity(0.9)
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)

          Blank()

          // 电量显示
          Row() {
            Text(`${this.batteryLevel}%`)
              .fontColor(Color.White)
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
            if (this.isCharging) {
              Text('⚡')
                .fontColor('#FCD34D') // Amber
                .fontSize(16)
            }
          }
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .backgroundColor('rgba(255,255,255,0.2)')
          .borderRadius(20)
        }
        .width('100%')
        .padding(20)
      }
      .width('100%')
      .height(180)
      .backgroundColor('#2563EB') // Blue-600
      .borderRadius({ bottomLeft: 30, bottomRight: 30 })
      .justifyContent(FlexAlign.Start)
      .padding({ top: 40 })

      // 内容区域
      Column({ space: 20 }) {
        
        // 状态卡片
        Row() {
          Column() {
            Text('当前状态')
              .fontSize(14)
              .fontColor('#64748B')
            Text(this.currentActivity)
              .fontSize(28)
              .fontWeight(FontWeight.Bold)
              .fontColor('#0F172A') // Slate-900
              .margin({ top: 8 })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)

          // 简单的图标模拟
          Circle({ width: 50, height: 50 })
            .fill('#EFF6FF') // Blue-50
        }
        .width('100%')
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(20)
        .shadow({ radius: 10, color: '#0A000000', offsetY: 4 })

        // 位置卡片
        Row() {
          Column() {
            Text('当前位置')
              .fontSize(14)
              .fontColor('#64748B')
            Text(this.location)
              .fontSize(16)
              .fontColor('#334155') // Slate-700
              .margin({ top: 8 })
              .maxLines(2)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
          .alignItems(HorizontalAlign.Start)
          .layoutWeight(1)
          
          Text('📍')
            .fontSize(24)
        }
        .width('100%')
        .padding(20)
        .backgroundColor(Color.White)
        .borderRadius(20)
        .shadow({ radius: 10, color: '#0A000000', offsetY: 4 })

        Blank()

        // 紧急呼叫按钮
        Button() {
          Column() {
            Text('SOS')
              .fontSize(40)
              .fontWeight(FontWeight.Bold)
              .fontColor(Color.White)
            Text('紧急呼叫')
              .fontSize(18)
              .fontColor(Color.White)
              .margin({ top: 5 })
          }
        }
        .type(ButtonType.Circle)
        .width(200)
        .height(200)
        .backgroundColor('#EF4444') // Red-500
        .shadow({ radius: 20, color: '#4DEF4444', offsetY: 10 })
        .onClick(() => {
          this.handleEmergencyCall();
        })
        .margin({ bottom: 40 })

      }
      .width('100%')
      .layoutWeight(1) // 占据剩余空间
      .padding(20)
      .margin({ top: -40 }) // 向上重叠
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }
}
