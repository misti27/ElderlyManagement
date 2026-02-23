
import { HistoryRecord, ActivityStatus, Elderly } from '../model/Types';
import { ElderlyLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import { getActivityColor } from '../utils/ColorUtil';
import { MockData } from '../utils/MockData'; // 引入模拟数据

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
  @State debugInfo: string = '';
  
  // 生成最近30天的日期列表
  private dateOptions: string[] = this.generateDateList(30);

  aboutToAppear() {
    const isGuest = AppStorage.Get('isGuest') as boolean | undefined;
    if (isGuest) {
      this.loadMockData();
    } else {
      this.fetchElderlyList().then(() => {
        // 默认加载选中日期（即今天）的数据
        const elderId = this.elderlyList[this.selectedElderIndex]?.id || 'all';
        this.fetchHistory(elderId);
      });
    }
  }

  loadMockData() {
    console.info('Loading mock data for HistoryPage...');
    // 1. 加载模拟的长辈列表
    const allOption = this.elderlyList[0]; // Keep '全部长辈'
    const mockElders = MockData.elderlyList.map(item => new ElderlyLocal(item));
    this.elderlyList = [allOption, ...mockElders];

    // 2. 加载模拟的历史记录
    // Here we can load all mock history records, the UI will filter them
    this.records = MockData.history;

    promptAction.showToast({ message: '已加载模拟历史数据' });
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
    this.debugInfo = `Connecting to server...`;
    
    try {
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');

      this.debugInfo += `\nStatus: Success`;

      if (Array.isArray(result)) {
        const allOption = this.elderlyList[0];
        const elders = result.map((item: Object): ElderlyLocal => new ElderlyLocal(item));
        
        this.elderlyList = [allOption, ...elders];
        this.debugInfo += `\nLoaded ${this.elderlyList.length} elders`;
      } else {
        this.debugInfo += `\nFailed to load elders`;
      }
    } catch (err) {
      this.debugInfo += `\nError: ${JSON.stringify(err)}`;
      console.error('Fetch elderly list failed:', JSON.stringify(err));
    } finally {
      this.isLoading = false;
    }
  }

  async fetchHistory(elderlyId: string) {
    // 获取当前选中的日期字符串 (YYYY/MM/DD)
    const selectedDateStr = this.dateOptions[this.selectedDateIndex];
    // 转换为后端需要的 YYYY-MM-DD
    const dateStr = selectedDateStr.replace(/\//g, '-');
    
    this.debugInfo = `Fetching history for ${elderlyId} on ${dateStr}...`;

    try {
      const url = `/stats/history/${elderlyId}?date=${dateStr}`;
      
      this.debugInfo += `\nRequesting: ${url}`;

      const result: HistoryRecord[] = await HttpUtil.get<HistoryRecord[]>(url);

      if (Array.isArray(result)) {
        this.records = result;
        this.debugInfo += `\nSuccess: ${this.records.length} records found`;
      } else {
        this.records = [];
        this.debugInfo += `\nFailed: Invalid response`;
      }
    } catch (err) {
      this.debugInfo += `\nNetwork Error: ${JSON.stringify(err)}`;
      console.error('Fetch history failed:', JSON.stringify(err));
      this.records = [];
    } finally {
      // this.isLoading = false; // fetchHistory is not blocking UI with spinner currently
    }
  }
  
  // 获取当前选中的老人
  get selectedElder(): Elderly | undefined {
    if (this.elderlyList && this.elderlyList.length > this.selectedElderIndex) {
      return this.elderlyList[this.selectedElderIndex];
    }
    return undefined;
  }

  build() {
    Column() {
      // 如果正在加载且没有数据，显示加载中（可选，这里直接让它渲染结构）

      Scroll() {
        Column({ space: 16 }) {
          // --- 1. 查询条件卡片 ---
          Column() {
            Text('查询条件')
              .fontSize(20)
              .fontWeight(FontWeight.Bold)
              .width('100%')
              .margin({ bottom: 20 })

            // 选择长辈
            Row() {
              Text('选择长辈')
                .fontSize(16)
                .fontColor('#333')
              Blank()
              
              // 模拟下拉选择器
              Row() {
                Text(this.elderlyList[this.selectedElderIndex]?.name || '请选择')
                  .fontSize(16)
                  .fontColor('#3b64cc')
                  .fontWeight(FontWeight.Medium)
              
                // 下拉箭头模拟
                Polygon({ width: 10, height: 6 })
                  .points([[0, 0], [10, 0], [5, 6]])
                  .fill('#3b64cc')
                  .margin({ left: 8 })
              }
              .padding({ left: 12, right: 12, top: 8, bottom: 8 })
              .backgroundColor('#EFF6FF')
              .borderRadius(8)
              .onClick(() => {
                if (this.elderlyList.length === 0) {
                  this.debugInfo += '\nList empty, cannot pick';
                  return;
                }

                TextPickerDialog.show({
                  range: this.elderlyList.map(e => e.name),
                  selected: this.selectedElderIndex,
                  onAccept: (value: TextPickerResult) => {
                    console.info('Selected index:', value.index);
                    this.selectedElderIndex = value.index as number;
                    this.debugInfo += `\nSelected: ${value.index} - ${this.elderlyList[this.selectedElderIndex]?.name}`;
                    
                    const elder = this.elderlyList[this.selectedElderIndex];
                    if (elder) {
                      this.fetchHistory(elder.id);
                    }
                  }
                })
              })
            }
            .width('100%')
            .margin({ bottom: 20 })

            // 选择日期
            Row() {
              Text('选择日期')
                .fontSize(16)
                .fontColor('#333')
              Blank()
              
              // 模拟下拉选择器
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
                    if (this.selectedElder) {
                      this.fetchHistory(this.selectedElder.id);
                    }
                  }
                })
              })
            }
            .width('100%')
          }
          .cardStyle()

          // --- 2. 运动记录卡片区域 ---
          
          // 情况A：选中了“全部长辈” -> 渲染多个卡片（每人一个）
          if (this.elderlyList[this.selectedElderIndex]?.id === 'all') {
            ForEach(this.elderlyList.slice(1), (elder: Elderly) => {
               Column() {
                 Text(`${elder.name} 的活动记录`)
                   .fontSize(20)
                   .fontWeight(FontWeight.Bold)
                   .width('100%')
                   .margin({ bottom: 25 })
                   
                 // 筛选出该长辈的记录
                 this.renderRecordList(this.records.filter(r => r.elderlyId === elder.id))
               }
               .cardStyle()
               .margin({ bottom: 16 })
            }, (elder: Elderly) => elder.id)
          } 
          // 情况B：选中了单个长辈 -> 渲染单个卡片
          else if (this.elderlyList.length > this.selectedElderIndex) {
            Column() {
              Text(`${this.elderlyList[this.selectedElderIndex]?.name} 的活动记录`)
                .fontSize(20)
                .fontWeight(FontWeight.Bold)
                .width('100%')
                .margin({ bottom: 25 })

              this.renderRecordList(this.records)
            }
            .cardStyle()
          }
        }
        .padding(16)
      }

      // if (this.debugInfo) {
      //   Text(this.debugInfo)
      //     .fontSize(10)
      //     .fontColor('#666')
      //     .width('100%')
      //     .padding(10)
      //     .backgroundColor('#eee')
      // }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8F8F8')
    .justifyContent(FlexAlign.Start)
    .alignItems(HorizontalAlign.Center)
  }

  // 提取列表渲染逻辑，复用代码
  @Builder
  renderRecordList(records: HistoryRecord[]) {
      // 循环渲染记录列表
      ForEach(records, (item: HistoryRecord) => {
        Row() {
          Column() {
            // 显示 Start - End 时间段
            Text(`${item.startTime} - ${item.endTime}`) 
              .fontSize(16)
              .fontColor('#999')
          }
          .alignItems(HorizontalAlign.Start)

          Blank()
          Text(item.status)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(getActivityColor(item.status))
        }
        .width('100%')
        .margin({ bottom: 25 })
      }, (item: HistoryRecord) => item.id)
      
      // 如果没有记录显示空状态
      if (records.length === 0) {
         Text(this.isLoading ? '加载中...' : '暂无记录')
           .fontSize(14)
           .fontColor('#999')
           .width('100%')
           .textAlign(TextAlign.Center)
           .padding(20)
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
