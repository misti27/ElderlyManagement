
import promptAction from '@ohos.promptAction';

@Component
export struct ProfilePage {
  @State userName: string = '张伟';
  @State userPhone: string = '13900139000';

  build() {
    Column() {
      // 个人信息头部
      Column() {
        Image($r('app.media.ic_public_contacts')) // 模拟头像
          .width(80)
          .height(80)
          .borderRadius(40)
          .backgroundColor('#E2E8F0')
          .margin({ bottom: 12 })
        
        Text(this.userName)
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1E293B')
        
        Text(this.userPhone)
          .fontSize(14)
          .fontColor('#64748B')
          .margin({ top: 4 })
        
        Button('编辑资料')
          .height(32)
          .fontSize(12)
          .backgroundColor('#EFF6FF')
          .fontColor('#2563EB')
          .margin({ top: 12 })
          .onClick(() => {
            promptAction.showToast({ message: '编辑功能开发中' });
          })
      }
      .width('100%')
      .padding({ top: 40, bottom: 40 })
      .backgroundColor(Color.White)

      // 功能列表
      Column() {
        this.MenuItem('绑定管理', '🔗', () => {
          promptAction.showDialog({
            title: '绑定管理',
            message: '添加新的老人设备或解除绑定',
            buttons: [{ text: '添加设备', color: '#2563EB' }, { text: '关闭', color: '#64748B' }]
          });
        })
        Divider().color('#F1F5F9').padding({ left: 56 })
        
        this.MenuItem('通用设置', '⚙️', () => {})
        Divider().color('#F1F5F9').padding({ left: 56 })
        
        this.MenuItem('隐私政策', '🔒', () => {})
        Divider().color('#F1F5F9').padding({ left: 56 })
        
        this.MenuItem('关于我们', 'ℹ️', () => {})
      }
      .backgroundColor(Color.White)
      .margin({ top: 16 })
      .borderRadius(12)
      .width('90%')

      Blank()

      Button('退出登录')
        .width('90%')
        .height(50)
        .backgroundColor('#FEE2E2')
        .fontColor('#EF4444')
        .margin({ bottom: 40 })
        .onClick(() => {
           promptAction.showToast({ message: '已退出' });
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F8FAFC')
  }

  @Builder MenuItem(title: string, icon: string, action: () => void) {
    Row() {
      Text(icon)
        .fontSize(20)
        .width(40)
        .textAlign(TextAlign.Center)
      Text(title)
        .fontSize(16)
        .fontColor('#1E293B')
      Blank()
      Text('>')
        .fontSize(14)
        .fontColor('#CBD5E1')
    }
    .width('100%')
    .padding(20)
    .onClick(action)
  }
}
