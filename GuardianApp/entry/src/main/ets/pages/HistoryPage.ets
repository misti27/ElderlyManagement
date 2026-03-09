import { HistoryRecord, ActivityStatus, Elderly } from '../model/Types';
import { ElderlyLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import { getActivityColor } from '../utils/ColorUtil';
import { MockData } from '../utils/MockData';

interface MergedRecord {
  startTime: string;
  endTime: string;
  status: string;
  durationMinutes: number;
}

interface StatusSummary {
  status: string;
  totalMinutes: number;
}

// 时间段分组
interface TimeGroup {
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  segments: MergedRecord[];
  totalMinutes: number;
  dominantStatus: string;
  uniqueStatuses: string[]; // 预计算去重状态列表，供 @Builder 直接使用
}

interface ElderComputedData {
  elderId: string;
  elderName: string;
  merged: MergedRecord[];
  summary: StatusSummary[];
  groups: TimeGroup[];
}

// 时间段定义接口
interface TimePeriodDef {
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
}

// 六个固定时间段定义
const TIME_PERIODS: TimePeriodDef[] = [
  { label: '凌晨', timeRange: '00:00-06:00', startHour: 0,  endHour: 6  } as TimePeriodDef,
  { label: '早晨', timeRange: '06:00-09:00', startHour: 6,  endHour: 9  } as TimePeriodDef,
  { label: '上午', timeRange: '09:00-12:00', startHour: 9,  endHour: 12 } as TimePeriodDef,
  { label: '下午', timeRange: '12:00-17:00', startHour: 12, endHour: 17 } as TimePeriodDef,
  { label: '傍晚', timeRange: '17:00-20:00', startHour: 17, endHour: 20 } as TimePeriodDef,
  { label: '夜间', timeRange: '20:00-24:00', startHour: 20, endHour: 24 } as TimePeriodDef,
];

@Component
export struct HistoryPage {
  @State selectedElderIndex: number = 0;
  @State selectedDateIndex: number = 0;
  @State records: HistoryRecord[] = [];
  @State elderlyList: Elderly[] = [{
    id: 'all',
    name: '全部长辈',
    age: 0,
    avatarUrl: '',
    phone: '',
    currentStatus: ActivityStatus.UNKNOWN,
    currentLocation: '',
    locationCoords: { latitude: 0, longitude: 0 },
    device: { deviceId: '', name: '', batteryLevel: 0, isOnline: false, lastOnlineTime: '' }
  }];
  @State isLoading: boolean = false;

  @State singleMerged: MergedRecord[] = [];
  @State singleSummary: StatusSummary[] = [];
  @State singleGroups: TimeGroup[] = [];
  @State allElderData: ElderComputedData[] = [];

  // 用字符串 key 记录已展开的分组，格式："{elderId}_{groupLabel}" 或 "single_{groupLabel}"
  @State expandedKeys: string[] = [];

  private dateOptions: string[] = this.generateDateList(30);
  private isGuest: boolean = false;
  // guest 模式下从 MockData 提取实际存在的日期（去重排序）
  private guestDateOptions: string[] = [];

  aboutToAppear() {
    const guest = AppStorage.Get('isGuest') as boolean | undefined;
    this.isGuest = guest === true;
    if (this.isGuest) {
      this.loadMockElders();
      this.fetchHistory('all');
    } else {
      this.fetchElderlyList().then(() => {
        const elderId = this.elderlyList[this.selectedElderIndex]?.id || 'all';
        this.fetchHistory(elderId);
      });
    }
  }

  // 仅加载长辈列表（guest 模式），同时提取可用日期
  loadMockElders() {
    const allOption = this.elderlyList[0];
    const mockElders = MockData.elderlyList.map(item => new ElderlyLocal(item));
    this.elderlyList = [allOption, ...mockElders];

    // 从 MockData 提取所有日期，去重倒序排列（最新在前）
    const dateSet = new Set<string>();
    for (const r of MockData.history) {
      if (r.date) dateSet.add(r.date);
    }
    const sortedDates: string[] = [];
    dateSet.forEach(d => sortedDates.push(d));
    sortedDates.sort((a, b) => b.localeCompare(a));
    // 转为 YYYY/MM/DD 格式与 dateOptions 一致
    this.guestDateOptions = sortedDates.map(d => d.replace(/-/g, '/'));
    // 覆盖 dateOptions 指向 mock 实际日期，默认选第一个（最新）
    this.dateOptions = this.guestDateOptions.length > 0
      ? this.guestDateOptions
      : this.generateDateList(30);
    this.selectedDateIndex = 0;
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
    this.isLoading = true;
    try {
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');
      if (Array.isArray(result)) {
        const allOption = this.elderlyList[0];
        const elders = result.map((item: Object): ElderlyLocal => new ElderlyLocal(item));
        this.elderlyList = [allOption, ...elders];
      }
    } catch (err) {
      console.error('Fetch elderly list failed:', JSON.stringify(err));
    } finally {
      this.isLoading = false;
    }
  }

  async fetchHistory(elderlyId: string) {
    const selectedDateStr = this.dateOptions[this.selectedDateIndex];
    const dateStr = selectedDateStr.replace(/\//g, '-'); // YYYY-MM-DD

    if (this.isGuest) {
      // Guest 模式：从 MockData 按日期 + 长辈 ID 过滤
      this.records = MockData.history.filter((r: HistoryRecord) => {
        const dateMatch = (r.date === dateStr);
        const elderMatch = (elderlyId === 'all') || (r.elderlyId === elderlyId);
        return dateMatch && elderMatch;
      });
      this.recomputeDisplayData();
      return;
    }

    try {
      const url = `/stats/history/${elderlyId}?date=${dateStr}`;
      const result: HistoryRecord[] = await HttpUtil.get<HistoryRecord[]>(url);
      this.records = Array.isArray(result) ? result : [];
    } catch (err) {
      console.error('Fetch history failed:', JSON.stringify(err));
      this.records = [];
    } finally {
      this.recomputeDisplayData();
    }
  }

  recomputeDisplayData() {
    // 切换数据时收起所有分组
    this.expandedKeys = [];

    const isAll = this.elderlyList[this.selectedElderIndex]?.id === 'all';
    if (isAll) {
      const computed: ElderComputedData[] = [];
      for (let i = 1; i < this.elderlyList.length; i++) {
        const elder = this.elderlyList[i];
        const filtered = this.records.filter(r => r.elderlyId === elder.id);
        const merged = this.mergeRecords(filtered);
        const summary = this.summarizeRecords(merged);
        const groups = this.buildGroups(merged);
        computed.push({ elderId: elder.id, elderName: elder.name, merged, summary, groups });
      }
      this.allElderData = computed;
      this.singleMerged = [];
      this.singleSummary = [];
      this.singleGroups = [];
    } else {
      const merged = this.mergeRecords(this.records);
      const summary = this.summarizeRecords(merged);
      const groups = this.buildGroups(merged);
      this.singleMerged = merged;
      this.singleSummary = summary;
      this.singleGroups = groups;
      this.allElderData = [];
    }
  }

  // 将合并段按五个时间段分桶
  buildGroups(merged: MergedRecord[]): TimeGroup[] {
    const groups: TimeGroup[] = [];
    for (const period of TIME_PERIODS as TimePeriodDef[]) {
      const segs = merged.filter(seg => {
        const h = parseInt(seg.startTime.split(':')[0]);
        return h >= period.startHour && h < period.endHour;
      });
      if (segs.length === 0) continue;

      const totalMinutes = segs.reduce((acc, s) => acc + s.durationMinutes, 0);

      // 找占时最长的状态
      const statusMap = new Map<string, number>();
      for (const s of segs) {
        statusMap.set(s.status, (statusMap.get(s.status) || 0) + s.durationMinutes);
      }
      let dominantStatus = segs[0].status;
      let maxMin = 0;
      statusMap.forEach((min, st) => {
        if (min > maxMin) { maxMin = min; dominantStatus = st; }
      });

      // 预计算去重状态列表（最多4个）
      const seen: string[] = [];
      for (const s of segs) {
        if (seen.indexOf(s.status) < 0) seen.push(s.status);
        if (seen.length >= 4) break;
      }

      groups.push({
        label: period.label,
        timeRange: period.timeRange,
        startHour: period.startHour,
        endHour: period.endHour,
        segments: segs,
        totalMinutes,
        dominantStatus,
        uniqueStatuses: seen
      });
    }
    return groups;
  }

  // 展开/收起某个分组
  toggleGroup(key: string) {
    const idx = this.expandedKeys.indexOf(key);
    if (idx >= 0) {
      const next = [...this.expandedKeys];
      next.splice(idx, 1);
      this.expandedKeys = next;
    } else {
      this.expandedKeys = [...this.expandedKeys, key];
    }
  }

  isExpanded(key: string): boolean {
    return this.expandedKeys.indexOf(key) >= 0;
  }

  get selectedElder(): Elderly | undefined {
    return this.elderlyList[this.selectedElderIndex];
  }

  timeToMinutes(time: string): number {
    const parts = time.split(':');
    const h = parseInt(parts[0] || '0');
    const m = parseInt(parts[1] || '0');
    return h * 60 + m;
  }

  durationBetween(start: string, end: string): number {
    return Math.max(0, this.timeToMinutes(end) - this.timeToMinutes(start));
  }

  formatDuration(minutes: number): string {
    if (minutes < 1) return '< 1分钟';
    if (minutes < 60) return `${minutes}分钟`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
  }

  mergeRecords(records: HistoryRecord[]): MergedRecord[] {
    if (records.length === 0) return [];
    const merged: MergedRecord[] = [];
    let curStatus = records[0].status;
    let curStart = records[0].startTime;
    let curEnd = records[0].endTime;
    for (let i = 1; i < records.length; i++) {
      const r = records[i];
      if (r.status === curStatus) {
        curEnd = r.endTime;
      } else {
        merged.push({ startTime: curStart, endTime: curEnd, status: curStatus, durationMinutes: this.durationBetween(curStart, curEnd) });
        curStatus = r.status;
        curStart = r.startTime;
        curEnd = r.endTime;
      }
    }
    merged.push({ startTime: curStart, endTime: curEnd, status: curStatus, durationMinutes: this.durationBetween(curStart, curEnd) });
    return merged;
  }

  summarizeRecords(merged: MergedRecord[]): StatusSummary[] {
    const map = new Map<string, number>();
    for (const r of merged) {
      map.set(r.status, (map.get(r.status) || 0) + r.durationMinutes);
    }
    const result: StatusSummary[] = [];
    map.forEach((minutes, status) => result.push({ status, totalMinutes: minutes }));
    result.sort((a, b) => b.totalMinutes - a.totalMinutes);
    return result;
  }

  build() {
    Column() {
      Scroll() {
        Column({ space: 16 }) {
          // --- 1. 查询条件卡片 ---
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
                    const elder = this.elderlyList[this.selectedElderIndex];
                    if (elder) this.fetchHistory(elder.id);
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
                    if (this.selectedElder) this.fetchHistory(this.selectedElder.id);
                  }
                });
              })
            }
            .width('100%')
          }
          .cardStyle()

          // --- 2. 记录卡片区域 ---
          if (this.elderlyList[this.selectedElderIndex]?.id === 'all') {
            ForEach(this.allElderData, (data: ElderComputedData) => {
              Column() {
                Text(`${data.elderName} 的活动记录`)
                  .fontSize(20).fontWeight(FontWeight.Bold)
                  .width('100%').margin({ bottom: 16 })
                this.RecordContent(data.merged, data.summary, data.groups, data.elderId)
              }
              .cardStyle().margin({ bottom: 16 })
            }, (data: ElderComputedData) => data.elderId)
          } else {
            Column() {
              Text(`${this.elderlyList[this.selectedElderIndex]?.name} 的活动记录`)
                .fontSize(20).fontWeight(FontWeight.Bold)
                .width('100%').margin({ bottom: 16 })
              this.RecordContent(this.singleMerged, this.singleSummary, this.singleGroups, 'single')
            }
            .cardStyle()
          }
        }
        .padding(16)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
    .justifyContent(FlexAlign.Start)
    .alignItems(HorizontalAlign.Center)
  }

  @Builder
  RecordContent(merged: MergedRecord[], summary: StatusSummary[], groups: TimeGroup[], elderId: string) {
    if (merged.length === 0) {
      Text(this.isLoading ? '加载中...' : '暂无记录')
        .fontSize(15).fontColor('#999')
        .width('100%').textAlign(TextAlign.Center)
        .padding({ top: 24, bottom: 24 })
    } else {
      // ---- 今日汇总 ----
      Column() {
        Text('今日汇总')
          .fontSize(14).fontColor('#999')
          .width('100%').margin({ bottom: 10 })
        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(summary, (s: StatusSummary) => {
            Row() {
              Row()
                .width(8).height(8).borderRadius(4)
                .backgroundColor(getActivityColor(s.status))
                .margin({ right: 6 })
              Text(s.status)
                .fontSize(14).fontColor('#333').fontWeight(FontWeight.Medium)
              Text(`  ${this.formatDuration(s.totalMinutes)}`)
                .fontSize(13).fontColor('#888')
            }
            .margin({ right: 16, bottom: 8 })
            .alignItems(VerticalAlign.Center)
          }, (s: StatusSummary) => s.status)
        }
        .width('100%')
      }
      .width('100%')
      .padding({ top: 12, bottom: 12 })
      .margin({ bottom: 4 })
      .backgroundColor('#F8FAFC')
      .borderRadius(12)

      // ---- 全天时间轴色带 ----
      Column() {
        Text('全天时间轴')
          .fontSize(14).fontColor('#999')
          .width('100%').margin({ bottom: 10 })
        Row() {
          ForEach(merged, (seg: MergedRecord) => {
            Row()
              .height(18)
              .layoutWeight(Math.max(seg.durationMinutes, 1))
              .backgroundColor(getActivityColor(seg.status))
          }, (seg: MergedRecord) => `${seg.startTime}-${seg.status}`)
        }
        .width('100%').borderRadius(6)

        Row() {
          Text('00:00').fontSize(11).fontColor('#BBB')
          Blank()
          Text('06:00').fontSize(11).fontColor('#BBB')
          Blank()
          Text('12:00').fontSize(11).fontColor('#BBB')
          Blank()
          Text('18:00').fontSize(11).fontColor('#BBB')
          Blank()
          Text('24:00').fontSize(11).fontColor('#BBB')
        }
        .width('100%').margin({ top: 4 })
      }
      .width('100%')
      .padding({ top: 14, bottom: 14 })
      .margin({ bottom: 4 })
      .backgroundColor('#F8FAFC')
      .borderRadius(12)

      // ---- 分割线 ----
      Divider().color('#EEEEEE').strokeWidth(1).margin({ top: 4, bottom: 16 })

      // ---- 按时间段分组的活动明细 ----
      Text('活动明细')
        .fontSize(14).fontColor('#999')
        .width('100%').margin({ bottom: 10 })

      ForEach(groups, (group: TimeGroup, idx: number) => {
        this.GroupSection(group, elderId, idx, groups.length)
      }, (group: TimeGroup) => `${elderId}_${group.label}`)
    }
  }

  // 单个时间段：折叠头 + 可展开的段列表
  @Builder
  GroupSection(group: TimeGroup, elderId: string, idx: number = 0, total: number = 1) {
    Column() {
      // ── 折叠头 ──
      Row() {
        // 左侧色块
        Row()
          .width(4).height(36)
          .backgroundColor(getActivityColor(group.dominantStatus))
          .borderRadius(2)
          .margin({ right: 12 })

        // 标题：时段名 + 紧跟时间范围
        Text(group.label)
          .fontSize(16).fontWeight(FontWeight.Bold).fontColor('#1E293B')
          .margin({ right: 6 })
        Text(group.timeRange)
          .fontSize(12).fontColor('#999')

        Blank()

        // 右侧：状态色点 + 段数 + 箭头
        Row() {
          ForEach(group.uniqueStatuses, (st: string) => {
            Row()
              .width(8).height(8).borderRadius(4)
              .backgroundColor(getActivityColor(st))
              .margin({ right: 4 })
          }, (st: string) => `${elderId}_${group.label}_dot_${st}`)

          Text(`${group.segments.length}段`)
            .fontSize(13).fontColor('#888').margin({ left: 4, right: 8 })

          Text(this.isExpanded(`${elderId}_${group.label}`) ? '▲' : '▼')
            .fontSize(11).fontColor('#AAAAAA')
        }
        .alignItems(VerticalAlign.Center)
      }
      .width('100%')
      .padding({ top: 10, bottom: 10 })
      .alignItems(VerticalAlign.Center)
      .onClick(() => { this.toggleGroup(`${elderId}_${group.label}`); })

      // ── 展开内容 ──
      if (this.isExpanded(`${elderId}_${group.label}`)) {
        Column() {
          ForEach(group.segments, (seg: MergedRecord, idx: number) => {
            Row() {
              // 时间范围 HH:MM – HH:MM
              Text(`${seg.startTime.substring(0, 5)} – ${seg.endTime.substring(0, 5)}`)
                .fontSize(14).fontColor('#555')
              // 时长紧跟时间范围右侧
              Text(this.formatDuration(seg.durationMinutes))
                .fontSize(12).fontColor('#AAAAAA').margin({ left: 8 })
              Blank()
              // 状态靠右
              Text(seg.status)
                .fontSize(15).fontWeight(FontWeight.Bold)
                .fontColor(getActivityColor(seg.status))
            }
            .width('100%')
            .padding({ top: 10, bottom: 10, left: 16, right: 16 })
            .alignItems(VerticalAlign.Center)

            if (idx < group.segments.length - 1) {
              Divider().color('#F5F5F5').strokeWidth(1).margin({ left: 16, right: 16 })
            }
          }, (seg: MergedRecord) => `${elderId}_${group.label}_${seg.startTime}`)
        }
        .width('100%')
        .backgroundColor('#FAFAFA')
        .borderRadius(8)
        .margin({ bottom: 14 })
      }
    }
    .width('100%')

    if (idx < total - 1) {
      Divider().color('#F0F0F0').strokeWidth(1)
    }
  }}

@Styles function cardStyle() {
  .width('100%')
  .backgroundColor(Color.White)
  .borderRadius(24)
  .padding(20)
  .shadow({ radius: 10, color: '#05000000', offsetX: 0, offsetY: 2 })
}
