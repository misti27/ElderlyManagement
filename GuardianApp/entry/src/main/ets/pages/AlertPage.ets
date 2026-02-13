
import { AlertRecord, AlertType, AlertLevel, AlertStatus, Elderly, ActivityStatus } from '../model/Types';
import { ElderlyLocal, LocationCoords, DeviceInfoLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';

@Component
export struct AlertPage {
  @State alerts: AlertRecord[] = [];
  @State elderlyList: ElderlyLocal[] = [];
  @State selectedElderIndex: number = 0;
  @State selectedDateIndex: number = 0;
  @State isLoading: boolean = false;

  // Generate date list for the last 30 days
  private dateOptions: string[] = this.generateDateList(30);

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

  async fetchElderlyList() {
    // Create "All" option first
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
      'id': 'all',
      'name': '全部长辈',
      'age': 0,
      'avatarUrl': '',
      'phone': '',
      'currentStatus': ActivityStatus.UNKNOWN,
      'currentLocation': '',
      'locationCoords': locationCoords,
      'device': device
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
      console.error('Fetch elderly list failed:', JSON.stringify(err));
      this.elderlyList = [allOption];
    }
  }

  async fetchAlerts() {
    this.isLoading = true;
    try {
      const selectedElder = this.elderlyList[this.selectedElderIndex];
      const elderlyId = selectedElder ? selectedElder.id : 'all';
      
      const selectedDateStr = this.dateOptions[this.selectedDateIndex];
      const dateStr = selectedDateStr.replace(/\//g, '-');

      let url = `/guardian/alerts?date=${dateStr}`;
      // Note: Even if 'all' is selected, we fetch all alerts.
      if (elderlyId !== 'all') {
        url += `&elderlyId=${elderlyId}`;
      }

      const result: AlertRecord[] = await HttpUtil.get<AlertRecord[]>(url);

      if (Array.isArray(result)) {
        this.alerts = result;
      } else {
        this.alerts = [];
      }
    } catch (err) {
      console.error('Fetch alerts error:', JSON.stringify(err));
      this.alerts = [];
    } finally {
      this.isLoading = false;
    }
  }

  getSeverityColor(level: AlertLevel): string {
    switch (level) {
      case AlertLevel.HIGH: return '#EF4444'; // Red
      case AlertLevel.MEDIUM: return '#F59E0B'; // Yellow
      case AlertLevel.LOW: return '#3B82F6'; // Blue
      default: return '#3B82F6';
    }
  }

  getBorderColor(alert: AlertRecord): string {
    if (alert.status === AlertStatus.RESOLVED || alert.status === AlertStatus.CONFIRMED) {
      return '#E2E8F0'; // Grey for processed
    }
    return this.getSeverityColor(alert.level);
  }

  async handleStatusUpdate(alertId: string, newStatus: AlertStatus) {
    const index = this.alerts.findIndex(a => a.id === alertId);
    if (index !== -1) {
      this.alerts[index].status = newStatus;
      this.alerts = [...this.alerts];
    }
    promptAction.showToast({ message: newStatus === AlertStatus.CONFIRMED ? '已确认' : '已处理' });
  }

  // Helper to get gradient colors based on severity
  getGradientColors(level: AlertLevel): [ResourceColor, ResourceColor] {
    switch (level) {
      case AlertLevel.HIGH: return ['#FEE2E2', '#EF4444']; // Red gradient
      case AlertLevel.MEDIUM: return ['#FEF3C7', '#F59E0B']; // Yellow gradient
      case AlertLevel.LOW: return ['#DBEAFE', '#3B82F6']; // Blue gradient
      default: return ['#DBEAFE', '#3B82F6'];
    }
  }

  @Builder
  renderAlertList(records: AlertRecord[]) {
    ForEach(records, (alert: AlertRecord) => {
      Column() {
        // 1. Type
        Row() {
          Text('报警类型：')
            .fontSize(14)
            .fontColor('#000000')
          Text(alert.type)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor('#000000')
        }
        .width('100%')
        .margin({ bottom: 4 })

        // 2. Time
        Row() {
          Text('时间：')
            .fontSize(14)
            .fontColor('#000000')
          Text(alert.time)
            .fontSize(14)
            .fontColor('#000000')
        }
        .width('100%')
        .margin({ bottom: 4 })

        // 3. Location
        Row() {
          Text('地点：')
            .fontSize(14)
            .fontColor('#000000')
          Text(alert.location)
            .fontSize(14)
            .fontColor('#000000')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
        }
        .width('100%')

        // 4. Buttons
        if (alert.status !== AlertStatus.RESOLVED) {
          Row() {
            // "Confirmed" Button Logic
            Button('已确认')
              .backgroundColor(alert.status === AlertStatus.CONFIRMED ? '#E2E8F0' : '#F0F9FF') // Grey if confirmed, else light blue
              .fontColor(alert.status === AlertStatus.CONFIRMED ? '#94A3B8' : '#000000') // Grey text if confirmed
              .fontSize(14)
              .height(32)
              .layoutWeight(1)
              .margin({ right: 8 })
              .enabled(alert.status !== AlertStatus.CONFIRMED) // Disable if already confirmed
              .onClick(() => this.handleStatusUpdate(alert.id, AlertStatus.CONFIRMED))
            
            // "Processed" Button Logic
            Button('已处理')
              .backgroundColor('#FEE2E2') // Light Red
              .fontColor('#000000')
              .fontSize(14)
              .height(32)
              .layoutWeight(1)
              .onClick(() => this.handleStatusUpdate(alert.id, AlertStatus.RESOLVED))
          }
          .width('100%')
          .margin({ top: 12 })
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor(Color.White)
      .borderRadius(12)
      .borderWidth(2)
      .borderColor(this.getBorderColor(alert))
      .shadow({ radius: 12, color: 'rgba(0, 0, 0, 0.1)', offsetX: 4, offsetY: 4 })
      .margin({ bottom: 12 })
    }, (alert: AlertRecord) => alert.id)

    if (records.length === 0) {
      Text(this.isLoading ? '加载中...' : '暂无消息')
        .fontSize(14)
        .fontColor('#999')
        .width('100%')
        .textAlign(TextAlign.Center)
        .padding(20)
    }
  }

  build() {
    Column() {
      Scroll() {
        Column({ space: 16 }) {

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
              
                // Arrow
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

          if (this.elderlyList[this.selectedElderIndex]?.id === 'all') {
            ForEach(this.elderlyList.slice(1), (elder: Elderly) => {
              Column() {
                Row() {
                  Text(`${elder.name} 的报警消息`)
                    .fontSize(20)
                    .fontWeight(FontWeight.Bold)
                }
                .width('100%')
                .margin({ bottom: 25 })
                
                this.renderAlertList(this.alerts.filter(a => a.elderlyId === elder.id))
              }
              .cardStyle()
            }, (elder: Elderly) => elder.id)
          } else if (this.elderlyList.length > this.selectedElderIndex) {
            // Single elderly view
            Column() {
              Text(`${this.elderlyList[this.selectedElderIndex]?.name} 的报警消息`)
                .fontSize(20)
                .fontWeight(FontWeight.Bold)
                .width('100%')
                .margin({ bottom: 25 })

              this.renderAlertList(this.alerts)
            }
            .cardStyle()
          }
        }
        .padding({ left: 16, right: 16, bottom: 16, top: 0 })
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F8F8')
    .justifyContent(FlexAlign.Start)
    .alignItems(HorizontalAlign.Center)
  }
}

// Reuse card style
@Styles function cardStyle() {
  .width('100%')
  .backgroundColor(Color.White)
  .borderRadius(24)
  .padding(20)
  .shadow({ radius: 10, color: '#05000000', offsetX: 0, offsetY: 2 })
}
