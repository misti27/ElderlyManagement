import { Elderly, ActivityStatus, DeviceInfo } from '../model/Types';
import { ElderlyLocal, LocationCoords, DeviceInfoLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';

@Component
export struct HomePage {
  @State elderlyList: ElderlyLocal[] = [];
  @State isLoading: boolean = false;

  aboutToAppear() {
    this.fetchElderlyList();
  }

  onPageShow() {
    this.fetchElderlyList();
  }

  async fetchElderlyList() {
    this.isLoading = true;
    try {
      // 使用 HttpUtil 发起请求
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');
      
      // HttpUtil 已自动解析 JSON 并处理错误
      if (Array.isArray(result)) {
        this.elderlyList = result.map((item: Object) => new ElderlyLocal(item));
      }
    } catch (err) {
      console.error('Fetch elderly list failed:', JSON.stringify(err));
      // HttpUtil 已经 toast 报错，这里不需要再次 toast，除非有特定业务逻辑
    } finally {
      this.isLoading = false;
    }
  }

  getStatusColor(status: ActivityStatus | string): string {
    switch (status) {
      case ActivityStatus.FALLEN:
      case '跌倒':
      case '摔倒':
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
      // 1. 顶部标题栏
      Row() {
        Text('我的长辈')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1a1a1a')

        Blank()


      }
      .width('100%')
      .padding({ left: 20, right: 20, top: 20, bottom: 10 })

      // 2. 列表区域
      List({ space: 16 }) {
        ForEach(this.elderlyList, (item: Elderly) => {
          ListItem() {
            this.ElderCard(item)
          }
        })
      }
      .width('100%')
      .layoutWeight(1)
      .padding({ left: 16, right: 16, bottom: 16 })
      .edgeEffect(EdgeEffect.Spring) // 列表回弹效果
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC') // 页面背景
  }

  // 长辈卡片组件
  @Builder ElderCard(item: Elderly) {
    Column() {
      // 第一行：头像、姓名、状态标签
      Row() {

        Text(item.name)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .margin({ right: 10 })

        if (item.device.isOnline) {
          Text('在线')
            .fontSize(12)
            .fontColor('#4CAF50')
            .backgroundColor('#E8F5E9')
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .borderRadius(8)
        } else {
          Text('离线')
            .fontSize(12)
            .fontColor('#999999')
            .backgroundColor('#EEEEEE')
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .borderRadius(8)
        }
      }
      .width('100%')
      .margin({ bottom: 20 })

      // 设备信息网格
      Row() {
        // 设备名
        Column() {
          Text('设备').fontSize(12).fontColor('#999').margin({ bottom: 4 })
          Text(item.device.name).fontSize(14).fontWeight(FontWeight.Bold).maxLines(1)
        }.alignItems(HorizontalAlign.Start).layoutWeight(1)

        Divider().vertical(true).height(24).color('#DDD').margin({ left: 10, right: 10 })

        // 电量
        Column() {
          Text('电量').fontSize(12).fontColor('#999').margin({ bottom: 4 })
          Text(`${item.device.batteryLevel}%`)
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(item.device.batteryLevel > 20 ? '#4CAF50' : '#EF4444')
        }.width(50)

        Divider().vertical(true).height(24).color('#DDD').margin({ left: 10, right: 10 })

        // 网络 (MockData暂无网络字段，暂时硬编码或根据在线状态显示)
        Column() {
          Text('网络').fontSize(12).fontColor('#999').margin({ bottom: 4 })
          Text(item.device.isOnline ? '极佳' : '无')
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor(item.device.isOnline ? '#3b64cc' : '#999')
        }.width(50)
      }
      .width('100%')
      .margin({ top: 15, bottom: 20})

      // 当前状态条
      this.StatusStrip('当前状态：', item.currentStatus, this.getStatusColor(item.currentStatus))

      // 第三行：实时位置条
      this.StatusStrip('实时位置：', item.currentLocation, '#1E293B')

    }
    .padding(20)
    .backgroundColor(Color.White)
    .borderRadius(28)
    .shadow({ radius: 20, color: '#15000000', offsetY: 10 })
  }

  // 修改后的状态条辅助组件：模仿图二样式
  @Builder StatusStrip(label: string, value: string, valueColor: string) {
    Row() {
      Text(label)
        .fontSize(15)
        .fontWeight(FontWeight.Bold)
        .fontColor('#1E293B')
        .flexShrink(0) // 确保标签不被长文本挤压

      // 关键：加入中间空白挤压，实现左右分布
      Blank()

      Text(value)
        .fontSize(15)
        .fontColor(valueColor)
        .layoutWeight(1)
        .textAlign(TextAlign.Start) // 关键：文字靠右对齐
        .margin({ left: 10 })     // 避免文字太贴标签
    }
    .width('100%')
    .padding({ right: 10, top: 14, bottom: 14 })
    .margin({ bottom: 10 })
  }
}