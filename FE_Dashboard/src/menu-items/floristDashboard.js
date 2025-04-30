import { IconCalendarWeek, IconChecklist , IconMessageChatbot } from '@tabler/icons-react';

const icons = {
  IconCalendarWeek,
  IconChecklist,
  IconMessageChatbot,
};

const floristDashboard = {
  id: 'floristDashboard',
  title: 'Florist Dashboard',
  caption: 'Management Dashboard for Florist',
  type: 'group',
  children: [
    {
      id: 'schedule',
      title: 'Task Schedule',
      type: 'item',
      url: '/floristDashboard/task-schedule',
      icon: IconCalendarWeek,
      breadcrumbs: true
    },
    {
      id: 'task',
      title: 'Task Management',
      type: 'item',
      url: '/floristDashboard/task-management',
      icon: IconChecklist,
      breadcrumbs: true
    },
    {
      id: 'advise',
      title: 'Design Consultant',
      type: 'item',
      url: '/floristDashboard/design-consultant',
      icon: IconMessageChatbot,
      breadcrumbs: true
    },
  ]
};

export default floristDashboard;
