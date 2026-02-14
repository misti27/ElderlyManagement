
import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { AuthService } from '../services/AuthService';
import { HttpUtil } from '../utils/HttpUtil';

@Entry
@Component
struct LoginPage {
  @State phone: string = '15011112222'; // Default test account
  @State code: string = '123456';
  @State isLoading: boolean = false;
  @State debugMsg: string = ''; // 调试信息

  async handleLogin() {
    this.debugMsg = '开始登录...';
    if (this.phone.length === 0) {
      this.debugMsg = '请输入手机号';
      promptAction.showToast({ message: '请输入手机号' });
      return;
    }

    this.isLoading = true;
    try {
      console.info('Attempting login...');
      this.debugMsg = '正在连接服务器: ' + '192.168.1.79';
      const res = await AuthService.login(this.phone, this.code);
      console.info('Login successful, token:', res.token);
      
      // Save to storage in UI context
      AppStorage.SetOrCreate('token', res.token);
      AppStorage.SetOrCreate('user', res.user);

      this.debugMsg = '登录成功，准备跳转...';
      promptAction.showToast({ message: '登录成功' });
      
      // Navigate to Index
      try {
        await router.replaceUrl({ url: 'pages/Index' });
        console.info('Router replaceUrl called successfully');
        this.debugMsg = '跳转指令已发出';
      } catch (routerErr) {
        console.error('Router error:', JSON.stringify(routerErr));
        this.debugMsg = '跳转失败: ' + (routerErr.message || '未知错误');
        promptAction.showToast({ message: '跳转失败: ' + (routerErr.message || '未知错误') });
      }

    } catch (err) {
      console.error('Login failed:', JSON.stringify(err));
      // Error is already toasted in HttpUtil or AuthService, but ensure user sees it
      this.debugMsg = '登录异常: ' + (err.message || JSON.stringify(err));
      promptAction.showToast({ message: '登录异常: ' + (err.message || JSON.stringify(err)) });
    } finally {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // Logo / Title
      Column() {

        Text('守护者端')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)
          .fontColor('#1E293B')
          .margin({ bottom: 8 })

        Text('登录您的账号以查看家人状况')
          .fontSize(14)
          .fontColor('#64748B')
      }
      .margin({ top: 80, bottom: 48 })
      .width('100%')
      .alignItems(HorizontalAlign.Center)

      // Form
      Column() {
        if (this.debugMsg) {
          Text(this.debugMsg)
            .fontSize(12)
            .fontColor(Color.Red)
            .margin({ bottom: 8 })
            .width('100%')
            .textAlign(TextAlign.Center)
        }

        TextInput({ placeholder: '请输入手机号', text: this.phone })
          .width('100%')
          .height(50)
          .backgroundColor('#F1F5F9')
          .borderRadius(8)
          .margin({ bottom: 16 })
          .padding({ left: 16 })
          .type(InputType.PhoneNumber)
          .onChange((value: string) => {
            this.phone = value;
          })

        TextInput({ placeholder: '验证码', text: this.code })
          .width('100%')
          .height(50)
          .backgroundColor('#F1F5F9')
          .borderRadius(8)
          .margin({ bottom: 32 })
          .padding({ left: 16 })
          .type(InputType.Number)
          .onChange((value: string) => {
            this.code = value;
          })

        Button() {
          if (this.isLoading) {
            LoadingProgress()
              .color(Color.White)
              .width(24)
              .height(24)
          } else {
            Text('登录')
              .fontSize(16)
              .fontColor(Color.White)
              .fontWeight(FontWeight.Medium)
          }
        }
        .width('100%')
        .height(50)
        .backgroundColor('#2563EB')
        .borderRadius(25)
        .onClick(() => {
          this.handleLogin();
        })
        .enabled(!this.isLoading)
      }
      .width('100%')
      .padding({ left: 32, right: 32 })

      // Cheat Button
      Button('跳过登录 (测试用)')
        .width(120)
        .height(30)
        .fontSize(12)
        .fontColor('#94A3B8')
        .backgroundColor('transparent')
        .margin({ top: 32 })
        .onClick(() => {
          // Manually set a mock token so Index page check passes
          AppStorage.SetOrCreate('token', 'mock-guardian-token-cheat');
          AppStorage.SetOrCreate('user', {
            id: '1',
            name: '测试监护人',
            phone: '13800000000',
            role: 'guardian'
          });
          HttpUtil.setToken('mock-guardian-token-cheat');
          
          router.replaceUrl({ url: 'pages/Index' });
          promptAction.showToast({ message: '已跳过登录' });
        })


    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
