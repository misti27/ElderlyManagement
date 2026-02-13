import { Elderly, ActivityStatus, DeviceInfo } from '../model/Types';
import { ElderlyLocal } from '../model/ViewModels';
import { HttpUtil } from '../utils/HttpUtil';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';

@Component
export struct ProfilePage {
  @State userName: string = '张伟';
  @State userPhone: string = '13900139000';
  @State elderlyList: ElderlyLocal[] = [];
  @State isLoading: boolean = true;
  @State isVibrationEnabled: boolean = true;
  @State isSmsEnabled: boolean = true;
  @State isEditing: boolean = false;
  @State editName: string = '';
  @State editPhone: string = '';

  aboutToAppear() {
    this.editName = this.userName;
    this.editPhone = this.userPhone;
    this.fetchElderlyList();
  }

  async fetchElderlyList() {
    try {
      const result = await HttpUtil.get<Object[]>('/guardian/elderly');

      if (Array.isArray(result)) {
        // Map backend data to local structure
        this.elderlyList = result.map((item: Object): ElderlyLocal => {
          return new ElderlyLocal(item);
        });
      }
    } catch (err) {
      console.error('Fetch elderly list failed:', JSON.stringify(err));
      // Fallback data
      this.elderlyList = [];
    } finally {
      this.isLoading = false;
    }
  }

  handleSaveProfile() {
    if (this.editName.trim() === '' || this.editPhone.trim() === '') {
      promptAction.showToast({ message: '姓名和电话不能为空' });
      return;
    }
    // 更新用户信息 (模拟)
    this.userName = this.editName;
    this.userPhone = this.editPhone;
    this.isEditing = false;
    promptAction.showToast({ message: '个人资料已更新' });
  }

