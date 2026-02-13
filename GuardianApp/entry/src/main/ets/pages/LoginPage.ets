
import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { AuthService } from '../services/AuthService';

@Entry
@Component
struct LoginPage {
  @State phone: string = '15011112222'; // Default test account
  @State code: string = '123456';
  @State isLoading: boolean = false;

  async handleLogin() {
    if (this.phone.length === 0) {
      promptAction.showToast({ message: '请输入手机号' });
      return;
    }

    this.isLoading = true;
    try {
      await AuthService.login(this.phone, this.code);
      promptAction.showToast({ message: '登录成功' });
      
      // Navigate to Index
      router.replaceUrl({ url: 'pages/Index' });
    } catch (err) {
      console.error('Login failed:', JSON.stringify(err));
      // Error is already toasted in HttpUtil or AuthService
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


    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
