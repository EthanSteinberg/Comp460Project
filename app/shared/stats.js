/**
 * A shipyard entity.
 */
let nextId = 0;

var roundshot = {
  health: 100,
  damage: 10,
  speed: 0,
  weight: -10,
  wcost: 10,
  ccost: 10,
  tcost: 10,
}

var chainshot = {
  health: 100,
  damage: 5,
  speed: 0,
  weight: -20,
  wcost: 25,
  ccost: 10,
  tcost: 10,
}

var grapeshot = {
  health: 100,
  damage: 20,
  speed: 0,
  weight: -5,
  wcost: 50,
  ccost: 50,
  tcost: 20,
}

var shell = {
  health: 100,
  damage: 5,
  speed: 0,
  weight: -20,
  wcost: 50,
  ccost: 100,
  tcost: 20,
}

var gunboat = {
  health: 100,
  damage: 0,
  speed: 20,
  weight: 25,
  wcost: 100,
  ccost: 10,
  tcost: 60,
}

var frigate = {
  health: 300,
  damage: 0,
  speed: 10,
  weight: 50,
  wcost: 200,
  ccost: 50,
  tcost: 120,
}

var galleon = {
  health: 600,
  damage: 0,
  speed: 5,
  weight: 100,
  wcost: 300,
  ccost: 100,
  tcost: 180,
}

var item = {
  roundshot,
  chainshot,
  grapeshot,
  shell,
  gunboat,
  frigate,
  galleon,
}

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

    this.templateNum = "None";
  }

  applyItemEffect(type) {
    var obj = item[type];
    this.health += obj.health;
    this.damage += obj.damage;  
    this.speed += obj.speed;
    this.weight += obj.weight;
    this.wcost += obj.wcost;
    this.ccost += obj.ccost;
    this.tcost += obj.tcost;
  }

  removeItemEffect(type) {
    if (type == "templateSelected") {
      this.templateNum = "None";
      return;
    }

    var obj = item[type];
    this.health -= obj.health;
    this.damage -= obj.damage;  
    this.speed -= obj.speed;
    this.weight -= obj.weight;
    this.wcost -= obj.wcost;
    this.ccost -= obj.ccost;
    this.tcost -= obj.tcost;
  }

  setTemplateNum(templateNum) {
    this.templateNum = templateNum;
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

  getTemplateNum() {
    return this.templateNum;
  }

}
