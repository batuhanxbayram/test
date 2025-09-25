// src/routes.jsx

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
} from "@heroicons/react/24/solid";

// Dashboard sayfalarını doğru yoldan tek bir import ile çekin
import {
  Home,
  Profile,
  Tables,
  Notifications,
} from "@/pages/dashboard";

// AddVehicleToQueue komponentini özel olarak import edin
import { AddVehicleToQueue } from "../src/pages/dashboard/AddVehicleToQueue"; // Doğru yol bu olmalı

import { SignIn } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <MapIcon {...icon} />,
        name: "Güzergahlar",
        path: "/routes",
        element: <Home />, // Home komponentini Güzergahlar için kullanıyoruz
      },
      {
        icon: <Squares2X2Icon {...icon} />,
        name: "Sıraya Araç Ekle",
        path: "/add-vehicle",
        element: <AddVehicleToQueue />,
      },
      {
        icon: <TruckIcon {...icon} />,
        name: "Araçlar",
        path: "/tables", // Veya /vehicles
        element: <Tables />,
        roles: ['admin'],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Kullanıcılar",
        path: "/profile", // Veya /users
        element: <Profile />,
        roles: ['admin'],
      },
      // NOT: "/add-vehicle/:routeId" dinamik rotasını menüye eklemiyoruz.
      // Çünkü bu rota, menüden değil, "Sıraya Araç Ekle" sayfasının içinden
      // dinamik olarak açılacak bir sayfa olacak.
      // Sadece /add-vehicle rotasını menüye ekliyoruz.
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