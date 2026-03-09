import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { AuthService } from '../services/AuthService';

@Entry
@Component
struct RegisterPage {
  @State name: string = '';
  @State phone: string = '';
  @State password: string = '';
  @State confirmPassword: string = '';
  @State isAgreed: boolean = false;

  async handleRegister() {
    if (!this.name || !this.phone || !this.password) {
      this.showToast('请填写所有必填项');
      return;
    }

    if (this.phone.length !== 11) {
      this.showToast('请输入有效的11位手机号');
      return;
    }

    if (this.password.length < 6) {
      this.showToast('密码长度不能少于6位');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.showToast('两次输入的密码不一致');
      return;
    }

    if (!this.isAgreed) {
      this.showToast('请先阅读并同意用户协议');
      return;
    }

    try {
      const success = await AuthService.register(this.name, this.phone, this.password);
      if (success) {
        this.showToast('注册成功！');
        router.back();
      } else {
        this.showToast('注册失败，手机号可能已被注册');
      }
    } catch (err) {
      console.error('Registration failed:', JSON.stringify(err));
      this.showToast('网络错误，请稍后重试');
    }
  }

  // 封装一个简单的 Toast 方法，避免代码重复
  showToast(msg: string) {
    try {
      promptAction.showToast({ message: msg });
    } catch (error) {
      console.error('Toast error');
    }
  }

  build() {
    Column() {
      // 1. 顶部导航栏
      Row() {
        Image($r('app.media.icon_back'))
          .width(24)
          .height(24)
          .onClick(() => {
            try {
              router.back();
            } catch (err) {}
          })
      }
      .width('100%')
      .padding({ left: 20, top: 20, bottom: 10 })

      // 2. 标题区域 (保持左对齐风格，颜色与登录页匹配)
      Column() {
        Text('创建新账号')
          .fontSize(30)
          .fontWeight(FontWeight.Bolder)
          .fontColor('#1A1A1A') // 柔和黑

        Text('欢迎加入，请填写以下信息以完成注册')
          .fontSize(15)
          .fontColor('#888888') // 质感灰
          .margin({ top: 10 })
      }
      .width('100%')
      .alignItems(HorizontalAlign.Start)
      .padding({ left: 24, right: 24, top: 10, bottom: 35 })

      // 3. 输入框表单区域
      Column({ space: 16 }) {
        TextInput({ placeholder: '请输入用户名', text: this.name })
          .height(56)
          .width('100%')
          .backgroundColor('#F4F6F8') // 同款浅蓝灰背景
          .placeholderColor('#A0AAB7') // 同款提示文字颜色
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => { this.name = value; })

        TextInput({ placeholder: '请输入11位手机号', text: this.phone })
          .type(InputType.PhoneNumber)
          .maxLength(11)
          .height(56)
          .width('100%')
          .backgroundColor('#F4F6F8')
          .placeholderColor('#A0AAB7')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => { this.phone = value; })

        TextInput({ placeholder: '设置密码 (不少于6位)', text: this.password })
          .type(InputType.Password)
          .showPasswordIcon(true)
          .height(56)
          .width('100%')
          .backgroundColor('#F4F6F8')
          .placeholderColor('#A0AAB7')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => { this.password = value; })

        TextInput({ placeholder: '确认密码', text: this.confirmPassword })
          .type(InputType.Password)
          .showPasswordIcon(true)
          .height(56)
          .width('100%')
          .backgroundColor('#F4F6F8')
          .placeholderColor('#A0AAB7')
          .borderRadius(12)
          .padding({ left: 20 })
          .onChange((value: string) => { this.confirmPassword = value; })
      }
      .width('100%')
      .padding({ left: 24, right: 24 })

      // 4. 用户协议勾选
      Row() {
        Checkbox({ name: 'agreement', group: 'ag' })
          .select(this.isAgreed)
          .selectedColor('#2A64E8') // 同步品牌蓝
          .width(18)
          .height(18)
          .onChange((value: boolean) => {
            this.isAgreed = value;
          })

        Text() {
          Span('我已阅读并同意 ')
            .fontColor('#888888')
          Span('《用户服务协议》')
            .fontColor('#2A64E8') // 协议高亮蓝
            .fontWeight(FontWeight.Medium)
            .onClick(() => {
              this.showToast('查看协议');
            })
        }
        .fontSize(13)
        .margin({ left: 8 })
      }
      .width('100%')
      .padding({ left: 24, top: 20 })
      .alignItems(VerticalAlign.Center)

      // 5. 注册按钮 (升级为带阴影的胶囊按钮)
      Button('立即注册')
        .width('90%')
        .height(54) // 高度与登录页一致
        .backgroundColor('#2A64E8') // 品牌蓝
        .fontColor(Color.White)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .borderRadius(27) // 半圆角 (54/2)
        .shadow({ radius: 10, color: '#332A64E8', offsetX: 0, offsetY: 4 }) // 蓝色光影
        .margin({ top: 30 })
        .onClick(() => this.handleRegister())

      Blank() // 弹性空白，把底部内容压到底

      // 6. 底部快捷入口
      Row() {
        Text('已有账号？')
          .fontSize(14)
          .fontColor('#888888')
        Text('去登录')
          .fontSize(14)
          .fontColor('#2A64E8')
          .fontWeight(FontWeight.Bold)
          .padding(5)
      }
      .padding({ bottom: 40 })
      .onClick(() => {
        try {
          router.back();
        } catch (err) {}
      })

    }
    .width('100%')
    .height('100%')
    .backgroundColor('#FFFFFF') // 纯白背景
  }
}