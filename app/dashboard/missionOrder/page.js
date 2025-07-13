import MissionOrderList from '@/app/components/missionOrder/MissionOrderList/MissionOrderList';

export const metadata = {
  title: 'احکام ماموریت | آریا فولاد',
  description: 'مدیریت احکام ماموریت آریا فولاد',
};

export default function MissionOrderListPage() {
  return (
    <div className="p-4 md:p-6">
      <MissionOrderList />
    </div>
  );
} 