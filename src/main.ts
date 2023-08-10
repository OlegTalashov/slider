import Vue from 'vue'
import Playground from './Playground.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(Playground),
}).$mount('#app')
