import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class NewOrderModal extends LightningElement {
    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleSuccess(event) {
        const orderId = event.detail.id;
        this.showToast('Success', 'Order created successfully', 'success');
        this.dispatchEvent(new CustomEvent('ordercreated', {
            detail: { orderId: orderId }
        }));
        this.handleClose();
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}