import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  TruckIcon,
  MapIcon,
  Squares2X2Icon,
  QueueListIcon, // 1. YENİ: Uygun bir ikon import edelim
} from "@heroicons/react/24/solid";
// 2. YENİ: Yeni sayfa bileşenimizi import edelim
import { Home, Profile, Tables, Notifications, QueueManagementPage } from "@/pages/dashboard";
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
        name: "Araç Sıraları",
        path: "/home",
        element: <Home />,
      },
      // 3. YENİ: "Sıra Yönetimi" sayfasını menüye ekleyelim
      {
        icon: <QueueListIcon {...icon} />,
        name: "Sıra Yönetimi",
        path: "/queue-management", // Tarayıcıda görünecek adres
        element: <QueueManagementPage />,
        roles: ['admin'], // Sadece adminler görebilir
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Kullanıcılar",
        path: "/profile",
        element: <Profile />,
        roles: ['admin'],
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Araçlar",
        path: "/tables",
        element: <Tables />,
        roles: ['admin'],
      },
      {
        icon: <MapIcon {...icon} />,
        name: "Güzergahlar",
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