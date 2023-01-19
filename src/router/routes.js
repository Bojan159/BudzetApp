const routes = [
  {
    path: "/",
    component: () => import("layouts/PrazanLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/NaslovnaBudzet.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/izbor-budzeta",
        component: () => import("pages/IzborBudzeta.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/prijava",
        component: () => import("pages/PrijavaKorisnika.vue"),
      },
      {
        path: "/registracija",
        component: () => import("pages/RegistracijaKorisnika.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
