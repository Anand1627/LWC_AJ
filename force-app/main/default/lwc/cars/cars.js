import { LightningElement, track } from 'lwc';

export default class Cars extends LightningElement {
    newCars;
  @track cars=[];

  handleEnterCar(event)
  {
    this.newCars= event.target.value;
    console.log(this.newCars);
  }
  handleAdd(event)
  {
    this.cars.push(this.newCars);
    console.log(JSON.stringify(this.newCars));
  }
  get isArray()
  {
    return this.cars.length > 0;
  }
}