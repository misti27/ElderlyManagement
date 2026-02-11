
import { Guardian, User } from '../model/Types';
import { MockData } from '../utils/MockData';
import promptAction from '@ohos.promptAction';
import router from '@ohos.router';

@Component
export struct ProfilePage {
  @State currentUser: User = MockData.currentUser;
  @State guardians: Guardian[] = MockData.guardians;

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
        router.replaceUrl({ url: 'pages/LoginPage' });
      }
    });
  }

  build() {
    Scroll() {
      Column() {
        // 个人信息头
        Row() {
          // 头像模拟 (圆形 + 文字)
          Stack() {
            Circle({ width: 80, height: 80 })
              .fill('#DBEAFE') // Blue-100
            Text(this.currentUser.name.substring(0, 1))
              .fontSize(32)
              .fontWeight(FontWeight.Bold)
              .fontColor('#2563EB')
          }
          .margin({ right: 20 })

          Column() {
            Text(this.currentUser.name)
              .fontSize(24)
              .fontWeight(FontWeight.Bold)
              .fontColor('#0F172A')
            Text(`年龄: ${this.currentUser.age}岁`)
              .fontSize(14)
              .fontColor('#64748B')
              .margin({ top: 4 })
            Text(this.currentUser.phone)
              .fontSize(14)
              .fontColor('#64748B')
              .margin({ top: 4 })
          }
          .alignItems(HorizontalAlign.Start)
        }
        .width('100%')
        .padding(24)
        .backgroundColor(Color.White)
        .margin({ bottom: 12 })

        // 监护人管理
        Column() {
          Row() {
            Text('我的家属')
              .fontSize(16)
              .fontWeight(FontWeight.Bold)
              .fontColor('#0F172A')
            Blank()
            Text('添加')
              .fontSize(14)
              .fontColor('#2563EB')
              .onClick(() => {
                promptAction.showToast({ message: '请在子女端添加关联' });
              })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 20, bottom: 10 })

          List() {
            ForEach(this.guardians, (item: Guardian) => {
              ListItem() {
                Row() {
                  // 头像
                  Circle({ width: 40, height: 40 })
                    .fill('#F1F5F9')
                    .margin({ right: 12 })
                  
                  Column() {
                    Text(item.name)
                      .fontSize(16)
                      .fontColor('#0F172A')
                    Text(item.relation)
                      .fontSize(12)
                      .fontColor('#64748B')
                  }
                  .alignItems(HorizontalAlign.Start)
                  
                  Blank()
                  
                  Button('拨号')
                    .height(32)
                    .fontSize(12)
                    .backgroundColor('#EFF6FF')
                    .fontColor('#2563EB')
                    .onClick(() => this.handleCall(item.phone))
                }
                .width('100%')
                .padding({ left: 20, right: 20, top: 12, bottom: 12 })
              }
            })
          }
          .divider({ strokeWidth: 1, color: '#F1F5F9', startMargin: 72 })
          .backgroundColor(Color.White)
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 12 })

        // 功能菜单
        Column() {
          this.MenuItem('设置提醒', '🔔')
          Divider().color('#F1F5F9').padding({ left: 50 })
          this.MenuItem('健康档案', '❤️')
          Divider().color('#F1F5F9').padding({ left: 50 })
          this.MenuItem('使用帮助', '❓')
        }
        .backgroundColor(Color.White)
        .margin({ bottom: 20 })

        // 退出按钮
        Button('退出登录')
          .width('90%')
          .height(50)
          .backgroundColor('#FEE2E2') // Red-100
          .fontColor('#EF4444') // Red-500
          .margin({ bottom: 40 })
          .onClick(() => this.handleLogout())
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }

  @Builder MenuItem(title: string, icon: string) {
    Row() {
      Text(icon)
        .fontSize(20)
        .width(30)
        .textAlign(TextAlign.Center)
        .margin({ right: 10 })
      Text(title)
        .fontSize(16)
        .fontColor('#0F172A')
      Blank()
      Text('>')
        .fontSize(14)
        .fontColor('#CBD5E1')
    }
    .width('100%')
    .padding(20)
    .backgroundColor(Color.White)
    .onClick(() => {
      promptAction.showToast({ message: `点击了 ${title}` });
    })
  }
}
