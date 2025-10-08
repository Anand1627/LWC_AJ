import { LightningElement, track, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrderById from '@salesforce/apex/OrderController.getOrderById';
import getOrderItems from '@salesforce/apex/OrderController.getOrderItems';
import deleteOrderItem from '@salesforce/apex/OrderController.deleteOrderItem';

export default class OrderDetailModal extends LightningElement {
    @api orderId;
    @track isLoading = true;
    @track orderData = {};
    @track showEditModal = false;
    @track showAddItemModal = false;
    @track showEditItemModal = false;
    @track selectedItemId;

    @wire(getOrderById, { orderId: '$orderId' })
    wiredOrder({ error, data }) {
        if (data) {
            this.orderData = data;
            this.isLoading = false;
        } else if (error) {
            this.showToast('Error', 'Error loading order: ' + error.body.message, 'error');
            this.isLoading = false;
        }
    }

    @wire(getOrderItems, { orderId: '$orderId' })
    orderItems;

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleEditOrder() {
        this.showEditModal = true;
    }

    handleAddItem() {
        this.showAddItemModal = true;
    }

    handleEditItem(event) {
        this.selectedItemId = event.currentTarget.dataset.itemId;
        this.showEditItemModal = true;
    }

    async handleDeleteItem(event) {
        const itemId = event.currentTarget.dataset.itemId;
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteOrderItem({ orderItemId: itemId });
                this.showToast('Success', 'Item deleted successfully', 'success');
                // Refresh the data
                this.refreshData();
            } catch (error) {
                this.showToast('Error', 'Error deleting item: ' + error.body.message, 'error');
            }
        }
    }

    handleCloseEditModal() {
        this.showEditModal = false;
    }

    handleCloseAddItemModal() {
        this.showAddItemModal = false;
    }

    handleCloseEditItemModal() {
        this.showEditItemModal = false;
        this.selectedItemId = null;
    }

    handleOrderUpdated() {
        this.showEditModal = false;
        this.showToast('Success', 'Order updated successfully', 'success');
        this.refreshData();
    }

    handleItemAdded() {
        this.showAddItemModal = false;
        this.showToast('Success', 'Item added successfully', 'success');
        this.refreshData();
    }

    handleItemUpdated() {
        this.showEditItemModal = false;
        this.selectedItemId = null;
        this.showToast('Success', 'Item updated successfully', 'success');
        this.refreshData();
    }

    refreshData() {
        // Refresh the data by updating the orderId
        this.orderId = this.orderId;
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