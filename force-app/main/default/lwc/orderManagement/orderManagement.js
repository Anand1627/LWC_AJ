import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getOrders from '@salesforce/apex/OrderController.getOrders';
import getOrderAnalytics from '@salesforce/apex/OrderController.getOrderAnalytics';
import getOrderStatuses from '@salesforce/apex/OrderController.getOrderStatuses';

export default class OrderManagement extends LightningElement {
    @track searchTerm = '';
    @track statusFilter = 'All';
    @track sortBy = 'CreatedDate';
    @track sortDirection = 'DESC';
    @track showOrderModal = false;
    @track showNewOrderModal = false;
    @track selectedOrderId;
    @track analyticsData = [];
    @track statusOptions = [];

    @wire(getOrders, {
        searchTerm: '$searchTerm',
        statusFilter: '$statusFilter',
        sortBy: '$sortBy',
        sortDirection: '$sortDirection'
    })
    orders;

    @wire(getOrderAnalytics)
    wiredAnalytics({ error, data }) {
        if (data) {
            this.analyticsData = Object.keys(data).map(key => ({
                key: key,
                value: data[key]
            }));
        } else if (error) {
            console.error('Error loading analytics:', error);
        }
    }

    @wire(getOrderStatuses)
    wiredStatuses({ error, data }) {
        if (data) {
            this.statusOptions = [
                { label: 'All Statuses', value: 'All' },
                ...data.map(status => ({ label: status, value: status }))
            ];
        } else if (error) {
            console.error('Error loading statuses:', error);
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
    }

    handleStatusChange(event) {
        this.statusFilter = event.detail.value;
    }

    handleSort(event) {
        const field = event.currentTarget.dataset.field;
        if (this.sortBy === field) {
            this.sortDirection = this.sortDirection === 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sortBy = field;
            this.sortDirection = 'ASC';
        }
    }

    handleNewOrder() {
        this.showNewOrderModal = true;
    }

    handleRefresh() {
        // Refresh data by updating a tracked property
        this.searchTerm = this.searchTerm;
    }

    handleOrderClick(event) {
        event.preventDefault();
        const orderId = event.currentTarget.dataset.orderId;
        this.selectedOrderId = orderId;
        this.showOrderModal = true;
    }

    handleEditOrder(event) {
        const orderId = event.currentTarget.dataset.orderId;
        this.selectedOrderId = orderId;
        this.showOrderModal = true;
    }

    handleDeleteOrder(event) {
        const orderId = event.currentTarget.dataset.orderId;
        this.showDeleteConfirmation(orderId);
    }

    handleCloseOrderModal() {
        this.showOrderModal = false;
        this.selectedOrderId = null;
    }

    handleCloseNewOrderModal() {
        this.showNewOrderModal = false;
    }

    handleOrderUpdated() {
        this.showOrderModal = false;
        this.selectedOrderId = null;
        this.showToast('Success', 'Order updated successfully', 'success');
        // Refresh the data
        this.handleRefresh();
    }

    handleOrderCreated() {
        this.showNewOrderModal = false;
        this.showToast('Success', 'Order created successfully', 'success');
        // Refresh the data
        this.handleRefresh();
    }

    showDeleteConfirmation(orderId) {
        // In a real implementation, you would use a confirmation modal
        if (confirm('Are you sure you want to delete this order?')) {
            this.deleteOrder(orderId);
        }
    }

    async deleteOrder(orderId) {
        try {
            const { deleteOrder } = await import('@salesforce/apex/OrderController.deleteOrder');
            await deleteOrder({ orderId: orderId });
            this.showToast('Success', 'Order deleted successfully', 'success');
            this.handleRefresh();
        } catch (error) {
            this.showToast('Error', 'Error deleting order: ' + error.body.message, 'error');
        }
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