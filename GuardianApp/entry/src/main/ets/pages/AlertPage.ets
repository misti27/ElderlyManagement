import { AlertRecord, AlertType, AlertLevel, AlertStatus, Elderly, ActivityStatus } from '../model/Types';
import { ElderlyLocal, LocationCoords, DeviceInfoLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import { MockData } from '../utils/MockData';

interface AlertLevelStyle {
  color: string;
  bgColor: string;
  tag: string;
}

// 预计算每位长辈的过滤后报警，供 build() 直接使用
interface ElderAlerts {
  elderId: string;
  elderName: string;
  alerts: AlertRecord[];
}

@Component
export struct AlertPage {
  @State alerts: AlertRecord[] = [];
  @State elderlyList: ElderlyLocal[] = [];
  @State selectedElderIndex: number = 0;
  @State selectedDateIndex: number = 0;
  @State isLoading: boolean = false;
  @State elderAlertList: ElderAlerts[] = [];  // 全部长辈视图：每人的未处理报警
  @State singleAlerts: AlertRecord[] = [];   // 单人视图：该长辈全部报警
  @State hasUnprocessed: boolean = false;    // 全部长辈视图是否有未处理报警

  private isGuest: boolean = false;
  // 日期选项：guest 模式下会被 mock 实际日期覆盖
  private dateOptions: string[] = ['全部时间', ...this.generateDateList(30)];

  aboutToAppear() {
    const guest = AppStorage.Get('isGuest') as boolean | undefined;
    this.isGuest = guest === true;
    if (this.isGuest) {
      this.loadMockData();
    } else {
      this.fetchElderlyList();
      this.fetchAlerts();
    }
  }

  loadMockData() {
    // 长辈列表
    const allOptionData: Record<string, Object> = {
      'id': 'all', 'name': '全部长辈', 'age': 0, 'avatarUrl': '', 'phone': '',
      'currentStatus': ActivityStatus.UNKNOWN, 'currentLocation': '',
      'locationCoords': new LocationCoords(), 'device': new DeviceInfoLocal()
    };
    const allOption = new ElderlyLocal(allOptionData);
    const mockElders = MockData.elderlyList.map(item => new ElderlyLocal(item));
    this.elderlyList = [allOption, ...mockElders];

    // 从 MockData 提取实际存在的报警日期，构建日期选项
    const dateSet = new Set<string>();
    for (const a of MockData.alerts) {
      // alert.time 格式 "YYYY-MM-DD HH:MM"，取日期部分
      const datePart = a.time.split(' ')[0];
      if (datePart) dateSet.add(datePart);
    }
    const sortedDates: string[] = [];
    dateSet.forEach(d => sortedDates.push(d));
    sortedDates.sort((a, b) => b.localeCompare(a));
    this.dateOptions = ['全部时间', ...sortedDates.map(d => d.replace(/-/g, '/'))];
    this.selectedDateIndex = 0;

    this.alerts = MockData.alerts;
    this.recomputeAlerts();
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
    const locationCoords = new LocationCoords();
    const device = new DeviceInfoLocal();
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
      this.recomputeAlerts();
    }
  }

  // 每次 alerts / selectedElderIndex / selectedDateIndex 变化后调用
  recomputeAlerts() {
    const isAll = this.elderlyList[this.selectedElderIndex]?.id === 'all';
    if (isAll) {
      const list: ElderAlerts[] = [];
      for (let i = 1; i < this.elderlyList.length; i++) {
        const elder = this.elderlyList[i];
        const filtered = this.getFilteredAlerts(elder.id);
        list.push({ elderId: elder.id, elderName: elder.name, alerts: filtered });
      }
      this.elderAlertList = list;
      this.hasUnprocessed = list.some(e => e.alerts.length > 0);
      this.singleAlerts = [];
    } else {
      const currentId = this.elderlyList[this.selectedElderIndex]?.id || '';
      this.singleAlerts = this.getFilteredAlerts(currentId);
      this.elderAlertList = [];
      this.hasUnprocessed = false;
    }
  }

  // ── 核心：根据当前选择条件过滤要显示的报警 ──
  // 规则：
  //   - 默认（全部长辈）：只显示未处理（UNPROCESSED）的报警
  //   - 选了具体长辈：显示该长辈全部状态的报警
  //   - 选了日期：额外按日期过滤（time 字段前10位）
  getFilteredAlerts(forElderId: string): AlertRecord[] {
    const isAll = this.elderlyList[this.selectedElderIndex]?.id === 'all';
    const selectedDateStr = this.dateOptions[this.selectedDateIndex];

    return this.alerts.filter((a: AlertRecord) => {
      // 1. 长辈过滤
      const elderMatch = (forElderId === 'all') || (a.elderlyId === forElderId);
      if (!elderMatch) return false;

      // 2. 状态过滤：全部长辈视图只看未处理；选了具体长辈则全部显示
      if (isAll && a.status === AlertStatus.RESOLVED) return false;

      // 3. 日期过滤（选了具体日期时生效）
      if (selectedDateStr !== '全部时间') {
        const dateStr = selectedDateStr.replace(/\//g, '-');
        if (!a.time.startsWith(dateStr)) return false;
      }

      return true;
    });
  }

  // ── 确认/解除：本地更新 + 同步后端 ──
  async handleStatusUpdate(alertId: string, newStatus: AlertStatus) {
    // 1. 乐观更新本地状态（先刷新 UI）
    const idx = this.alerts.findIndex(a => a.id === alertId);
    if (idx !== -1) {
      this.alerts[idx].status = newStatus;
      this.alerts = [...this.alerts]; // 触发响应式刷新
    }

    const statusLabel = newStatus === AlertStatus.CONFIRMED ? '已确认' : '已解除';
    promptAction.showToast({ message: statusLabel });

    // 2. guest 模式不调后端
    if (this.isGuest) return;

    // 3. 同步到后端
    try {
      await HttpUtil.put(`/guardian/alerts/${alertId}`, { status: newStatus });
    } catch (err) {
      console.error('Update alert status failed:', JSON.stringify(err));
      // 回滚本地状态
      const rollbackStatus = newStatus === AlertStatus.CONFIRMED
        ? AlertStatus.UNPROCESSED
        : AlertStatus.CONFIRMED;
      const rollbackIdx = this.alerts.findIndex(a => a.id === alertId);
      if (rollbackIdx !== -1) {
        this.alerts[rollbackIdx].status = rollbackStatus;
        this.alerts = [...this.alerts];
      }
      promptAction.showToast({ message: '操作失败，请重试' });
    }
  }

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
  renderAlertList(records: AlertRecord[], emptyHint: string) {
    if (records.length === 0) {
      Text(this.isLoading ? '加载中...' : emptyHint)
        .fontSize(14).fontColor('#999')
        .width('100%').textAlign(TextAlign.Center)
        .padding({ top: 20, bottom: 20 })
    } else {
      ForEach(records, (alert: AlertRecord) => {
        Column() {
          // 第一行：类型 + 等级标签
          Row() {
            Text(alert.type)
              .fontSize(20).fontWeight(FontWeight.Bold).fontColor('#1A1A1A')
            Blank()
            Text(this.getLevelStyles(alert.level).tag)
              .fontSize(12).fontWeight(FontWeight.Medium)
              .fontColor(this.getLevelStyles(alert.level).color)
              .backgroundColor(this.getLevelStyles(alert.level).bgColor)
              .padding({ left: 10, right: 10, top: 4, bottom: 4 })
              .borderRadius(6)
          }.width('100%').margin({ bottom: 6 })

          // 第二行：时间
          Text(alert.time)
            .fontSize(13).fontColor('#999')
            .width('100%').margin({ bottom: 12 })

          // 第三行：位置
          Row() {
            Circle({ width: 6, height: 6 })
              .fill(this.getLevelStyles(alert.level).color)
              .margin({ right: 8 })
            Text(alert.location)
              .fontSize(14).fontColor('#555')
              .layoutWeight(1).maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
          }
          .width('100%').padding(10)
          .backgroundColor('#F7F8FA').borderRadius(8)
          .margin({ bottom: 16 })

          // 第四行：操作按钮 / 已处理标记
          if (alert.status !== AlertStatus.RESOLVED) {
            Row({ space: 12 }) {
              Button('确认收到')
                .layoutWeight(1).height(38).fontSize(14)
                .fontColor(alert.status === AlertStatus.CONFIRMED ? '#BBBBBB' : '#555')
                .backgroundColor(alert.status === AlertStatus.CONFIRMED ? '#F5F5F5' : '#FFFFFF')
                .borderWidth(alert.status === AlertStatus.CONFIRMED ? 0 : 1)
                .borderColor('#E8E8E8').borderRadius(19)
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
        .width('100%').padding(16)
        .backgroundColor(Color.White).borderRadius(16)
        .margin({ bottom: 12 })
        .shadow({ radius: 12, color: '#0A000000', offsetY: 6 })
        .border({ width: { left: 4 }, color: this.getLevelStyles(alert.level).color })
      }, (alert: AlertRecord) => alert.id)
    }
  }

  build() {
    Column() {
      Scroll() {
        Column({ space: 16 }) {
          // --- 查询条件卡片 ---
          Column() {
            Text('查询条件')
              .fontSize(22).fontWeight(FontWeight.Bold)
              .width('100%').margin({ bottom: 20 })

            Row() {
              Text('选择长辈').fontSize(17).fontColor('#333')
              Blank()
              Row() {
                Text(this.elderlyList[this.selectedElderIndex]?.name || '请选择')
                  .fontSize(17).fontColor('#3b64cc').fontWeight(FontWeight.Medium)
                Polygon({ width: 10, height: 6 })
                  .points([[0, 0], [10, 0], [5, 6]])
                  .fill('#3b64cc').margin({ left: 8 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor('#EFF6FF').borderRadius(8)
              .onClick(() => {
                if (this.elderlyList.length === 0) return;
                TextPickerDialog.show({
                  range: this.elderlyList.map(e => e.name),
                  selected: this.selectedElderIndex,
                  onAccept: (value: TextPickerResult) => {
                    this.selectedElderIndex = value.index as number;
                    if (this.isGuest) this.recomputeAlerts();
                    else this.fetchAlerts();
                  }
                });
              })
            }
            .width('100%').margin({ bottom: 16 })

            Row() {
              Text('选择日期').fontSize(17).fontColor('#333')
              Blank()
              Row() {
                Text(this.dateOptions[this.selectedDateIndex])
                  .fontSize(17).fontColor('#3b64cc').fontWeight(FontWeight.Medium)
                Polygon({ width: 10, height: 6 })
                  .points([[0, 0], [10, 0], [5, 6]])
                  .fill('#3b64cc').margin({ left: 8 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor('#EFF6FF').borderRadius(8)
              .onClick(() => {
                TextPickerDialog.show({
                  range: this.dateOptions,
                  selected: this.selectedDateIndex,
                  onAccept: (value: TextPickerResult) => {
                    this.selectedDateIndex = value.index as number;
                    if (this.isGuest) this.recomputeAlerts();
                    else this.fetchAlerts();
                  }
                });
              })
            }
            .width('100%')
          }
          .cardStyle()

          // --- 报警列表（全部使用预计算的 @State，build() 内零逻辑）---
          if (this.elderlyList[this.selectedElderIndex]?.id === 'all') {
            // 全部长辈：只显示有未处理报警的人
            ForEach(this.elderAlertList, (ea: ElderAlerts) => {
              if (ea.alerts.length > 0) {
                Column() {
                  Text(`${ea.elderName} 的待处理报警`)
                    .fontSize(17).fontWeight(FontWeight.Bold).fontColor('#666')
                    .width('100%').margin({ bottom: 12 })
                  this.renderAlertList(ea.alerts, '无未处理的报警')
                }.width('100%')
              }
            }, (ea: ElderAlerts) => ea.elderId)

            // 全部无未处理报警时的空状态
            if (!this.hasUnprocessed) {
              Column() {
                Text(this.isLoading ? '加载中...' : '✓ 暂无未处理的报警')
                  .fontSize(15).fontColor('#52C41A').fontWeight(FontWeight.Medium)
                  .width('100%').textAlign(TextAlign.Center)
                  .padding({ top: 32, bottom: 32 })
              }
              .width('100%').backgroundColor(Color.White)
              .borderRadius(16).padding(20)
              .shadow({ radius: 10, color: '#05000000', offsetY: 2 })
            }
          } else {
            // 选了具体长辈：显示该长辈全部报警
            Column() {
              Text(`${this.elderlyList[this.selectedElderIndex]?.name} 的全部报警`)
                .fontSize(17).fontWeight(FontWeight.Bold).fontColor('#666')
                .width('100%').margin({ bottom: 12 })
              this.renderAlertList(this.singleAlerts, '暂无报警记录')
            }.width('100%')
          }
        }
        .padding({ left: 16, right: 16, bottom: 16, top: 16 })
      }
      .width('100%').layoutWeight(1)
    }
    .width('100%').height('100%')
    .backgroundColor('#F8FAFC')
  }
}

@Styles function cardStyle() {
  .width('100%')
  .backgroundColor(Color.White)
  .borderRadius(24)
  .padding(20)
  .shadow({ radius: 10, color: '#05000000', offsetX: 0, offsetY: 2 })
}
