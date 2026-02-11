
import { Elderly, ActivityStatus } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';

@Component
export struct HomePage {
  @State elderlyList: Elderly[] = MockData.elderlyList;

  @Builder ElderlyCard(elderly: Elderly) {
    Column() {
      // 顶部信息：头像、姓名、状态
      Row() {
        Image($r(elderly.avatarUrl)) // 实际使用 $r('app.media.xxx')
          .width(50)
          .height(50)
          .borderRadius(25)
          .backgroundColor('#E2E8F0')
          .margin({ right: 12 })

        Column() {
          Text(elderly.name)
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1E293B')
          Text(`设备电量: ${elderly.device.batteryLevel}%`)
            .fontSize(12)
            .fontColor(elderly.device.batteryLevel < 20 ? '#EF4444' : '#64748B')
            .margin({ top: 4 })
        }
        .alignItems(HorizontalAlign.Start)

        Blank()

        // 状态标签
        Text(elderly.currentStatus)
          .fontSize(14)
          .fontColor(Color.White)
          .fontWeight(FontWeight.Bold)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .borderRadius(16)
          .backgroundColor(this.getStatusColor(elderly.currentStatus))
      }
      .width('100%')
      .margin({ bottom: 16 })

      Divider().color('#F1F5F9').margin({ bottom: 16 })

      // 位置与设备详情
      Row() {
        Column() {
          Row() {
            Text('📍')
              .fontSize(14)
              .margin({ right: 4 })
            Text(elderly.currentLocation)
              .fontSize(14)
              .fontColor('#334155')
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
          .margin({ bottom: 8 })

          Row() {
            Text('📱')
              .fontSize(14)
              .margin({ right: 4 })
            Text(`${elderly.device.name} (${elderly.device.isOnline ? '在线' : '离线'})`)
              .fontSize(12)
              .fontColor(elderly.device.isOnline ? '#10B981' : '#94A3B8')
          }
        }
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(16)
    .shadow({ radius: 8, color: '#0A000000', offsetY: 2 })
    .margin({ bottom: 16 })
    .onClick(() => {
      promptAction.showToast({ message: `查看 ${elderly.name} 详情` });
    })
  }

  getStatusColor(status: ActivityStatus): string {
    switch (status) {
      case ActivityStatus.FALLEN: return '#EF4444'; // Red
      case ActivityStatus.RUNNING:
      case ActivityStatus.JOGGING: return '#F59E0B'; // Amber
      case ActivityStatus.WALKING: return '#3B82F6'; // Blue
      default: return '#10B981'; // Green (Sitting/Still)
    }
  }

  build() {
    Column() {
      // 顶部标题栏
      Text('守护')
        .fontSize(24)
        .fontWeight(FontWeight.Bold)
        .fontColor('#1E293B')
        .width('100%')
        .padding({ left: 20, top: 20, bottom: 10 })

      // 列表区域
      List() {
        ForEach(this.elderlyList, (item: Elderly) => {
          ListItem() {
            this.ElderlyCard(item)
          }
          .padding({ left: 20, right: 20 })
        })
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }
}
