
import { User, Guardian, ActivityStatus } from '../model/Types';

export class MockData {
  static currentUser: User = {
    id: 'u001',
    name: '张建国',
    age: 76,
    phone: '13800138000',
    emergencyPhone: '13900139000',
    avatarUrl: 'app.media.ic_public_user', // 模拟资源路径
    address: '北京市朝阳区幸福养老社区3号楼201'
  };

  static guardians: Guardian[] = [
    {
      id: 'g001',
      name: '张伟',
      phone: '13900139000',
      relation: '长子',
      avatarUrl: 'app.media.ic_public_contacts'
    },
    {
      id: 'g002',
      name: '李秀英',
      phone: '13900139001',
      relation: '配偶',
      avatarUrl: 'app.media.ic_public_contacts'
    }
  ];

  static currentActivity: ActivityStatus = ActivityStatus.WALKING;
}
