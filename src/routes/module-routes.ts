import {
  Activity,
  Bell,
  Building2,
  CircleDollarSign,
  HeartHandshake,
  Home,
  Map,
  Megaphone,
  MessageCircleQuestion,
  Newspaper,
  Settings,
  ShieldCheck,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/features/auth/permissions';

export interface ModuleRoute {
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
  permission?: Permission;
}

export interface RouteGroup { label: string; items: ModuleRoute[]; }

export const routeGroups: RouteGroup[] = [
  {
    label: 'العمليات',
    items: [
      { label: 'الرئيسية', path: '/dashboard', icon: Home, description: 'نظرة تشغيلية فورية على حالة منصة ResQ.', permission: 'dashboard:view' },
      { label: 'البلاغات', path: '/reports', icon: ShieldCheck, description: 'إدارة ومراجعة بلاغات الحيوانات والحالات الواردة.', permission: 'reports:view' },
      { label: 'الخريطة', path: '/map', icon: Map, description: 'دليل جغرافي موحد للخدمات والأماكن المهمة للمهتمين بالحيوانات.', permission: 'map.read' },
    ],
  },
  {
    label: 'المجتمع',
    items: [
      { label: 'عروض التبني', path: '/adoption-requests', icon: HeartHandshake, description: 'مراجعة عروض الحيوانات قبل النشر ومتابعة طلبات التبني بعد النشر.', permission: 'adoption:read' },
      { label: 'الجمعيات', path: '/organizations', icon: Building2, description: 'مراجعة الجمعيات واعتمادها ومتابعة نشاطها التشغيلي.', permission: 'organizations:read' },
      { label: 'المستخدمون', path: '/users', icon: Users, description: 'إدارة حسابات المستخدمين ونشاطهم المرتبط.', permission: 'users:read' },
      { label: 'نقاط الإطعام', path: '/feeding-points', icon: Utensils, description: 'متابعة نقاط الإطعام وحالتها واحتياجات التعبئة والصيانة.', permission: 'feeding_points.read' },
    ],
  },
  {
    label: 'الإدارة',
    items: [
      { label: 'التبرعات', path: '/donations', icon: CircleDollarSign, description: 'متابعة التبرعات وحالات العمليات والجهات المستفيدة والسجلات المالية.', permission: 'donations.read' },
      { label: 'الإعلانات', path: '/advertisements', icon: Megaphone, description: 'مراجعة الإعلانات وجدولتها ومتابعة الحملات والجهات المعلنة.', permission: 'advertisements.read' },
      { label: 'المحتوى', path: '/content', icon: Newspaper, description: 'إدارة المحتوى التحريري والنشر في المنصة.', permission: 'content.read' },
      { label: 'الإشعارات', path: '/notifications', icon: Bell, description: 'إدارة رسائل البث والقوالب التلقائية والتسليم.', permission: 'notifications.read' },
      { label: 'الدعم', path: '/support', icon: MessageCircleQuestion, description: 'متابعة طلبات الدعم والشكاوى وتوزيعها ومعالجتها.', permission: 'support.read' },
    ],
  },
  {
    label: 'النظام',
    items: [
      { label: 'سجل النشاط', path: '/audit-log', icon: Activity, description: 'سجل تدقيق مركزي للأنشطة الإدارية والتغييرات الحساسة.', permission: 'audit.read' },
      { label: 'الإعدادات', path: '/settings', icon: Settings, description: 'إدارة المسؤولين والأدوار والصلاحيات والقيم التشغيلية.', permission: 'settings.read' },
    ],
  },
];

export const allModuleRoutes = routeGroups.flatMap((group) => group.items);
