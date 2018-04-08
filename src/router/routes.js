
export default [
  {
    path: '/',
    component: () => import('layouts/default'),
    props: true,
    children: [
      { path: '', component: () => import('pages/index'), props: true }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
