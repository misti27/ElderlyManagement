
import { User, Guardian, ActivityStatus, HistoryRecord } from '../model/Types';

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

  static history: HistoryRecord[] = [
    { id: 'h1', status: ActivityStatus.SITTING, startTime: '14:30', endTime: '15:15' },
    { id: 'h2', status: ActivityStatus.WALKING, startTime: '13:00', endTime: '14:30' },
    { id: 'h3', status: ActivityStatus.SITTING, startTime: '11:30', endTime: '13:00' },
    { id: 'h4', status: ActivityStatus.WALKING, startTime: '10:00', endTime: '11:30' },
    { id: 'h5', status: ActivityStatus.SITTING, startTime: '08:30', endTime: '10:00' },
    { id: 'h6', status: ActivityStatus.STILL, startTime: '07:00', endTime: '08:30' },
  ];
}
