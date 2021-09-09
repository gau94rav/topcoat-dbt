import Vue from 'vue'
import Router from 'vue-router'

// Admin
import Admin from '../components/Admin/Admin'
import Secrets from '../components/Admin/Secrets'
import Git from '../components/Admin/Git'
import Connections from '../components/Admin/Connections'
import Logs from '../components/Admin/Logs'
import Groups from '../components/Admin/Groups'
import Users from '../components/Admin/Users'
import DevelopmentMode from '../components/Admin/DevelopmentMode'
import Dbt from '../components/Admin/Dbt'

// Develop
import Develop from '../components/Develop/Develop'
import axios from 'axios';

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: "/a/",
  routes: [
      {
      path: '/',
      beforeEnter(to, from, next) {

        axios.get('/api/git/getGitConfig')
        .then((response)  =>  {
            if (response.data.dev_enabled) {
              next('/develop');
            } else {
              next('/admin');
            }
        }, (error)  =>  {
            console.log("Git Config failed");
        })
      }
    },
    {
      path: '/admin',
      redirect: '/admin/connections'
    },
    {
      path: '/admin/:id', component: Admin,
      children: [
        {
          path: '/admin/connections',
          name: 'Connections',
          component: Connections
        },
        {
          path: '/admin/git',
          name: 'Git',
          component: Git
        },
        {
          path: '/admin/devmode',
          name: 'DevelopmentMode',
          component: DevelopmentMode
        },
        {
          path: '/admin/dbt',
          name: 'Dbt',
          component: Dbt
        },
        // {
        //   path: '/admin/secrets',
        //   name: 'Secrets',
        //   component: Secrets
        // },
        {
          path: '/admin/logs',
          name: 'Logs',
          component: Logs
        },
        {
          path: '/admin/groups',
          name: 'Groups',
          component: Groups
        },
        {
          path: '/admin/users',
          name: 'Users',
          component: Users
        }
        ]
    },
    {
      path: '/develop', component: Develop,
      beforeEnter(to, from, next) {

        axios.get('/api/git/getGitConfig')
        .then((response)  =>  {
            if (response.data.dev_enabled) {
              next();
            } else {
              next('/admin');
            }
        }, (error)  =>  {
            console.log("Git Config failed");
        })
      },
      children: [
        {
          path: '/develop',
          name: 'Develop',
          component: Develop,
          props: true
        },
        {
          path: '/develop/*',
          name: 'Develop',
          component: Develop,
          props: true,
        }
      ]
    },
  ]
})