  handleCall(phone: string) {
    promptAction.showDialog({
      title: '拨打电话',
      message: `确定拨打 ${phone} 吗？`,
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '拨叫', color: '#2563EB' }
      ]
    });
  }

  handleLogout() {
    promptAction.showDialog({
      title: '提示',
      message: '确定要退出登录吗？',
      buttons: [
        { text: '取消', color: '#64748B' },
        { text: '退出', color: '#EF4444' }
      ]
    }).then(result => {
      if (result.index === 1) {
        // router.replaceUrl({ url: 'pages/LoginPage' });
        promptAction.showToast({ message: '已退出登录' });
      }
    });
  }

  build() {
    Scroll() {
      Column() {
        // 1. 个人资料卡片 (支持编辑)
        if (this.isEditing) {
          Column() {
            Text('编辑个人资料')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#1E293B')
              .margin({ bottom: 16 })
              .width('100%')

            Text('姓名')
              .fontSize(14)
              .fontColor('#64748B')
              .width('100%')
              .margin({ bottom: 8 })
            TextInput({ text: this.editName, placeholder: '请输入姓名' })
              .width('100%')
              .height(48)
              .backgroundColor('#F8FAFC')
              .borderRadius(8)
              .onChange((value: string) => {
                this.editName = value;
              })
              .margin({ bottom: 16 })

            Text('电话')
              .fontSize(14)
              .fontColor('#64748B')
              .width('100%')
              .margin({ bottom: 8 })
            TextInput({ text: this.editPhone, placeholder: '请输入电话' })
              .width('100%')
              .height(48)
              .backgroundColor('#F8FAFC')
              .borderRadius(8)
              .type(InputType.PhoneNumber)
              .onChange((value: string) => {
                this.editPhone = value;
              })
              .margin({ bottom: 24 })

            Row() {
              Button('取消')
                .backgroundColor('#F1F5F9')
                .fontColor('#64748B')
                .width('45%')
                .onClick(() => {
                  this.isEditing = false;
                  this.editName = this.userName;
                  this.editPhone = this.userPhone;
                })
              
              Blank()
              
              Button('保存')
                .backgroundColor('#2563EB')
                .fontColor(Color.White)
                .width('45%')
                .onClick(() => {
                  this.handleSaveProfile();
                })
            }
            .width('100%')
          }
          .padding(24)
          .backgroundColor(Color.White)
          .margin({ bottom: 12 })
        } else {
          Row() {
            Stack() {
              Circle({ width: 72, height: 72 })
                .fill('#EFF6FF')
              Text(this.userName.substring(0, 1))
                .fontSize(28)
                .fontWeight(FontWeight.Bold)
                .fontColor('#2563EB')
            }
            .margin({ right: 16 })
  
            Column() {
              Text(this.userName)
                .fontSize(22)
                .fontWeight(FontWeight.Bold)
                .fontColor('#1E293B')
              Text(this.userPhone)
                .fontSize(14)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            
            Blank()
            
            // 编辑按钮
            Text('编辑')
              .fontSize(14)
              .fontColor('#2563EB')
              .onClick(() => {
                this.isEditing = true;
              })
          }
          .width('100%')
          .padding(24)
          .backgroundColor(Color.White)
          .margin({ bottom: 12 })
        }

        // 2. 我的家属 (直接展示列表)
        Column() {
          this.SectionHeader('我的家属')
          
          if (this.elderlyList.length > 0) {
            ForEach(this.elderlyList, (elder: ElderlyLocal, index: number) => {
              Column() {
                if (index > 0) {
                  Divider().color('#F1F5F9').padding({ left: 16, right: 16 })
                }
                Row() {
                  Text(elder.name)
                    .fontSize(18)
                    .fontColor('#1E293B')
                    .fontWeight(FontWeight.Medium)
                  Text(elder.relation)
                    .fontSize(16)
                    .fontColor('#64748B')
                    .margin({ top: 2, left:10 })
                  
                  Blank()
                  
                  Text(elder.phone)
                    .fontSize(18)
                    .fontColor('#2563EB')
                    .onClick(() => {
                      this.handleCall(elder.phone);
                    })
                }
                .width('100%')
                .padding(16)
              }
            })
          } else {
            Text('暂无守护长辈')
              .fontSize(18)
              .fontColor('#94A3B8')
              .padding(16)
          }
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 12, left: 16, right: 16 })
        .borderRadius(12)

        // 3. 通知策略
        Column() {
          this.SectionHeader('通知策略')
          
          // 震动提醒
          Row() {
            Column() {
              Text('手机强力震动提醒')
                .fontSize(16)
                .fontColor('#1E293B')
                .fontWeight(FontWeight.Medium)
              Text('检测到异常时，监护人手机产生持续震动')
                .fontSize(12)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            
            Toggle({ type: ToggleType.Switch, isOn: this.isVibrationEnabled })
            .selectedColor('#2563EB')
            .onChange((isOn: boolean) => {
              this.isVibrationEnabled = isOn;
            })
          }
          .width('100%')
          .padding(16)

          Divider().color('#F1F5F9').padding({ left: 16 })

          // 短信提醒
          Row() {
            Column() {
              Text('跌倒短信紧急报警')
                .fontSize(16)
                .fontColor('#1E293B')
                .fontWeight(FontWeight.Medium)
              Text('检测到异常跌倒后，自动发送告警短信')
                .fontSize(12)
                .fontColor('#64748B')
                .margin({ top: 4 })
            }
            .alignItems(HorizontalAlign.Start)
            .layoutWeight(1)
            
            Toggle({ type: ToggleType.Switch, isOn: this.isSmsEnabled })
            .selectedColor('#2563EB')
            .onChange((isOn: boolean) => {
              this.isSmsEnabled = isOn;
            })
          }
          .width('100%')
          .padding(16)
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 12, left: 16, right: 16 })
        .borderRadius(12)


        // 4. 退出登录
        Button('退出登录')
          .width('90%')
          .height(48)
          .backgroundColor('#FEE')
          .fontColor('#EF4444')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ top: 12, bottom: 40 })
          .onClick(() => {
             this.handleLogout();
          })
      }
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }

  @Builder SectionHeader(title: string) {
    Text(title)
      .fontSize(20)
      .width('100%')
      .padding({ left: 16, top: 16, bottom: 8 })
      .fontWeight(600)
  }
}