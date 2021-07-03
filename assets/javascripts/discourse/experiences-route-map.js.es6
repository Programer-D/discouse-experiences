console.log('experiences-route-map3')
export default function () {
  this.route('experiences', {path: '/experiences'});
  this.route('postes', {path: '/postes'});
  this.route('showes', {path: '/showes'});
  this.route('detailes', {path: '/detailes/:es_id'});
}
