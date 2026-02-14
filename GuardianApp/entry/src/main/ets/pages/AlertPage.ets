import { AlertRecord, AlertType, AlertLevel, AlertStatus, Elderly, ActivityStatus } from '../model/Types';
import { ElderlyLocal, LocationCoords, DeviceInfoLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';

// 定义等级样式的接口，解决 ArkTS 编译报错
interface AlertLevelStyle {
  color: string;
  bgColor: string;
  tag: string;
}

@Component
export struct AlertPage {
  @State alerts: AlertRecord[] = [];
  @State elderlyList: ElderlyLocal[] = [];
  @State selectedElderIndex: number = 0;
  @State selectedDateIndex: number = 0;
  @State isLoading: boolean = false;

  // Generate date list (First is "All Time")
  private dateOptions: string[] = ['全部时间', ...this.generateDateList(30)];

  aboutToAppear() {
    this.fetchElderlyList();
    this.fetchAlerts();
  }

  generateDateList(days: number): string[] {
    const list: string[] = [];
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const year = d.getFullYear();
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      list.push(`${year}/${month}/${day}`);
    }
    return list;
  }

  // --- 原有逻辑保持不变 ---
  async fetchElderlyList() {
    const locationCoords = new LocationCoords();
    locationCoords.latitude = 0;
    locationCoords.longitude = 0;
    const device = new DeviceInfoLocal();
    device.deviceId = '';
    device.name = '';
    device.batteryLevel = 0;
    device.isOnline = false;
    device.lastOnlineTime = '';
    const allOptionData: Record<string, Object> = {
      'id': 'all', 'name': '全部长辈', 'age': 0, 'avatarUrl': '', 'phone': '',
      'currentStatus': ActivityStatus.UNKNOWN, 'currentLocation': '',
      'locationCoords': locationCoords, 'device': device
    };
    const allOption = new ElderlyLocal(allOptionData);
    try {
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');
      if (Array.isArray(result)) {
        const elders = result.map((item: Object) => new ElderlyLocal(item));
        this.elderlyList = [allOption, ...elders];
      } else {
        this.elderlyList = [allOption];
      }
    } catch (err) {
      this.elderlyList = [allOption];
    }
  }

  async fetchAlerts() {
    this.isLoading = true;
    try {
      const selectedElder = this.elderlyList[this.selectedElderIndex];
      const elderlyId = selectedElder ? selectedElder.id : 'all';
      const selectedDateStr = this.dateOptions[this.selectedDateIndex];
      
      let url = '/guardian/alerts';
      const params: string[] = [];
      
      if (selectedDateStr !== '全部时间') {
        params.push(`date=${selectedDateStr.replace(/\//g, '-')}`);
      }
      
      if (elderlyId !== 'all') {
        params.push(`elderlyId=${elderlyId}`);
      }
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }
      const result: AlertRecord[] = await HttpUtil.get<AlertRecord[]>(url);
      this.alerts = Array.isArray(result) ? result : [];
    } catch (err) {
      this.alerts = [];
    } finally {
      this.isLoading = false;
    }
  }

  async handleStatusUpdate(alertId: string, newStatus: AlertStatus) {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts[index].status = newStatus;
      this.alerts = [...this.alerts];
    }
    promptAction.showToast({ message: newStatus === AlertStatus.CONFIRMED ? '已确认' : '已解除' });
  }

  // 这里的函数增加了明确的返回类型定义
  getLevelStyles(level: AlertLevel): AlertLevelStyle {
    if (level === AlertLevel.HIGH) {
      return { color: '#E64545', bgColor: '#FFF1F0', tag: '紧急警报' };
    } else if (level === AlertLevel.MEDIUM) {
      return { color: '#ED7B2F', bgColor: '#FFF7E6', tag: '注意观察' };
    } else {
      return { color: '#2F54EB', bgColor: '#F0F5FF', tag: '日常提醒' };
    }
  }

  @Builder
  renderAlertList(records: AlertRecord[]) {
    ForEach(records, (alert: AlertRecord) => {
      Column() {
        // 第一行：类型 + 状态标签
        Row() {
          Text(alert.type)
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .fontColor('#1A1A1A')
          Blank()
          Text(this.getLevelStyles(alert.level).tag)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
            .fontColor(this.getLevelStyles(alert.level).color)
            .backgroundColor(this.getLevelStyles(alert.level).bgColor)
            .padding({ left: 10, right: 10, top: 4, bottom: 4 })
            .borderRadius(6)
        }.width('100%').margin({ bottom: 6 })

        // 第二行：时间
        Text(alert.time)
          .fontSize(13)
          .fontColor('#999')
          .width('100%')
          .margin({ bottom: 12 })

        // 第三行：地址区域
        Row() {
          Circle({ width: 6, height: 6 })
            .fill(this.getLevelStyles(alert.level).color)
            .margin({ right: 8 })
          Text(alert.location)
            .fontSize(14)
            .fontColor('#555')
            .layoutWeight(1)
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .width('100%')
        .padding(10)
        .backgroundColor('#F7F8FA')
        .borderRadius(8)
        .margin({ bottom: 16 })

        // 第四行：操作按钮
        if (alert.status !== AlertStatus.RESOLVED) {
          Row({ space: 12 }) {
            Button('确认收到')
              .layoutWeight(1).height(38).fontSize(14)
              .fontColor(alert.status === AlertStatus.CONFIRMED ? '#BBBBBB' : '#555')
              .backgroundColor(alert.status === AlertStatus.CONFIRMED ? '#F5F5F5' : '#FFFFFF')
              .borderWidth(alert.status === AlertStatus.CONFIRMED ? 0 : 1)
              .borderColor('#E8E8E8')
              .borderRadius(19)
              .enabled(alert.status !== AlertStatus.CONFIRMED)
              .onClick(() => this.handleStatusUpdate(alert.id, AlertStatus.CONFIRMED))

            Button('解除警报')
              .layoutWeight(1).height(38).fontSize(14).fontColor('#FFF')
              .backgroundColor(this.getLevelStyles(alert.level).color)
              .borderRadius(19)
              .onClick(() => this.handleStatusUpdate(alert.id, AlertStatus.RESOLVED))
          }.width('100%')
        } else {
          Row() {
            Text('✓ 已处理').fontSize(14).fontColor('#52C41A').fontWeight(FontWeight.Medium)
          }.width('100%').justifyContent(FlexAlign.End)
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor(Color.White)
      .borderRadius(16)
      .margin({ bottom: 12 })
      .shadow({ radius: 12, color: '#0A000000', offsetY: 6 })
      .border({ width: { left: 4 }, color: this.getLevelStyles(alert.level).color }) // 侧边色条
    }, (alert: AlertRecord) => alert.id)

    if (records.length === 0) {
      Text(this.isLoading ? '加载中...' : '暂无消息')
        .fontSize(14).fontColor('#999').width('100%').textAlign(TextAlign.Center).padding(20)
    }
  }

  build() {
    Column() {
      Scroll() {
        Column({ space: 16 }) {
          // --- 完全保留您的原始查询条件 UI ---
          Column() {
            Text('查询条件')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .width('100%')
              .margin({ bottom: 20 })

            Row() {
              Text('选择长辈')
                .fontSize(16)
                .fontColor('#333')
              Blank()
              Row() {
                Text(this.elderlyList[this.selectedElderIndex]?.name || '请选择')
                  .fontSize(16)
                  .fontColor('#3b64cc')
                  .fontWeight(FontWeight.Medium)
                Polygon({ width: 10, height: 6 })
                  .points([[0, 0], [10, 0], [5, 6]])
                  .fill('#3b64cc')
                  .margin({ left: 8 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor('#EFF6FF')
              .borderRadius(8)
              .onClick(() => {
                if (this.elderlyList.length === 0) return;
                TextPickerDialog.show({
                  range: this.elderlyList.map(e => e.name),
                  selected: this.selectedElderIndex,
                  onAccept: (value: TextPickerResult) => {
                    this.selectedElderIndex = value.index as number;
                    this.fetchAlerts();
                  }
                })
              })
            }
            .width('100%')
            .margin({ bottom: 20 })

            Row() {
              Text('选择日期')
                .fontSize(16)
                .fontColor('#333')
              Blank()
              Row() {
                Text(this.dateOptions[this.selectedDateIndex])
                  .fontSize(16)
                  .fontColor('#3b64cc')
                  .fontWeight(FontWeight.Medium)
                Polygon({ width: 10, height: 6 })
                  .points([[0, 0], [10, 0], [5, 6]])
                  .fill('#3b64cc')
                  .margin({ left: 8 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor('#EFF6FF')
              .borderRadius(8)
              .onClick(() => {
                TextPickerDialog.show({
                  range: this.dateOptions,
                  selected: this.selectedDateIndex,
                  onAccept: (value: TextPickerResult) => {
                    this.selectedDateIndex = value.index as number;
                    this.fetchAlerts();
                  }
                })
              })
            }
            .width('100%')
          }
          .cardStyle()
          // --- 查询条件结束 ---

          // 列表部分
          if (this.elderlyList[this.selectedElderIndex]?.id === 'all') {
            ForEach(this.elderlyList.slice(1), (elder: Elderly) => {
              Column() {
                Text(`${elder.name} 的报警消息`)
                  .fontSize(18).fontWeight(FontWeight.Bold).fontColor('#666')
                  .width('100%').margin({ bottom: 12, left: 4 })
                this.renderAlertList(this.alerts.filter(a => a.elderlyId === elder.id))
              }.width('100%')
            }, (elder: Elderly) => elder.id)
          } else {
            Column() {
              Text(`${this.elderlyList[this.selectedElderIndex]?.name} 的报警消息`)
                .fontSize(18).fontWeight(FontWeight.Bold).fontColor('#666')
                .width('100%').margin({ bottom: 12, left: 4 })
              this.renderAlertList(this.alerts)
            }.width('100%')
          }
        }
        .padding({ left: 16, right: 16, bottom: 16, top: 16 })
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F4F6F9') // 淡淡的灰蓝色底色，衬托白色卡片
  }
}

@Styles function cardStyle() {
  .width('100%')
  .backgroundColor(Color.White)
  .borderRadius(24)
  .padding(20)
  .shadow({ radius: 10, color: '#05000000', offsetX: 0, offsetY: 2 })
}