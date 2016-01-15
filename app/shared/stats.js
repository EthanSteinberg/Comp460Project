/**
 * A shipyard entity.
 */
let nextId = 0;

export default class Stats {

  constructor() {
    this.id = nextId++;

    this.health = 0;
    this.damage = 0;
    this.speed = 0;
    this.weight = 0;
    this.wcost = 0;
    this.ccost = 0;
    this.tcost = 0;
  }

  applyItemEffect(type, mult) {
    switch (type) {
      case 'roundshot':
        this.damage += 10 * mult;  
        this.health += 100 * mult;
        this.weight -= 10 * mult;
        this.wcost += 10 * mult;
        this.ccost += 10 * mult;
        this.tcost += 10 * mult;
        break;
      case 'chainshot':
        this.damage += 5 * mult;  
        this.health += 100 * mult;
        this.weight -= 20 * mult;
        this.wcost += 50 * mult;
        this.ccost += 50 * mult;
        this.tcost += 20 * mult;
        break;
      case 'grapeshot':
        this.damage += 20 * mult;  
        this.health += 100 * mult;
        this.weight -= 5 * mult;
        this.wcost += 25 * mult;
        this.ccost += 10 * mult;
        this.tcost += 10 * mult;
        break;
      case 'shell':
        this.damage += 5 * mult;  
        this.health += 100 * mult;
        this.weight -= 20 * mult;
        this.wcost += 50 * mult;
        this.ccost += 100 * mult;
        this.tcost += 20 * mult;
        break;
      case 'gunboat':
        this.health += 100 * mult;
        this.weight += 25 * mult;
        this.speed += 20 * mult;
        this.wcost += 100 * mult;
        this.ccost += 10 * mult;
        this.tcost += 60 * mult;
        break;
      case 'frigate':
        this.health += 300 * mult;
        this.weight += 50 * mult;
        this.speed += 10 * mult;
        this.wcost += 200 * mult;
        this.ccost += 50 * mult;
        this.tcost += 120 * mult;
        break;
      case 'galleon':
        this.health += 600 * mult;
        this.weight += 100 * mult;
        this.speed += 5 * mult;
        this.wcost += 300 * mult;
        this.ccost += 100 * mult;
        this.tcost += 180 * mult;
        break;      
      default:
        console.error('Trying to update by unknown type');
    }
  }

  getHealth() {
    return this.health;
  }

  getDamage() {
    return this.damage;
  }

  getSpeed() {
    return this.speed;
  }

  getWeight() {
    return this.weight;
  }

  getWcost() {
    return this.wcost;
  }

  getCcost() {
    return this.ccost;
  }

  getTcost() {
    return this.tcost;
  }

}
