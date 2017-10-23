export default class Utils {
  static ucfirst(str) {
    if (typeof str === 'string' && str.length > 0) {
      return str.charAt(0).toUpperCase() + str.substr(1);
    }
    return str;
  }
}
