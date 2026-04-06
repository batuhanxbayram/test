import {
  HomeIcon,
  UserCircleIcon,
  TruckIcon,
  MapIcon,
  Squares2X2Icon,
  QueueListIcon,
  PaperAirplaneIcon,
  ServerStackIcon,
} from "@heroicons/react/24/solid";

import {
  Home,
  Profile,
  Tables,
  Notifications,
  QueueManagementPage,
  DispatchPage,
} from "@/pages/dashboard";

import { SignIn } from "@/pages/auth";
import TVQueuePage from "./pages/dashboard/TVQueuePage";
import DispatchDetailPage from "./pages/dashboard/DispatchDetailPage";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "anasayfa",
    pages: [
      {
        icon: <Squares2X2Icon {...icon} />,
        name: "Araç Sıraları",
        path: "/arac-siralari",
        element: <Home />,
      },
      {
        icon: <QueueListIcon {...icon} />,
        name: "Sıra Yönetimi",
        path: "/sira-yonetimi",
        element: <QueueManagementPage />,
        roles: ['admin'],
      },
      {
        icon: <PaperAirplaneIcon {...icon} />,
        name: "Özel Görev",
        path: "/ozel-gorev",
        element: <DispatchPage />,
        roles: ['admin'],
      },
      {
        hidden: true,
        path: "/ozel-gorev/:routeId",
        element: <DispatchDetailPage />,
        roles: ['admin'],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Kullanıcılar",
        path: "/kullanicilar",
        element: <Profile />,
        roles: ['admin'],
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Araçlar",
        path: "/araclar",
        element: <Tables />,
        roles: ['admin'],
      },
      {
        icon: <MapIcon {...icon} />,
        name: "Güzergahlar",
        path: "/guzergahlar",
        element: <Notifications />,
        roles: ['admin'],
      },
    ],
  },
  {
    title: "Giriş İşlemleri",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Giriş Yap",
        path: "/giris",
        element: <SignIn />,
      },
    ],
  },
  {
    layout: "tv",
    pages: [
      {
        name: "TV Monitor",
        path: "/monitor",
        element: <TVQueuePage />,
      },
    ],
  },
];

export default routes;