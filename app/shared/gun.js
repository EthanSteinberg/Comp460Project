export default class Gun {
  constructor(ship, offset, id) {
    this.type = 'gun';
    this.ship = ship;
    this.offset = offset;
    this.id = id;
    this.radius = 5.625 / 50;
    this.isSelected = false;
  }

  getPosition() {
    const x = this.ship.getX() + Math.cos(this.ship.getOrientation()) * this.offset.x - Math.sin(this.ship.getOrientation()) * this.offset.y;
    const y = this.ship.getY() + Math.sin(this.ship.getOrientation()) * this.offset.x + Math.cos(this.ship.getOrientation()) * this.offset.y;
    return { x, y };
  }

  render(context, images) {
    const { x, y } = this.getPosition();

    context.drawImage(images.cannon, x * 50 - 15 / 4, y * 50 - 25 / 4, 10, 10);
    if (this.isSelected) {
      context.strokeStyle = 'cyan';
      context.beginPath();
      context.arc(this.getPosition().x * 50, this.getPosition().y * 50, this.radius * 50, 0, Math.PI * 2, true);
      context.stroke();
    }
  }

  getType() {
    return this.type;
  }

  getId() {
    return this.id;
  }
}
