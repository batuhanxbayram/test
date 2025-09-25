3

import {
  UserCircleIcon,
  TruckIcon,
  MapIcon,
  Squares2X2Icon,
  QueueListIcon,
  ServerStackIcon,
} from "@heroicons/react/24/solid";

// Gerekli tüm sayfa bileşenlerini tek bir yerden import ediyoruz.
import {
  Home,
  Profile,
  Tables,
  Notifications,
  QueueManagementPage,
} from "@/pages/dashboard";
import { SignIn } from "@/pages/auth";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <Squares2X2Icon {...icon} />,
        name: "Dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <QueueListIcon {...icon} />,
        name: "Sıra Yönetimi", // YENİ: Sıraları yönettiğimiz (araç ekle/çıkar) sayfa
        path: "/queue-management",
        element: <QueueManagementPage />,
        roles: ['admin'],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Kullanıcılar", // KORUNDU: Kullanıcıları yönettiğimiz sayfa
        path: "/profile",
        element: <Profile />,
        roles: ['admin'],
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Araçlar", // KORUNDU: Araçları yönettiğimiz sayfa
        path: "/tables",
        element: <Tables />,
        roles: ['admin'],
      },
      {
        icon: <MapIcon {...icon} />,
        name: "Güzergahlar", // KORUNDU: Güzergahları yönettiğimiz (ekle/düzenle/sil) sayfa
        path: "/notifications",
        element: <Notifications />,
        roles: ['admin'],
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
    ],
  },
];

export default routes;